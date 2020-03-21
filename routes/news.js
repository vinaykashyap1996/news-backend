const express = require("express");

let router = express.Router();
module.exports = router;

const NewsController = require("../controllers/news");

router.post("/newspost", (req, res) => {
  NewsController.postnews(req, res);
});

router.get("/getnews", (req, res) => {
  NewsController.getnews(req, res);
});

router.get("/sessiondata", (req, res) => {
  NewsController.getnews1(req, res);
});

router.get("/postnews", (req, res) => {
  NewsController.postNewsFile(req, res);
});
