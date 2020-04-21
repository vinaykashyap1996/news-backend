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
      .status(200)
      .json({ status: 400, message: " please pass a proper first name" });
  }
  if (!req.body.lastName) {
    return res
      .status(200)
      .json({ status: 400, message: "please pass a proper last name" });
  }
  if (!req.body.email) {
    return res
      .status(200)
      .json({ status: 400, message: "please pass a proper email" });
  }
  if (!req.body.password) {
    return res
      .status(200)
      .json({ status: 400, message: "please pass a proper password" });
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
        return res.status(200).json({
          status: 404,
          message: "This Email Id is Already Present"
        });
      } else {
        res
          .status(200)
          .json({ status: 200, message: "Successfully Registered", result });
      }
    });
  } else {
    res
      .status(200)
      .json({ status: 400, message: "Please Fill the Information" });
  }
};

const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.login = (req, res) => {
  if (!req.body.email) {
    return res
      .status(200)
      .json({ status: 400, message: "please pass a proper Email id" });
  }
  if (!req.body.password) {
    return res
      .status(200)
      .json({ status: 400, message: "please pass a proper password" });
  }
  userModel.findOne({ email: req.body.email.toLowerCase() }, function(
    err,
    userData
  ) {
    if (err || userData === {} || userData === null) {
      res.status(200).json({ status: 404, message: "User Not Found" });
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
      res.status(200).json({ status: 404, message: "User Not Found" });
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
          res.status(200).json({ status: 404, message: "cannot find user" });
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
          "https://news-ui-app.herokuapp.com/reset/" +
          token +
          "\n\n" +
          "If you did not request this, please ignore this email and your password will remain unchanged.\n"
      };
      smtpTransport.sendMail(mailOptions, function(err, result) {
        if (err) {
          res.status(200).json({ status: 404, message: err });
        } else {
          res.status(200).json({
            status: 200,
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
                    .status(200)
                    .json({ status: 403, message: "Not able to find user" });
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
          res
            .status(200)
            .json({ status: 500, message: "Error in sending email", err });
        } else {
          res.status(200).json({
            status: 200,
            message: "Successfully Updated your password"
          });
        }
      });
    }
  ]);
};

exports.change_password = (req, res) => {
  if (!req.body.oldPassword) {
    return res
      .status(200)
      .json({ status: 400, message: "Please Provide You're Old Password" });
  }
  if (!req.body.newPassword) {
    return res
      .status(200)
      .json({ status: 400, message: "Please Provide You're New Password" });
  }
  async.waterfall(
    [
      function(waterfallCb) {
        userModel.findOne({ _id: req.body.userId }, (err, result) => {
          if (err) {
            return waterfallCb("User Not Found");
          }
          waterfallCb(null, result);
        });
      },
      function(result, waterfallCb2) {
        if (!bcrypt.compareSync(req.body.oldPassword, result.password)) {
          return waterfallCb2("old password not matching");
        }
        userModel.findOneAndUpdate(
          { email: result.email },
          { password: bcrypt.hashSync(req.body.newPassword, saltRounds) },
          (err, result) => {
            if (err) {
              return waterfallCb2(" Error in updating");
            }
            waterfallCb2(null);
          }
        );
      }
    ],
    function(err) {
      if (err) {
        return res.status(200).json({ status: 400, message: err });
      }
      res
        .status(200)
        .json({ status: 200, message: "successfully updated your password" });
    }
  );
};
exports.userCategoryUpdate = (req, res) => {
  userModel.findOneAndUpdate(
    { _id: req.body.userId },
    { category: req.body.category },
    (err, results) => {
      if (err) {
        return res
          .status(200)
          .json({ status: 400, message: "Error in updating" });
      }
      res.status(200).json({ status: 200, message: "Successfully updated" });
    }
  );
};

exports.userLanguageUpdate = (req, res) => {
  userModel.findOneAndUpdate(
    { _id: req.body.userId },
    { language: req.body.language },
    (err, results) => {
      if (err) {
        return res
          .status(200)
          .json({ status: 400, message: "Error in updating" });
      }
      res.status(200).json({ status: 200, message: "Successfully updated" });
    }
  );
};

exports.userDetails = (req, res) => {
  userModel
    .find({ _id: req.query.userId }, (err, results) => {
      if (err) {
        return res.status(200).json({ status: 404, message: "User not found" });
      }
      res.status(200).json({ status: 200, results });
    })
    .select("-password");
};

exports.userTaskUpdate = (req, res) => {
  userModel.findOneAndUpdate(
    { _id: req.body.userId },
    { task: req.body.task },
    (err, results) => {
      if (err) {
        return res
          .status(200)
          .json({ status: 400, message: "Error in updating" });
      }
      res.status(200).json({ status: 200, message: "Successfully updated" });
    }
  );
};
