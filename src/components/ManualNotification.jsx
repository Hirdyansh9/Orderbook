import { useState } from "react";
import api from "../services/api";
import { X, AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

export default function ManualNotification({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    recipients: ["all"],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const notificationTypes = [
    { value: "info", label: "Info", icon: Info, color: "blue" },
    { value: "success", label: "Success", icon: CheckCircle2, color: "green" },
    { value: "warning", label: "Warning", icon: AlertTriangle, color: "amber" },
    { value: "alert", label: "Alert", icon: XCircle, color: "red" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.message.trim()) {
      setError("Title and message are required");
      return;
    }

    try {
      setLoading(true);
      await api.createManualNotification(formData);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to create notification");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-lg w-full max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200 z-50"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="sticky top-0 bg-gray-900 px-6 py-4 border-b border-gray-800 z-10 pr-12">
          <h3 className="text-xl font-semibold text-gray-100">
            Create Manual Notification
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-sm text-red-300 font-medium">{error}</p>
            </div>
          )}

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Notification Type
            </label>
            <div className="grid grid-cols-4 gap-3">
              {notificationTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, type: type.value }))
                    }
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                      formData.type === type.value
                        ? type.color === "blue"
                          ? "border-blue-800 bg-blue-900/30"
                          : type.color === "green"
                          ? "border-green-800 bg-green-900/30"
                          : type.color === "amber"
                          ? "border-amber-800 bg-amber-900/30"
                          : "border-red-800 bg-red-900/30"
                        : "border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    <IconComponent
                      className={`w-6 h-6 mb-2 ${
                        formData.type === type.value
                          ? type.color === "blue"
                            ? "text-blue-400"
                            : type.color === "green"
                            ? "text-green-400"
                            : type.color === "amber"
                            ? "text-amber-400"
                            : "text-red-400"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="text-xs font-semibold text-gray-300">
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Important Order Update"
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 transition-all duration-200"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter detailed notification message..."
              rows={4}
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 resize-none transition-all duration-200"
              required
            />
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Send To
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.recipients.includes("all")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData((prev) => ({ ...prev, recipients: ["all"] }));
                    } else {
                      setFormData((prev) => ({ ...prev, recipients: [] }));
                    }
                  }}
                  className="rounded border-gray-700 bg-gray-950 text-gray-100 focus:ring-gray-600"
                />
                <span className="ml-2 text-sm text-gray-300">
                  All Users (Owner + Employees)
                </span>
              </label>
              {!formData.recipients.includes("all") && (
                <>
                  <label className="flex items-center">
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
                        setFormData((prev) => ({
                          ...prev,
                          recipients: newRecipients,
                        }));
                      }}
                      className="rounded border-gray-700 bg-gray-950 text-gray-100 focus:ring-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-300">
                      Owner Only
                    </span>
                  </label>
                  <label className="flex items-center">
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
                        setFormData((prev) => ({
                          ...prev,
                          recipients: newRecipients,
                        }));
                      }}
                      className="rounded border-gray-700 bg-gray-950 text-gray-100 focus:ring-gray-600"
                    />
                    <span className="ml-2 text-sm text-gray-300">
                      Employees Only
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-100 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
