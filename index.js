require("dotenv").config();
const express = require("express");
const app = express();
module.exports = app;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const async = require("async");
const port = process.env.PORT || 3002;
const results = [];
const csv = require("csv-parser");
const fs = require("fs");
const Multer = require("multer");
const uploads = Multer({ dest: "uploads/" });
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

const report = require("./routes/report");
app.use("/report", report);

const rating = require("./routes/ratings");
app.use("/rating", rating);

const type = uploads.single("image");
app.post("/image", type, (req, res) => {
  var tmp_path = req.file.path;
  var target_path = "uploads/" + req.file.originalname;
  NewsModel.findOneAndUpdate(
    { id: "11" },
    { image: target_path },
    (err, result) => {
      if (err) {
        return res.send(err);
      }
      res.send("Success");
    }
  );
});
app.get("/postnews", async (req, res, next) => {
  try {
    fs.createReadStream("./config/joined_tables.csv")
      .pipe(csv())
      .on("data", data => results.push(data))
      .on("end", () => {
        for (i = 0; i < results.length; i++) {
          if (
            results[i]["body"] != " " &&
            results[i]["lang"] != "lang_err" &&
            results[i]["publish_date"] != ""
          ) {
            NewsModel.insertMany(results[i], { ordered: false }, function(
              error,
              docs
            ) {});
          }
        }
      });
  } catch (err) {
    next(err);
  }
});

app.delete("/delete", (req, res) => {
  NewsModel.deleteMany({ id: { $gt: 1000 } }, (err, result) => {
    if (err) {
      res.send(err);
    }
    res.send("success");
  });
});

app.get("/unique", (req, res) => {
  NewsModel.distinct("url")
    .count()
    .exec(function(err, count) {
      if (err) {
        return res.json({ err });
      }
      res.status(200).json({ count });
    });
});

app.listen(port, () => {
  console.log("server running on port number 3002");
});
