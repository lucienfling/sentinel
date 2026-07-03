import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ── User profiles ─────────────────────────────────────────────────────────────
export const userProfilesTable = pgTable("user_profiles", {
  id: text("id").primaryKey(), // Clerk user ID
  displayName: text("display_name").notNull().default(""),
  title: text("title").notNull().default(""),
  salutation: text("salutation").notNull().default("sir"),
  timezone: text("timezone").notNull().default("UTC"),
  briefingTime: text("briefing_time").notNull().default("07:00"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserProfileSchema = createInsertSchema(userProfilesTable).omit({ createdAt: true, updatedAt: true });
export type UserProfile = typeof userProfilesTable.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

// ── Briefings ─────────────────────────────────────────────────────────────────
export const briefingsTable = pgTable("briefings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  greeting: text("greeting").notNull(),
  headline: text("headline").notNull(),
  executiveSummary: jsonb("executive_summary").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBriefingSchema = createInsertSchema(briefingsTable).omit({ id: true });
export type Briefing = typeof briefingsTable.$inferSelect;
export type InsertBriefing = z.infer<typeof insertBriefingSchema>;

// ── Priorities ────────────────────────────────────────────────────────────────
export const prioritiesTable = pgTable("priorities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  briefingId: integer("briefing_id"),
  title: text("title").notNull(),
  reasoning: text("reasoning").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull().default(30),
  deadline: timestamp("deadline", { withTimezone: true }),
  confidenceLevel: integer("confidence_level").notNull().default(80),
  category: text("category").notNull().default("task"),
  rank: integer("rank").notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPrioritySchema = createInsertSchema(prioritiesTable).omit({ id: true, createdAt: true });
export type Priority = typeof prioritiesTable.$inferSelect;
export type InsertPriority = z.infer<typeof insertPrioritySchema>;

// ── Insights ──────────────────────────────────────────────────────────────────
export const insightsTable = pgTable("insights", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  briefingId: integer("briefing_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("productivity"),
  severity: text("severity").notNull().default("neutral"),
  dataPoints: jsonb("data_points").notNull().default([]),
  confidenceLevel: integer("confidence_level").notNull().default(75),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInsightSchema = createInsertSchema(insightsTable).omit({ id: true, createdAt: true });
export type Insight = typeof insightsTable.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;

// ── Recommendations ───────────────────────────────────────────────────────────
export const recommendationsTable = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  briefingId: integer("briefing_id"),
  title: text("title").notNull(),
  reasoning: text("reasoning").notNull(),
  confidenceLevel: integer("confidence_level").notNull().default(75),
  evidence: jsonb("evidence").notNull().default([]),
  sourceType: text("source_type").notNull().default("personal_data"),
  isDismissed: boolean("is_dismissed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRecommendationSchema = createInsertSchema(recommendationsTable).omit({ id: true, createdAt: true });
export type Recommendation = typeof recommendationsTable.$inferSelect;
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;

// ── Integrations ──────────────────────────────────────────────────────────────
export const userIntegrationsTable = pgTable("user_integrations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  integrationId: text("integration_id").notNull(),
  isConnected: boolean("is_connected").notNull().default(false),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserIntegrationSchema = createInsertSchema(userIntegrationsTable).omit({ createdAt: true });
export type UserIntegration = typeof userIntegrationsTable.$inferSelect;
export type InsertUserIntegration = z.infer<typeof insertUserIntegrationSchema>;

// ── Subscriptions ─────────────────────────────────────────────────────────────
export const subscriptionsTable = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  plan: text("plan").notNull().default("trial"),
  status: text("status").notNull().default("trial"),
  trialDaysRemaining: integer("trial_days_remaining").default(14),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type Subscription = typeof subscriptionsTable.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
