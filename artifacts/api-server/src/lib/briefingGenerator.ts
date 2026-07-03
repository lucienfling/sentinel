import { db, briefingsTable, prioritiesTable, insightsTable, recommendationsTable } from "@workspace/db";

const PRIORITIES_DATA = [
  {
    title: "Review Q3 financial projections before board call",
    reasoning: "Board meeting in 4 hours. CFO flagged three line items requiring executive sign-off. Delay will block downstream approvals.",
    estimatedMinutes: 45,
    confidenceLevel: 95,
    category: "review",
    rank: 1,
  },
  {
    title: "Respond to Series B investor due diligence request",
    reasoning: "Investor response window closes in 18 hours. Historical pattern shows delayed responses reduce deal probability by 34%.",
    estimatedMinutes: 60,
    confidenceLevel: 88,
    category: "email",
    rank: 2,
  },
  {
    title: "Approve engineering sprint scope for next cycle",
    reasoning: "7 engineers blocked pending scope approval. Each day of delay costs approximately 56 hours of team productivity.",
    estimatedMinutes: 30,
    confidenceLevel: 91,
    category: "project",
    rank: 3,
  },
  {
    title: "Prepare talking points for all-hands meeting",
    reasoning: "All-hands scheduled for 3 PM. Leadership team expects executive summary of company trajectory and product roadmap.",
    estimatedMinutes: 40,
    confidenceLevel: 82,
    category: "meeting",
    rank: 4,
  },
  {
    title: "Review and sign partnership agreement with Apex Systems",
    reasoning: "Legal cleared the agreement yesterday. Contract countersignature deadline is end of business today.",
    estimatedMinutes: 25,
    confidenceLevel: 97,
    category: "review",
    rank: 5,
  },
];

const INSIGHTS_DATA = [
  {
    title: "Peak focus window identified: 06:00–09:30",
    description: "Analysis of your last 30 days shows highest deep work output occurs in early morning. Scheduling complex cognitive tasks during this window increases output quality by an estimated 40%.",
    category: "productivity",
    severity: "positive",
    dataPoints: ["23 of 30 most productive work sessions began before 9:00", "Average focus session: 94 min in early morning vs 41 min afternoon", "Interruption rate 67% lower before 9:30"],
    confidenceLevel: 87,
  },
  {
    title: "Meeting overload detected on Tuesdays and Thursdays",
    description: "Your calendar shows an average of 6.2 hours of meetings on Tuesdays and Thursdays over the past month. This leaves fewer than 90 minutes for deep work on those days, creating a pattern of deferred decision-making.",
    category: "meetings",
    severity: "warning",
    dataPoints: ["Average Tuesday meetings: 6.2 hours", "Average Thursday meetings: 5.8 hours", "Deep work sessions on those days: 1 per week on average", "Decisions deferred on high-meeting days: 3.4 per week"],
    confidenceLevel: 92,
  },
  {
    title: "Email response latency increasing",
    description: "Your average email response time has increased from 2.1 hours to 4.7 hours over the past two weeks. Stakeholder communication delays may be creating downstream bottlenecks.",
    category: "communication",
    severity: "warning",
    dataPoints: ["Current average response time: 4.7 hours", "Previous 2-week average: 2.1 hours", "Emails pending >24 hours: 8", "3 flagged as high-priority by sender"],
    confidenceLevel: 84,
  },
  {
    title: "Project completion velocity above baseline",
    description: "You have completed 7 project milestones this month compared to a 6-month average of 4.3. This positive trend correlates with the new weekly planning protocol introduced 5 weeks ago.",
    category: "projects",
    severity: "positive",
    dataPoints: ["Milestones completed this month: 7", "6-month average: 4.3", "On-time completion rate: 86% vs 61% baseline", "Protocol introduced 5 weeks ago"],
    confidenceLevel: 78,
  },
];

const RECOMMENDATIONS_DATA = [
  {
    title: "Block 06:00–09:30 daily as protected deep work time",
    reasoning: "Your highest-quality cognitive output consistently occurs in early morning. Protecting this window from meetings and interruptions would maximize your decision-making effectiveness.",
    confidenceLevel: 87,
    evidence: ["23 of 30 highest-output sessions began before 9:30", "Interruption rate is 67% lower in this window", "Focus session duration averages 94 minutes vs 41 minutes later in the day"],
    sourceType: "personal_data",
  },
  {
    title: "Delegate Tuesday meeting load by 40%",
    reasoning: "Current Tuesday meeting density leaves insufficient time for the cognitive tasks that require your direct involvement. Delegating operational meetings would recover an estimated 3–4 hours of executive decision-making capacity.",
    confidenceLevel: 82,
    evidence: ["6.2 average meeting hours on Tuesdays", "Less than 90 minutes of available deep work time", "3.4 decisions deferred per high-meeting day on average"],
    sourceType: "personal_data",
  },
  {
    title: "Set email triage windows at 09:30 and 16:00",
    reasoning: "Research on executive time management indicates that scheduled triage windows reduce cognitive context-switching by up to 60% compared to continuous inbox monitoring. Your current pattern shows frequent email checks throughout the day.",
    confidenceLevel: 74,
    evidence: ["Industry research: scheduled triage reduces interruptions by 60%", "Your current average response latency: 4.7 hours regardless of check frequency", "8 emails pending over 24 hours suggest batch processing may already be occurring informally"],
    sourceType: "combined",
  },
];

export async function generateDailyBriefing(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning, sir." : hour < 17 ? "Good afternoon, sir." : "Good evening, sir.";

  const executiveSummary = {
    productivityScore: 78,
    focusScore: 65,
    upcomingDeadlines: 3,
    pendingEmails: 12,
    meetingsToday: 4,
    activeProjects: 6,
    workloadLevel: "moderate",
    tasksCompleted: 5,
    tasksTotal: 11,
  };

  const [briefing] = await db
    .insert(briefingsTable)
    .values({
      userId,
      date: today,
      greeting,
      headline: "Three time-sensitive decisions require your attention before noon.",
      executiveSummary,
    })
    .returning();

  // Insert priorities
  for (const p of PRIORITIES_DATA) {
    await db.insert(prioritiesTable).values({
      userId,
      briefingId: briefing.id,
      ...p,
      isCompleted: false,
    });
  }

  // Insert insights
  for (const i of INSIGHTS_DATA) {
    await db.insert(insightsTable).values({
      userId,
      briefingId: briefing.id,
      ...i,
      dataPoints: i.dataPoints,
    });
  }

  // Insert recommendations
  for (const r of RECOMMENDATIONS_DATA) {
    await db.insert(recommendationsTable).values({
      userId,
      briefingId: briefing.id,
      ...r,
      evidence: r.evidence,
      isDismissed: false,
    });
  }

  return briefing;
}
