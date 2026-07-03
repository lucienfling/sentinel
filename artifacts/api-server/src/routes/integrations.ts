import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, userIntegrationsTable } from "@workspace/db";
import { requireAuth, getUserId } from "../lib/auth";

const router: IRouter = Router();

const ALL_INTEGRATIONS = [
  { id: "gmail", name: "Gmail", description: "Email intelligence and response patterns", icon: "mail", category: "email" },
  { id: "google-calendar", name: "Google Calendar", description: "Meeting analysis and schedule optimization", icon: "calendar", category: "calendar" },
  { id: "github", name: "GitHub", description: "Coding activity and project velocity", icon: "code", category: "code" },
  { id: "slack", name: "Slack", description: "Communication patterns and team dynamics", icon: "message-square", category: "communication" },
  { id: "notion", name: "Notion", description: "Knowledge management and documentation", icon: "book-open", category: "productivity" },
  { id: "jira", name: "Jira", description: "Project tracking and sprint intelligence", icon: "layers", category: "productivity" },
  { id: "linear", name: "Linear", description: "Engineering workflow and issue tracking", icon: "zap", category: "productivity" },
  { id: "todoist", name: "Todoist", description: "Personal task management and completion rates", icon: "check-square", category: "productivity" },
  { id: "outlook", name: "Outlook", description: "Email and calendar intelligence", icon: "inbox", category: "email" },
  { id: "google-drive", name: "Google Drive", description: "Document activity and collaboration", icon: "hard-drive", category: "productivity" },
  { id: "linkedin", name: "LinkedIn", description: "Professional network and opportunity signals", icon: "briefcase", category: "other" },
];

router.get("/integrations", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);

  const userIntegrations = await db
    .select()
    .from(userIntegrationsTable)
    .where(eq(userIntegrationsTable.userId, userId));

  const userIntMap = new Map(userIntegrations.map((ui) => [ui.integrationId, ui]));

  const result = ALL_INTEGRATIONS.map((integration) => {
    const ui = userIntMap.get(integration.id);
    return {
      ...integration,
      isConnected: ui?.isConnected ?? false,
      lastSyncAt: ui?.lastSyncAt ?? null,
    };
  });

  res.json(result);
});

router.patch("/integrations/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const integrationId = raw;

  const integration = ALL_INTEGRATIONS.find((i) => i.id === integrationId);
  if (!integration) {
    res.status(404).json({ error: "Integration not found" });
    return;
  }

  const { isConnected } = req.body;

  const [existing] = await db
    .select()
    .from(userIntegrationsTable)
    .where(
      and(
        eq(userIntegrationsTable.userId, userId),
        eq(userIntegrationsTable.integrationId, integrationId),
      ),
    );

  const lastSyncAt = isConnected ? new Date() : null;

  if (existing) {
    await db
      .update(userIntegrationsTable)
      .set({ isConnected, lastSyncAt })
      .where(eq(userIntegrationsTable.id, existing.id));
  } else {
    await db.insert(userIntegrationsTable).values({
      id: `${userId}-${integrationId}`,
      userId,
      integrationId,
      isConnected,
      lastSyncAt,
    });
  }

  res.json({
    ...integration,
    isConnected,
    lastSyncAt,
  });
});

export default router;
