import { Router } from "express";
import { subscribeNewsletter, unsubscribeNewsletter } from "../controllers/newsletter.controller";

export const newsletterRouter = Router();

newsletterRouter.post("/subscribe", subscribeNewsletter);
newsletterRouter.post("/unsubscribe", unsubscribeNewsletter);
