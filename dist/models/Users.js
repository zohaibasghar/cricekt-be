"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema; // you can do this by adding (mongoose.) just before scheme in the next line
var UserSchema = new Schema({
  'name': {
    type: String,
    required: true
  },
  'email': {
    type: String,
    required: true,
    unique: true
  },
  'password': {
    type: String,
    required: true
  },
  'date': {
    type: Date,
    "default": Date.now
  }
});
module.exports = mongoose.model("User", UserSchema);