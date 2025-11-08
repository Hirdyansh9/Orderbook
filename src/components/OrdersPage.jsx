import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Package,
  Calendar,
  DollarSign,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import ImprovedOrderForm from "./ImprovedOrderForm";
import CustomDropdown from "./CustomDropdown";

// Import common components
const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "default",
  className = "",
  disabled = false,
  type = "button",
}) => {
  const baseStyles =
    "rounded-lg font-semibold transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost:
      "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300",
  };
  const sizes = {
    default: "px-4 py-2",
    icon: "p-2",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="flex flex-col">
    {label && (
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
    )}
    <input
      {...props}
      onWheel={(e) => {
        // Prevent scrolling to change number values
        if (props.type === "number") {
          e.target.blur();
        }
      }}
      onInput={(e) => {
        // Remove leading zeros for number inputs
        if (props.type === "number" && e.target.value) {
          const value = e.target.value.replace(/^0+(?=\d)/, "");
          if (value !== e.target.value) {
            e.target.value = value;
          }
        }
      }}
      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="flex flex-col">
    {label && (
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        {...props}
        className="w-full appearance-none px-3 py-2 pr-10 bg-gray-950 border border-gray-800 rounded-lg text-gray-100 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 transition-all duration-200 cursor-pointer hover:border-gray-700"
        style={{
          backgroundImage: "none",
        }}
      >
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-gray-900 text-gray-100 py-2 hover:bg-gray-800"
          >
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200 z-10"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-6 border-b dark:border-gray-700 pr-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// Orders/Customers Component
function Orders() {
  const {
    customers,
    createOrder,
    updateOrder,
    deleteOrder,
    user,
    loading,
    refreshData,
  } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [modal, setModal] = useState({
    isOpen: false,
    mode: "create",
    data: null,
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // Ensure data is loaded when component mounts
  useEffect(() => {
    console.log("Orders component mounted", {
      customersCount: customers.length,
      hasRefreshData: !!refreshData,
      user: user?.username,
      userRole: user?.role,
    });
    if (customers.length === 0 && refreshData && user) {
      console.log("Calling refreshData for user:", user.username);
      refreshData(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log when customers change
  useEffect(() => {
    console.log("Customers updated:", customers.length, "orders");
  }, [customers]);

  const filteredOrders = useMemo(() => {
    return customers.filter((order) => {
      const matchesSearch =
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.mobileNo.includes(searchTerm);
      const matchesStatus =
        filterStatus === "All" || order.deliveryStatus === filterStatus;

      // Date filter logic
      let matchesDate = true;
      if (dateFilter !== "All") {
        const deliveryDate = new Date(order.deliveryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === "Today") {
          matchesDate = deliveryDate.toDateString() === today.toDateString();
        } else if (dateFilter === "This Week") {
          const weekFromNow = new Date(today);
          weekFromNow.setDate(today.getDate() + 7);
          matchesDate = deliveryDate >= today && deliveryDate <= weekFromNow;
        } else if (dateFilter === "This Month") {
          const monthFromNow = new Date(today);
          monthFromNow.setDate(today.getDate() + 30);
          matchesDate = deliveryDate >= today && deliveryDate <= monthFromNow;
        } else if (
          dateFilter === "Custom" &&
          customRange.start &&
          customRange.end
        ) {
          const startDate = new Date(customRange.start);
          const endDate = new Date(customRange.end);
          endDate.setHours(23, 59, 59, 999);
          matchesDate = deliveryDate >= startDate && deliveryDate <= endDate;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [customers, searchTerm, filterStatus, dateFilter, customRange]);

  const handleSubmit = async (formData) => {
    try {
      if (modal.mode === "edit") {
        await updateOrder(modal.data._id, formData);
      } else {
        await createOrder(formData);
      }
      setModal({ isOpen: false, mode: "create", data: null });
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteOrder(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="text-sm text-gray-400">
          Showing {filteredOrders.length}{" "}
          {filteredOrders.length === 1 ? "order" : "orders"}
        </div>
        <button
          onClick={() => setModal({ isOpen: true, mode: "create", data: null })}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-white transition-all duration-200 shadow-sm hover:shadow hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      {/* Show loading state */}
      {loading && customers.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Filters */}
      {!loading || customers.length > 0 ? (
        <>
          <div className="bg-gray-900 border border-gray-800 shadow-sm rounded-lg p-5 transition-all duration-200 animate-in fade-in slide-in-from-top-3 duration-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Input
                  placeholder="Search by name, item, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <CustomDropdown
                value={filterStatus}
                onChange={(value) => setFilterStatus(value)}
                options={[
                  { value: "All", label: "All Status" },
                  { value: "Pending", label: "Pending" },
                  { value: "Delivered", label: "Delivered" },
                ]}
              />
              <CustomDropdown
                value={dateFilter}
                onChange={(value) => {
                  setDateFilter(value);
                  setShowCustomRange(value === "Custom");
                }}
                options={[
                  { value: "All", label: "All Time" },
                  { value: "Today", label: "Today" },
                  { value: "This Week", label: "Next 7 Days" },
                  { value: "This Month", label: "Next 30 Days" },
                  { value: "Custom", label: "Custom Range" },
                ]}
              />
            </div>

            {showCustomRange && (
              <div className="mt-4 flex items-center gap-3 pt-4 border-t border-gray-800 animate-in fade-in duration-200">
                <label className="text-sm text-gray-400 whitespace-nowrap">
                  Date Range:
                </label>
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) =>
                    setCustomRange({
                      ...customRange,
                      start: e.target.value,
                    })
                  }
                  className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 text-gray-100 [&::-webkit-calendar-picker-indicator]:invert transition-all"
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) =>
                    setCustomRange({
                      ...customRange,
                      end: e.target.value,
                    })
                  }
                  className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-600 text-gray-100 [&::-webkit-calendar-picker-indicator]:invert transition-all"
                />
                {customRange.start && customRange.end && (
                  <button
                    onClick={() => {
                      setCustomRange({ start: "", end: "" });
                      setDateFilter("All");
                      setShowCustomRange(false);
                    }}
                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-100 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Orders Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Advance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Delivery
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredOrders.map((order, index) => (
                    <React.Fragment key={order._id}>
                      <tr
                        onClick={() =>
                          setExpandedOrderId(
                            expandedOrderId === order._id ? null : order._id
                          )
                        }
                        style={{
                          animationDelay: `${index * 30}ms`,
                        }}
                        className="hover:bg-gray-800/50 transition-all duration-150 group cursor-pointer animate-in fade-in slide-in-from-left-3 duration-300"
                      >
                        <td className="px-4 py-3 text-sm text-gray-100 whitespace-nowrap">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-100">
                            {order.customerName}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">
                          <span
                            className="group-hover:text-gray-300 transition-colors"
                            title={order.address}
                          >
                            {order.address}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-100 whitespace-nowrap">
                          {order.mobileNo}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-100">
                          {order.item}{" "}
                          <span className="text-gray-400">
                            ×{order.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-100 whitespace-nowrap">
                          ₹{order.advanceAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-100 whitespace-nowrap">
                          ₹{order.totalAmount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-amber-400 whitespace-nowrap">
                          ₹{order.remainingBalance.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-100 whitespace-nowrap">
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.deliveryStatus === "Delivered"
                                ? "bg-green-900/30 text-green-400 border border-green-800"
                                : "bg-amber-900/30 text-amber-400 border border-amber-800"
                            }`}
                          >
                            {order.deliveryStatus}
                          </span>
                        </td>
                        <td
                          className="px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setModal({
                                  isOpen: true,
                                  mode: "edit",
                                  data: order,
                                })
                              }
                              className="opacity-70 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setDeleteModal({ isOpen: true, id: order._id })
                              }
                              className="opacity-70 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4 text-red-500 hover:text-red-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedOrderId === order._id && (
                        <tr className="bg-gray-800/30 animate-in slide-in-from-top-2 fade-in duration-200">
                          <td colSpan="11" className="px-4 py-4">
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-4">
                              <h3 className="text-lg font-semibold text-gray-100 mb-4">
                                Order Details
                              </h3>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Customer Name
                                    </p>
                                    <p className="text-sm font-medium text-gray-100">
                                      {order.customerName}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Mobile Number
                                    </p>
                                    <p className="text-sm text-gray-100">
                                      {order.mobileNo}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Address
                                    </p>
                                    <p className="text-sm text-gray-100">
                                      {order.address}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Item & Quantity
                                    </p>
                                    <p className="text-sm text-gray-100">
                                      {order.item} × {order.quantity}
                                    </p>
                                  </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Order Date
                                    </p>
                                    <p className="text-sm text-gray-100">
                                      {new Date(
                                        order.orderDate
                                      ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Delivery Date
                                    </p>
                                    <p className="text-sm text-gray-100">
                                      {new Date(
                                        order.deliveryDate
                                      ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">
                                      Delivery Status
                                    </p>
                                    <span
                                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                        order.deliveryStatus === "Delivered"
                                          ? "bg-green-900/30 text-green-400 border border-green-800"
                                          : "bg-amber-900/30 text-amber-400 border border-amber-800"
                                      }`}
                                    >
                                      {order.deliveryStatus}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Financial Details */}
                              <div className="border-t border-gray-700 pt-4 mt-4">
                                <h4 className="text-sm font-semibold text-gray-100 mb-3">
                                  Financial Details
                                </h4>
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">
                                      Total Amount
                                    </p>
                                    <p className="text-lg font-bold text-gray-100">
                                      ₹
                                      {order.totalAmount.toLocaleString(
                                        "en-IN"
                                      )}
                                    </p>
                                  </div>
                                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">
                                      Advance Paid
                                    </p>
                                    <p className="text-lg font-bold text-green-400">
                                      ₹
                                      {order.advanceAmount.toLocaleString(
                                        "en-IN"
                                      )}
                                    </p>
                                  </div>
                                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">
                                      Balance Due
                                    </p>
                                    <p className="text-lg font-bold text-amber-400">
                                      ₹
                                      {order.remainingBalance.toLocaleString(
                                        "en-IN"
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Notes */}
                              {order.notes && (
                                <div className="border-t border-gray-700 pt-4">
                                  <p className="text-xs text-gray-500 mb-2">
                                    Notes
                                  </p>
                                  <p className="text-sm text-gray-100 italic whitespace-pre-wrap">
                                    {order.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No orders found</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Try adjusting your filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Order Form Modal */}
      <ImprovedOrderForm
        isOpen={modal.isOpen}
        mode={modal.mode}
        data={modal.data}
        onClose={() => setModal({ isOpen: false, mode: "create", data: null })}
        onSubmit={handleSubmit}
        isLoading={loading}
      />

      {/* Delete Confirmation */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Delete Order"
      >
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Are you sure you want to delete this order? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ isOpen: false, id: null })}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// Order Form Modal Component
function OrderFormModal({ isOpen, mode, data, onClose, onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    customerName: "",
    address: "",
    mobileNo: "",
    item: "",
    quantity: 1,
    orderDate: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    advanceAmount: 0,
    totalAmount: 0,
    deliveryStatus: "Pending",
    notes: "",
  });

  useEffect(() => {
    if (mode === "edit" && data) {
      setFormData({
        customerName: data.customerName || "",
        address: data.address || "",
        mobileNo: data.mobileNo || "",
        item: data.item || "",
        quantity: data.quantity || 1,
        orderDate: data.orderDate
          ? new Date(data.orderDate).toISOString().split("T")[0]
          : "",
        deliveryDate: data.deliveryDate
          ? new Date(data.deliveryDate).toISOString().split("T")[0]
          : "",
        advanceAmount: data.advanceAmount || 0,
        totalAmount: data.totalAmount || 0,
        deliveryStatus: data.deliveryStatus || "Pending",
        notes: data.notes || "",
      });
    } else {
      setFormData({
        customerName: "",
        address: "",
        mobileNo: "",
        item: "",
        quantity: 1,
        orderDate: new Date().toISOString().split("T")[0],
        deliveryDate: "",
        advanceAmount: 0,
        totalAmount: 0,
        deliveryStatus: "Pending",
        notes: "",
      });
    }
  }, [mode, data, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Order" : "New Order"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="customerName"
            label="Customer Name"
            value={formData.customerName}
            onChange={handleChange}
            required
          />
          <Input
            id="mobileNo"
            label="Mobile Number"
            value={formData.mobileNo}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          id="address"
          label="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="item"
            label="Item"
            value={formData.item}
            onChange={handleChange}
            required
          />
          <Input
            id="quantity"
            label="Quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="orderDate"
            label="Order Date"
            type="date"
            value={formData.orderDate}
            onChange={handleChange}
            required
          />
          <Input
            id="deliveryDate"
            label="Delivery Date"
            type="date"
            value={formData.deliveryDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="totalAmount"
            label="Total Amount"
            type="number"
            value={formData.totalAmount}
            onChange={handleChange}
            required
          />
          <Input
            id="advanceAmount"
            label="Advance Amount"
            type="number"
            value={formData.advanceAmount}
            onChange={handleChange}
          />
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400">
            Remaining Balance:{" "}
            <span className="font-semibold text-lg text-gray-100">
              ₹
              {(formData.totalAmount - formData.advanceAmount).toLocaleString(
                "en-IN"
              )}
            </span>
          </p>
        </div>

        <Select
          id="deliveryStatus"
          label="Delivery Status"
          value={formData.deliveryStatus}
          onChange={handleChange}
          options={[
            { value: "Pending", label: "Pending" },
            { value: "Delivered", label: "Delivered" },
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-100 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Save Order"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export { Orders, OrderFormModal };
