import Customer from "../models/Customer.js";
import Notification from "../models/Notification.js";
import Policy from "../models/Policy.js";
import User from "../models/User.js";

class NotificationService {
  async checkAndCreateNotifications() {
    try {
      console.log("⏰ Running notification check...");

      // Get all active owner users
      const owners = await User.find({ role: "owner", isActive: true });

      for (const owner of owners) {
        // Get all active employees for this owner
        const allUsers = await User.find({ isActive: true });
        await this.processUserNotifications(owner._id, allUsers);
      }

      console.log("✅ Notification check completed");
    } catch (error) {
      console.error("❌ Error in notification check:", error);
    }
  }

  async processUserNotifications(userId, allUsers) {
    try {
      // Get user's policy
      const policy = await Policy.findOne({ userId });
      if (!policy) return;

      const enabledTriggers = policy.triggers.filter((t) => t.enabled);
      if (enabledTriggers.length === 0) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Process customer/order triggers
      const customerTriggers = enabledTriggers.filter(
        (t) => t.type === "customer" || t.type === "order"
      );
      if (customerTriggers.length > 0) {
        const customers = await Customer.find();
        for (const customer of customers) {
          await this.checkCustomerTriggers(
            customer,
            customerTriggers,
            today,
            allUsers
          );
        }
      }
    } catch (error) {
      console.error(
        `Error processing notifications for user ${userId}:`,
        error
      );
    }
  }

  async checkCustomerTriggers(customer, triggers, today, allUsers) {
    for (const trigger of triggers) {
      let value,
        shouldNotify = false;
      const templateData = {
        id: customer._id,
        customerName: customer.customerName,
        item: customer.item,
        quantity: customer.quantity,
        totalAmount: customer.totalAmount.toLocaleString("en-IN"),
        advanceAmount: customer.advanceAmount.toLocaleString("en-IN"),
        remainingBalance: customer.remainingBalance.toLocaleString("en-IN"),
        address: customer.address,
        mobileNo: customer.mobileNo,
      };

      switch (trigger.condition) {
        case "deliveryInDays":
          if (customer.deliveryStatus === "Pending") {
            const deliveryDate = new Date(customer.deliveryDate);
            deliveryDate.setHours(0, 0, 0, 0);
            const diffTime = deliveryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            value = diffDays;
            shouldNotify = this.evaluateCondition(
              diffDays,
              trigger.operator,
              trigger.threshold
            );
            templateData.days = Math.abs(diffDays);
            templateData.deliveryDate =
              deliveryDate.toLocaleDateString("en-IN");
          }
          break;

        case "remainingBalance":
          // Only check if delivery is completed and balance is pending
          if (customer.deliveryStatus === "Delivered") {
            value = customer.remainingBalance;
            shouldNotify = this.evaluateCondition(
              value,
              trigger.operator,
              trigger.threshold
            );
          }
          break;

        case "totalAmount":
          value = customer.totalAmount;
          shouldNotify = this.evaluateCondition(
            value,
            trigger.operator,
            trigger.threshold
          );
          break;

        case "quantity":
          value = customer.quantity;
          shouldNotify = this.evaluateCondition(
            value,
            trigger.operator,
            trigger.threshold
          );
          break;
      }

      if (shouldNotify) {
        // Filter users based on trigger recipients
        const targetUsers = this.filterUsersByRecipients(
          trigger.recipients || ["all"],
          allUsers
        );

        // Create notification for target users
        for (const user of targetUsers) {
          await this.createNotificationIfNotExists(
            user._id,
            trigger,
            templateData,
            customer._id
          );
        }
      }
    }
  }

  filterUsersByRecipients(recipients, allUsers) {
    // If "all" is included, return all users
    if (recipients.includes("all")) {
      return allUsers;
    }

    const filtered = [];

    // Check for role-based recipients
    if (recipients.includes("owner")) {
      filtered.push(...allUsers.filter((u) => u.role === "owner"));
    }
    if (recipients.includes("employees")) {
      filtered.push(...allUsers.filter((u) => u.role === "employee"));
    }

    // Check for specific user IDs
    const specificUserIds = recipients.filter(
      (r) => r !== "owner" && r !== "employees" && r !== "all"
    );
    if (specificUserIds.length > 0) {
      filtered.push(
        ...allUsers.filter((u) => specificUserIds.includes(u._id.toString()))
      );
    }

    // Remove duplicates
    return [...new Set(filtered)];
  }

  evaluateCondition(value, operator, threshold) {
    switch (operator) {
      case "<=":
        return value <= threshold;
      case "<":
        return value < threshold;
      case ">=":
        return value >= threshold;
      case ">":
        return value > threshold;
      case "===":
        return value === threshold;
      case "!==":
        return value !== threshold;
      default:
        return false;
    }
  }

  formatMessage(template, data) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  async createNotificationIfNotExists(
    userId,
    trigger,
    templateData,
    relatedId
  ) {
    try {
      // Check if similar notification exists in last 24 hours
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const existing = await Notification.findOne({
        userId,
        triggerId: trigger.id,
        title: this.formatMessage(trigger.titleTemplate, templateData),
        createdAt: { $gte: yesterday },
      });

      if (!existing) {
        const notification = new Notification({
          userId,
          type: trigger.notificationType,
          title: this.formatMessage(trigger.titleTemplate, templateData),
          message: this.formatMessage(trigger.messageTemplate, templateData),
          triggerId: trigger.id,
          read: false,
        });
        await notification.save();
      }
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  }

  startScheduler() {
    // Run immediately
    this.checkAndCreateNotifications();

    // Run every hour
    const interval = 60 * 60 * 1000; // 1 hour
    setInterval(() => {
      this.checkAndCreateNotifications();
    }, interval);

    console.log("📢 Notification scheduler started (checking every hour)");
  }
}

export default new NotificationService();
