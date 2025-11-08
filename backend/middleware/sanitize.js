// Input sanitization middleware

// Basic sanitization to prevent XSS and injection attacks
export const sanitizeInput = (req, res, next) => {
  // Sanitize function to clean user input
  const sanitize = (obj) => {
    if (typeof obj === "string") {
      // Remove potentially dangerous characters
      return obj
        .replace(/[<>]/g, "") // Remove < and >
        .trim();
    }
    if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  // Sanitize body
  if (req.body) {
    req.body = sanitize(req.body);
  }

  // Sanitize query params
  if (req.query) {
    req.query = sanitize(req.query);
  }

  // Sanitize URL params
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};
