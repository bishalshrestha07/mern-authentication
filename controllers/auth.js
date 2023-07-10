const crypto = require("crypto");
const User = require("../models/User");

const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");

exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.create({
      username,
      email,
      password,
    });
    // res.status(201).json({
    //   success: true,
    //   token: "sfdsadfje",
    // });
    sendToken(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,

      error: error.message,
    });
    // next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // res.status(400).json({
    //   success: false,
    //   error: "please provide email or password",
    // });
    return next(new ErrorResponse("please provide email or password", 400));
  }
  try {
    const user = await User.findOne({ email }).select("+password");
    console.log("userdetails------->", user);

    if (!user) {
      // res.status(404).json({
      //   success: false,
      //   error: "Invalid Credentials",
      // });
      return next(new ErrorResponse("Invalid Credentials", 401));
    }
    const isMatch = await user.matchPasswords(password);

    if (!isMatch) {
      // res.status(404).json({
      //   success: false,
      //   error: "Invalid Credential",
      // });
      return next(new ErrorResponse("Invalid Credentials", 401));
    }
    // res.status(200).json({
    //   success: true,
    //   token: "abc45xdf",
    // });
    sendToken(user, 200, res);
  } catch (error) {
    // res.status(500).json({
    //   success: false,
    //   error: error.message,
    // });
    next(error);
  }
};

exports.forgotpassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse("Email could not be sent", 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `http://localhost:3000/password/${resetToken}`;
    const message = `
    <h1> You have requested a password reset</h1>
    <p>please go to this link to reset you password</p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: message,
      });
      res.status(200).json({ success: true, data: "Email Sent" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new ErrorResponse("Email could not be send", 500));
    }
  } catch (error) {
    next(error);
  }
};

exports.resetpassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  console.log(resetPasswordToken);
  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    console.log("useeer---->", user);

    if (!user) {
      return next(new ErrorResponse("Invalid Reset Token", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      data: "Password Reset Success",
    });
  } catch (error) {
    next(error);
  }
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({ success: true, token });
};
