const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description:{
      type: String,
      trim: true,
      default:""
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
    },
    type:{
      type:String,
      enum: ["individual", "default"],
      default: "individual",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);
