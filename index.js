require("dotenv").config();
const express = require("express");
const app = express();
module.exports = app;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const async = require("async");
const port = process.env.PORT || 3002;
const csv = require("csv-parser");
const fs = require("fs");
// const csvPath = require("./config/joined_tables.csv");
const NewsModel = require("./model/News").newsModel;

const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

mongoose.connect(process.env.db_url, { useNewUrlParser: true }, function(err) {
  if (err) console.log("Error While connecting to DB:", err);
  else console.log("DB Connected Successfully");
});

app.use(cors());
global.mongoose = mongoose;
global.async = async;
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("NodeJS");
});
const user = require("./routes/user");
app.use("/user", user);

const news = require("./routes/news");
app.use("/news", news);

const rating = require("./routes/ratings");
app.use("/rating", rating);

const results = [];
fs.createReadStream("./config/joined_tables.csv")
  .pipe(csv())
  .on("data", data => results.push(data))
  .on("end", () => {
    // console.log(results);
    NewsModel.insertMany(results);
  });

app.listen(port, () => {
  console.log("server running on port number 3002");
});
