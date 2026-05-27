/**
 * Global error-handling middleware.
 * Catches any error thrown/passed via next(err) in routes.
 * Returns structured API error responses.
 */
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Resolve standard error codes
  let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
  if (status === 400) errorCode = 'BAD_REQUEST';
  if (status === 401) errorCode = 'UNAUTHORIZED';
  if (status === 403) errorCode = 'FORBIDDEN';
  if (status === 404) errorCode = 'NOT_FOUND';
  if (status === 409) errorCode = 'CONFLICT';

  // Centralized logging (could connect to Winston, ELK, or Datadog in production)
  console.error(
    `[ERROR] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | ` +
    `Status: ${status} | Code: ${errorCode} | Message: ${message}`
  );
  if (status === 500 && err.stack) {
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message,
    errorCode,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 handler — placed after all routes.
 */
export function notFound(req, res) {
  const pathInfo = `${req.method} ${req.originalUrl}`;
  res.status(404).json({
    success: false,
    message: `Route not found: ${pathInfo}`,
    errorCode: 'ROUTE_NOT_FOUND',
    timestamp: new Date().toISOString(),
  });
}
