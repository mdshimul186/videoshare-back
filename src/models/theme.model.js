const mongoose = require("mongoose");

const themeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    systemName: {
      type: String,
      trim: true,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageURL: {
      type: String,
      trim: true,
      required: true,
    },
    price: {
      type: Number,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Theme", themeSchema);
