const userModel = require("../model/Signup").userModel;
const bcrypt = require("bcrypt");
const saltRounds = 10;
var Email = process.env.email;
var pass = process.env.password;
var service = process.env.service;
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const async = require("async");

exports.adduser = (req, res, next) => {
  if (!req.body.firstName) {
    return res
      .status(400)
      .json({ message: " please pass a proper first name" });
  }
  if (!req.body.lastName) {
    return res.status(400).json({ message: "please pass a proper last name" });
  }
  if (!req.body.email) {
    return res.status(400).json({ message: "please pass a proper email" });
  }
  if (!req.body.password) {
    return res.status(400).json({ message: "please pass a proper password" });
  }

  if (req.body) {
    var userData = userModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email.toLowerCase(),
      password: bcrypt.hashSync(req.body.password, saltRounds)
    });
    userData.save((err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error saving to the db" + err });
      } else {
        res.status(200).json({ message: "Successfully registerd" });
      }
    });
  } else {
    res.status(400).json({ message: "please enter Data" });
  }
};

const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.login = (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ message: "please pass a proper Email id" });
  }
  if (!req.body.password) {
    return res.status(400).json({ message: "please pass a proper password" });
  }
  userModel.findOne({ email: req.body.email.toLowerCase() }, function(
    err,
    userData
  ) {
    if (err || userData === {} || userData === null) {
      res.status(404).json({ message: "User Not Found" });
    } else if (bcrypt.compareSync(req.body.password, userData.password)) {
      const payload = { _id: userData._id };
      let token = jwt.sign(payload, process.env.SECRET);
      token = "JWT " + token;
      res.status(200).json({
        status: 200,
        message: "Successfully logged in",
        token,
        userData
      });
    } else {
      res.status(404).json({ message: "User Not Found" });
    }
  });
};

exports.forgot_password = function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString("hex");
        done(err, token);
      });
    },
    function(token, done) {
      userModel.findOne({ email: req.body.email }, function(err, user) {
        if (err) {
          next(err);
        } else if (!user) {
          res.status(400).json({ message: "cannot find user" });
        } else {
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        }
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: service,
        host: "smtp.gmail.com",
        port: 587,
        auth: {
          user: Email,
          pass: pass
        },
        tls: { rejectUnauthorized: false }
      });
      name = user.firstName;
      nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
      var mailOptions = {
        to: req.body.email,
        from: Email,
        subject: "[News App]",
        text:
          "Hi " +
          nameCapitalized +
          ",\n\n" +
          "We recieved a request to reset your News password\n\n" +
          "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
          "http://" +
          "localhost:3000/reset/" +
          token +
          "\n\n" +
          "If you did not request this, please ignore this email and your password will remain unchanged.\n"
      };
      smtpTransport.sendMail(mailOptions, function(err, result) {
        if (err) {
          res.status(404).json({ err });
        } else {
          res.status(200).json({
            message: "we have sent you a link to your registered email id "
          });
        }
      });
    }
  ]);
};

exports.reset_get = (req, res) => {
  userModel.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    },
    function(err, user) {
      if (!user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          done(err, user);
        });
        return res.json({ message: "Token Expired" });
      }
    }
  );
};

exports.reset_password = (req, res) => {
  async.waterfall([
    function(done) {
      userModel.findOne(
        {
          resetPasswordToken: req.params.token,
          resetPasswordExpires: { $gt: Date.now() }
        },
        function(err, user) {
          if (!user) {
            userModel.findOne(
              { resetPasswordToken: req.params.token },
              function(err, user1) {
                if (err) {
                  return res
                    .status(403)
                    .json({ message: "Not able to find user" });
                }
                user1.resetPasswordToken = undefined;
                user1.resetPasswordExpires = undefined;
                user1.save(function(err) {
                  done(err, user1);
                });
              }
            );
          } else {
            user.password = bcrypt.hashSync(req.body.password, saltRounds);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              done(err, user);
            });
            user1 = user.email;
          }
        }
      );
    },
    function(user, user1, done) {
      var smtpTransport = nodemailer.createTransport({
        service: service,
        host: "smtp.gmail.com",
        port: 465,
        auth: {
          user: Email,
          pass: pass
        }
      });
      name = user.firstName;
      nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
      var mailOptions = {
        to: user.email,
        from: Email,
        subject: "[News App]",
        text:
          "Hi " +
          nameCapitalized +
          ",\n\n" +
          "This is a confirmation that the password for your account " +
          user.email +
          " has just been changed.\n"
      };
      smtpTransport.sendMail(mailOptions, function(err, result) {
        if (err) {
          res.status(500).json({ message: "Error in sending email", err });
        } else {
          res.status(200).json({ message: "Success" });
        }
      });
    }
  ]);
};
