// Import package
const express = require("express");
const mongoose = require("mongoose");
const dotEnv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const path = require("path");

// Import internal
const chatSocket = require("./sockets/chatSocket");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const orderRoute = require("./routes/order");
const adminRoute = require("./routes/admin");
const messageRoute = require("./routes/message");

// Config
dotEnv.config();
const app = express();
const port = process.env.PORT || 5000;
const store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  collection: "sessions",
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Session middleware configuration
const sessionMiddleware = session({
  secret: "my secret",
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    httpOnly: true,
    secure: true, // Set to true if using HTTPS
    sameSite: "lax", // Ensure cookies are sent for cross-origin requests
  },
});

// Middleware-Config
app.use(sessionMiddleware);
// Trust the first proxy to get the correct protocol (https)
app.set("trust proxy", 1);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  cors({
    origin: true, // replace with your frontend's domain
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter }).array("image", 5));

//Middleware - route
app.use(authRoute);
app.use(productRoute);
app.use(orderRoute);
app.use(messageRoute);
app.use("/admin", adminRoute);

// Setup Server
mongoose
  .connect(`${process.env.MONGODB_URL}`)
  .then((result) => {
    const server = app.listen(port);
    const io = require("./socket").init(server);

    // Share session middleware with Socket.io
    io.use((socket, next) => {
      sessionMiddleware(socket.request, socket.request.res || {}, next);
    });

    chatSocket(io);
  })
  .catch((err) => {
    console.log(err);
  });
