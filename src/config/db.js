const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://ritiksingh7369:ritik2005@cluster0.y9tc2rd.mongodb.net/DevTinder"
    );
    console.log("Connected to database");
    
  } catch (error) {
    console.log(error);
  }
};
module.exports = connectDB;
