import { validationResult } from "express-validator";
import { AppError } from "./errorHandler.js";

// Runs after express-validator rule chains; collects errors into one response
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new AppError(messages.join(", "), 422));
  }
  next();
};
