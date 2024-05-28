const Product = require("../models/Products");
const Order = require("../models/Orders");
const User = require("../models/Users");
const { validationResult } = require("express-validator");
// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");

const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANq9C0IjVbCBP69vroBkZYsiPJO2LOVbE",
  authDomain: "applestorestorage.firebaseapp.com",
  projectId: "applestorestorage",
  storageBucket: "applestorestorage.appspot.com",
  messagingSenderId: "698267547012",
  appId: "1:698267547012:web:25d6bed04c145eb13119d1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage();
// Export
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products });
  } catch (err) {
    console.log(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    res.status(200).json({ product });
  } catch (err) {
    console.log(err);
  }
};

exports.getRelatedProduct = async (req, res, next) => {
  try {
    const category = req.params.category;
    const relatedProducts = await Product.find({ category });

    res.status(200).json({ relatedProducts });
  } catch (err) {
    console.log(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const quantity = req.body.quantity;
    const product = await Product.findById(productId);
    if (quantity > product.count) {
      return res.status(300).json({ msg: "Quantity not enough!" });
    }

    const user = await User.findById(req.session.user._id);
    const result = await user.addToCart(productId, quantity);
    res.status(200).json({ msg: "Product has been added to cart" });
  } catch (err) {
    console.log(err);
  }
};
exports.subtractFromCart = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const quantity = req.body.quantity;
    const user = await User.findById(req.session.user._id);
    const result = await user.subtractFromCart(productId, quantity);
    res.status(200).json({ msg: "Product has been subtract from cart" });
  } catch (err) {
    console.log(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id).populate(
      "cart.products.productId"
    );

    res.status(200).json({ cart: user._doc.cart });
  } catch (err) {
    console.log(err);
  }
};

// Admin route

exports.deleteProductFromCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.session.user._id);
    const result = await user.deleteProductFromCart(req.params.productId);
    res.status(200).json({ msg: "Product has been deleted from cart" });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    await Product.findByIdAndDelete(productId);
    res.status(200).json({ msg: "Product has been deleted" });
  } catch (err) {
    console.log(err);
  }
};
exports.editProduct = async (req, res) => {
  try {
    // Báo lỗi với express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(300).json({ error: errors.array() });
    }
    const { name, price, category, long_desc, short_desc, count } = req.body;

    const productId = req.params.productId;
    const product = await Product.findById(productId);

    product.name = name;
    product.price = price;
    product.count = count;
    product.category = category;
    product.long_desc = long_desc;
    product.short_desc = short_desc;

    await product.save();
    res.status(200).json({ product });
  } catch (err) {
    console.log(err);
  }
};
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      name: { $regex: req.query.query, $options: "i" },
    });
    res.status(200).json({ products });
  } catch (err) {
    console.log(err);
  }
};
exports.createProduct = async (req, res, next) => {
  try {
    // Báo lỗi với express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(300).json({ error: errors.array() });
    }
    const { name, price, category, long_desc, short_desc, count } = req.body;
    // Nhận array image nhận được
    const images = req.files;

    // Chiết xuất ảnh sang dạng URL dể lưu vào DB
    const imgPathPromises = images.map(async (file) => {
      const storageRef = ref(
        storage,
        `files/${Date.now()}-${file.originalname}`
      );
      const metadata = {
        contentType: file.mimetype,
      };
      // Lưu vào firestore
      const snapshot = await uploadBytes(storageRef, file.buffer, metadata);
      // Lấy link imgage để lưu vào DB
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    });

    const imgPath = await Promise.all(imgPathPromises);
    const [img1, img2, img3, img4] = imgPath;
    // Lưu vào DB
    const product = await Product.create({
      name,
      price,
      count,
      category,
      long_desc,
      short_desc,
      img1,
      img2,
      img3,
      img4,
    });
    res.status(200).json({ msg: "Product has been created" });
  } catch (err) {
    console.log(err);
  }
};
// exports.createProduct = async (req, res, next) => {
//   try {
//     // Báo lỗi với express-validator
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(300).json({ error: errors.array() });
//     }
//     const { name, price, category, long_desc, short_desc, count } = req.body;
//     const images = req.files;

//     // Chiết xuất ảnh sang dạng URL dể lưu vào DB
//     const imgPath = images.map(
//       (file) => `${process.env.SERVER_API}/${file.path}`
//     );
//     const [img1, img2, img3, img4] = imgPath;
//     // Lưu vào DB
//     const product = await Product.create({
//       name,
//       price,
//       count,
//       category,
//       long_desc,
//       short_desc,
//       img1,
//       img2,
//       img3,
//       img4,
//     });
//     res.status(200).json({ msg: "Product has been created" });
//   } catch (err) {
//     console.log(err);
//   }
// };
