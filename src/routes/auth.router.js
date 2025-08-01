const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const User = require("../models/user");
const { validateSignupData } = require("../utils/validation");

const authRouter = express.Router();

// SIGNUP
authRouter.post("/signup", async (req, res) => {
  try {
    // Validate input
    validateSignupData(req);

    const { firstName, lastName, email, password, gender, bio, skills, photo } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "This email is already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      gender,
      bio,
      skills,
      photo,
    });

    const token = await newUser.getJWT();

    // Set cookie securely
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(Date.now() + 8 * 3600000), // 8 hours
    });

    console.log("User created:", newUser.email);
    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// LOGIN
authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(Date.now() + 8 * 3600000),
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(400).json({ message: error.message });
  }
});

// LOGOUT
authRouter.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = authRouter;
