const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    password:String,
    facebookId:{type:String,default:null},
    googleId:{type:String,default:null},
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  });
  
  const users = mongoose.model("users", userSchema);
  module.exports = {
    userModel: users,
    userSchema: userSchema
  };