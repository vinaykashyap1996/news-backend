const mongoose = require("mongoose");
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  category: { type: String, default: null },
  language: { type: String, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null }
});

const users = mongoose.model("users", userSchema);
module.exports = {
  userModel: users,
  userSchema: userSchema
};
