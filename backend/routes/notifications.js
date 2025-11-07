import express from "express";
import Notification from "../models/Notification.js";
import { auth, ownerOnly } from "../middleware/auth.js";

const router = express.Router();

// Get all notifications for current user
router.get("/", auth, async (req, res) => {
  try {
    const { read, limit = 50 } = req.query;

    const filter = { userId: req.userId };
    if (read !== undefined) filter.read = read === "true";

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create manual notification (owner only)
router.post("/manual", auth, ownerOnly, async (req, res) => {
  try {
    const { title, message, type = "info", recipients = ["all"] } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    // Get all active users
    const User = (await import("../models/User.js")).default;
    const allUsers = await User.find({ isActive: true });

    // Filter users based on recipients
    const targetUsers = filterUsersByRecipients(recipients, allUsers);

    // Create notification for each target user
    const notifications = [];
    for (const user of targetUsers) {
      const notification = new Notification({
        userId: user._id,
        type,
        title,
        message,
        read: false,
      });
      await notification.save();
      notifications.push(notification);
    }

    res.status(201).json({
      message: `Notification sent to ${targetUsers.length} user(s)`,
      count: targetUsers.length,
      notifications,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Helper function to filter users by recipients
function filterUsersByRecipients(recipients, allUsers) {
  if (recipients.includes("all")) {
    return allUsers;
  }

  const filtered = [];

  if (recipients.includes("owner")) {
    filtered.push(...allUsers.filter((u) => u.role === "owner"));
  }
  if (recipients.includes("employees")) {
    filtered.push(...allUsers.filter((u) => u.role === "employee"));
  }

  const specificUserIds = recipients.filter(
    (r) => r !== "owner" && r !== "employees" && r !== "all"
  );
  if (specificUserIds.length > 0) {
    filtered.push(
      ...allUsers.filter((u) => specificUserIds.includes(u._id.toString()))
    );
  }

  return [...new Set(filtered)];
}

// Test notification triggers (owner only - for debugging)
router.post("/test-triggers", auth, ownerOnly, async (req, res) => {
  try {
    const notificationService = (
      await import("../services/notificationService.js")
    ).default;
    await notificationService.checkAndCreateNotifications();
    res.json({ message: "Notification check triggered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
router.patch("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete("/:id", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get("/unread/count", auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.userId,
      read: false,
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
