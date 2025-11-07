import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true,
    },
    item: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    orderDate: {
      type: Date,
      required: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    advanceAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingBalance: {
      type: Number,
      min: 0,
      default: 0,
    },
    deliveryStatus: {
      type: String,
      enum: ["Pending", "Delivered"],
      default: "Pending",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate remaining balance
customerSchema.pre("save", function (next) {
  if (this.isModified("totalAmount") || this.isModified("advanceAmount")) {
    this.remainingBalance = this.totalAmount - this.advanceAmount;
  }
  next();
});

// Index for faster queries
customerSchema.index({ orderDate: -1 });
customerSchema.index({ deliveryDate: 1 });
customerSchema.index({ deliveryStatus: 1 });

export default mongoose.model("Customer", customerSchema);
