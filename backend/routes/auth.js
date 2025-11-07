import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";
import { authRateLimit } from "../middleware/rateLimiter.js";
import {
  isValidEmail,
  isValidUsername,
  validatePasswordStrength,
} from "../middleware/sanitize.js";

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authRateLimit);

// Register new user (Owner only in production)
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    // Input validation
    if (!name || !username || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Username validation
    if (!isValidUsername(username)) {
      return res.status(400).json({
        error:
          "Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens",
      });
    }

    // Email validation (if provided)
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Password strength validation
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: "Password does not meet requirements",
        details: passwordValidation.errors,
      });
    }

    // Check if username exists
    const existingUser = await User.findOne({
      username: username.toLowerCase(),
    });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Hash password with salt rounds from env or default to 10
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      email: email ? email.toLowerCase().trim() : undefined,
      password: hashedPassword,
      role: role || "employee",
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    // Find user by username (case-insensitive)
    const user = await User.findOne({
      username: username.toLowerCase().trim(),
    });

    // Generic error message to prevent username enumeration
    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token with secure expiry
    const tokenExpiry = process.env.JWT_EXPIRY || "7d";
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Don't send sensitive data
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
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
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
