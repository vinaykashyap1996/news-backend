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
    fs.createReadStream("./config/joined_politics_fakenews.csv")
      .pipe(csv())
      .on("data", data => results.push(data))
      .on("end", () => {
        for (i = 0; i < results.length; i++) {
          {
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

app.get("/delete", (req, res) => {
  let pattern = /fake-[a-z]/;
  NewsModel.deleteMany({ group: pattern }, (err, result) => {
    if (err) {
      res.send(err);
    }
    res.send("success");
  });
});

app.get("/datajson", (req, res) => {
  let pattern = /fake-[a-z]/;
  async.waterfall(
    [
      function(waterfallCb1) {
        NewsModel.find({ group: "satire" }).exec((err, result) => {
          if (err) {
            return waterfallCb1(err);
          }
          waterfallCb1(null, result);
        });
      },
      function(Ids, waterfallCb) {
        async.eachLimit(
          Ids,
          100,
          function(singleSource, eachCallback) {
            async.waterfall(
              [
                function(innerWaterfallCb) {
                  NewsModel.find(
                    {
                      $or: [{ source: singleSource }, { group: "satire" }]
                    },
                    (err, results) => {
                      if (err) {
                        return innerWaterfallCb("Error in saving to the DB");
                      }
                      innerWaterfallCb(null, results);
                    }
                  ).select("-_id");
                }
              ],
              function(err, resultsid) {
                if (err) {
                  return eachCallback(err);
                }
                eachCallback(resultsid, null);
              }
            );
          },
          function(resultsid, err) {
            if (err) {
              return waterfallCb(err);
            }
            waterfallCb(null, resultsid);
          }
        );
      }
    ],
    function(err, Ids) {
      if (err) {
        return res.json({ message: err });
      }

      const resultArrayfinal = [];
      const map = new Map();
      for (const item of Ids) {
        if (!map.has(item.source)) {
          map.set(item.source, true); // set any value to Map
          resultArrayfinal.push({
            lang: item.lang,
            title: item.title,
            publishedDate: item.publishedDate,
            url: item.url,
            source: item.source,
            category: item.category,
            content: item.content,
            collection: item.group
          });
        }
      }
      let xyz = resultArrayfinal.slice(0, 25);
      let data = JSON.stringify(xyz);
      fs.writeFileSync("satire_politics", data);

      res.json({ message: "success" });
    }
  );
});

app.listen(port, () => {
  console.log("server running on port number 3002");
});
