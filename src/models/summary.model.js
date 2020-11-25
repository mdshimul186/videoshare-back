const mongoose = require("mongoose");

const summarySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    options: [
      {
        title: { type: String, required: true },
        position: { type: Number, required: true },
        value: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    scriptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Script",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Summary", summarySchema);
