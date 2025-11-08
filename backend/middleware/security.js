// Security middleware functions

// Enforce HTTPS in production
export const enforceHTTPS = (req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
};

// Add HSTS header
export const addHSTSHeader = (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
  next();
};

// Prevent parameter pollution
export const preventParameterPollution = (req, res, next) => {
  // Remove duplicate query parameters, keep only the first occurrence
  if (req.query) {
    for (const key in req.query) {
      if (Array.isArray(req.query[key])) {
        req.query[key] = req.query[key][0];
      }
    }
  }
  next();
};

// Add security timing headers
export const addSecurityTimingHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");
  next();
};
