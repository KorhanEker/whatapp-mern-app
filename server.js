// importing
const express = require("express");
const mongoose = require("mongoose");
const Messages = require("./dbMessages");
const Pusher = require("pusher");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
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

/* We can get rid of the below code after importing corse and using it above.
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

// middlewares
var allowedOrigins = [
  `http://localhost:${port}`,
  "https://korhan-whatsapp-clone.herokuapp.com/",
];

app.use(morgan("common"));
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: (origin, fallback) => {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
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

// serve static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "whatsapp-client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "whatsapp-client", "build", "index.html")
    );
  });
}

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

// listener
app.listen(port, () => console.log(`Listening on http://localhost:${port}`));
