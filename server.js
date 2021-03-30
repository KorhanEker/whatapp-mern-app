// importing
const express = require("express");
const mongoose = require("mongoose");
const Messages = require("./dbMessages");
const Pusher = require("pusher");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const path = require("path");
const middlewares = require("./middlewares");

// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1178804",
  key: "757dbb443cdaa980d8a6",
  secret: "41b1e1d2f6d660fead2e",
  cluster: "eu",
  useTLS: true,
});

// DB Config
const connection_url = process.env.CONNECTION_URL;
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// middlewares

app.use(morgan("common"));
app.use(express.json());
app.use(cors());
/*
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
*/
//  Pusher Use
const db = mongoose.connection;
db.once("open", () => {
  console.log("Db connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    console.log("A change occured", change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        createdAt: messageDetails.createdAt,
        received: messageDetails.received,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
});

//  api routes
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));
  app.get("/ping", (req, res) => {
    res.send("pong");
  });
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

app.get("api/messages/sync", async (req, res) => {
  await Messages.find((err, data) => {
    if (err) {
      res.status(500), send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.post("api/messages/new", async (req, res) => {
  const dbMessage = req.body;
  await Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(`new message created : \n ${data}`);
    }
  });
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// listener
app.listen(port, process.env.CORS_ORIGIN, () =>
  console.log(`Listening on ${port}`)
);
