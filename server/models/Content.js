const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "html", "image", "json"],
      default: "text",
    },
  },
  { timestamps: true }
);

contentSchema.index({ section: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("Content", contentSchema);
