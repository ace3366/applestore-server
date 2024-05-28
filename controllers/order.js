const Order = require("../models/Orders");
const User = require("../models/Users");
const Product = require("../models/Products");
const sender = require("../util/sendMail");

// Update số lượng sản phẩm
const updateCounts = async (updates) => {
  try {
    for (const update of updates) {
      const { _id, count } = update;
      await Product.findByIdAndUpdate(_id, { $inc: { count: -count } });
      console.log("Count decreased successfully for document with ID:", _id);
    }
    console.log("All counts decreased successfully");
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
};

exports.postOrder = async (req, res, next) => {
  try {
    // Lưu order
    const user = await User.findById(req.session.user._id);

    const fullName = req.body.fullName;
    const email = req.body.email;
    const phone = req.body.phone;
    const address = req.body.address;
    const userId = req.session.user._id;
    const cart = user.cart;
    const order = new Order({ fullName, email, phone, address, userId, cart });

    await order.save();
    // Update số lượng sản phẩm
    console.log(order);
    const userProducts = cart.products.map((product) => {
      return { _id: product.productId, count: product.quantity };
    });

    // const product = await Product.find({ _id: { $in: userProducts } }).select(
    //   "count _id"
    // );
    updateCounts(userProducts);

    // Xoá sản phẩm trong cart
    user.cart.totalPrice = 0;
    user.cart.products = [];
    await user.save();
    const populatedOrder = await Order.findById(order._id).populate(
      "cart.products.productId"
    );
    sender.sendEmail(populatedOrder);
    res.status(200).json({ msg: "Done" });
  } catch (err) {
    console.log(err);
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.session.user._id });

    res.status(200).json({ orders });
  } catch (err) {
    console.log(err);
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate(
      "cart.products.productId"
    );

    res.status(200).json({ order });
  } catch (err) {
    console.log(err);
  }
};
exports.getInfoBoard = async (req, res) => {
  try {
    const userCount = await User.countDocuments({ role: "customer" });
    const orderCount = await Order.countDocuments();
    const profit = await Order.profitCount();
    res.status(200).json({ userCount, orderCount, profit });
  } catch (err) {
    console.log(err);
  }
};
exports.getAllOrder = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json({ orders });
  } catch (err) {
    console.log(err);
  }
};
