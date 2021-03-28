const mongoose = require("mongoose");

const whatsappSchema = mongoose.Schema(
  {
    message: String,
    name: String,
    received: Boolean,
  },
  { timestamps: true }
);

//collection
module.exports = mongoose.model("messagecontents", whatsappSchema);
