const mongoose = require("mongoose");

const brandingSchema = new mongoose.Schema(
  {
    brandingName: {
      type: String,
      trim: true,
      required: true,
    },
    firstLogoURL: {
      type: String,
      trim: true,
      default: ""
    },
    secondLogoURL: {
      type: String,
      trim: true,
      default: ""
    },
    textNameBackgroundHEX: {
      type: String,
      trim: true,
      default: ""
    },
    textNameBackgroundRGB: {
      type: String,
      trim: true,
      default: ""
    },
    textRoleBackgroundHEX: {
      type: String,
      trim: true,
      default: ""
    },
    textRoleBackgroundRGB: {
      type: String,
      trim: true,
      default: ""
    },
    textNameHEX: {
      type: String,
      trim: true,
      default: ""
    },
    textNameRGB: {
      type: String,
      trim: true,
      default: ""
    },
    textRoleHEX: {
      type: String,
      trim: true,
      default: ""
    },
    textRoleRGB: {
      type: String,
      trim: true,
      default: ""
    },
    firstBackgroundHEX: {
      type: String,
      trim: true,
      default: ""
    },
    firstBackgroundRGB: {
      type: String,
      trim: true,
      default: ""
    },
    secondBackgroundHEX: {
      type: String,
      trim: true,
      default: ""
    },
    secondBackgroundRGB: {
      type: String,
      trim: true,
      default: ""
    },
    fontName: {
      type: String,
      trim: true,
      default: ""
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
