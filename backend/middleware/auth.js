import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: "Invalid authentication" });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid authentication token" });
  }
};

export const ownerOnly = (req, res, next) => {
  if (req.user.role !== "owner") {
    return res
      .status(403)
      .json({ error: "Access denied. Owner role required." });
  }
  next();
};
