const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
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
    fileURL: {
      type: String,
      trim: true,
      required: true,
    },
    placeholderImageURL: {
      type: String,
      trim: true,
      required: true,
    },
    length: {
      type: String,
      trim: true,
      required: true,
    },
    isEffectsApplied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);
