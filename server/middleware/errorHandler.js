export function errorHandler(error, req, res, next) {
  console.error({
    route: `${req.method} ${req.originalUrl}`,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
    error
  });
  if (res.headersSent) return next(error);
  res.status(error.statusCode ?? 500).json({
    error: true,
    message: error.message ?? "Internal server error",
    code: error.code
  });
}
