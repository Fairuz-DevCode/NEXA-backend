export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const formatedErrors = result.error.issues.map(
      (issue) => {
        return {
          field: issue.path[0],
          message: issue.message,
        };
      },
    );

    return res.status(422).json({
      status: "fail",
      message: "Validation failed",
      errors: formatedErrors,
    });
  }
  
  req.body = result.data;

  next();
};
