const connectToMongo = require("./db");
connectToMongo();

const express = require("express");
var cors = require("cors");
const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

async function index() {
  try {
    connectToMongo();

    app.listen(port, () => {
      console.log(`Backend listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}
app.use("/api/auth", require("./routes/auth"));

module.exports = app;
index();
