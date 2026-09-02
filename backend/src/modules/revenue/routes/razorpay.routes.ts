import { Router } from "express";
import { createRazorpayOrder, verifyRazorpayPayment } from "../controllers/razorpay.controller";
import { authenticateUser } from "../../../middleware/authenticateUser";

export const razorpayRouter = Router();

// STEP 1: Create Order
razorpayRouter.post("/create-order", authenticateUser, createRazorpayOrder);

// STEP 3: Verify Payment Signature
razorpayRouter.post("/verify-payment", authenticateUser, verifyRazorpayPayment);
