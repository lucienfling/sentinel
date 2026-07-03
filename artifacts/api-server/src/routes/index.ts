import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import subscriptionRouter from "./subscription";
import integrationsRouter from "./integrations";
import briefingRouter from "./briefing";
import prioritiesRouter from "./priorities";
import intelligenceRouter from "./intelligence";
import recommendationsRouter from "./recommendations";
import performanceRouter from "./performance";
import openaiRouter from "./openai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(subscriptionRouter);
router.use(integrationsRouter);
router.use(briefingRouter);
router.use(prioritiesRouter);
router.use(intelligenceRouter);
router.use(recommendationsRouter);
router.use(performanceRouter);
router.use(openaiRouter);

export default router;
