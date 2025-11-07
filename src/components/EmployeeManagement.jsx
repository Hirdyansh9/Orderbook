import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Key,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";
import CustomDropdown from "./CustomDropdown";

function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  title,
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
      "bg-transparent hover:bg-gray-800/50 text-gray-400 hover:text-gray-100",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
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
  required = false,
  disabled = false,
}) {
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
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-gray-600 focus:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="w-full appearance-none px-4 py-2.5 pr-10 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 cursor-pointer hover:border-gray-600 hover:bg-gray-800"
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

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200 z-10"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex justify-between items-center mb-4 pr-10">
          <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
        </div>
        {children}
      </div>
    </div>
  );
}

// Main EmployeeManagement Component
export default function EmployeeManagement({
  employees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  resetEmployeePassword,
  loading,
}) {
  const [modal, setModal] = useState({
    isOpen: false,
    mode: "create",
    data: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });

  const handleSubmit = async (formData) => {
    try {
      if (modal.mode === "edit") {
        await updateEmployee(modal.data._id, formData);
      } else {
        await createEmployee(formData);
      }
      setModal({ isOpen: false, mode: "create", data: null });
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEmployee(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null, name: "" });
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="text-sm text-gray-400">
          {employees.length} {employees.length === 1 ? "employee" : "employees"}
        </div>
        <Button
          onClick={() => setModal({ isOpen: true, mode: "create", data: null })}
          className="hover:scale-105 w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Employees Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
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
              {employees.map((employee, index) => (
                <tr
                  key={employee._id}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                  className="hover:bg-gray-800/50 transition-all duration-150 group animate-in fade-in slide-in-from-left-2 duration-300"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-100">
                    {employee.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-100">
                    <span className="text-gray-400">@</span>
                    {employee.username}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.role === "owner"
                          ? "bg-purple-900/30 text-purple-400 border border-purple-800"
                          : "bg-blue-900/30 text-blue-400 border border-blue-800"
                      }`}
                    >
                      {employee.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        employee.isActive
                          ? "bg-green-900/30 text-green-400 border border-green-800"
                          : "bg-gray-800 text-gray-400 border border-gray-700"
                      }`}
                    >
                      {employee.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setModal({
                            isOpen: true,
                            mode: "edit",
                            data: employee,
                          })
                        }
                        title="Edit"
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setPasswordModal({
                            isOpen: true,
                            id: employee._id,
                            name: employee.name,
                          })
                        }
                        title="Reset Password"
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                      >
                        <Key className="w-4 h-4 text-blue-400" />
                      </Button>
                      {employee.role !== "owner" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              id: employee._id,
                              name: employee.name,
                            })
                          }
                          title="Delete"
                          className="opacity-70 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-red-500 hover:text-red-400" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-800">
          {employees.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No employees found
            </div>
          ) : (
            employees.map((employee, index) => (
              <div
                key={employee._id}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                className="p-4 hover:bg-gray-800/30 transition-all duration-150 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-100 truncate">
                      {employee.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      <span className="text-gray-500">@</span>
                      {employee.username}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2 flex-shrink-0 ${
                      employee.isActive
                        ? "bg-green-900/30 text-green-400 border border-green-800"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                    }`}
                  >
                    {employee.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Role Badge */}
                <div className="mb-3">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      employee.role === "owner"
                        ? "bg-purple-900/30 text-purple-400 border border-purple-800"
                        : "bg-blue-900/30 text-blue-400 border border-blue-800"
                    }`}
                  >
                    {employee.role}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setModal({
                        isOpen: true,
                        mode: "edit",
                        data: employee,
                      })
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-100 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      setPasswordModal({
                        isOpen: true,
                        id: employee._id,
                        name: employee.name,
                      })
                    }
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-400 bg-blue-900/20 border border-blue-800 rounded-lg hover:bg-blue-900/30 transition-all"
                  >
                    <Key className="w-4 h-4" />
                  </button>
                  {employee.role !== "owner" && (
                    <button
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          id: employee._id,
                          name: employee.name,
                        })
                      }
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-400 bg-red-900/20 border border-red-800 rounded-lg hover:bg-red-900/30 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Employee Form Modal */}
      <EmployeeFormModal
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
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: "" })}
        title="Delete Employee"
      >
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete{" "}
          <strong className="text-gray-100">{deleteModal.name}</strong>? This
          action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              setDeleteModal({ isOpen: false, id: null, name: "" })
            }
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete"}
          </Button>
        </div>
      </Modal>

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={passwordModal.isOpen}
        employeeName={passwordModal.name}
        onClose={() => setPasswordModal({ isOpen: false, id: null, name: "" })}
        onSubmit={async (newPassword) => {
          await resetEmployeePassword(passwordModal.id, newPassword);
          setPasswordModal({ isOpen: false, id: null, name: "" });
        }}
        isLoading={loading}
      />
    </div>
  );
}

// Employee Form Modal
function EmployeeFormModal({
  isOpen,
  mode,
  data,
  onClose,
  onSubmit,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "employee",
    isActive: true,
  });

  useEffect(() => {
    if (mode === "edit" && data) {
      setFormData({
        name: data.name || "",
        username: data.username || "",
        password: "", // Don't show password
        role: data.role || "employee",
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
    } else {
      setFormData({
        name: "",
        username: "",
        password: "",
        role: "employee",
        isActive: true,
      });
    }
  }, [mode, data, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Don't send password if editing (unless you want to allow password change here)
    const submitData = { ...formData };
    if (mode === "edit" && !submitData.password) {
      delete submitData.password;
    }
    onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "edit" ? "Edit Employee" : "Add Employee"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="name"
          label="Full Name *"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Input
          id="username"
          label="Username *"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={mode === "edit"} // Don't allow changing username when editing
        />

        {mode === "create" && (
          <Input
            id="password"
            label="Password *"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        )}

        <CustomDropdown
          label="Role"
          value={formData.role}
          onChange={(value) => {
            setFormData({ ...formData, role: value });
          }}
          options={[
            { value: "employee", label: "Employee" },
            { value: "owner", label: "Owner" },
          ]}
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="isActive"
            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
          >
            Active Employee
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === "edit" ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Password Reset Modal
function PasswordResetModal({
  isOpen,
  employeeName,
  onClose,
  onSubmit,
  isLoading,
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    onSubmit(newPassword);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reset Password - ${employeeName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="newPassword"
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <Input
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && (
          <div className="text-red-300 text-sm bg-red-900/20 border border-red-800 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Reset Password"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
