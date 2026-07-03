---
name: Sentinel Clerk auth pattern
description: How Clerk Express middleware is wired in the API server for Sentinel
---

## Rule
Use `clerkMiddleware()` directly from `@clerk/express` — do NOT import `publishableKeyFromHost` from `@clerk/shared/keys`. That function is not exported by the installed version.

```typescript
import { clerkMiddleware } from "@clerk/express";
app.use(clerkMiddleware());
```

**Why:** `@clerk/shared@2.22.1` does not export `publishableKeyFromHost` from the `keys` subpath. The build will fail with "No matching export" if you try.

**How to apply:** Any time the Clerk proxy middleware template is used in api-server/src/app.ts, remove the publishableKeyFromHost import and use simple `clerkMiddleware()`.
