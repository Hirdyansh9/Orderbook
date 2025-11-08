import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Register new user (Owner only in production)
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    // Check if username exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
      role: role || "employee",
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt:", { username, passwordProvided: !!password });

    // Find user by username
    const user = await User.findOne({ username });
    console.log(
      "User found:",
      user
        ? { id: user._id, username: user.username, isActive: user.isActive }
        : "No user found"
    );

    if (!user) {
      return res.status(401).json({ error: "User not found. Please check your username." });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: "Your account has been deactivated. Please contact the administrator." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token with longer expiry
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  res.json({ user: req.user });
});

// Logout (client-side handles token removal)
router.post("/logout", auth, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
