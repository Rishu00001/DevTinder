const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    if (!token) {
      return res.status(401).send("Unauthorized");
    }

    const decoded = await jwt.verify(token, "secret");

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error("User not found");
    } else {
      req.user = user;
      next();
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { userAuth };
