const express = require("express");
const Chat = require("../models/Chat");
const { userAuth } = require("../middleware/auth");

const ChatRouter = express.Router();

ChatRouter.get("/:receiverId", userAuth, async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;
    if (!senderId || !receiverId) {
      throw new Error("Invalid participants");
    }

    //get the chat between these two users
    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    })
      .populate("messages")
      .populate("participants"); // This will populate receiverId also (and senderId both)

    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
        messages: [],
      });
      await chat.save();
    }
    return res.status(200).json(chat);
  } catch (error) {
    console.log(error);
  }
});

module.exports = ChatRouter;
