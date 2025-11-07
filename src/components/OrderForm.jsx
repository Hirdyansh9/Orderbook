import React, { useState, useEffect } from "react";
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Calendar,
  ChevronDown,
} from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-800 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="sticky top-4 float-right p-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200 z-50 mr-4"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="sticky top-0 bg-gray-900 p-4 sm:p-6 border-b border-gray-800 z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-100 pr-10">
            {title}
          </h2>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

const Input = ({ label, error, ...props }) => (
  <div className="flex flex-col">
    {label && (
      <label className="text-sm font-medium text-gray-300 mb-2">{label}</label>
    )}
    <div className="relative">
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
        className={`w-full px-4 py-2.5 bg-gray-950 border rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:border-gray-600 transition-all duration-200 ${
          props.type === "date"
            ? "pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
            : ""
        } ${
          error
            ? "border-red-500/50 focus:ring-red-500/50"
            : "border-gray-800 focus:ring-gray-600"
        }`}
      />
      {props.type === "date" && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
      )}
    </div>
    {error && (
      <div className="flex items-center gap-1 mt-1.5 text-red-400 text-xs">
        <AlertCircle className="w-3 h-3" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

const Select = ({ label, options, error, ...props }) => (
  <div className="flex flex-col">
    {label && (
      <label className="text-sm font-medium text-gray-300 mb-2">{label}</label>
    )}
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none px-4 py-2.5 pr-10 bg-gray-950 border rounded-lg text-gray-100 focus:ring-2 focus:border-blue-600 transition-all duration-200 cursor-pointer ${
          error
            ? "border-red-500/50 focus:ring-red-500/50"
            : "border-gray-800 focus:ring-blue-600 hover:border-gray-600 hover:bg-gray-900"
        }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
    {error && (
      <div className="flex items-center gap-1 mt-1.5 text-red-400 text-xs">
        <AlertCircle className="w-3 h-3" />
        <span>{error}</span>
      </div>
    )}
  </div>
);

const Button = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
}) => {
  const baseStyles =
    "rounded-lg font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm";
  const variants = {
    primary: "bg-gray-100 text-gray-900 hover:bg-white",
    secondary:
      "bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-700",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default function ImprovedOrderForm({
  isOpen,
  mode,
  data,
  onClose,
  onSubmit,
  isLoading,
}) {
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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isOpen && mode === "edit" && data) {
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
    } else if (isOpen && mode === "create") {
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
    setErrors({});
    setTouched({});
  }, [mode, data, isOpen]);

  const validateField = (name, value) => {
    switch (name) {
      case "customerName":
        return !value.trim() ? "Customer name is required" : "";
      case "mobileNo":
        if (!value.trim()) return "Mobile number is required";
        if (!/^[+]?[\d\s-]{10,}$/.test(value))
          return "Invalid mobile number format";
        return "";
      case "address":
        return !value.trim() ? "Address is required" : "";
      case "item":
        return !value.trim() ? "Item is required" : "";
      case "quantity":
        return value < 1 ? "Quantity must be at least 1" : "";
      case "deliveryDate":
        if (!value) return "Delivery date is required";
        if (new Date(value) < new Date(formData.orderDate))
          return "Delivery date cannot be before order date";
        return "";
      case "totalAmount":
        return value <= 0 ? "Total amount must be greater than 0" : "";
      case "advanceAmount":
        if (value < 0) return "Advance amount cannot be negative";
        if (value > formData.totalAmount)
          return "Advance cannot exceed total amount";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? parseFloat(value) || 0 : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const remainingBalance = formData.totalAmount - formData.advanceAmount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Order" : "Create New Order"}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-800 pb-2">
            Customer Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="customerName"
              label="Customer Name *"
              value={formData.customerName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.customerName && errors.customerName}
              placeholder="Enter customer name"
              required
            />

            <Input
              name="mobileNo"
              label="Mobile Number *"
              value={formData.mobileNo}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.mobileNo && errors.mobileNo}
              placeholder="+91-9876543210"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter complete address"
              rows="2"
              required
              className={`w-full px-4 py-2.5 bg-gray-950 border rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:border-gray-600 resize-none transition-all duration-200 ${
                touched.address && errors.address
                  ? "border-red-500/50 focus:ring-red-500/50"
                  : "border-gray-800 focus:ring-gray-600"
              }`}
            />
            {touched.address && errors.address && (
              <div className="flex items-center gap-1 mt-1.5 text-red-400 text-xs">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-800 pb-2">
            Order Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="item"
              label="Item/Product *"
              value={formData.item}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.item && errors.item}
              placeholder="e.g., Pashmina Shawl"
              required
            />

            <Input
              name="quantity"
              label="Quantity *"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.quantity && errors.quantity}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="orderDate"
              label="Order Date *"
              type="date"
              value={formData.orderDate}
              onChange={handleChange}
              required
            />

            <Input
              name="deliveryDate"
              label="Expected Delivery Date *"
              type="date"
              min={formData.orderDate}
              value={formData.deliveryDate}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.deliveryDate && errors.deliveryDate}
              required
            />
          </div>
        </div>

        {/* Payment Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-800 pb-2">
            Payment Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="totalAmount"
              label="Total Amount (₹) *"
              type="number"
              min="0"
              step="0.01"
              value={formData.totalAmount}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.totalAmount && errors.totalAmount}
              placeholder="0.00"
              required
            />

            <Input
              name="advanceAmount"
              label="Advance Payment (₹)"
              type="number"
              min="0"
              step="0.01"
              max={formData.totalAmount}
              value={formData.advanceAmount}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.advanceAmount && errors.advanceAmount}
              placeholder="0.00"
            />
          </div>

          <div
            className={`p-4 rounded-lg transition-all duration-200 ${
              remainingBalance > 0
                ? "bg-amber-900/20 border border-amber-800/50"
                : "bg-green-900/20 border border-green-800/50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-300">
                Remaining Balance:
              </span>
              <span
                className={`text-2xl font-bold ${
                  remainingBalance > 0 ? "text-amber-400" : "text-green-400"
                }`}
              >
                ₹{remainingBalance.toLocaleString("en-IN")}
              </span>
            </div>
            {remainingBalance > 0 ? (
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span>Payment pending from customer</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Fully paid</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-800 pb-2">
            Additional Information
          </h3>

          <Select
            name="deliveryStatus"
            label="Delivery Status"
            value={formData.deliveryStatus}
            onChange={handleChange}
            options={[
              { value: "Pending", label: "Pending" },
              { value: "Delivered", label: "Delivered" },
            ]}
          />

          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add any special instructions or notes..."
              rows="3"
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 resize-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gray-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="min-w-[140px] w-full sm:w-auto order-1 sm:order-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>{mode === "edit" ? "Update Order" : "Save Order"}</>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
