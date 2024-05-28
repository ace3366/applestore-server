const mongoose = require("mongoose");
const Product = require("./Products");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  cart: {
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: { type: Number },
        productTotalPrice: { type: Number },
      },
    ],
    totalPrice: { type: Number },
  },
  role: { type: String, required: true },
});

// Method to add to cart
userSchema.methods.addToCart = async function (productId, quantity) {
  await this.populate("cart.products.productId");
  const updatedCart = [...this.cart.products];
  // Tìm index của sản phẩm được add
  const cartProductIndex = this.cart.products.findIndex((prod) =>
    prod.productId.equals(productId)
  );

  let updatedPrice = this.cart.totalPrice;

  // Nếu sản phẩm tìm được index, thêm quantity và price, còn không thì thêm mới
  if (cartProductIndex >= 0) {
    updatedCart[cartProductIndex].quantity += quantity;
    updatedCart[cartProductIndex].productTotalPrice +=
      updatedCart[cartProductIndex].productId.price * quantity;
    updatedPrice += updatedCart[cartProductIndex].productId.price * quantity;
  } else {
    const product = await Product.findById(productId);
    const productTotalPrice = product.price * quantity;
    updatedCart.push({ productId, quantity, productTotalPrice });
    updatedPrice += product.price * quantity;
  }

  this.cart.products = updatedCart;
  this.cart.totalPrice = updatedPrice;
  return await this.save();
};

// Method to subtract from cart
userSchema.methods.subtractFromCart = async function (productId, quantity) {
  await this.populate("cart.products.productId");
  const updatedCart = [...this.cart.products];
  // Find index of the product being added
  const cartProductIndex = this.cart.products.findIndex((prod) =>
    prod.productId.equals(productId)
  );

  // If product found in cart, increase the quantity, otherwise add it to cart
  let updatedPrice = this.cart.totalPrice;

  updatedCart[cartProductIndex].quantity -= quantity;
  updatedCart[cartProductIndex].productTotalPrice -=
    updatedCart[cartProductIndex].productId.price * quantity;
  updatedPrice -= updatedCart[cartProductIndex].productId.price * quantity;

  this.cart.totalPrice = updatedPrice;
  this.cart.products = updatedCart;
  return await this.save();
};

userSchema.methods.deleteProductFromCart = async function (productId) {
  try {
    const updatedCart = [...this.cart.products];
    let updatedPrice = this.cart.totalPrice;
    const cartProductIndex = updatedCart.findIndex((prod) =>
      prod.productId.equals(productId)
    );
    // Update lại total price
    updatedPrice -= updatedCart[cartProductIndex].productTotalPrice;
    // Update product trong list

    updatedCart.splice(cartProductIndex, 1);

    this.cart.totalPrice = updatedPrice;
    this.cart.products = updatedCart;
    return await this.save();
  } catch (err) {
    console.log(err);
  }
};

module.exports = mongoose.model("User", userSchema);
