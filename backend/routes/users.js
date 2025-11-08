import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import {
  auth as authenticateToken,
  ownerOnly as requireOwner,
} from "../middleware/auth.js";

const router = express.Router();

// Get all employees (owner only)
router.get("/", authenticateToken, requireOwner, async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Create new employee (owner only)
router.post("/", authenticateToken, requireOwner, async (req, res, next) => {
  try {
    const { name, username, email, password, role } = req.body;

    // Validate required fields
    if (!name || !username || !password) {
      return res
        .status(400)
        .json({ message: "Name, username, and password are required" });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      username,
      email: email || undefined, // Optional email
      password: hashedPassword,
      role: role || "employee",
    });

    await user.save();

    // Create notification for owner about new employee
    try {
      const owner = await User.findOne({ role: "owner" });
      if (owner) {
        await Notification.create({
          userId: owner._id,
          title: "New Employee Created",
          message: `Employee ${name} (${username}) has been added to the system by ${req.user.name}.`,
          type: "success",
          read: false,
        });
      }
    } catch (notifError) {
      console.error(
        "Failed to create employee creation notification:",
        notifError
      );
    }

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Update employee (owner only)
router.put("/:id", authenticateToken, requireOwner, async (req, res, next) => {
  try {
    const { name, username, email, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't allow changing the owner's role
    if (user.role === "owner" && role !== "owner") {
      return res.status(403).json({ message: "Cannot change owner role" });
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
    }

    // Update fields
    if (name) user.name = name;
    if (email !== undefined) user.email = email; // Allow clearing email
    if (role) user.role = role;
    if (typeof isActive !== "undefined") user.isActive = isActive;

    await user.save();

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Delete employee (owner only)
router.delete(
  "/:id",
  authenticateToken,
  requireOwner,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't allow deleting the owner
      if (user.role === "owner") {
        return res.status(403).json({ message: "Cannot delete owner account" });
      }

      // Create notification for owner about employee deletion
      try {
        const owner = await User.findOne({ role: "owner" });
        if (owner) {
          await Notification.create({
            userId: owner._id,
            title: "Employee Deleted",
            message: `Employee ${user.name} (${user.username}) has been removed from the system by ${req.user.name}.`,
            type: "warning",
            read: false,
          });
        }
      } catch (notifError) {
        console.error(
          "Failed to create employee deletion notification:",
          notifError
        );
      }

      await user.deleteOne();

      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
);

// Reset employee password (owner only)
router.post(
  "/:id/reset-password",
  authenticateToken,
  requireOwner,
  async (req, res, next) => {
    try {
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Hash new password
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
