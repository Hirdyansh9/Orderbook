import express from "express";
import Customer from "../models/Customer.js";
import { auth, ownerOnly } from "../middleware/auth.js";

const router = express.Router();

// Get all customers
router.get("/", auth, async (req, res) => {
  try {
    const {
      paymentStatus,
      deliveryStatus,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (deliveryStatus) filter.deliveryStatus = deliveryStatus;

    const sortOrder = order === "desc" ? -1 : 1;
    const customers = await Customer.find(filter)
      .sort({ [sortBy]: sortOrder })
      .populate("createdBy", "name email");

    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single customer
router.get("/:id", auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new customer order
router.post("/", auth, async (req, res) => {
  try {
    console.log("Creating order with data:", req.body);
    console.log("User ID:", req.userId);

    const customer = new Customer({
      ...req.body,
      createdBy: req.userId,
    });
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(400).json({ error: error.message });
  }
});

// Update customer order
router.put("/:id", auth, async (req, res) => {
  try {
    // Calculate remaining balance if amounts are provided
    if (
      req.body.totalAmount !== undefined ||
      req.body.advanceAmount !== undefined
    ) {
      const customer = await Customer.findById(req.params.id);
      if (customer) {
        const totalAmount =
          req.body.totalAmount !== undefined
            ? req.body.totalAmount
            : customer.totalAmount;
        const advanceAmount =
          req.body.advanceAmount !== undefined
            ? req.body.advanceAmount
            : customer.advanceAmount;
        req.body.remainingBalance = totalAmount - advanceAmount;
      }
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete customer order (both owner and employee can delete)
router.delete("/:id", auth, async (req, res) => {
  try {
    console.log("Delete order request:", {
      orderId: req.params.id,
      userId: req.userId,
    });

    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.json({ message: "Customer order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get customer statistics
router.get("/stats/summary", auth, async (req, res) => {
  try {
    // Get query parameters for custom time windows (default to 1 day)
    const recentDays = parseInt(req.query.recentDays) || 1;
    const upcomingDays = parseInt(req.query.upcomingDays) || 1;

    // Get orders from previous days (grouped by date)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - recentDays);

    const ordersByDay = await Customer.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate, $lt: today },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$orderDate" },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          advanceCollected: { $sum: "$advanceAmount" },
          orders: {
            $push: {
              _id: "$_id",
              customerName: "$customerName",
              address: "$address",
              mobileNo: "$mobileNo",
              item: "$item",
              quantity: "$quantity",
              totalAmount: "$totalAmount",
              advanceAmount: "$advanceAmount",
              remainingBalance: "$remainingBalance",
              deliveryDate: "$deliveryDate",
              deliveryStatus: "$deliveryStatus",
              notes: "$notes",
            },
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: recentDays },
    ]);

    // Upcoming deliveries (next N days based on parameter)
    const nextDate = new Date(today);
    nextDate.setDate(nextDate.getDate() + upcomingDays);

    const upcomingDeliveries = await Customer.find({
      deliveryDate: { $gte: today, $lte: nextDate },
      deliveryStatus: "Pending",
    })
      .sort({ deliveryDate: 1 })
      .limit(50);

    // Total upcoming deliveries (all pending deliveries from today onwards)
    const totalUpcomingDeliveriesCount = await Customer.countDocuments({
      deliveryDate: { $gte: today },
      deliveryStatus: "Pending",
    });

    // Pending balance summary (total pending orders with remaining balance)
    const pendingBalance = await Customer.aggregate([
      { $match: { remainingBalance: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$remainingBalance" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      ordersByDay,
      upcomingDeliveries,
      totalUpcomingDeliveriesCount,
      pendingBalance: {
        total: pendingBalance[0]?.total || 0,
        count: pendingBalance[0]?.count || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
