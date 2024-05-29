const express = require("express");
const productController = require("../controllers/product");
const router = express.Router();

router.get("/get-products", productController.getAllProducts);

router.get("/get-product/:productId", productController.getProduct);
router.get(
  "/get-products-category/:category",
  productController.getProductCategory
);

router.get(
  "/get-related-product/:category",
  productController.getRelatedProduct
);

router.get("/get-cart", productController.getCart);

router.post("/add-to-cart/:productId", productController.addToCart);

router.post(
  "/subtract-from-cart/:productId",
  productController.subtractFromCart
);

router.delete(
  "/delete-product-from-cart/:productId",
  productController.deleteProductFromCart
);

module.exports = router;
