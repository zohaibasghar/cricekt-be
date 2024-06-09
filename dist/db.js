"use strict";

var mongoose = require("mongoose");
var URI = "mongodb+srv://zohaib:dVqrzGs1eC5YVCTl@cluster0.ozggqrs.mongodb.net/cricket";
var connectToMongo = function connectToMongo() {
  mongoose.Promise = global.Promise;
  mongoose.connect(URI).then(function () {
    return console.log("MongoDB connected");
  })["catch"](function (err) {
    return console.log(err);
  });
};
module.exports = connectToMongo;