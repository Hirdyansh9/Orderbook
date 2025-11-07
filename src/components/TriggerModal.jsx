import { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function TriggerModal({ trigger, onClose, onSave }) {
  const [formData, setFormData] = useState(
    trigger || {
      name: "",
      type: "order",
      condition: "deliveryInDays",
      threshold: 0,
      operator: "<=",
      notificationType: "info",
      titleTemplate: "",
      messageTemplate: "",
      recipients: ["all"],
    }
  );

  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const availableFields = [
    { value: "deliveryInDays", label: "Days Until Delivery", unit: "days" },
    { value: "remainingBalance", label: "Remaining Balance", unit: "₹" },
    { value: "totalAmount", label: "Total Amount", unit: "₹" },
    { value: "advanceAmount", label: "Advance Amount", unit: "₹" },
    { value: "quantity", label: "Quantity", unit: "units" },
  ];

  const operators = [
    { value: "<=", label: "≤ Less than or equal" },
    { value: "<", label: "< Less than" },
    { value: ">=", label: "≥ Greater than or equal" },
    { value: ">", label: "> Greater than" },
    { value: "===", label: "= Equal to" },
    { value: "!==", label: "≠ Not equal to" },
  ];

  const notificationTypes = [
    {
      value: "info",
      label: "Info",
      icon: Info,
      bgColor: "bg-blue-900/30",
      textColor: "text-blue-400",
      borderColor: "border-blue-800",
    },
    {
      value: "success",
      label: "Success",
      icon: CheckCircle2,
      bgColor: "bg-green-900/30",
      textColor: "text-green-400",
      borderColor: "border-green-800",
    },
    {
      value: "warning",
      label: "Warning",
      icon: AlertTriangle,
      bgColor: "bg-amber-900/30",
      textColor: "text-amber-400",
      borderColor: "border-amber-800",
    },
    {
      value: "error",
      label: "Error",
      icon: XCircle,
      bgColor: "bg-red-900/30",
      textColor: "text-red-400",
      borderColor: "border-red-800",
    },
  ];

  const triggerTypes = [
    { value: "order", label: "Order", color: "blue" },
    { value: "customer", label: "Customer", color: "green" },
    { value: "stock", label: "Stock", color: "purple" },
  ];

  const templateVariables = [
    "{id}",
    "{customerName}",
    "{item}",
    "{quantity}",
    "{totalAmount}",
    "{advanceAmount}",
    "{remainingBalance}",
    "{address}",
    "{mobileNo}",
    "{days}",
    "{deliveryDate}",
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.titleTemplate.trim())
      newErrors.titleTemplate = "Title template is required";
    if (!formData.messageTemplate.trim())
      newErrors.messageTemplate = "Message template is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Get human-readable condition preview
  const getConditionPreview = () => {
    const field = availableFields.find((f) => f.value === formData.condition);
    const op = operators.find((o) => o.value === formData.operator);
    return `When ${field?.label} ${op?.label.split(" ")[1] || ""} ${
      formData.threshold
    } ${field?.unit}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-3xl w-full my-8 relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200 z-10"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between pr-12">
          <h3 className="text-xl font-semibold text-gray-100">
            {trigger ? "Edit Trigger" : "Create New Trigger"}
          </h3>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
        >
          {/* Step 1: Basic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900/30 border border-blue-800">
                <span className="text-xs font-bold text-blue-400">1</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-100">
                Basic Information
              </h4>
            </div>

            {/* Trigger Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trigger Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., High Priority Delivery Alert"
                className={`w-full px-4 py-2.5 bg-gray-950 border rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 ${
                  errors.name ? "border-red-800" : "border-gray-800"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
              <p className="mt-1.5 text-xs text-gray-500 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>
                  Give your trigger a descriptive name to identify it easily
                </span>
              </p>
            </div>

            {/* Trigger Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Trigger Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {triggerTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange("type", type.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      formData.type === type.value
                        ? "border-blue-600 bg-blue-900/20 shadow-sm"
                        : "border-gray-800 hover:border-gray-700 hover:bg-gray-800/50"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        formData.type === type.value
                          ? "text-blue-400"
                          : "text-gray-100"
                      }`}
                    >
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Condition */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900/30 border border-blue-800">
                <span className="text-xs font-bold text-blue-400">2</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-100">
                Set Condition
              </h4>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-3">
                Define when this notification should trigger
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Field to Check
                  </label>
                  <div className="relative">
                    <select
                      value={formData.condition}
                      onChange={(e) =>
                        handleChange("condition", e.target.value)
                      }
                      className="w-full appearance-none px-3 py-2 pr-8 bg-gray-950 border border-gray-700 rounded-lg text-sm text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 cursor-pointer hover:border-gray-600 hover:bg-gray-900"
                    >
                      {availableFields.map((field) => (
                        <option key={field.value} value={field.value}>
                          {field.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Condition
                  </label>
                  <div className="relative">
                    <select
                      value={formData.operator}
                      onChange={(e) => handleChange("operator", e.target.value)}
                      className="w-full appearance-none px-3 py-2 pr-8 bg-gray-950 border border-gray-700 rounded-lg text-sm text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 cursor-pointer hover:border-gray-600 hover:bg-gray-900"
                    >
                      {operators.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Value
                  </label>
                  <input
                    type="number"
                    value={formData.threshold}
                    onChange={(e) =>
                      handleChange("threshold", parseInt(e.target.value) || 0)
                    }
                    onWheel={(e) => e.target.blur()}
                    onInput={(e) => {
                      if (e.target.value) {
                        const value = e.target.value.replace(/^0+(?=\d)/, "");
                        if (value !== e.target.value) {
                          e.target.value = value;
                        }
                      }
                    }}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded-lg text-sm text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Condition Preview */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-1">
                  Trigger will activate:
                </p>
                <p className="text-sm font-medium text-blue-400">
                  {getConditionPreview()}
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Notification Style */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900/30 border border-blue-800">
                <span className="text-xs font-bold text-blue-400">3</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-100">
                Notification Style
              </h4>
            </div>

            {/* Notification Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Choose Notification Type
              </label>
              <div className="grid grid-cols-4 gap-3">
                {notificationTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        handleChange("notificationType", type.value)
                      }
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        formData.notificationType === type.value
                          ? `${type.borderColor} ${type.bgColor} shadow-sm`
                          : "border-gray-800 hover:border-gray-700 hover:bg-gray-800/50"
                      }`}
                    >
                      <IconComponent
                        className={`w-6 h-6 mb-2 mx-auto ${
                          formData.notificationType === type.value
                            ? type.textColor
                            : "text-gray-400"
                        }`}
                      />
                      <div
                        className={`text-xs font-medium ${
                          formData.notificationType === type.value
                            ? type.textColor
                            : "text-gray-400"
                        }`}
                      >
                        {type.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 4: Message Content */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900/30 border border-blue-800">
                <span className="text-xs font-bold text-blue-400">4</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-100">
                Message Content
              </h4>
            </div>

            {/* Title Template */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notification Title *
              </label>
              <input
                type="text"
                value={formData.titleTemplate}
                onChange={(e) => handleChange("titleTemplate", e.target.value)}
                placeholder="e.g., Delivery Due Soon"
                className={`w-full px-4 py-2.5 bg-gray-950 border rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 ${
                  errors.titleTemplate ? "border-red-800" : "border-gray-800"
                }`}
              />
              {errors.titleTemplate && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.titleTemplate}
                </p>
              )}
            </div>

            {/* Message Template */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notification Message *
              </label>
              <textarea
                value={formData.messageTemplate}
                onChange={(e) =>
                  handleChange("messageTemplate", e.target.value)
                }
                placeholder="Order for {customerName} ({item}) is due in {days} days. Contact: {mobileNo}"
                rows={3}
                className={`w-full px-4 py-2.5 bg-gray-950 border rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 ${
                  errors.messageTemplate ? "border-red-800" : "border-gray-800"
                }`}
              />
              {errors.messageTemplate && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.messageTemplate}
                </p>
              )}

              {/* Template Variables Helper */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="mt-2 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {showAdvanced ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {showAdvanced ? "Hide" : "Show"} available variables
                </span>
              </button>

              {showAdvanced && (
                <div className="mt-3 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <p className="text-xs font-medium text-gray-300 mb-2">
                    Available Variables:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {templateVariables.map((variable) => (
                      <code
                        key={variable}
                        className="px-2 py-1 text-xs bg-gray-950 border border-gray-700 rounded text-blue-400 font-mono"
                      >
                        {variable}
                      </code>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    These will be replaced with actual values when the
                    notification is sent
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Step 5: Recipients */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900/30 border border-blue-800">
                <span className="text-xs font-bold text-blue-400">5</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-100">
                Who Should Receive This?
              </h4>
            </div>

            <div className="space-y-2">
              <label className="flex items-center p-3 bg-gray-800/30 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.recipients.includes("all")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleChange("recipients", ["all"]);
                    } else {
                      handleChange("recipients", []);
                    }
                  }}
                  className="rounded border-gray-600 bg-gray-950 text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-900"
                />
                <span className="ml-3 text-sm text-gray-200 font-medium">
                  All Users (Owner + Employees)
                </span>
              </label>
              {!formData.recipients.includes("all") && (
                <div className="ml-6 space-y-2">
                  <label className="flex items-center p-3 bg-gray-800/30 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.recipients.includes("owner")}
                      onChange={(e) => {
                        const newRecipients = e.target.checked
                          ? [
                              ...formData.recipients.filter((r) => r !== "all"),
                              "owner",
                            ]
                          : formData.recipients.filter((r) => r !== "owner");
                        handleChange("recipients", newRecipients);
                      }}
                      className="rounded border-gray-600 bg-gray-950 text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-900"
                    />
                    <span className="ml-3 text-sm text-gray-300">
                      Owner Only
                    </span>
                  </label>
                  <label className="flex items-center p-3 bg-gray-800/30 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.recipients.includes("employees")}
                      onChange={(e) => {
                        const newRecipients = e.target.checked
                          ? [
                              ...formData.recipients.filter((r) => r !== "all"),
                              "employees",
                            ]
                          : formData.recipients.filter(
                              (r) => r !== "employees"
                            );
                        handleChange("recipients", newRecipients);
                      }}
                      className="rounded border-gray-600 bg-gray-950 text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-900"
                    />
                    <span className="ml-3 text-sm text-gray-300">
                      Employees Only
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
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
              className="px-5 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-white transition-all duration-200"
            >
              {trigger ? "Update Trigger" : "Create Trigger"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
