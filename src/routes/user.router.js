const express = require("express");
const { userAuth } = require("../middleware/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const userRouter = express.Router();

//get all the pending connection requests for the logged in user
userRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    //find all the requests received
    const connectionRequests = await ConnectionRequest.find({
      receiverId: loggedInUser._id,
      status: "interested",
    }).populate("senderId", [
      "firstName",
      "lastName",
      "photo",
      "age",
      "bio",
      "gender",
    ]);
    res.status(200).json({
      message: "fetched connection requests",
      data: connectionRequests,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//to get all the connections
userRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      $or: [{ senderId: loggedInUser._id }, { receiverId: loggedInUser._id }],
      status: "accepted",
    })
      .populate("senderId", [
        "firstName",
        "lastName",
        "bio",
        "gender",
        "age",
        "photo",
      ])
      .populate("receiverId", [
        "firstName",
        "lastName",
        "bio",
        "gender",
        "age",
        "photo",
      ]);
    if (!connections) {
      throw new Error("No Connections found");
    }
    const data = connections.map((row) => {
      if (row.senderId._id.toString() === loggedInUser._id.toString()) {
        return row.receiverId;
      } else {
        return row.senderId;
      }
    });
    res.status(200).json({ message: "fetched all connections", data: data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//building the feed API
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    let loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if(limit > 10) limit = 10;
    const skip = (page - 1) * limit;
    //which users should  not come in my feed
    // jisko maine request(interested)  bheja haii
    //jisko maine ignore  kiya hai
    //jo mere connections haiii
    // own
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ senderId: loggedInUser._id }, { receiverId: loggedInUser._id }],
    }).select("senderId receiverId");

    const hideUsers = new Set();
    connectionRequests.forEach((req) => {
      hideUsers.add(req.senderId.toString());
      hideUsers.add(req.receiverId.toString());
    });
    hideUsers.add(loggedInUser);
    const feedUsers = await User.find({
      _id: {
        $nin: Array.from(hideUsers),
      },
    })
      .select("-password -email")
      .skip(skip)
      .limit(limit);

    res.send(feedUsers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = userRouter;
