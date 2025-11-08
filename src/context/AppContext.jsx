import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import api from "../services/api";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [policies, setPolicies] = useState({ triggers: [] });
  const [dashboardStats, setDashboardStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebarOpen");
      const initialValue = saved !== null ? JSON.parse(saved) : true;
      return initialValue;
    } catch (error) {
      console.error("Error reading sidebar state:", error);
      return true;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  // Poll for new notifications every 10 seconds when user is logged in
  useEffect(() => {
    if (!user) return;

    const pollNotifications = async () => {
      try {
        const notificationsData = await api.getNotifications();
        setNotifications(notificationsData);
      } catch (error) {
        console.error("Error polling notifications:", error);
      }
    };

    // Poll immediately on mount, then every 10 seconds
    pollNotifications();
    const intervalId = setInterval(pollNotifications, 10000);

    return () => clearInterval(intervalId);
  }, [user]);

  // Persist sidebar state
  useEffect(() => {
    try {
      localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
    } catch (error) {
      console.error("Error saving sidebar state:", error);
    }
  }, [sidebarOpen]);

  // Check for existing auth
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          api.setToken(token);
          const userData = await api.getCurrentUser();
          // Extract the actual user object if it's nested
          const actualUser = userData.user || userData;
          setUser(actualUser);
          // Load data after user is set
          const [customersData, notificationsData, policiesData] =
            await Promise.all([
              api.getCustomers(),
              api.getNotifications(),
              api.getPolicy(),
            ]);
          setCustomers(customersData);
          setNotifications(notificationsData);
          setPolicies(policiesData);

          const stats = await api.getCustomerStats();
          setDashboardStats(stats);

          // Load employees if owner (use actualUser since it's the correct object)
          if (actualUser?.role === "owner") {
            const employeesData = await api.getUsers();
            setEmployees(employeesData);
          }
        } catch (error) {
          console.error("Auth init error:", error);
          // Clear invalid token and force re-login
          localStorage.removeItem("token");
          api.setToken(null);
          setUser(null);
        }
      }
      setIsAuthInitialized(true);
    };
    initAuth();
  }, []);

  const loadAllData = useCallback(async (currentUser) => {
    try {
      const [customersData, notificationsData, policiesData] =
        await Promise.all([
          api.getCustomers(),
          api.getNotifications(),
          api.getPolicy(),
        ]);
      setCustomers(customersData);
      setNotifications(notificationsData);
      setPolicies(policiesData);

      const stats = await api.getCustomerStats();
      setDashboardStats(stats);

      // Load employees if owner
      if (currentUser?.role === "owner") {
        const employeesData = await api.getUsers();
        setEmployees(employeesData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }, []);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      const { user: userData } = await api.login(username, password);
      setUser(userData);
      await loadAllData(userData);
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setCustomers([]);
      setEmployees([]);
      setNotifications([]);
      setPolicies({ triggers: [] });
      setDashboardStats(null);
    }
  };

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Customer/Order operations
  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      const newOrder = await api.createCustomer(orderData);
      setCustomers((prev) => [newOrder, ...prev]);
      await addNotification(
        "Order Created",
        `New order for ${orderData.customerName}`,
        "success"
      );
      await refreshDashboard();
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async (id, orderData) => {
    try {
      setLoading(true);
      const updated = await api.updateCustomer(id, orderData);
      setCustomers((prev) =>
        prev.map((item) => (item._id === id ? updated : item))
      );
      await addNotification(
        "Order Updated",
        `Order for ${orderData.customerName} updated`,
        "info"
      );
      await refreshDashboard();
    } catch (error) {
      console.error("Error updating order:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (id) => {
    try {
      setLoading(true);
      await api.deleteCustomer(id);
      setCustomers((prev) => prev.filter((item) => item._id !== id));
      await addNotification("Order Deleted", "Order has been deleted", "error");
      await refreshDashboard();
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Employee operations
  const createEmployee = async (employeeData) => {
    try {
      setLoading(true);
      const newEmployee = await api.createUser(employeeData);
      setEmployees((prev) => [newEmployee, ...prev]);
      await addNotification(
        "Employee Added",
        `${employeeData.name} has been added`,
        "success"
      );
    } catch (error) {
      console.error("Error creating employee:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (id, employeeData) => {
    try {
      setLoading(true);
      const updated = await api.updateUser(id, employeeData);
      setEmployees((prev) =>
        prev.map((item) => (item._id === id ? updated : item))
      );
      await addNotification(
        "Employee Updated",
        `${employeeData.name} updated`,
        "info"
      );
    } catch (error) {
      console.error("Error updating employee:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id) => {
    try {
      setLoading(true);
      await api.deleteUser(id);
      setEmployees((prev) => prev.filter((item) => item._id !== id));
      await addNotification(
        "Employee Deleted",
        "Employee has been removed",
        "error"
      );
    } catch (error) {
      console.error("Error deleting employee:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetEmployeePassword = async (id, newPassword) => {
    try {
      setLoading(true);
      await api.resetUserPassword(id, newPassword);
      await addNotification(
        "Password Reset",
        "Employee password has been reset",
        "success"
      );
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Notification operations
  const addNotification = async (title, message, type = "info") => {
    try {
      const notification = await api.createNotification({
        title,
        message,
        type,
      });
      setNotifications((prev) => [notification, ...prev]);
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const dismissNotification = async (id) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const updatePolicies = async (newTriggers) => {
    try {
      setLoading(true);
      const updated = await api.updatePolicy({ triggers: newTriggers });
      setPolicies(updated);
      await addNotification(
        "Settings Updated",
        "Notification policies have been saved",
        "success"
      );
    } catch (error) {
      console.error("Error updating policies:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = useCallback(
    async (recentDays = 1, upcomingDays = 1) => {
      try {
        const stats = await api.getCustomerStats(recentDays, upcomingDays);
        setDashboardStats(stats);
      } catch (error) {
        console.error("Error refreshing dashboard:", error);
      }
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        sidebarOpen,
        toggleSidebar,
        customers,
        employees,
        notifications,
        policies,
        dashboardStats,
        createOrder,
        updateOrder,
        deleteOrder,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        resetEmployeePassword,
        addNotification,
        markNotificationAsRead,
        dismissNotification,
        updatePolicies,
        refreshDashboard,
        loading,
        error,
        isAuthInitialized,
        refreshData: loadAllData,
        loadNotifications: async () => {
          try {
            const notificationsData = await api.getNotifications();
            setNotifications(notificationsData);
          } catch (error) {
            console.error("Error loading notifications:", error);
          }
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
