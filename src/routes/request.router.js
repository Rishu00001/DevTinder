const express = require("express");
const User = require("../models/user");
const requestRouter = express.Router();

const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");

requestRouter.post("/send/:status/:receiverId", userAuth, async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.receiverId;
    //check if the sender and receiver is same
    //in schema pre (done)
    //check if the receiver id is valid
    const receiver = await User.findOne({ _id: receiverId });
    if (!receiver) {
      throw new Error("Receiver does not exist");
    }

    const status = req.params.status;
    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status)) {
      throw new Error("Invalid Request");
    }
    //if there is an existing connection req
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (existingConnectionRequest) {
      throw new Error("Connection request already exist");
    }

    const newRequest = new ConnectionRequest({
      senderId,
      receiverId,
      status,
    });
    const data = await newRequest.save();

    res.status(200).json({ message: "request send successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

requestRouter.post("/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;
    //validate the status
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      throw new Error("Invalid request");
    }
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      receiverId: loggedInUser._id,
      status: "interested",
    });
    if (!connectionRequest) {
      throw new Error("Invalid request");
    }

    connectionRequest.status = status;
    await connectionRequest.save();
    res.status(200).json({ message: "Connection request reviewed" });
    //the logged in user should be the receiver
    //the status must be interested to be accepted or rejected
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = requestRouter;
