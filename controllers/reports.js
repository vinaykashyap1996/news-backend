const ReportsModel = require("../model/Report").reportsModel;

exports.postFeeback = (req, res) => {
  // if (!req.body.newsId) {
  //   return res
  //     .status(200)
  //     .json({ status: 400, message: " please pass a proper News Id " });
  // }
  if (!req.body.userId) {
    return res
      .status(200)
      .json({ status: 400, message: " please pass a proper User Id" });
  }
  if (!req.body.feedback) {
    return res
      .status(200)
      .json({ status: 400, message: "This Field cannot be empty" });
  }
  if (req.body) {
    const reportsData = ReportsModel({
      newsId: req.body.newsId,
      userId: req.body.userId,
      feedback: req.body.feedback
    });
    reportsData.save((err, results) => {
      if (err) {
        res.status(200).json({ status: 500, message: err });
      }
      res.status(200).json({
        status: 200,
        message: "We will get back soon thank you for your feedback"
      });
    });
  } else {
    res
      .status(200)
      .json({ status: 400, message: "Please Fill the Information" });
  }
};
