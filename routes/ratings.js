const express = require("express");

let router = express.Router();
module.exports = router;

const ratingController = require("../controllers/ratings");

router.post("/ratingpost", (req, res) => {
  ratingController.postratings(req, res);
});

router.get("/getrating", (req, res) => {
  ratingController.getposts(req, res);
});
