#!/usr/bin/env node

/**
 * Check Database Script
 * Verify if the database has been seeded with initial data
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Policy from "../models/Policy.js";
import Notification from "../models/Notification.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/handloom-inventory";

async function checkDatabase() {
  try {
    console.log("🔍 Checking database status...\n");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
    console.log(`📍 Database: ${mongoose.connection.name}\n`);

    // Check Users
    const userCount = await User.countDocuments();
    console.log("👥 Users:");
    console.log(`   Total: ${userCount}`);

    if (userCount > 0) {
      const users = await User.find({}, "name username role isActive").lean();
      users.forEach((user) => {
        console.log(
          `   - ${user.name} (${user.username}) - Role: ${user.role} - Active: ${user.isActive}`
        );
      });
    } else {
      console.log("   ⚠️  No users found - Database needs seeding!");
    }

    // Check Customers/Orders
    console.log("\n📦 Orders:");
    const orderCount = await Customer.countDocuments();
    console.log(`   Total: ${orderCount}`);

    if (orderCount > 0) {
      const pendingOrders = await Customer.countDocuments({
        deliveryStatus: "Pending",
      });
      const deliveredOrders = await Customer.countDocuments({
        deliveryStatus: "Delivered",
      });
      console.log(`   - Pending: ${pendingOrders}`);
      console.log(`   - Delivered: ${deliveredOrders}`);

      // Show recent orders
      const recentOrders = await Customer.find({})
        .sort({ createdAt: -1 })
        .limit(3)
        .select("customerName item totalAmount deliveryStatus")
        .lean();

      if (recentOrders.length > 0) {
        console.log("\n   Recent orders:");
        recentOrders.forEach((order) => {
          console.log(
            `   - ${order.customerName}: ${order.item} (₹${order.totalAmount}) - ${order.deliveryStatus}`
          );
        });
      }
    } else {
      console.log("   ⚠️  No orders found - Database needs seeding!");
    }

    // Check Policies
    console.log("\n🔔 Notification Policies:");
    const policyCount = await Policy.countDocuments();
    console.log(`   Total: ${policyCount}`);

    if (policyCount > 0) {
      const policies = await Policy.find({}).lean();
      policies.forEach((policy) => {
        console.log(`   - ${policy.triggers.length} triggers configured`);
        const enabledTriggers = policy.triggers.filter((t) => t.enabled).length;
        console.log(`   - ${enabledTriggers} triggers enabled`);
      });
    } else {
      console.log("   ⚠️  No policies found - Database needs seeding!");
    }

    // Check Notifications
    console.log("\n📬 Notifications:");
    const notificationCount = await Notification.countDocuments();
    console.log(`   Total: ${notificationCount}`);

    if (notificationCount > 0) {
      const unreadCount = await Notification.countDocuments({ read: false });
      console.log(`   - Unread: ${unreadCount}`);
      console.log(`   - Read: ${notificationCount - unreadCount}`);
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 Summary:");
    console.log("=".repeat(50));

    const isSeeded = userCount >= 2 && orderCount >= 1 && policyCount >= 1;

    if (isSeeded) {
      console.log("✅ Database appears to be seeded!");
      console.log("\n💡 You can now:");
      console.log("   - Start the backend: npm start");
      console.log("   - Login with: username=owner, password=password123");
    } else {
      console.log("⚠️  Database appears to be empty!");
      console.log("\n💡 To seed the database, run:");
      console.log("   npm run seed");
    }

    console.log("=".repeat(50));

    await mongoose.connection.close();
    console.log("\n✅ Connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking database:", error.message);
    process.exit(1);
  }
}

checkDatabase();
