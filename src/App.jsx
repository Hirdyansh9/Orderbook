import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./index.css";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import LoginScreen from "./components/LoginScreen";
import { Orders } from "./components/OrdersPage";
import EmployeeManagement from "./components/EmployeeManagement";
import NotificationsPage from "./components/pages/NotificationsPage";
import NotificationSettings from "./components/NotificationSettings";
import CustomDropdown from "./components/CustomDropdown";
import {
  X,
  Loader2,
  Bell,
  Home,
  Package,
  Users,
  Settings as SettingsIcon,
  Menu,
  LogOut,
  DollarSign,
  AlertCircle,
  Truck,
  ChevronUp,
  ChevronDown,
  Hash,
  User,
  Crown,
} from "lucide-react";

// Logo Component
const Logo = ({ className = "w-8 h-8" }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="10"
      y="25"
      width="80"
      height="60"
      rx="8"
      stroke="currentColor"
      strokeWidth="6"
      fill="none"
    />
    <line
      x1="10"
      y1="45"
      x2="90"
      y2="45"
      stroke="currentColor"
      strokeWidth="6"
    />
    <line
      x1="30"
      y1="25"
      x2="30"
      y2="45"
      stroke="currentColor"
      strokeWidth="6"
    />
    <line
      x1="70"
      y1="25"
      x2="70"
      y2="45"
      stroke="currentColor"
      strokeWidth="6"
    />
    <circle cx="35" cy="65" r="5" fill="currentColor" />
    <circle cx="65" cy="65" r="5" fill="currentColor" />
  </svg>
);

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 max-w-md">
            <h1 className="text-2xl font-semibold text-red-400 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-400 mb-6">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-800 text-gray-100 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Reusable Components ---
function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  ...props
}) {
  const baseStyle =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gray-100 text-gray-900 hover:bg-white focus:ring-gray-500",
    secondary:
      "bg-gray-800 text-gray-100 hover:bg-gray-700 focus:ring-gray-700 border border-gray-700",
    danger:
      "bg-red-900/50 text-red-100 hover:bg-red-900 focus:ring-red-800 border border-red-800",
    ghost:
      "bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-gray-100",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  className = "",
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg focus:ring-2 focus:ring-gray-700 focus:border-gray-700 text-gray-100 placeholder-gray-500 transition-all"
      />
    </div>
  );
}

function Select({ id, label, value, onChange, options, required = false }) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required={required}
          className="w-full appearance-none px-4 py-2.5 pr-10 bg-gray-900 border border-gray-800 rounded-lg focus:ring-2 focus:ring-blue-700 focus:border-blue-700 text-gray-100 transition-all cursor-pointer hover:border-gray-600 hover:bg-gray-800"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

// --- Modal Component ---
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200 z-10"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="pr-12 mb-6">
          <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}

// --- Dashboard Component ---
const Dashboard = React.memo(function Dashboard() {
  const { dashboardStats, refreshDashboard } = useApp();
  const [recentDays, setRecentDays] = useState(1);
  const [upcomingDays, setUpcomingDays] = useState(1);
  const [recentMinimized, setRecentMinimized] = useState(false);
  const [upcomingMinimized, setUpcomingMinimized] = useState(false);
  const [recentCustomRange, setRecentCustomRange] = useState({
    start: "",
    end: "",
  });
  const [upcomingCustomRange, setUpcomingCustomRange] = useState({
    start: "",
    end: "",
  });
  const [showRecentCustom, setShowRecentCustom] = useState(false);
  const [showUpcomingCustom, setShowUpcomingCustom] = useState(false);

  useEffect(() => {
    refreshDashboard(recentDays, upcomingDays);
  }, [refreshDashboard, recentDays, upcomingDays]);

  const timeWindowOptions = useMemo(
    () => [
      { value: 1, label: "1 Day" },
      { value: 3, label: "3 Days" },
      { value: 7, label: "7 Days" },
      { value: 14, label: "14 Days" },
      { value: 30, label: "30 Days" },
      { value: "custom", label: "Custom Range" },
    ],
    []
  );

  if (!dashboardStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6 flex items-center gap-3 sm:gap-4 hover:border-gray-700 hover:shadow-lg transition-all duration-200 group animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div
        className={`p-2 sm:p-3 rounded-lg ${colorClass} group-hover:scale-110 transition-transform duration-200`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-400 mb-1">
          {title}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-100 tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <StatCard
          title="Total Pending Payments"
          value={dashboardStats.pendingBalance?.count || 0}
          icon={<Hash className="w-6 h-6 text-amber-400" />}
          colorClass="bg-amber-950/50 border border-amber-900/50"
        />
        <StatCard
          title="Total Upcoming Deliveries"
          value={dashboardStats.totalUpcomingDeliveriesCount || 0}
          icon={<Truck className="w-6 h-6 text-blue-400" />}
          colorClass="bg-blue-950/50 border border-blue-900/50"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col max-h-[800px]">
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 sm:pb-4 gap-3 cursor-pointer hover:bg-gray-800/50 transition-colors relative z-10 flex-shrink-0"
          onClick={() => setRecentMinimized(!recentMinimized)}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 transition-transform duration-300">
              {recentMinimized ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-100">
              Recent Orders
            </h3>
          </div>
          {!recentMinimized && (
            <div
              className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <label className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                Show last:
              </label>
              <div className="w-full sm:w-40 relative z-20">
                <CustomDropdown
                  value={recentDays}
                  onChange={(val) => {
                    if (val === "custom") {
                      setShowRecentCustom(true);
                    } else {
                      setShowRecentCustom(false);
                      setRecentDays(Number(val));
                    }
                  }}
                  options={timeWindowOptions}
                />
              </div>
            </div>
          )}
        </div>

        <div
          className={`transition-all duration-300 ease-in-out flex-1 min-h-0 ${
            recentMinimized ? "max-h-0 opacity-0" : "opacity-100"
          }`}
        >
          {showRecentCustom && (
            <div className="px-4 sm:px-6 pb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 border-t border-b border-gray-800 pt-4 flex-shrink-0">
              <input
                type="date"
                value={recentCustomRange.start}
                onChange={(e) =>
                  setRecentCustomRange({
                    ...recentCustomRange,
                    start: e.target.value,
                  })
                }
                className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 text-gray-100 [&::-webkit-calendar-picker-indicator]:invert"
              />
              <span className="text-gray-400 text-sm text-center sm:text-left">
                to
              </span>
              <input
                type="date"
                value={recentCustomRange.end}
                onChange={(e) =>
                  setRecentCustomRange({
                    ...recentCustomRange,
                    end: e.target.value,
                  })
                }
                className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 text-gray-100 [&::-webkit-calendar-picker-indicator]:invert"
              />
              <button
                onClick={() => {
                  if (recentCustomRange.start && recentCustomRange.end) {
                    const start = new Date(recentCustomRange.start);
                    const end = new Date(recentCustomRange.end);
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24)
                    );
                    setRecentDays(diffDays);
                  }
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-900 rounded-lg hover:bg-white transition-colors"
              >
                Apply
              </button>
            </div>
          )}

          <div className="px-4 sm:px-6 pb-4 sm:pb-6 overflow-y-auto animate-in slide-in-from-top-4 fade-in duration-500">
            {dashboardStats.ordersByDay &&
            dashboardStats.ordersByDay.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {dashboardStats.ordersByDay.map((day, dayIndex) => (
                  <div
                    key={day._id}
                    style={{
                      animationDelay: `${dayIndex * 75}ms`,
                    }}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 sm:p-4 hover:border-gray-600 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="flex justify-between items-start mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-700">
                      <div>
                        <p className="font-semibold text-gray-100 text-sm sm:text-base">
                          {new Date(day._id).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 mt-1">
                          {day.count} order{day.count !== 1 ? "s" : ""} placed
                        </p>
                      </div>
                    </div>

                    {/* Individual Orders */}
                    {day.orders && day.orders.length > 0 && (
                      <div className="space-y-2 sm:space-y-3">
                        {day.orders.map((order, orderIndex) => (
                          <div
                            key={order._id}
                            style={{
                              animationDelay: `${orderIndex * 50}ms`,
                            }}
                            className="bg-gray-900/50 border border-gray-700 rounded-lg p-2.5 sm:p-3 hover:border-gray-600 transition-all duration-200 animate-in fade-in slide-in-from-left-2 duration-300"
                          >
                            <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-100 text-sm sm:text-base truncate">
                                  {order.customerName}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                  {order.item} (Qty: {order.quantity})
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span
                                  className={`text-xs font-semibold px-1.5 sm:px-2 py-1 rounded whitespace-nowrap ${
                                    order.deliveryStatus === "Delivered"
                                      ? "bg-green-900/30 text-green-400"
                                      : "bg-amber-900/30 text-amber-400"
                                  }`}
                                >
                                  {order.deliveryStatus}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-700">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Mobile
                                </p>
                                <p className="text-sm text-gray-300">
                                  {order.mobileNo}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Delivery Date
                                </p>
                                <p className="text-sm text-gray-300">
                                  {new Date(
                                    order.deliveryDate
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                              <div className="col-span-2 md:col-span-1">
                                <p className="text-xs text-gray-500 mb-1">
                                  Order Date
                                </p>
                                <p className="text-sm text-gray-300">
                                  {new Date(day._id).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-gray-700">
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">
                                  Total
                                </p>
                                <p className="text-xs sm:text-sm font-semibold text-gray-100">
                                  ₹{order.totalAmount.toLocaleString("en-IN")}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">
                                  Advance
                                </p>
                                <p className="text-xs sm:text-sm font-semibold text-green-400">
                                  ₹{order.advanceAmount.toLocaleString("en-IN")}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">
                                  Balance
                                </p>
                                <p className="text-xs sm:text-sm font-semibold text-amber-400">
                                  ₹
                                  {order.remainingBalance.toLocaleString(
                                    "en-IN"
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm text-gray-300">
                                  {order.address}
                                </p>
                              </div>
                              {order.notes && (
                                <div>
                                  <p className="text-xs text-gray-500">Notes</p>
                                  <p className="text-sm text-gray-300 italic">
                                    {order.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No orders in the selected time period
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Deliveries */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg flex flex-col max-h-[800px]">
        <div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 sm:pb-4 gap-3 cursor-pointer hover:bg-gray-800/50 transition-colors relative z-10 flex-shrink-0"
          onClick={() => setUpcomingMinimized(!upcomingMinimized)}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 transition-transform duration-300">
              {upcomingMinimized ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              )}
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-100">
              Upcoming Deliveries
            </h3>
          </div>
          {!upcomingMinimized && (
            <div
              className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <label className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                Show next:
              </label>
              <div className="w-full sm:w-40 relative z-20">
                <CustomDropdown
                  value={upcomingDays}
                  onChange={(val) => {
                    if (val === "custom") {
                      setShowUpcomingCustom(true);
                    } else {
                      setShowUpcomingCustom(false);
                      setUpcomingDays(Number(val));
                    }
                  }}
                  options={timeWindowOptions}
                />
              </div>
            </div>
          )}
        </div>

        <div
          className={`transition-all duration-300 ease-in-out flex-1 min-h-0 ${
            upcomingMinimized
              ? "max-h-0 opacity-0"
              : "opacity-100"
          }`}
        >
          {showUpcomingCustom && (
            <div className="px-4 sm:px-6 pb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 border-t border-b border-gray-800 pt-4 flex-shrink-0">
              <input
                type="date"
                value={upcomingCustomRange.start}
                onChange={(e) =>
                  setUpcomingCustomRange({
                    ...upcomingCustomRange,
                    start: e.target.value,
                  })
                }
                className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 text-gray-100 [&::-webkit-calendar-picker-indicator]:invert"
              />
              <span className="text-gray-400 text-sm text-center sm:text-left">
                to
              </span>
              <input
                type="date"
                value={upcomingCustomRange.end}
                onChange={(e) =>
                  setUpcomingCustomRange({
                    ...upcomingCustomRange,
                    end: e.target.value,
                  })
                }
                className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 text-gray-100 [&::-webkit-calendar-picker-indicator]:invert"
              />
              <button
                onClick={() => {
                  if (upcomingCustomRange.start && upcomingCustomRange.end) {
                    const start = new Date(upcomingCustomRange.start);
                    const end = new Date(upcomingCustomRange.end);
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24)
                    );
                    setUpcomingDays(diffDays);
                  }
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-900 rounded-lg hover:bg-white transition-colors"
              >
                Apply
              </button>
            </div>
          )}

          <div className="px-4 sm:px-6 pb-4 sm:pb-6 overflow-y-auto animate-in slide-in-from-top-4 fade-in duration-500">
            {dashboardStats.upcomingDeliveries &&
            dashboardStats.upcomingDeliveries.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {(() => {
                  // Group deliveries by date
                  const grouped = dashboardStats.upcomingDeliveries.reduce(
                    (acc, order) => {
                      const dateKey = new Date(
                        order.deliveryDate
                      ).toDateString();
                      if (!acc[dateKey]) {
                        acc[dateKey] = [];
                      }
                      acc[dateKey].push(order);
                      return acc;
                    },
                    {}
                  );

                  return Object.entries(grouped).map(
                    ([date, orders], dateIndex) => (
                      <div
                        key={date}
                        style={{
                          animationDelay: `${dateIndex * 75}ms`,
                        }}
                        className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 sm:p-4 hover:border-gray-600 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                      >
                        <div className="flex justify-between items-start mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-gray-700">
                          <div>
                            <p className="font-semibold text-gray-100 text-sm sm:text-base">
                              {new Date(date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-400 mt-1">
                              {orders.length}{" "}
                              {orders.length !== 1 ? "deliveries" : "delivery"}{" "}
                              scheduled
                            </p>
                          </div>
                        </div>

                        {/* Individual Orders */}
                        <div className="space-y-2 sm:space-y-3">
                          {orders.map((order, orderIndex) => (
                            <div
                              key={order._id}
                              style={{
                                animationDelay: `${orderIndex * 50}ms`,
                              }}
                              className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 hover:border-gray-600 transition-all duration-200 animate-in fade-in slide-in-from-left-2 duration-300"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-100 text-base">
                                    {order.customerName}
                                  </p>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {order.item} (Qty: {order.quantity})
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span
                                    className={`text-xs font-semibold px-2 py-1 rounded ${
                                      order.deliveryStatus === "Delivered"
                                        ? "bg-green-900/30 text-green-400"
                                        : "bg-amber-900/30 text-amber-400"
                                    }`}
                                  >
                                    {order.deliveryStatus}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 pb-3 border-b border-gray-700">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Mobile
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    {order.mobileNo}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Delivery Date
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    {new Date(
                                      order.deliveryDate
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                  <p className="text-xs text-gray-500 mb-1">
                                    Order Date
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    {new Date(
                                      order.orderDate
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4 mb-3 pb-3 border-b border-gray-700">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Total Amount
                                  </p>
                                  <p className="text-sm font-semibold text-gray-100">
                                    ₹{order.totalAmount.toLocaleString("en-IN")}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Advance Paid
                                  </p>
                                  <p className="text-sm font-semibold text-green-400">
                                    ₹
                                    {order.advanceAmount.toLocaleString(
                                      "en-IN"
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Balance Due
                                  </p>
                                  <p className="text-sm font-semibold text-amber-400">
                                    ₹
                                    {order.remainingBalance.toLocaleString(
                                      "en-IN"
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-gray-500">
                                    Address
                                  </p>
                                  <p className="text-sm text-gray-300">
                                    {order.address}
                                  </p>
                                </div>
                                {order.notes && (
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Notes
                                    </p>
                                    <p className="text-sm text-gray-300 italic">
                                      {order.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  );
                })()}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No upcoming deliveries in the selected time period
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// --- Notifications Panel ---
const NotificationsPanel = React.memo(function NotificationsPanel() {
  const { notifications, markNotificationAsRead, dismissNotification } =
    useApp();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-20 max-h-96 overflow-y-auto animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="p-4 border-b border-gray-800">
              <h3 className="font-medium text-gray-100">Notifications</h3>
            </div>
            {notifications.length === 0 ? (
              <p className="p-8 text-gray-500 text-center text-sm">
                No notifications
              </p>
            ) : (
              <div className="divide-y divide-gray-800">
                {notifications.map((notif, index) => (
                  <div
                    key={notif._id}
                    style={{
                      animationDelay: `${index * 30}ms`,
                    }}
                    className={`p-4 hover:bg-gray-800/50 transition-colors animate-in fade-in slide-in-from-right-2 duration-200 ${
                      !notif.read ? "bg-gray-800/30" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-100 text-sm">
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                      <button
                        onClick={() => dismissNotification(notif._id)}
                        className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => markNotificationAsRead(notif._id)}
                        className="mt-2 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});

// --- Main Layout ---
function MainLayout() {
  const {
    user,
    logout,
    sidebarOpen,
    toggleSidebar,
    employees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    resetEmployeePassword,
    loading,
  } = useApp();
  const [currentView, setCurrentView] = useState("dashboard");

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      roles: ["owner", "employee"],
    },
    {
      id: "orders",
      label: "Orders",
      icon: Package,
      roles: ["owner", "employee"],
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      roles: ["owner", "employee"],
    },
    { id: "employees", label: "Employees", icon: Users, roles: ["owner"] },
    {
      id: "notification-settings",
      label: "Notification Settings",
      icon: SettingsIcon,
      roles: ["owner"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="flex h-screen bg-gray-950 relative overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ease-in-out flex-shrink-0`}
      >
        <div className="w-72 h-full flex flex-col">
          <div className="px-6 py-4 border-b border-gray-800 h-[73px] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8 text-gray-100" />
              <h1 className="text-xl font-semibold text-gray-100 tracking-wide">
                Orderbook
              </h1>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
              title="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
            {filteredMenuItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  // Close sidebar on mobile when item is clicked
                  if (window.innerWidth < 1024) {
                    toggleSidebar();
                  }
                }}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group animate-in fade-in slide-in-from-left-3 duration-300 ${
                  currentView === item.id
                    ? "bg-gray-800 text-gray-100 shadow-lg"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 hover:translate-x-1"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    currentView === item.id
                      ? "scale-110"
                      : "group-hover:scale-110"
                  } transition-transform duration-200`}
                />
                <span className="font-medium">{item.label}</span>
                {currentView === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-in zoom-in duration-200"></div>
                )}
              </button>
            ))}
          </nav>
          {/* User info in sidebar */}
          <div className="p-4 border-t border-gray-800 bg-gray-900/50 animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 hover:translate-x-1">
              <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center flex-shrink-0">
                {user?.role === "owner" ? (
                  <Crown className="w-5 h-5 text-gray-400" />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 h-[73px]">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 h-full">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <Menu className="w-5 h-5 text-gray-400" />
              </button>
              <h2 className="text-base sm:text-lg font-medium text-gray-100 capitalize truncate">
                {currentView.replace("-", " ")}
              </h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationsPanel />
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-gray-100 transition-all duration-200 shadow-sm hover:shadow group"
                title="Logout"
              >
                <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
                <span className="text-sm font-medium hidden sm:inline">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-950">
          {currentView === "dashboard" && <Dashboard />}
          {currentView === "orders" && <Orders />}
          {currentView === "notifications" && <NotificationsPage />}
          {currentView === "employees" && user?.role === "owner" && (
            <EmployeeManagement
              employees={employees}
              createEmployee={createEmployee}
              updateEmployee={updateEmployee}
              deleteEmployee={deleteEmployee}
              resetEmployeePassword={resetEmployeePassword}
              loading={loading}
            />
          )}
          {currentView === "notification-settings" &&
            user?.role === "owner" && <NotificationSettings />}
        </main>
      </div>
    </div>
  );
}

// --- Main App Component ---
function App() {
  const { user, login, isAuthInitialized } = useApp();

  // Show loading state while checking authentication
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  return <MainLayout />;
}

// --- Export ---
export default function Root() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  );
}
