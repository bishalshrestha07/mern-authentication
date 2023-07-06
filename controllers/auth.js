const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.create({
      username,
      email,
      password,
    });
    res.status(201).json({
      success: true,
      token: "sfdsadfje",
    });
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
    res.status(200).json({
      success: true,
      token: "abc45xdf",
    });
  } catch (error) {
    // res.status(500).json({
    //   success: false,
    //   error: error.message,
    // });
    next(error);
  }
};
exports.forgotpassword = (req, res, next) => {
  res.send("forgotpassword");
};
exports.resetpassword = (req, res, next) => {
  res.send("resetpassword");
};
