// Use environment variable for API URL with fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

class ApiService {
  constructor() {
    this.token = localStorage.getItem("token");
    this.tokenExpiry = localStorage.getItem("tokenExpiry");
    this.checkTokenExpiry();
  }

  /**
   * Check if token is expired and clear if necessary
   */
  checkTokenExpiry() {
    if (this.tokenExpiry && Date.now() > parseInt(this.tokenExpiry)) {
      console.warn("Token expired, clearing...");
      this.clearAuth();
    }
  }

  /**
   * Set authentication token with optional expiry
   */
  setToken(token, expiresIn = 7 * 24 * 60 * 60 * 1000) {
    // Default 7 days
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
      // Store expiry timestamp
      const expiry = Date.now() + expiresIn;
      localStorage.setItem("tokenExpiry", expiry.toString());
      this.tokenExpiry = expiry.toString();
    } else {
      this.clearAuth();
    }
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    this.token = null;
    this.tokenExpiry = null;
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
  }

  /**
   * Get headers with auth token
   */
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    // Check token expiry before adding to headers
    this.checkTokenExpiry();

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * Handle API response with error handling
   */
  async handleResponse(response) {
    // Handle 401 Unauthorized (expired/invalid token)
    if (response.status === 401) {
      this.clearAuth();
      // Redirect to login or trigger auth event
      window.dispatchEvent(new Event("unauthorized"));
      throw new Error("Session expired. Please login again.");
    }

    // Handle 429 Too Many Requests
    if (response.status === 429) {
      throw new Error("Too many requests. Please try again later.");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: "An error occurred",
      }));
      throw new Error(
        error.error || error.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Auth endpoints
  async login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await this.handleResponse(response);
    this.setToken(data.token);
    return data;
  }

  async register(name, username, email, password, role = "employee") {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, email, password, role }),
    });
    return this.handleResponse(response);
  }

  async logout() {
    try {
      // Optional: Call backend logout endpoint if needed
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearAuth();
    }
    return Promise.resolve();
  }

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Customer/Order endpoints
  async getCustomers(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/customers?${params}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getCustomer(id) {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createCustomer(customerData) {
    const response = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(customerData),
    });
    return this.handleResponse(response);
  }

  async updateCustomer(id, customerData) {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(customerData),
    });
    return this.handleResponse(response);
  }

  async deleteCustomer(id) {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getCustomerStats(recentDays = 1, upcomingDays = 1) {
    const params = new URLSearchParams({
      recentDays: recentDays.toString(),
      upcomingDays: upcomingDays.toString(),
    });
    const response = await fetch(
      `${API_URL}/customers/stats/summary?${params}`,
      {
        headers: this.getHeaders(),
      }
    );
    return this.handleResponse(response);
  }

  // Notification endpoints
  async getNotifications() {
    const response = await fetch(`${API_URL}/notifications`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createNotification(notificationData) {
    const response = await fetch(`${API_URL}/notifications`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(notificationData),
    });
    return this.handleResponse(response);
  }

  async markNotificationAsRead(id) {
    const response = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async markAllNotificationsAsRead() {
    const response = await fetch(`${API_URL}/notifications/read-all`, {
      method: "PATCH",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async deleteNotification(id) {
    const response = await fetch(`${API_URL}/notifications/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUnreadCount() {
    const response = await fetch(`${API_URL}/notifications/unread/count`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Policy endpoints
  async getPolicy() {
    const response = await fetch(`${API_URL}/policies`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updatePolicy(triggers) {
    const response = await fetch(`${API_URL}/policies`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify({ triggers }),
    });
    return this.handleResponse(response);
  }

  // Manual notification endpoints
  async createManualNotification({ title, message, type, recipients }) {
    const response = await fetch(`${API_URL}/notifications/manual`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ title, message, type, recipients }),
    });
    return this.handleResponse(response);
  }

  async testNotificationTriggers() {
    const response = await fetch(`${API_URL}/notifications/test-triggers`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // User/Employee management endpoints
  async getUsers() {
    const response = await fetch(`${API_URL}/users`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createUser(userData) {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async updateUser(id, userData) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async deleteUser(id) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async resetUserPassword(id, newPassword) {
    const response = await fetch(`${API_URL}/users/${id}/reset-password`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ newPassword }),
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();
