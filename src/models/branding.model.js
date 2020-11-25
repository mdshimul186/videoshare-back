const mongoose = require("mongoose");

const brandingSchema = new mongoose.Schema(
  {
    logoName: {
      type: String,
      trim: true,
      required: true,
    },
    firstLogoURL: {
      type: String,
      trim: true,
      required: true,
    },
    secondLogoURL: {
      type: String,
      trim: true,
      required: true,
    },
    firstHEX: {
      type: String,
      trim: true,
      required: true,
    },
    firstRGB: {
      type: String,
      trim: true,
      required: true,
    },
    secondHEX: {
      type: String,
      trim: true,
      required: true,
    },
    secondRGB: {
      type: String,
      trim: true,
      required: true,
    },
    textNameHEX: {
      type: String,
      trim: true,
      required: true,
    },
    textNameRGB: {
      type: String,
      trim: true,
      required: true,
    },
    textRoleHEX: {
      type: String,
      trim: true,
      required: true,
    },
    textRoleRGB: {
      type: String,
      trim: true,
      required: true,
    },
    firstBackgroundHEX: {
      type: String,
      trim: true,
      required: true,
    },
    firstBackgroundRGB: {
      type: String,
      trim: true,
      required: true,
    },
    secondBackgroundHEX: {
      type: String,
      trim: true,
      required: true,
    },
    secondBackgroundRGB: {
      type: String,
      trim: true,
      required: true,
    },
    fontName: {
      type: String,
      trim: true,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Branding", brandingSchema);
