export const errorHandler = (err, req, res, next) => {
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      status: "fail",
      message: "Malformed JSON in request body",
      errors: null,
    });
  }

  const statusCode = err.statusCode || 500;
  const status = err.status || "error";
  const message = err.message || "Internal Server Error";
  const errors = err.errors || null;

  return res.status(statusCode).json({
    status: status,
    message: message,
    errors: errors,
  });
};
