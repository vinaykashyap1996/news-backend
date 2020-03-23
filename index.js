require("dotenv").config();
const express = require("express");
const app = express();
const Router = app.router();
module.exports = app;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const async = require("async");
const port = process.env.PORT || 3003;
const results = [];
const csv = require("csv-parser");
const fs = require("fs");
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
app.get("*", function(req, res) {
  Router.run(routes, req.path, function(Handler, state) {
    var element = React.createElement(Handler);
    var html = React.renderToString(element);
    res.render("main", { content: html });
  });
});

app.get("/", (req, res) => {
  res.send("NodeJS");
});
const user = require("./routes/user");
app.use("/user", user);

const news = require("./routes/news");
app.use("/news", news);

const rating = require("./routes/ratings");
app.use("/rating", rating);

app.get("/postnews", (req, res) => {
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
          NewsModel.create(results[i]);
        }
      }
    });
});
app.delete("/delete", (req, res) => {
  NewsModel.deleteMany({ id: { $gt: 1000 } }, (err, result) => {
    if (err) {
      res.send(err);
    }
    res.send("success");
  });
});
app.listen(port, () => {
  console.log("server running on port number 3002");
});
