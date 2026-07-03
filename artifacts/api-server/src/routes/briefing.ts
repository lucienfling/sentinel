import { Router, type IRouter } from "express";
import { and, count, desc, eq } from "drizzle-orm";
import { db, briefingsTable, prioritiesTable, insightsTable, recommendationsTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";
import { generateDailyBriefing } from "../lib/briefingGenerator";

const router: IRouter = Router();

async function getBriefingWithRelations(briefingId: number) {
  const [briefing] = await db.select().from(briefingsTable).where(eq(briefingsTable.id, briefingId));
  if (!briefing) return null;

  const priorities = await db
    .select()
    .from(prioritiesTable)
    .where(eq(prioritiesTable.briefingId, briefingId))
    .orderBy(prioritiesTable.rank);

  const insights = await db
    .select()
    .from(insightsTable)
    .where(eq(insightsTable.briefingId, briefingId));

  const recommendations = await db
    .select()
    .from(recommendationsTable)
    .where(eq(recommendationsTable.briefingId, briefingId));

  return {
    id: briefing.id,
    date: briefing.date,
    greeting: briefing.greeting,
    headline: briefing.headline,
    executiveSummary: briefing.executiveSummary,
    priorities: priorities.map((p) => ({
      ...p,
      deadline: p.deadline?.toISOString() ?? null,
      completedAt: p.completedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
    insights: insights.map((i) => ({
      ...i,
      dataPoints: (i.dataPoints as string[]) ?? [],
      createdAt: i.createdAt.toISOString(),
    })),
    recommendations: recommendations.map((r) => ({
      ...r,
      evidence: (r.evidence as string[]) ?? [],
      createdAt: r.createdAt.toISOString(),
    })),
    generatedAt: briefing.generatedAt.toISOString(),
  };
}

router.get("/briefing/today", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const today = new Date().toISOString().split("T")[0];

  const [existing] = await db
    .select()
    .from(briefingsTable)
    .where(and(eq(briefingsTable.userId, userId), eq(briefingsTable.date, today)));

  if (existing) {
    const result = await getBriefingWithRelations(existing.id);
    res.json(result);
    return;
  }

  const briefingData = await generateDailyBriefing(userId);
  const result = await getBriefingWithRelations(briefingData.id);
  res.json(result);
});

router.get("/briefing/history", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const offset = Number(req.query.offset) || 0;

  const briefings = await db
    .select()
    .from(briefingsTable)
    .where(eq(briefingsTable.userId, userId))
    .orderBy(desc(briefingsTable.date))
    .limit(limit)
    .offset(offset);

  const results = await Promise.all(
    briefings.map(async (b) => {
      const [{ value: priorityCount }] = await db
        .select({ value: count() })
        .from(prioritiesTable)
        .where(eq(prioritiesTable.briefingId, b.id));

      const [{ value: insightCount }] = await db
        .select({ value: count() })
        .from(insightsTable)
        .where(eq(insightsTable.briefingId, b.id));

      return {
        id: b.id,
        date: b.date,
        headline: b.headline,
        priorityCount: Number(priorityCount),
        insightCount: Number(insightCount),
        generatedAt: b.generatedAt.toISOString(),
      };
    }),
  );

  res.json(results);
});

router.get("/briefing/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [briefing] = await db
    .select()
    .from(briefingsTable)
    .where(and(eq(briefingsTable.id, id), eq(briefingsTable.userId, userId)));

  if (!briefing) {
    res.status(404).json({ error: "Briefing not found" });
    return;
  }

  const result = await getBriefingWithRelations(id);
  res.json(result);
});

export default router;
