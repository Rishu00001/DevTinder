const mongoose = require("mongoose");

const ConnectionRequestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
      required: true,
    },
  },
  { timestamps: true }
);
ConnectionRequestSchema.index({ senderId: 1, receiverId: 1 });

ConnectionRequestSchema.pre("save", function (next) {
  const ConnectionRequest = this;
  //check if senderId and receiverId is same
  if (ConnectionRequest.senderId.equals(ConnectionRequest.receiverId)) {
    throw new Error("Invalid request");
  }
  next();
});
const ConnectionRequest = mongoose.model(
  "ConnectionRequest",
  ConnectionRequestSchema
);

module.exports = ConnectionRequest;
