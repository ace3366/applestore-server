const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/Users");
const Order = require("../models/Orders");

exports.postSignUp = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(300).json({ error: errors.array() });
    }
    const email = req.body.email;
    const fullName = req.body.fullName;
    const phone = req.body.phone;
    const password = await bcrypt.hash(req.body.password, 10);
    const role = "customer";
    const user = new User({
      email,
      fullName,
      phone,
      password,
      cart: { totalPrice: 0 },
      role,
    });
    await user.save();
    res.status(200).json({ msg: "User has been created" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Something go wrong" });
  }
};

exports.postLogIn = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(300).json({ error: errors.array() });
    }
    req.session.isLoggedIn = true;
    req.session.user = await User.findOne({ email: req.body.email });

    res.status(200).json({ msg: "login success" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Something go wrong" });
  }
};

exports.checkAuth = (req, res, next) => {
  console.log(req.session.isLoggedIn);

  if (req.session.isLoggedIn) {
    return res
      .status(200)
      .json({ isAuth: req.session.isLoggedIn, user: req.session.user });
  }
  res.status(200).json({ isAuth: false, msg: req.session });
};

exports.logOut = (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ msg: "User has logout" });
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id);
    res.status(200).json({
      user: { fullName: user.fullName, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.log(err);
  }
};

//Admin section
exports.postSignUpAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(300).json({ error: errors.array() });
    }
    const email = req.body.email;
    const fullName = req.body.fullName;
    const phone = req.body.phone;
    const password = await bcrypt.hash(req.body.password, 10);
    const role = "admin";
    const user = new User({
      email,
      fullName,
      phone,
      password,
      role,
    });
    await user.save();
    res.status(200).json({ msg: "User has been created" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Something go wrong" });
  }
};

exports.postLogInAdmin = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(300).json({ error: errors.array() });
    }
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (user.role !== "admin") {
      return res.status(300).json({ error: [{ msg: "You are not admin" }] });
    }
    req.session.isLoggedIn = true;
    req.session.user = user;

    res.status(200).json({ msg: "login success" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ msg: "Something go wrong" });
  }
};

exports.checkAuthAdmin = async (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res
      .status(200)
      .json({ isAuth: req.session.isLoggedIn, user: req.session.user });
  }
  res.status(200).json({ isAuth: false });
};

exports.logOutAdmin = async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ msg: "User has logout" });
    });
  } catch (err) {
    console.log(err);
  }
};
