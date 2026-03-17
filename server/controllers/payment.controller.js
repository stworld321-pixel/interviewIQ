import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js";
import crypto from "crypto";

const PLAN_CATALOG = {
  starter: { amount: 199, credits: 220, planType: "starter" },
  pro: { amount: 599, credits: 900, planType: "pro" },
};

const planRank = { free: 0, starter: 1, pro: 2 };

export const createOrder = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Payment gateway is not configured on server" });
    }

    const { planId } = req.body;
    const selectedPlan = PLAN_CATALOG[planId];
    if (!selectedPlan) {
      return res.status(400).json({ message: "Invalid paid plan selected" });
    }

    const options = {
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId: req.userId,
      planId,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.json({
      ...order,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return res.status(500).json({ message: error?.error?.description || error?.message || "Failed to create Razorpay order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Payment verification key is missing on server" });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "paid") {
      const user = await User.findById(payment.userId);
      return res.json({ success: true, message: "Already processed", user });
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    const selectedPlan = PLAN_CATALOG[payment.planId];
    const planToApply = selectedPlan?.planType || "free";

    const user = await User.findById(payment.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found for payment update" });
    }

    user.credits += payment.credits || 0;
    const currentRank = planRank[user.planType || "free"] ?? 0;
    const incomingRank = planRank[planToApply] ?? 0;
    if (incomingRank > currentRank) {
      user.planType = planToApply;
    }
    await user.save();

    return res.json({
      success: true,
      message: "Payment verified and credits added",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error?.message || "Failed to verify Razorpay payment" });
  }
};
