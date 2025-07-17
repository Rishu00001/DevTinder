const validator = require("validator");

const validateSignupData = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (
    !firstName ||
    !lastName ||
    validator.isEmpty(firstName.trim()) ||
    validator.isEmpty(lastName.trim())
  ) {
    throw new Error("First name and last name are required");
  }

  if (!validator.isLength(firstName.trim(), { min: 4, max: 50 })) {
    throw new Error("First name must be between 4 and 50 characters");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email address");
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    throw new Error(
      "Password must be at least 8 characters long and include lowercase, uppercase, number, and symbol"
    );
  }
};

const validatorProfileEditData = (req) => {
  const allowedEditFields = ["firstName", "lastName", "photo", "bio", "skills"];
  const data = req.body;

  // Disallowed fields check
  const hasInvalidFields = !Object.keys(data).every((field) =>
    allowedEditFields.includes(field)
  );
  if (hasInvalidFields) return false;

  // firstName & lastName: must be alphabetic and not empty
  if (
    data.firstName &&
    (!validator.isAlpha(data.firstName, "en-US", { ignore: " " }) ||
      validator.isEmpty(data.firstName.trim()))
  ) {
    return false;
  }

  if (
    data.lastName &&
    (!validator.isAlpha(data.lastName, "en-US", { ignore: " " }) ||
      validator.isEmpty(data.lastName.trim()))
  ) {
    return false;
  }

  // photo: must be a valid URL
  if (data.photo && !validator.isURL(data.photo)) {
    return false;
  }

  // bio: optional, max length 300
  if (data.bio && !validator.isLength(data.bio, { max: 300 })) {
    return false;
  }

  // skills: must be an array of non-empty strings
  if (
    data.skills &&
    (!Array.isArray(data.skills) ||
      !data.skills.every(
        (skill) => typeof skill === "string" && !validator.isEmpty(skill.trim())
      ))
  ) {
    return false;
  }

  return true;
};

module.exports = { validateSignupData, validatorProfileEditData };
