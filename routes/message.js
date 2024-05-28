const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message");

router.get("/get-messages", messageController.getMessages);

module.exports = router;
