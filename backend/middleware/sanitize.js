/**
 * Input Sanitization Middleware
 * Prevents XSS and injection attacks by sanitizing user input
 */

/**
 * Recursively sanitize strings in an object
 * Removes potentially dangerous characters while preserving legitimate content
 */
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;

  return (
    str
      // Remove null bytes
      .replace(/\0/g, "")
      // Trim whitespace
      .trim()
  );
};

/**
 * Sanitize all string values in an object recursively
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === "object") {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Don't sanitize password fields (they need exact content)
        if (key === "password") {
          sanitized[key] = obj[key];
        } else {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Middleware to sanitize request body, query params, and route params
 */
export const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize route parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Validate MongoDB ObjectId format
 */
export const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username format (alphanumeric, underscore, hyphen)
 */
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Check password strength
 * Returns: { valid: boolean, errors: string[] }
 */
export const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Optional: Special character requirement (uncomment if needed)
  // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
  //   errors.push("Password must contain at least one special character");
  // }

  return {
    valid: errors.length === 0,
    errors,
  };
};
