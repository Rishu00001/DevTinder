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
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!["male", "female", "other"].includes(value.trim())) {
          throw new Error("Invalid Gender");
        }
      },
    },
    photo: {
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "Hey there! I am using DevTinder",
      trim: true,
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
