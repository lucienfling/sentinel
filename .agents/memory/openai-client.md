---
name: OpenAI client setup
description: How OpenAI is configured in this project — uses user-supplied OPENAI_API_KEY, not Replit AI Integrations
---

## Rule
All three client.ts files in `lib/integrations-openai-ai-server/src/` (`client.ts`, `image/client.ts`, `audio/client.ts`) must use:

```typescript
import OpenAI from "openai";
if (!process.env.OPENAI_API_KEY) { throw new Error("..."); }
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
```

**Why:** Replit AI Integrations (which provides AI_INTEGRATIONS_OPENAI_BASE_URL and AI_INTEGRATIONS_OPENAI_API_KEY) requires an account upgrade not available for this project. The user supplied their own OPENAI_API_KEY secret instead.

**How to apply:** Any time the openai lib templates are copied fresh, all three client files need this replacement. The templates default to integration env vars.
