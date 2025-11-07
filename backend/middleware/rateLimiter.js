// Simple in-memory rate limiter
// For production, consider using Redis-backed rate limiting

const rateLimitStore = new Map();

export const rateLimit = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const max = options.max || 100; // limit each IP to 100 requests per windowMs

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    // Clean up old entries
    if (Math.random() < 0.1) {
      // 10% chance to clean up
      for (const [ip, data] of rateLimitStore.entries()) {
        if (now - data.resetTime > windowMs) {
          rateLimitStore.delete(ip);
        }
      }
    }

    let record = rateLimitStore.get(key);

    if (!record) {
      record = {
        count: 0,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, record);
    }

    // Reset if window has passed
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + windowMs;
    }

    record.count++;

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count));
    res.setHeader(
      "X-RateLimit-Reset",
      new Date(record.resetTime).toISOString()
    );

    if (record.count > max) {
      return res.status(429).json({
        error: "Too many requests, please try again later.",
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    next();
  };
};

// Stricter rate limiting for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per 15 minutes
});

// General rate limiting for API endpoints
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per 15 minutes
});
