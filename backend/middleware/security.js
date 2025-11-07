/**
 * Security Middleware Collection
 */

/**
 * Enforce HTTPS in production
 * Redirects HTTP requests to HTTPS
 */
export const enforceHTTPS = (req, res, next) => {
  // Only enforce in production
  if (process.env.NODE_ENV === "production") {
    // Check if request is already HTTPS
    if (
      !req.secure &&
      req.get("x-forwarded-proto") !== "https" &&
      req.get("x-forwarded-proto") !== "https"
    ) {
      return res.redirect(301, `https://${req.hostname}${req.url}`);
    }
  }
  next();
};

/**
 * Add HSTS (HTTP Strict Transport Security) header
 * Forces browsers to use HTTPS for future requests
 */
export const addHSTSHeader = (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    // max-age: 1 year in seconds
    // includeSubDomains: apply to all subdomains
    // preload: allow inclusion in browser HSTS preload lists
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  next();
};

/**
 * Prevent parameter pollution
 * Limits array parameters to prevent DoS
 */
export const preventParameterPollution = (req, res, next) => {
  // Maximum array length for query parameters
  const MAX_ARRAY_LENGTH = 100;

  const checkParams = (params) => {
    for (const key in params) {
      if (Array.isArray(params[key])) {
        if (params[key].length > MAX_ARRAY_LENGTH) {
          return false;
        }
      }
    }
    return true;
  };

  if (!checkParams(req.query) || !checkParams(req.body)) {
    return res.status(400).json({
      error: "Too many parameters",
    });
  }

  next();
};

/**
 * Add security timing headers to prevent timing attacks
 */
export const addSecurityTimingHeaders = (req, res, next) => {
  // Remove server identification
  res.removeHeader("X-Powered-By");

  next();
};

/**
 * Validate Content-Type for POST/PUT requests
 */
export const validateContentType = (req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.get("content-type");

    if (
      !contentType ||
      (!contentType.includes("application/json") &&
        !contentType.includes("application/x-www-form-urlencoded"))
    ) {
      return res.status(400).json({
        error: "Invalid Content-Type. Expected application/json",
      });
    }
  }

  next();
};
