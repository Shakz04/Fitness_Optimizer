export function validate(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!parsed.success) {
      return res.status(400).json({
        error: true,
        message: "Validation failed.",
        code: "VALIDATION_FAILED",
        details: parsed.error.flatten()
      });
    }

    req.validated = parsed.data;
    next();
  };
}
