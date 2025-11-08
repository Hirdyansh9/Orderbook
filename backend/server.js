import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sanitizeInput } from "./middleware/sanitize.js";
import {
  enforceHTTPS,
  addHSTSHeader,
  preventParameterPollution,
  addSecurityTimingHeaders,
} from "./middleware/security.js";
import notificationService from "./services/notificationService.js";

// Routes
import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customers.js";
import notificationRoutes from "./routes/notifications.js";
import policyRoutes from "./routes/policies.js";
import userRoutes from "./routes/users.js";

// Load environment variables
dotenv.config();

// Validate critical environment variables
if (!process.env.JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET is not set in environment variables");
  process.exit(1);
}

// Warn if JWT_SECRET is too short in production
if (
  process.env.NODE_ENV === "production" &&
  process.env.JWT_SECRET.length < 32
) {
  console.warn(
    "⚠️  WARNING: JWT_SECRET should be at least 32 characters in production"
  );
}

// Warn if using default/weak JWT_SECRET
const weakSecrets = [
  "your-super-secret-jwt-key-change-this-in-production",
  "secret",
  "jwt_secret",
  "test",
];
if (weakSecrets.includes(process.env.JWT_SECRET.toLowerCase())) {
  console.error(
    "❌ FATAL: Using a default/weak JWT_SECRET. Generate a strong secret!"
  );
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

// Create Express app
const app = express();

// Security: Trust proxy for proper IP detection behind reverse proxies
app.set("trust proxy", 1);

// Enforce HTTPS in production
app.use(enforceHTTPS);

// Add HSTS header
app.use(addHSTSHeader);

// Remove X-Powered-By header
app.use(addSecurityTimingHeaders);

// Security Headers
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Enable XSS filter
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; frame-ancestors 'none'"
  );
  next();
});

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow all Vercel deployment URLs (production, preview, git branches)
      if (origin?.includes("vercel.app")) {
        return callback(null, true);
      }

      // Allow localhost origins
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified origin.";
        console.error(`CORS blocked origin: ${origin}`);
        console.error(`Allowed origins: ${allowedOrigins.join(", ")}`);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser with size limits to prevent DoS
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Prevent parameter pollution
app.use(preventParameterPollution);

// Sanitize all inputs
app.use(sanitizeInput);

// Connect to MongoDB
connectDB();

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes (no rate limiting)
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/users", userRoutes);

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const HOST = "127.0.0.1";
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`📍 Bound to: ${HOST}:${PORT}`);

  // Start notification scheduler
  notificationService.startScheduler();
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err);
  // Close server & exit process
  process.exit(1);
});
