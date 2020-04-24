const NewsModel = require("../model/News").newsModel;
const ratingsModel = require("../model/ratings").ratingModel;
const userModel = require("../model/Signup").userModel;

exports.postnews = (req, res) => {
  async.eachLimit(
    req.body.newsdetails,
    2,
    function(singleNews, eachCallback) {
      async.waterfall(
        [
          function(innerWaterfallCb) {
            var NewsData = NewsModel({
              url: singleNews.url,
              source: singleNews.source,
              claim: singleNews.claim,
              claim_url: singleNews.claim_url,
              label: singleNews.label,
              date: singleNews.date,
              author: singleNews.author
            });
            NewsData.save((err, results) => {
              if (err) {
                return innerWaterfallCb(
                  "Error while inserting employee project details."
                );
              }
              innerWaterfallCb(null);
            });
          }
        ],
        function(err) {
          if (err) {
            return eachCallback(err);
          }
          eachCallback(null);
        }
      );
    },
    function(err) {
      if (err) {
        return res.status(400).json({ message: err });
      }
      res.status(200).json({ message: "Successfully Processed" });
    }
  );
};

exports.getnews = (req, res) => {
  async.waterfall(
    [
      function(waterfallCb) {
        NewsModel.find({ _id: req.query.newsId }, (err, results) => {
          if (err) {
            return waterfallCb("Error in saving to the DB");
          }
          waterfallCb(null, results);
        }).sort({ source: -1 });
      },
      function(Ids, waterfallCb2) {
        async.eachLimit(Ids, 2, function(singleEmp, eachCallback) {
          async.waterfall(
            [
              function(innerWaterfallCb) {
                ratingsModel.find(
                  {
                    $and: [
                      { newsId: singleEmp._id },
                      { userId: req.query.userId }
                    ]
                  },
                  (err, resultsid) => {
                    if (err) {
                      return innerWaterfallCb("Error in saving to the DB");
                    }
                    innerWaterfallCb(null, resultsid);
                  }
                );
              }
            ],
            function(err, resultsid) {
              if (err) {
                return waterfallCb2(err);
              }
              waterfallCb2(null, Ids, resultsid);
            }
          );
        });
      }
    ],
    function(err, resultsid, Ids) {
      if (err) {
        return res.json({ message: err });
      }
      res.json({ message: "results", newsData: resultsid, userData: Ids });
    }
  );
};

exports.getSessionData = (req, res) => {
  async.waterfall(
    [
      function(waterfallCb1) {
        userModel.findOne({ _id: req.query.userId }, (err, userResult) => {
          if (err) {
            return waterfallCb1("Error in fetching user details");
          }
          waterfallCb1(null, userResult);
        });
      },
      function(userResult, waterfallCb) {
        const selection = {
          $and: [
            { category: userResult.category },
            { lang: userResult.language }
          ]
        };
        const query = {};
        var selections =
          userResult.language == null || userResult.category == null
            ? query
            : selection;
        NewsModel.find(selections, (err, results) => {
          if (err) {
            return waterfallCb("Error in saving to the DB");
          }
          waterfallCb(null, results);
        })
          .select("_id")
          .sort({ source: -1 });
      },
      function(Ids, waterfallCb) {
        async.eachLimit(
          Ids,
          2,
          function(singleEmp, eachCallback) {
            async.waterfall(
              [
                function(innerWaterfallCb) {
                  ratingsModel
                    .find({ userId: req.query.userId }, (err, resultsid) => {
                      if (err) {
                        return innerWaterfallCb("Error in saving to the DB");
                      }
                      innerWaterfallCb(null, resultsid, Ids);
                    })
                    .select("newsId flag -_id");
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
            waterfallCb(null, Ids, resultsid);
          }
        );
      }
    ],
    function(err, resultsid, Ids) {
      if (err) {
        return res.json({ message: err });
      }
      res.json({ message: "results", newsIds: resultsid, sessionData: Ids });
    }
  );
};

exports.update = (req, res) => {
  async.waterfall(
    [
      function(waterfallcb) {
        NewsModel.find({ source: "youtube.com" }, (err, result) => {
          if (err) {
            waterfallcb("error in fetching");
          }
          waterfallcb(null, result);
        });
      },
      function(newsResult, waterfallCb2) {
        async.eachLimit(
          newsResult,
          2,
          function(singleNews, eachCallback) {
            async.waterfall(
              [
                function(innerWaterfallCb) {
                  let newsId = singleNews._id;
                  let url = singleNews.url
                    .replace(/\b&fbclid=[0-9a-zA-Z_@.#+-]{1,50}\b/, "")
                    .replace("reload=9&", "")
                    .replace("time_continue=1&", "")
                    .replace("watch?v=", "embed/")
                    .replace(/\b&feature=[0-9a-zA-Z_@.#+-]{1,50}\b/, "")
                    .replace(/\b&t=[0-9a-zA-Z_@.#+-]s{1,50}\b/, "")
                    .replace(/\b&t=[0-9a-zA-Z_@.#+-]{1,50}\b/, "")
                    .replace(/\b&mod=[0-9a-zA-Z_@.#+-]{1,50}\b/, "");
                  NewsModel.updateMany(
                    { _id: newsId },
                    { url: url },
                    (err, result) => {
                      if (err) {
                        return innerWaterfallCb("updating error" + err);
                      }
                      innerWaterfallCb(null);
                    }
                  );
                }
              ],
              function(err) {
                if (err) {
                  return eachCallback(err);
                }
                eachCallback(null);
              }
            );
          },
          function(err) {
            if (err) {
              return waterfallCb2(err);
            }
            waterfallCb2(null);
          }
        );
      }
    ],
    function(err) {
      if (err) {
        return res.status(200).json({ status: 403, message: err });
      }
      res.json({ status: 200, message: "updating successfull" });
    }
  );
};

exports.category = (req, res) => {
  async.waterfall(
    [
      function(waterfallCb) {
        NewsModel.find({}, (err, result) => {
          if (err) {
            return waterfallCb("Error in fetching the results");
          }
          waterfallCb(null, result);
        });
      },
      function(newsResult, waterfallCb2) {
        async.eachLimit(
          newsResult,
          2,
          function(singleNews, eachCallback) {
            async.waterfall(
              [
                function(innerWaterfallCb) {
                  let newsId = singleNews._id;
                  let social =
                    singleNews.url.includes("facebook") ||
                    singleNews.url.includes("youtube.com") ||
                    singleNews.url.includes("twitter") ||
                    singleNews.url.includes("instagram") ||
                    singleNews.url.includes("whatsapp")
                      ? "social media"
                      : "news post";
                  NewsModel.updateMany(
                    { _id: newsId },
                    { category: social },
                    (err, result) => {
                      if (err) {
                        return innerWaterfallCb("updating error");
                      }
                      innerWaterfallCb(null);
                    }
                  );
                }
              ],
              function(err) {
                if (err) {
                  return eachCallback(err);
                }
                eachCallback(null);
              }
            );
          },
          function(err) {
            if (err) {
              return waterfallCb2(err);
            }
            waterfallCb2(null);
          }
        );
      }
    ],
    function(err) {
      if (err) {
        return res.status(200).json({ status: 403, message: err });
      }
      res.json({ status: 200, message: "updating successfull" });
    }
  );
};
