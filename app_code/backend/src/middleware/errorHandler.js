export const notFound = (_req, res, _next) => {
  res.status(404).json({ error: "Route not found" });
};

export const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  const status = res.statusCode >= 400 ? res.statusCode : 500;
  res.status(status).json({ error: err.message || "Server error" });
};
