---
name: Sentinel DB schema decisions
description: Key schema decisions and security constraints for Sentinel's database
---

## Conversations table must have userId
`lib/db/src/schema/conversations.ts` — the `conversations` table MUST include a `userId text NOT NULL` column. The original template does not have this column.

**Why:** Without userId, all OpenAI conversation routes are vulnerable to IDOR (any authenticated user can read/delete any conversation by ID). Every conversation-scoped route must filter by `and(eq(conversations.id, id), eq(conversations.userId, userId))`.

## Briefing count queries
Use `count()` from drizzle-orm for accurate counts in `/briefing/history`. The pattern `select({ count: prioritiesTable.id })` returns undefined or the column value, not a row count.

```typescript
import { count } from "drizzle-orm";
const [{ value }] = await db.select({ value: count() }).from(table).where(...);
```
