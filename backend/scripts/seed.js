import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Policy from "../models/Policy.js";
import Notification from "../models/Notification.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/handloom-inventory";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Policy.deleteMany({});
    await Notification.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Create owner user
    const ownerPassword = await bcrypt.hash("password123", 10);
    const owner = await User.create({
      name: "Business Owner",
      username: "owner",
      email: "owner@handloom.com",
      password: ownerPassword,
      role: "owner",
    });
    console.log("✅ Created owner user");

    // Create employee user
    const employeePassword = await bcrypt.hash("password123", 10);
    const employee = await User.create({
      name: "Employee User",
      username: "employee",
      email: "employee@handloom.com",
      password: employeePassword,
      role: "employee",
    });
    console.log("✅ Created employee user");

    // Create sample customer orders
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const threeDays = new Date(today);
    threeDays.setDate(threeDays.getDate() + 3);
    const fiveDays = new Date(today);
    fiveDays.setDate(fiveDays.getDate() + 5);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const customers = await Customer.create([
      {
        customerName: "Rajesh Kumar",
        address: "123 MG Road, Bangalore",
        mobileNo: "+91-9876543210",
        item: "Pashmina Shawl",
        quantity: 2,
        orderDate: lastWeek,
        deliveryDate: tomorrow,
        advanceAmount: 5000,
        totalAmount: 10000,
        remainingBalance: 5000,
        deliveryStatus: "Pending",
        notes: "Premium quality requested",
        createdBy: owner._id,
      },
      {
        customerName: "Priya Sharma",
        address: "45 Park Street, Delhi",
        mobileNo: "+91-9876543211",
        item: "Kullu Stole",
        quantity: 5,
        orderDate: yesterday,
        deliveryDate: fiveDays,
        advanceAmount: 10000,
        totalAmount: 15000,
        remainingBalance: 5000,
        deliveryStatus: "Pending",
        notes: "Wedding order",
        createdBy: owner._id,
      },
      {
        customerName: "Amit Patel",
        address: "78 Marine Drive, Mumbai",
        mobileNo: "+91-9876543212",
        item: "Handloom Saree",
        quantity: 3,
        orderDate: today,
        deliveryDate: threeDays,
        advanceAmount: 20000,
        totalAmount: 25000,
        remainingBalance: 5000,
        deliveryStatus: "Pending",
        notes: "Gift wrapping needed",
        createdBy: employee._id,
      },
      {
        customerName: "Sneha Reddy",
        address: "12 Jubilee Hills, Hyderabad",
        mobileNo: "+91-9876543213",
        item: "Woolen Blanket",
        quantity: 4,
        orderDate: lastWeek,
        deliveryDate: yesterday,
        advanceAmount: 8000,
        totalAmount: 8000,
        remainingBalance: 0,
        deliveryStatus: "Delivered",
        notes: "Delivered on time",
        createdBy: owner._id,
      },
    ]);
    console.log("✅ Created customer orders");

    // Create default notification policy with delivery reminder
    const defaultPolicy = await Policy.create({
      userId: owner._id,
      triggers: [
        {
          id: "delivery-reminder-2days",
          name: "Delivery Reminder",
          type: "order",
          condition: "deliveryInDays",
          operator: "<=",
          threshold: 2,
          enabled: true,
          notificationType: "warning",
          titleTemplate: "Delivery Reminder: {customerName}",
          messageTemplate:
            "Order for {customerName} ({item} x{quantity}) is scheduled for delivery on {deliveryDate}. Only {days} days remaining!",
        },
        {
          id: "high-value-order",
          name: "High Value Order",
          type: "order",
          condition: "totalAmount",
          operator: ">=",
          threshold: 20000,
          enabled: true,
          notificationType: "info",
          titleTemplate: "High Value Order: {customerName}",
          messageTemplate:
            "{customerName} placed an order worth ₹{totalAmount} for {item} (Qty: {quantity})",
        },
        {
          id: "pending-balance",
          name: "High Pending Balance",
          type: "order",
          condition: "remainingBalance",
          operator: ">",
          threshold: 5000,
          enabled: true,
          notificationType: "warning",
          titleTemplate: "Pending Balance: {customerName}",
          messageTemplate:
            "{customerName} has a remaining balance of ₹{remainingBalance} for {item} order",
        },
      ],
    });
    console.log("✅ Created default notification policy");

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("   Owner: username=owner / password123");
    console.log("   Employee: username=employee / password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();
