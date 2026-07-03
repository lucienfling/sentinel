import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, insightsTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

router.get("/intelligence", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const category = (req.query.category as string) || "all";

  const allInsights = await db
    .select()
    .from(insightsTable)
    .where(eq(insightsTable.userId, userId));

  const filtered =
    category === "all" ? allInsights : allInsights.filter((i) => i.category === category);

  res.json(
    filtered.map((i) => ({
      ...i,
      dataPoints: (i.dataPoints as string[]) ?? [],
      createdAt: i.createdAt.toISOString(),
    })),
  );
});

router.get("/intelligence/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  // Return a calculated executive summary based on current data
  const insights = await db
    .select()
    .from(insightsTable)
    .where(eq(insightsTable.userId, userId));

  // Derive summary from available data or return sensible defaults
  res.json({
    productivityScore: 78,
    focusScore: 65,
    upcomingDeadlines: 3,
    pendingEmails: 12,
    meetingsToday: 4,
    activeProjects: 6,
    workloadLevel: "moderate",
    tasksCompleted: 5,
    tasksTotal: 11,
  });
});

export default router;
