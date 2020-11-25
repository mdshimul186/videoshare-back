const mongoose = require("mongoose");

const scriptSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      trim: true,
      required: true,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    template: [{ type: mongoose.Schema.Types.ObjectId, ref: "Template" }],
    summary: [{ type: mongoose.Schema.Types.ObjectId, ref: "Summary" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Script", scriptSchema);
