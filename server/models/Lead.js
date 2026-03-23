const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    service: {
      type: String,
      trim: true,
    },
    subService: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ["contact_form", "chatbot", "get_started", "service_page"],
      default: "contact_form",
    },
    page: {
      type: String,
      trim: true,
    },
    device: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "converted", "closed"],
      default: "new",
    },
    notes: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

leadSchema.index({ name: "text", email: "text", phone: "text" });
leadSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Lead", leadSchema);
