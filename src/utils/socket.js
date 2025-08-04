const socket = require("socket.io");
const Chat = require("../models/Chat");
const Message = require('../models/message');

const initialiseSocket = (server) => {
  //bind the socket to http server
  const io = socket(server, {
    cors: {
      origin: "https://devtinder-client.onrender.com",
      credentials : true,
    },
  });

  io.on("connection", (socket) => {
    //handle events

    //when a new user joins the chat
    socket.on("joinChat", ({ senderId, receiverId }) => {
      const roomId = [senderId, receiverId].sort().join("_");
      console.log("Joining room" + roomId);
      socket.join(roomId);
    });

    //when any user sends a message
    socket.on(
      "sendMessage",
      async ({ firstName, senderId, receiverId, text }) => {
        const roomId = [senderId, receiverId].sort().join("_");
        console.log(firstName + " " + text);

        //save the message to the database
        try {
          io.to(roomId).emit("messageReceived", { firstName, text,senderId });
          //find a chat where these participants exist
          let chat = await Chat.findOne({
            participants: { $all: [senderId, receiverId] },
          });

          //if there is not any existing chat Create a new chat
          if (!chat) {
            chat = new Chat({
              participants: [senderId,receiverId],
              messages: [],
            });
          }
          //now create a message
          const message = await Message.create({
            sender : senderId,
            receiver: receiverId,
            text,
          });
          chat.messages.push(message);
          await chat.save();
        } catch (error) {
          console.log(error);
        }
      }
    );

    //when an user leaves the chat
    socket.on("disconnect", () => {});
  });
};

module.exports = initialiseSocket;
