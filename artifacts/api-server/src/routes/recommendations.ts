import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, recommendationsTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

router.get("/recommendations", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const status = (req.query.status as string) || "active";

  const all = await db
    .select()
    .from(recommendationsTable)
    .where(eq(recommendationsTable.userId, userId));

  const filtered =
    status === "all"
      ? all
      : status === "dismissed"
        ? all.filter((r) => r.isDismissed)
        : all.filter((r) => !r.isDismissed);

  res.json(
    filtered.map((r) => ({
      ...r,
      evidence: (r.evidence as string[]) ?? [],
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

router.patch("/recommendations/:id/dismiss", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [rec] = await db
    .select()
    .from(recommendationsTable)
    .where(and(eq(recommendationsTable.id, id), eq(recommendationsTable.userId, userId)));

  if (!rec) {
    res.status(404).json({ error: "Recommendation not found" });
    return;
  }

  const [updated] = await db
    .update(recommendationsTable)
    .set({ isDismissed: true })
    .where(eq(recommendationsTable.id, id))
    .returning();

  res.json({
    ...updated,
    evidence: (updated.evidence as string[]) ?? [],
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
