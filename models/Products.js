const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const productSchema = new Schema({
  category: { type: String, required: true },
  img1: { type: String, required: true },
  img2: { type: String },
  img3: { type: String },
  img4: { type: String },
  long_desc: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  short_desc: { type: String, required: true },
  count: { type: Number },
});

module.exports = mongoose.model("Product", productSchema);
