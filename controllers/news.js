const NewsModel = require("../model/News").newsModel;
const ratingsModel = require("../model/ratings").ratingModel;
// const filedata = require("../config/joined_tables.csv");
const finalResponse = [];
const re1 = [];
exports.postnews = (req, res) => {
  async.eachLimit(
    req.body.newsdetails,
    2,
    function(singleNews, eachCallback) {
      async.waterfall(
        [
          //Team Date
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
        });
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
      function(waterfallCb) {
        NewsModel.find({}, (err, results) => {
          if (err) {
            return waterfallCb("Error in saving to the DB");
          }
          waterfallCb(null, results);
        }).select("_id");
      },
      function(Ids, waterfallCb) {
        async.eachLimit(
          Ids,
          2,
          function(singleEmp, eachCallback) {
            ratingsModel
              .find(
                {
                  $and: [
                    { newsId: singleEmp._id },
                    { userId: req.query.userId }
                  ]
                },
                (err, resultsid) => {
                  if (err) {
                    return eachCallback("Error in saving to the DB");
                  }
                  eachCallback(resultsid, null);
                }
              )
              .select("newsId flag -_id");
          },
          function(resultid, err) {
            if (err) {
              return waterfallCb(err);
            }
            waterfallCb(null, Ids, resultid);
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
