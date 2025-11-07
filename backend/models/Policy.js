import mongoose from "mongoose";

const triggerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    enum: ["customer", "order", "stock"],
    required: true,
  },
  condition: {
    type: String,
    required: true,
  },
  threshold: {
    type: Number,
    required: true,
  },
  operator: {
    type: String,
    enum: ["<=", "<", ">=", ">", "===", "!=="],
    required: true,
  },
  notificationType: {
    type: String,
    enum: ["info", "warning", "error", "success"],
    required: true,
  },
  titleTemplate: {
    type: String,
    required: true,
  },
  messageTemplate: {
    type: String,
    required: true,
  },
  recipients: {
    type: [String], // Array of: "all", "owner", "employees", or specific user IDs
    default: ["all"],
  },
});

const policySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    triggers: [triggerSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Policy", policySchema);
