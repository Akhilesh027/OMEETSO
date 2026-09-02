import { Response, NextFunction } from "express";
import crypto from "crypto";
import { env } from "../../../config/env";
import { AuthenticatedUserRequest } from "../../../middleware/authenticateUser";
import { Wallet } from "../models/Wallet";
import { WalletTransaction } from "../models/WalletTransaction";

/**
 * STEP 1: BACKEND - Create Order
 * Endpoint: POST /api/create-order
 * Calls Razorpay API: POST https://api.razorpay.com/v1/orders
 * Minimum amount: 100 paise
 */
export async function createRazorpayOrder(
  req: AuthenticatedUserRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawAmount = req.body.amount;
    const amount = Number(rawAmount);

    // Validate amount >= 100 paise
    if (!amount || isNaN(amount) || amount < 100) {
      res.status(400).json({
        success: false,
        error: {
          code: "INVALID_AMOUNT",
          message: "Amount must be at least 100 paise (₹1)"
        }
      });
      return;
    }

    const currency = (req.body.currency || "INR").toUpperCase();
    const receipt = req.body.receipt || `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    // Prepare HTTP Basic Auth header for Razorpay API
    const authString = `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`;
    const basicAuth = Buffer.from(authString).toString("base64");

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`
      },
      body: JSON.stringify({
        amount: Math.round(amount),
        currency,
        receipt,
        notes: {
          userId: req.user?._id?.toString() || "guest",
          userPhone: req.user?.phone || ""
        }
      })
    });

    // Handle authentication failure from Razorpay (401)
    if (razorpayResponse.status === 401) {
      res.status(401).json({
        success: false,
        error: {
          code: "RAZORPAY_AUTH_FAILED",
          message: "Authentication failed with Razorpay API. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
        }
      });
      return;
    }

    const orderData = (await razorpayResponse.json()) as any;

    if (!razorpayResponse.ok) {
      res.status(500).json({
        success: false,
        error: {
          code: "RAZORPAY_ORDER_CREATION_FAILED",
          message: orderData.error?.description || "Failed to create Razorpay order",
          details: orderData.error
        }
      });
      return;
    }

    // Return required fields: order_id, amount, currency
    res.status(200).json({
      success: true,
      order_id: orderData.id,
      id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      key_id: env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    next(error);
  }
}

/**
 * STEP 3: BACKEND - Verify Signature
 * Endpoint: POST /api/verify-payment
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
 */
export async function verifyRazorpayPayment(
  req: AuthenticatedUserRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      paymentMethod
    } = req.body;

    // Validate missing fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({
        success: false,
        error: {
          code: "MISSING_FIELDS",
          message: "Missing required fields: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required"
        }
      });
      return;
    }

    // Generate expected HMAC-SHA256 signature
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest("hex");

    // Signature mismatch: return 400, do NOT mark as paid
    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({
        success: false,
        error: {
          code: "SIGNATURE_MISMATCH",
          message: "Invalid payment signature. Payment verification failed."
        }
      });
      return;
    }

    // If authenticated user is present, credit wallet and log transaction
    let updatedWallet = null;
    let transactionRecord = null;

    if (req.user) {
      let wallet = await Wallet.findOne({ userId: req.user._id });
      if (!wallet) {
        wallet = await Wallet.create({
          userId: req.user._id,
          balanceInPaise: 0,
          refundBalanceInPaise: 0
        });
      }

      const amountInPaise = Math.round(Number(amount) || 0);

      // Check if this payment was already recorded
      const existingTxn = await WalletTransaction.findOne({
        walletId: wallet._id,
        $or: [
          { referenceId: razorpay_payment_id },
          { description: { $regex: String(razorpay_payment_id).slice(-8) } }
        ]
      });

      if (!existingTxn && amountInPaise > 0) {
        const methodStr = paymentMethod ? ` (${String(paymentMethod).toUpperCase()})` : " (UPI)";

        transactionRecord = await WalletTransaction.create({
          walletId: wallet._id,
          userId: req.user._id,
          type: "credit",
          amountInPaise,
          description: `Wallet top-up via Razorpay${methodStr} #${String(razorpay_payment_id).slice(-8)}`,
          referenceType: "TOPUP",
          referenceId: razorpay_payment_id,
          idempotencyKey: `topup_${razorpay_payment_id}`,
          status: "SUCCESS"
        });

        wallet.balanceInPaise += amountInPaise;
        await wallet.save();
      } else if (existingTxn) {
        transactionRecord = existingTxn;
      }

      // Reconcile and calculate exact balance from all completed transactions (preventing legacy default 5,000)
      const allTxns = await WalletTransaction.find({
        walletId: wallet._id,
        status: { $in: ["COMPLETED", "SUCCESS", "completed", "success"] }
      }).lean();

      if (allTxns.length > 0) {
        const computedBalance = allTxns.reduce((sum, t) => {
          const isCredit = (t.type || "").toUpperCase() === "CREDIT" || t.type === "credit";
          const isDebit = (t.type || "").toUpperCase() === "DEBIT" || t.type === "debit";
          if (isCredit) return sum + t.amountInPaise;
          if (isDebit) return sum - t.amountInPaise;
          return sum;
        }, 0);

        if (wallet.balanceInPaise !== computedBalance) {
          wallet.balanceInPaise = Math.max(0, computedBalance);
          await wallet.save();
        }
      }

      updatedWallet = {
        id: wallet._id.toString(),
        balanceInPaise: wallet.balanceInPaise,
        addedInPaise: amountInPaise
      };
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      wallet: updatedWallet,
      transaction: transactionRecord ? {
        id: transactionRecord._id.toString(),
        amountInPaise: transactionRecord.amountInPaise,
        description: transactionRecord.description,
        status: transactionRecord.status,
        createdAt: transactionRecord.createdAt
      } : undefined
    });
  } catch (error) {
    next(error);
  }
}
