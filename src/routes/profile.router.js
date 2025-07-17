const express = require("express");
const { userAuth } = require("../middleware/auth");
const User = require("../models/user");
const { validatorProfileEditData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const profileRouter = express.Router(); // fixed here

// View Profile
profileRouter.get("/view", userAuth, async (req, res) => {
  try {
    const user = req.user.toObject(); // Convert to plain object
    delete user.password; // Now this will work

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Edit Profile
profileRouter.patch("/edit", userAuth, async (req, res) => {
  try {
    const isValid = validatorProfileEditData(req);
    if (!isValid) {
      throw new Error("Invalid edit request");
    }

    const updates = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

profileRouter.patch("/edit/password", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { password, newPassword } = req.body;

    // Compare current password
    const isValidRequest = await bcrypt.compare(password, user.password);
    if (!isValidRequest) {
      throw new Error("Current password is incorrect");
    }

    // Validate new password strength
    const isStrong = validator.isStrongPassword(newPassword, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    });

    if (!isStrong) {
      throw new Error(
        "New password must be at least 8 characters and include uppercase, lowercase, number, and symbol"
      );
    }

    // Hash and update password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, {
      $set: {
        password: newPasswordHash,
      },
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = profileRouter;
