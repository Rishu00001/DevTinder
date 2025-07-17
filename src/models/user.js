const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      required: true,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Invalid Gender");
        }
      },
    },
    photo: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "Hey there! I am using DevTinder",
    },
    skills: {
      type: [String],
    },
  },
  { timestamps: true }
);
userSchema.methods.getJWT = async function () {
  let user = this;
  let token = await jwt.sign({ id: user._id }, "secret", {
    expiresIn: "1d",
  });
  return token;
};
userSchema.methods.validatePassword = async function (inputPassword) {
  let user = this;
  const hashedPassword = user.password;
  const isPasswordValid = bcrypt.compare(inputPassword, hashedPassword);
  return isPasswordValid;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
