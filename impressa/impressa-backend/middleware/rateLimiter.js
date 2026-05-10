import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: "Too many authentication attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const checkoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: "Too many checkout attempts. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: "Too many payment requests.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const reportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many reports generated. Please wait and try again.",
});

export const analyticsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: "Too many analytics requests. Please slow down.",
});