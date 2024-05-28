// Import lib
const express = require("express");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");

//Import internal
const User = require("../models/Users");
const authController = require("../controllers/auth");
const router = express.Router();

router.post(
  "/signup",
  [
    check("fullName").notEmpty().withMessage("Please enter your name"),
    check("email")
      .notEmpty()
      .withMessage("Please enter your email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("This email has been registered");
        }
      }),
    check("password")
      .notEmpty()
      .withMessage("Please enter your password")
      .isLength({ min: 8 })
      .withMessage("Your password must contain at least 8 characters"),
    check("phone").notEmpty().withMessage("Please enter your phone number"),
  ],
  authController.postSignUp
);

router.post(
  "/login",
  [
    check("email")
      .notEmpty()
      .withMessage("Please enter your email and password")
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });

        if (!user) {
          return Promise.reject("Please check your email or password again");
        }

        const match = await bcrypt.compare(req.body.password, user.password);
        if (!match) {
          return Promise.reject("Please check your email or password again");
        }
      }),
  ],
  authController.postLogIn
);

router.get("/check-auth", authController.checkAuth);

router.post("/logout", authController.logOut);

router.get("/get-user-info", authController.getUserInfo);

module.exports = router;
