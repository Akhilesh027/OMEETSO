import { Request, Response, NextFunction } from "express";
import { NewsletterSubscriber } from "../models/NewsletterSubscriber";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeNewsletter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, source } = req.body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_EMAIL", message: "Please provide a valid email address" }
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          status: "active",
          source: source || "website_footer",
          subscribedAt: new Date()
        },
        $unset: { unsubscribedAt: 1 }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Thank you for subscribing to Omeetso deals and updates!",
      data: {
        id: subscriber._id,
        email: subscriber.email,
        status: subscriber.status,
        subscribedAt: subscriber.subscribedAt
      }
    });
  } catch (err: any) {
    next(err);
  }
}

export async function unsubscribeNewsletter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      res.status(400).json({
        success: false,
        error: { code: "INVALID_EMAIL", message: "Please provide a valid email address" }
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    await NewsletterSubscriber.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $set: {
          status: "unsubscribed",
          unsubscribedAt: new Date()
        }
      }
    );

    res.status(200).json({
      success: true,
      message: "You have been successfully unsubscribed from the newsletter."
    });
  } catch (err: any) {
    next(err);
  }
}
