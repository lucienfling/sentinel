import { Router, type IRouter } from "express";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

function generateTrendPoints(range: string) {
  const points = [];
  const count = range === "yearly" ? 12 : range === "monthly" ? 30 : 7;
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (range === "yearly") {
      d.setMonth(d.getMonth() - i);
    } else {
      d.setDate(d.getDate() - i);
    }

    points.push({
      date: d.toISOString().split("T")[0],
      productivityScore: Math.floor(60 + Math.random() * 35),
      focusHours: +(3 + Math.random() * 5).toFixed(1),
      tasksCompleted: Math.floor(3 + Math.random() * 10),
      meetingHours: +(1 + Math.random() * 4).toFixed(1),
    });
  }
  return points;
}

router.get("/performance", requireAuth, async (req, res): Promise<void> => {
  const range = (req.query.range as string) || "weekly";

  res.json({
    range,
    focusHours: 28.5,
    deepWorkHours: 18.0,
    meetingHours: 12.5,
    emailResponseTimeMinutes: 23,
    projectsCompleted: 2,
    tasksFinished: 34,
    codingActivityMinutes: 480,
    learningHours: 3.5,
    workloadTrend: "stable",
    comparedToPrevious: {
      focusHoursChange: 2.5,
      deepWorkChange: 1.2,
      tasksChange: 4,
      productivityChange: 5.3,
    },
  });
});

router.get("/performance/trends", requireAuth, async (req, res): Promise<void> => {
  const range = (req.query.range as string) || "weekly";
  res.json(generateTrendPoints(range));
});

export default router;
