export function errorHandler(error, req, res, next) {
  console.error({
    route: `${req.method} ${req.originalUrl}`,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
    error
  });
  if (res.headersSent) return next(error);
  const hideDetails = process.env.NODE_ENV === "production" && (!error.statusCode || error.statusCode >= 500);
  res.status(error.statusCode ?? 500).json({
    error: true,
    message: hideDetails ? "Internal server error" : error.message ?? "Internal server error",
    code: hideDetails ? "INTERNAL_ERROR" : error.code
  });
}
