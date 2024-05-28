const mongoose = require("mongoose");
const Message = require("../models/Messages");
const messageController = require("../controllers/message");

const chatSocket = (io) => {
  io.on("connection", (socket) => {
    // console.log("New client connected");
    const session = socket.request.session;
    // Join a room
    socket.on("joinRoom", async ({ roomId }) => {
      if (session.user) {
        if (session.user.role === "customer") {
          roomId = session.user._id.toString();
        }
        // Join room

        socket.join(roomId);
      }

      // console.log(`${username} joined room ${roomId}`);
    });

    // Leave a room
    socket.on("leaveRoom", ({ roomId, username }) => {
      socket.leave(roomId);
      console.log(`${username} left room ${roomId}`);
    });

    // Handle sending messages
    socket.on("sendMessage", async (data) => {
      let message;
      let roomId;
      // RoomId cũng chính là userId
      // Nếu là customer thì chỉ sẽ kèm theo phần message
      if (session.user.role === "customer") {
        ({ message } = data);
        roomId = session.user._id.toString();
      }
      // Nếu là admin thì sẽ kèm theo phần roomId
      else if (session.user.role === "admin") {
        ({ roomId, message } = data);
      }
      // Kiểm tra xem roomId có trong list chưa
      // Nếu chưa thì thêm vào list
      const roomList = await messageController.getRoomList();

      if (!roomList.includes(roomId)) {
        roomList.push(roomId);
        io.emit("roomList", roomList);
      }

      // Nếu message là /end thì xoá hết đoạn chat, đồng thời update lại roomList cho admin
      if (message === "/end") {
        await messageController.deleteMessage(roomId);
        io.to(roomId).emit("message", { message, end: true });
        const roomList = await messageController.getRoomList();

        io.emit("roomList", roomList);
      } else {
        const _id = new mongoose.Types.ObjectId();
        const userId = session.user._id;
        const newMessage = await messageController.saveMessage({
          _id,
          userId,
          roomId,
          message,
        });

        // io.to(roomId).emit("message", { message, userId: session.user._id });
        io.to(roomId).emit("message", { message, userId: session.user, _id });
      }
    });

    socket.on("disconnect", () => {
      // console.log("Client disconnected");
    });
  });
};

module.exports = chatSocket;
