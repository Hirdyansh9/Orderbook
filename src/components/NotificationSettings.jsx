import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import api from "../services/api";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  TestTube,
  Power,
  AlertCircle,
  CheckCircle2,
  Bell,
  Loader2,
} from "lucide-react";
import TriggerModal from "./TriggerModal";

export default function NotificationSettings() {
  const { user } = useApp();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState(null);

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const data = await api.getPolicy();
      setPolicy(data);
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to load notification settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTrigger = (triggerId) => {
    setPolicy((prev) => ({
      ...prev,
      triggers: prev.triggers.map((trigger) =>
        trigger.id === triggerId
          ? { ...trigger, enabled: !trigger.enabled }
          : trigger
      ),
    }));
  };

  const handleThresholdChange = (triggerId, value) => {
    const numValue = parseInt(value) || 0;
    setPolicy((prev) => ({
      ...prev,
      triggers: prev.triggers.map((trigger) =>
        trigger.id === triggerId ? { ...trigger, threshold: numValue } : trigger
      ),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updatePolicy(policy.triggers);
      setMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestTriggers = async () => {
    try {
      await api.testNotificationTriggers();
      setMessage({
        type: "success",
        text: "Notification check triggered! Check notifications in a moment.",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      setMessage({ type: "error", text: "Failed to test triggers" });
    }
  };

  const handleCreateTrigger = (newTrigger) => {
    const trigger = {
      ...newTrigger,
      id: `custom_${Date.now()}`,
      enabled: true,
    };
    setPolicy((prev) => ({
      ...prev,
      triggers: [...prev.triggers, trigger],
    }));
    setShowCreateModal(false);
    setMessage({
      type: "success",
      text: "Trigger created! Don't forget to save.",
    });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleUpdateTrigger = (updatedTrigger) => {
    setPolicy((prev) => ({
      ...prev,
      triggers: prev.triggers.map((t) =>
        t.id === updatedTrigger.id
          ? { ...updatedTrigger, id: t.id, enabled: t.enabled }
          : t
      ),
    }));
    setEditingTrigger(null);
    setMessage({
      type: "success",
      text: "Trigger updated! Don't forget to save.",
    });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const handleDeleteTrigger = (triggerId) => {
    if (!window.confirm("Are you sure you want to delete this trigger?")) {
      return;
    }
    setPolicy((prev) => ({
      ...prev,
      triggers: prev.triggers.filter((t) => t.id !== triggerId),
    }));
    setMessage({
      type: "success",
      text: "Trigger deleted! Don't forget to save.",
    });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  const getTriggerIcon = (type) => {
    const icons = {
      info: <AlertCircle className="w-6 h-6 text-blue-400" />,
      warning: <AlertCircle className="w-6 h-6 text-amber-400" />,
      error: <AlertCircle className="w-6 h-6 text-red-400" />,
      success: <CheckCircle2 className="w-6 h-6 text-green-400" />,
    };
    return icons[type] || <Bell className="w-6 h-6 text-gray-400" />;
  };

  const getFieldUnit = (condition) => {
    const units = {
      deliveryInDays: "days",
      remainingBalance: "₹",
      totalAmount: "₹",
      advanceAmount: "₹",
      quantity: "units",
    };
    return units[condition] || "";
  };

  const getTypeColor = (type) => {
    const colors = {
      order: {
        bg: "bg-blue-900/30",
        text: "text-blue-400",
        border: "border-blue-800",
      },
      customer: {
        bg: "bg-green-900/30",
        text: "text-green-400",
        border: "border-green-800",
      },
      stock: {
        bg: "bg-purple-900/30",
        text: "text-purple-400",
        border: "border-purple-800",
      },
    };
    return (
      colors[type] || {
        bg: "bg-gray-900/30",
        text: "text-gray-400",
        border: "border-gray-800",
      }
    );
  };

  const getNotificationTypeColor = (type) => {
    const colors = {
      info: {
        bg: "bg-blue-900/20",
        border: "border-blue-800",
      },
      success: {
        bg: "bg-green-900/20",
        border: "border-green-800",
      },
      warning: {
        bg: "bg-amber-900/20",
        border: "border-amber-800",
      },
      error: {
        bg: "bg-red-900/20",
        border: "border-red-800",
      },
    };
    return (
      colors[type] || {
        bg: "bg-gray-900/20",
        border: "border-gray-800",
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center py-12">
          <p className="text-gray-400">No notification settings found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-end items-center mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex gap-3">
          {user?.role === "owner" && (
            <>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg hover:bg-white transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Create Trigger
              </button>
              <button
                onClick={handleTestTriggers}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-100 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              >
                <TestTube className="w-4 h-4" />
                Test Now
              </button>
            </>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-100 bg-blue-900/50 border border-blue-800 rounded-lg hover:bg-blue-900/70 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-900/20 border-green-800 text-green-300"
              : "bg-red-900/20 border-red-800 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-3 duration-400">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Triggers</p>
              <p className="text-2xl font-semibold text-gray-100">
                {policy.triggers.length}
              </p>
            </div>
            <div className="p-3 bg-blue-900/30 rounded-lg">
              <Bell className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active</p>
              <p className="text-2xl font-semibold text-green-400">
                {policy.triggers.filter((t) => t.enabled).length}
              </p>
            </div>
            <div className="p-3 bg-green-900/30 rounded-lg">
              <Power className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-200 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Inactive</p>
              <p className="text-2xl font-semibold text-gray-400">
                {policy.triggers.filter((t) => !t.enabled).length}
              </p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <Power className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Triggers Grid */}
      <div className="grid grid-cols-1 gap-4">
        {policy.triggers.map((trigger, index) => {
          const typeColor = getTypeColor(trigger.type);
          const notifColor = getNotificationTypeColor(trigger.notificationType);

          return (
            <div
              key={trigger.id}
              style={{
                animationDelay: `${index * 75}ms`,
              }}
              className={`bg-gray-900 rounded-lg border transition-all duration-200 hover:border-gray-700 hover:shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-400 ${
                trigger.enabled
                  ? "border-gray-800"
                  : "border-gray-800 opacity-60"
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left Side - Icon and Content */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Icon */}
                    <div className="flex-shrink-0 p-3 rounded-lg bg-gray-800 border border-gray-700">
                      {getTriggerIcon(trigger.notificationType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-lg font-semibold text-gray-100">
                          {trigger.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeColor.bg} ${typeColor.text} border ${typeColor.border}`}
                        >
                          {trigger.type}
                        </span>
                        {!trigger.enabled && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                            Disabled
                          </span>
                        )}
                      </div>

                      {/* Condition Details */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
                          <span className="text-xs font-medium text-gray-400">
                            Threshold:
                          </span>
                          <input
                            type="number"
                            value={trigger.threshold}
                            onChange={(e) =>
                              handleThresholdChange(trigger.id, e.target.value)
                            }
                            onWheel={(e) => e.target.blur()}
                            onInput={(e) => {
                              if (e.target.value) {
                                const value = e.target.value.replace(
                                  /^0+(?=\d)/,
                                  ""
                                );
                                if (value !== e.target.value) {
                                  e.target.value = value;
                                }
                              }
                            }}
                            disabled={!trigger.enabled}
                            className="w-16 px-2 py-0.5 text-sm font-semibold text-gray-100 bg-gray-950 border border-gray-700 rounded focus:ring-2 focus:ring-gray-600 focus:border-gray-600 disabled:bg-gray-900 disabled:text-gray-500"
                          />
                          <span className="text-xs font-medium text-gray-300">
                            {getFieldUnit(trigger.condition)}
                          </span>
                        </div>
                        <div className="px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
                          <span className="text-xs text-gray-400">
                            Operator:{" "}
                          </span>
                          <span className="text-xs font-mono font-semibold text-gray-100">
                            {trigger.operator}
                          </span>
                        </div>
                        <div className="px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
                          <span className="text-xs text-gray-400">Field: </span>
                          <span className="text-xs font-medium text-gray-100">
                            {trigger.condition}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Edit Button */}
                    <button
                      onClick={() => setEditingTrigger(trigger)}
                      className="p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg transition-all duration-200"
                      title="Edit trigger"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteTrigger(trigger.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                      title="Delete trigger"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleTrigger(trigger.id)}
                      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-gray-950 ${
                        trigger.enabled ? "bg-blue-900/50" : "bg-gray-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-gray-100 shadow-lg ring-0 transition duration-200 ease-in-out ${
                          trigger.enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="p-2 bg-gray-800 rounded-lg">
              <AlertCircle className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-100 mb-2">
              How Notification Triggers Work
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>
                  Automatic checks run{" "}
                  <strong className="text-gray-300">every hour</strong> to
                  evaluate all enabled triggers
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>
                  Notifications are created{" "}
                  <strong className="text-gray-300">once per 24 hours</strong>{" "}
                  for each matching order
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>
                  Use{" "}
                  <strong className="text-gray-300">"Create Trigger"</strong> to
                  add custom notification rules for any order field
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>
                  Click <strong className="text-gray-300">"Test Now"</strong> to
                  manually check all conditions immediately
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>
                  Toggle triggers on/off anytime without deleting them
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <TriggerModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateTrigger}
        />
      )}
      {editingTrigger && (
        <TriggerModal
          trigger={editingTrigger}
          onClose={() => setEditingTrigger(null)}
          onSave={handleUpdateTrigger}
        />
      )}
    </div>
  );
}
