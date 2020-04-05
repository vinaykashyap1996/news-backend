const express = require("express");

let router = express.Router();
module.exports = router;

const ReportController = require("../controllers/reports");
router.post("/report", (req, res) => {
  ReportController.postFeeback(req, res);
});
