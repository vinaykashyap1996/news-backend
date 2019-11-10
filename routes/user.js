const express = require("express");

let router = express.Router();
module.exports = router;

let userController = require("../controllers/user");

router.post("/signup", (req, res) => {
  userController.adduser(req, res);
});

router.post("/signin", (req, res) => {
  userController.login(req, res);
});

router.post("/forgotpassword", (req, res) => {
  userController.forgot_password(req, res);
});

router.post("/resetpassword/:token", (req, res) => {
  userController.reset_password(req, res);
});
