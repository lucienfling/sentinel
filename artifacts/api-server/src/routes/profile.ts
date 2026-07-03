import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, userProfilesTable, subscriptionsTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

async function getOrCreateProfile(userId: string) {
  const [existing] = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.id, userId));

  if (existing) return existing;

  const [created] = await db
    .insert(userProfilesTable)
    .values({ id: userId, displayName: "Executive", title: "Executive", salutation: "sir" })
    .returning();

  // Also create a trial subscription
  await db
    .insert(subscriptionsTable)
    .values({ userId, plan: "trial", status: "trial", trialDaysRemaining: 14 })
    .onConflictDoNothing();

  return created;
}

router.get("/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const profile = await getOrCreateProfile(userId);
  res.json(profile);
});

router.patch("/profile", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  await getOrCreateProfile(userId);

  const { displayName, title, salutation, timezone, briefingTime } = req.body;
  const updates: Record<string, string> = {};
  if (displayName != null) updates.displayName = displayName;
  if (title != null) updates.title = title;
  if (salutation != null) updates.salutation = salutation;
  if (timezone != null) updates.timezone = timezone;
  if (briefingTime != null) updates.briefingTime = briefingTime;

  const [updated] = await db
    .update(userProfilesTable)
    .set(updates)
    .where(eq(userProfilesTable.id, userId))
    .returning();

  res.json(updated);
});

export default router;
