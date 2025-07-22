const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    const result = await cloudinary.uploader.upload(filePath);
    console.log(result);
    fs.unlinkSync(filePath); // Remove file from local after upload
    return result.secure_url;
  } catch (error) {
    fs.unlinkSync(filePath); // Cleanup on failure too
    console.log(error);
  }
};

module.exports = uploadOnCloudinary;
