const express = require("express");
const { userAuth } = require("../middleware/auth");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/Payment");
const { membership_amount } = require("../utils/constants");
const paymentRouter = express.Router();
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");
paymentRouter.post("/create", userAuth, async (req, res) => {
  try {
    const { membership_type } = req.body;
    const { firstName, lastName, email } = req.user;
    const order = await razorpayInstance.orders.create({
      amount: membership_amount[membership_type] * 100,
      currency: "INR",
      receipt: "receipt#1",
      partial_payment: false,
      notes: {
        firstName,
        lastName,
        email,
        membership_type: membership_type,
      },
    });
    console.log(order);
    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });
    //save it in the database
    const savedPayment = await payment.save();

    //return back the order details to client
    res.status(200).json({ ...savedPayment.toJSON() });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong while creating the order" });
  }
});

paymentRouter.post("/webhook", async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      throw new Error("Webhook signature is not valid");
    }

    //if the webhook is valid
    const paymentDetails = req.body.payload.payment.entity;
    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });

    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membership_type = payment.notes.membership_type;
    await user.save();
    // if (req.body.event === "payment.captured") {
    // }
    // if (req.body.event === "payment.failed") {
    // }
    return res.status(200).json({ message: "webhook received successfully" });
  } catch (error) {
    return res.status(400).json(error);
  }
});

module.exports = paymentRouter;
