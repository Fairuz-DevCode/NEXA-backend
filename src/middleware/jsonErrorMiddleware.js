import { AppError } from "../utils/appError.js";

export const handleJsonSyntaxError = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return next(new AppError("Malformed JSON in request body", 400));
  }
  next(err);
};
