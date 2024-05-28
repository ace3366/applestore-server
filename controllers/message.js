const Message = require("../models/Messages");

exports.saveMessage = async (data) => {
  try {
    const newMessage = new Message(data);
    await newMessage.save();
    return newMessage;
  } catch (err) {
    console.log(err);
  }
};

exports.getMessages = async (req, res) => {
  try {
    const roomId = req.session.user._id;
    const messages = await Message.find({ roomId }).populate("userId");

    res.status(200).json(messages);
  } catch (err) {
    console.log(err);
  }
};

exports.deleteMessage = async (roomId) => {
  try {
    await Message.deleteMany({ roomId });
  } catch (err) {
    console.log(err);
  }
};

exports.getRoomList = async () => {
  try {
    const roomList = await Message.distinct("roomId");
    return roomList.map((roomId) => roomId.toString());
  } catch (err) {
    console.log(err);
  }
};
exports.getAllRoomId = async (req, res) => {
  try {
    const rooms = await Message.distinct("roomId");
    res.status(200).json(rooms);
  } catch (err) {
    console.log(err);
  }
};

exports.getAdminMessages = async (req, res) => {
  try {
    const roomId = req.params.roomId;

    const messages = await Message.find({ roomId }).populate("userId");
    res.status(200).json(messages);
  } catch (err) {
    console.log(err);
  }
};
