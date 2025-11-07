import express from "express";
import Policy from "../models/Policy.js";
import { auth, ownerOnly } from "../middleware/auth.js";

const router = express.Router();

// Get user's policy
router.get("/", auth, async (req, res) => {
  try {
    console.log("Getting policy for user:", req.userId);
    let policy = await Policy.findOne({ userId: req.userId });

    // Create default policy if not exists
    if (!policy) {
      console.log("Creating default policy for user:", req.userId);
      policy = new Policy({
        userId: req.userId,
        triggers: getDefaultTriggers(),
      });
      await policy.save();
      console.log("Default policy created successfully");
    }

    res.json(policy);
  } catch (error) {
    console.error("Error in GET /api/policies:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update user's policy (owner only)
router.put("/", auth, ownerOnly, async (req, res) => {
  try {
    const { triggers } = req.body;

    let policy = await Policy.findOne({ userId: req.userId });

    if (!policy) {
      policy = new Policy({
        userId: req.userId,
        triggers,
      });
    } else {
      policy.triggers = triggers;
    }

    await policy.save();
    res.json(policy);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Helper function to get default triggers
function getDefaultTriggers() {
  return [
    {
      id: "deliveryReminder2Days",
      name: "Delivery Reminder",
      enabled: true,
      type: "order",
      condition: "deliveryInDays",
      threshold: 2,
      operator: "<=",
      notificationType: "info",
      titleTemplate: "Upcoming Delivery",
      messageTemplate:
        "Order for {customerName} ({item}) is scheduled for delivery on {deliveryDate}. Contact: {mobileNo}",
    },
    {
      id: "deliveryDeadline",
      name: "Delivery Deadline Today",
      enabled: true,
      type: "order",
      condition: "deliveryInDays",
      threshold: 0,
      operator: "===",
      notificationType: "warning",
      titleTemplate: "Delivery Due Today",
      messageTemplate:
        "Order for {customerName} ({item}, {quantity} units) must be delivered today. Address: {address}",
    },
    {
      id: "deliveryOverdue",
      name: "Delivery Overdue",
      enabled: true,
      type: "order",
      condition: "deliveryInDays",
      threshold: 0,
      operator: "<",
      notificationType: "error",
      titleTemplate: "Delivery Overdue",
      messageTemplate:
        "Order for {customerName} ({item}) was due {days} day(s) ago. Immediate action required!",
    },
    {
      id: "paymentPendingAfterDelivery",
      name: "Payment Pending After Delivery",
      enabled: true,
      type: "order",
      condition: "remainingBalance",
      threshold: 0,
      operator: ">",
      notificationType: "warning",
      titleTemplate: "Payment Pending",
      messageTemplate:
        "{customerName} has pending payment of ₹{remainingBalance} (Total: ₹{totalAmount}, Advance: ₹{advanceAmount}). Contact: {mobileNo}",
    },
    {
      id: "highValueOrder",
      name: "High Value Order",
      enabled: true,
      type: "order",
      condition: "totalAmount",
      threshold: 50000,
      operator: ">=",
      notificationType: "success",
      titleTemplate: "High Value Order",
      messageTemplate:
        "New high-value order from {customerName} for ₹{totalAmount} ({item}, {quantity} units).",
    },
    {
      id: "largeQuantityOrder",
      name: "Large Quantity Order",
      enabled: false,
      type: "order",
      condition: "quantity",
      threshold: 100,
      operator: ">=",
      notificationType: "info",
      titleTemplate: "Large Quantity Order",
      messageTemplate:
        "Order from {customerName} includes {quantity} units of {item}.",
    },
  ];
}

export default router;
