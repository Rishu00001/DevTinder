const express = require("express");
const { userAuth } = require("../middleware/auth");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/Payment");
const { membership_amount } = require("../utils/constants");
const paymentRouter = express.Router();

paymentRouter.post("/create", userAuth, async (req, res) => {
  try {
    const { membership_type} = req.body;
    const { firstName, lastName, email } = req.user;
    const order = await razorpayInstance.orders.create({
      amount: membership_amount[membership_type]*100,
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
  } catch (error) {}
});

module.exports = paymentRouter;
