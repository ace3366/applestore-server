const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order");
router.post("/post-order", orderController.postOrder);
router.get("/get-orders", orderController.getOrders);
router.get("/get-order/:orderId", orderController.getOrder);

module.exports = router;
