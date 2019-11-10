const ratingModel = require("../model/ratings").ratingModel;

exports.postratings = (req, res) => {
  ratingModel.findOneAndUpdate(
    { $and: [{ userId: req.body.userId }, { newsId: req.body.newsId }] },
    { belivibalityIndex: req.body.bi, priorknowledge: req.body.pk },
    (err, results) => {
      if (err) {
        return res.status(404).json({ message: "Error in finding the user" });
      } else if (results == null || results == []) {
        ratingsData = ratingModel({
          userId: req.body.userId,
          newsId: req.body.newsId,
          belivibalityIndex: req.body.bi,
          priorknowledge: req.body.pk
        });
        ratingsData.save((err, result) => {
          if (err) {
            return res.status(400).json({ message: "error in updating data" });
          }
          return res.status(200).json({ message: "success" });
        });
      } else {
        res.status(200).json({ message: "Successfully updated " });
      }
    }
  );
};

exports.getposts = (req, res) => {
  if (!req.query.userId) {
    return res.status(400).json({ message: " please pass a proper userId" });
  }
  if (!req.query.newsId) {
    return res.status(400).json({ message: "please pass a proper newsId" });
  }
  ratingModel.findOne(
    { $and: [{ userId: req.query.userId }, { newsId: req.query.newsId }] },
    (err, results) => {
      if (err) {
        return res.status(404).json({ message: "Error in the user details" });
      }
      res.status(200).json({ message: "success", results });
    }
  );
};
