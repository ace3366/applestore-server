const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const { check } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/auth");
const productController = require("../controllers/product");
const orderController = require("../controllers/order");
const messageController = require("../controllers/message");
const User = require("../models/Users");

// Auth route
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
  authController.postSignUpAdmin
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
  authController.postLogInAdmin
);
router.post("/logout", authController.logOutAdmin);

router.get("/check-auth", authController.checkAuthAdmin);

// Product route
router.get("/get-products", productController.getProducts);
router.get("/get-product/:productId", productController.getProduct);

router.delete("/delete-product/:productId", productController.deleteProduct);
router.patch("/edit-product/:productId", productController.editProduct);
router.post(
  "/create-product",
  check("name").notEmpty().withMessage("Please enter product name"),
  check("price").notEmpty().withMessage("Please enter product price"),
  check("count").notEmpty().withMessage("Please enter product count"),
  check("category").notEmpty().withMessage("Please enter prodcut category"),
  check("long_desc")
    .notEmpty()
    .withMessage("Please enter product long description"),
  check("short_desc")
    .notEmpty()
    .withMessage("Please enter product short description"),
  check("image").custom((value, { req }) => {
    const images = req.files;
    // Kiểm tra đúng loại file chưa để báo lỗi
    if (images.length > 0) {
      const invalidFiles = images.filter(
        (file) =>
          file.mimetype !== "image/png" &&
          file.mimetype !== "image/jpg" &&
          file.mimetype !== "image/jpeg"
      );
      if (invalidFiles.length > 0) {
        throw new Error("Only accept png, jpg, jpeg");
      }
    } else {
      throw new Error("Please select image");
    }
    return true;
  }),
  productController.createProduct
);

router.get("/get-info-board", orderController.getInfoBoard);
router.get("/get-orders", orderController.getAllOrder);

// Chat route
router.get("/get-all-room", messageController.getAllRoomId);
router.get("/get-messages/:roomId", messageController.getAdminMessages);

module.exports = router;
