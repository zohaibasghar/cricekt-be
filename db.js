const mongoose = require("mongoose");
const URI = "mongodb+srv://zohaib:dVqrzGs1eC5YVCTl@cluster0.ozggqrs.mongodb.net/cricket";

const connectToMongo = () => {
  mongoose.Promise = global.Promise;
  mongoose
    .connect(URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));
};
module.exports = connectToMongo;
