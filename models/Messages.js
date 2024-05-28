const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const messageSchema = new Schema({
  message: { type: String },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  roomId: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Message", messageSchema);
