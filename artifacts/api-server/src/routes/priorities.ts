import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, prioritiesTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

router.get("/priorities", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const date = (req.query.date as string) || new Date().toISOString().split("T")[0];

  const priorities = await db
    .select()
    .from(prioritiesTable)
    .where(eq(prioritiesTable.userId, userId))
    .orderBy(prioritiesTable.rank);

  res.json(
    priorities.map((p) => ({
      ...p,
      deadline: p.deadline?.toISOString() ?? null,
      completedAt: p.completedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  );
});

router.patch("/priorities/:id/complete", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  const [priority] = await db
    .select()
    .from(prioritiesTable)
    .where(and(eq(prioritiesTable.id, id), eq(prioritiesTable.userId, userId)));

  if (!priority) {
    res.status(404).json({ error: "Priority not found" });
    return;
  }

  const [updated] = await db
    .update(prioritiesTable)
    .set({ isCompleted: true, completedAt: new Date() })
    .where(eq(prioritiesTable.id, id))
    .returning();

  res.json({
    ...updated,
    deadline: updated.deadline?.toISOString() ?? null,
    completedAt: updated.completedAt?.toISOString() ?? null,
    createdAt: updated.createdAt.toISOString(),
  });
});

export default router;
