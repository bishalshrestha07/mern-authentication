exports.register = (req, res, next) => {
  res.send("register");
};
exports.login = (req, res, next) => {
  res.send("login");
};
exports.forgotpassword = (req, res, next) => {
  res.send("forgotpassword");
};
exports.resetpassword = (req, res, next) => {
  res.send("resetpassword");
};
