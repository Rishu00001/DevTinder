const express = require("express");
const connectDB = require("./config/db");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const authRouter = require("./routes/auth.router");
const profileRouter = require("./routes/profile.router");
const requestRouter = require("./routes/request.router");
const userRouter = require("./routes/user.router");
const cors = require("cors");
const dotenv = require("dotenv");

const app = express();
const PORT = 3000;
dotenv.config();
app.use(
  cors({
    origin: "http://localhost:5173", // or your frontend domain
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/request", requestRouter);
app.use("/api/user", userRouter);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err);
  });
