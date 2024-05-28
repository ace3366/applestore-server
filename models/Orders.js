const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
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
});

orderSchema.statics.profitCount = async function () {
  try {
    const result = await this.aggregate([
      {
        $group: {
          _id: null, // Group all documents together
          total: { $sum: "$cart.totalPrice" }, // Sum the totalPrice fields
        },
      },
    ]);

    // If the aggregation returns a result, return the total value; otherwise, return 0
    return result.length > 0 ? result[0].total : 0;
  } catch (err) {
    console.log(err);
    throw err; // Rethrow the error after logging it
  }
};
module.exports = mongoose.model("Order", orderSchema);
