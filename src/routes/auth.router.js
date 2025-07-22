const express = require("express");
const { validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const authRouter = express.Router();
const validator = require("validator");

authRouter.post("/signup", async (req, res) => {
  try {
    //validate the data
    validateSignupData(req);
    const { firstName, lastName, email, password, gender, bio, skills, photo } =
      req.body;
    const userExists = await User.findOne({ email });
    if (userExists?.length > 0) {
      throw new Error("This email is already registered");
    }

    //hash the password using bcrypt library
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

    //generating the token
    const token = await newUser.getJWT();

    //set the cookie
    res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) });
    console.log("Created Successfully", newUser);
    res.status(200).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid email or password" });

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("user does not exist");
    }

    //compare the password using bcrypt
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    //generating the token
    const token = await user.getJWT();

    //set the cookie
    res.cookie("token", token, { expires: new Date(Date.now() + 8 * 3600000) });

    //if the password is valid
    res.status(200).json(user);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", "");
  res.send();
});

module.exports = authRouter;
