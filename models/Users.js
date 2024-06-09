const mongoose = require("mongoose");
const { Schema } = mongoose; // you can do this by adding (mongoose.) just before scheme in the next line
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  mobile: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model("User", UserSchema);
