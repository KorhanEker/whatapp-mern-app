// importing
const express = require("express");
const mongoose = require("mongoose");
const Messages = require("./dbMessages");
const Pusher = require("pusher");
const cors = require("cors");
require("dotenv").config();

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

// middlewares
app.use(express.json());
app.use(cors());

/* We cna get rid of the below code after importing corse and using it above.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});
*/

// DB Config
const connection_url = process.env.CONNECTION_URL;
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
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
app.get("/", (req, res) => {
  res.status(200);
  res.json({
    message: "Hello World",
  });
});

app.get("/messages/sync", async (req, res) => {
  await Messages.find((err, data) => {
    if (err) {
      res.status(500), send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.post("/messages/new", async (req, res) => {
  const dbMessage = req.body;
  await Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(`new message created : \n ${data}`);
    }
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "whatsapp-client", "build")));
  app.get("*", (req, resp) => {
    resp.sendFile(
      path.join(__dirname, "whatsapp-client", "build", "index.html")
    );
  });
}

// listener
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
