import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, subscriptionsTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

const PLAN_FEATURES: Record<string, string[]> = {
  trial: [
    "Daily executive briefing (limited)",
    "5 AI intelligence insights per day",
    "3 data source integrations",
    "AI chat (10 messages/day)",
  ],
  pro: [
    "Full daily executive briefing",
    "Unlimited AI intelligence insights",
    "All data source integrations",
    "Unlimited AI chat",
    "Advanced performance analytics",
    "Priority pattern recognition",
    "Evidence-backed recommendations",
  ],
  enterprise: [
    "Everything in Pro",
    "Custom briefing schedules",
    "Team intelligence reports",
    "Advanced API access",
    "Dedicated support",
    "Custom integrations",
    "SLA guarantees",
  ],
};

async function getOrCreateSubscription(userId: string) {
  const [existing] = await db
    .select()
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.userId, userId));

  if (existing) return existing;

  const [created] = await db
    .insert(subscriptionsTable)
    .values({ userId, plan: "trial", status: "trial", trialDaysRemaining: 14 })
    .returning();

  return created;
}

router.get("/subscription", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const sub = await getOrCreateSubscription(userId);

  res.json({
    plan: sub.plan,
    status: sub.status,
    trialDaysRemaining: sub.trialDaysRemaining,
    currentPeriodEnd: sub.currentPeriodEnd,
    features: PLAN_FEATURES[sub.plan] ?? [],
  });
});

router.post("/subscription/upgrade", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const { plan } = req.body;

  if (!["pro", "enterprise"].includes(plan)) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await db
    .update(subscriptionsTable)
    .set({ plan, status: "active", trialDaysRemaining: null, currentPeriodEnd: periodEnd })
    .where(eq(subscriptionsTable.userId, userId));

  res.json({ success: true, message: `Upgraded to ${plan} plan.`, plan });
});

export default router;
