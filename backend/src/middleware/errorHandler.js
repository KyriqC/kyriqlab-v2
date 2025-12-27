module.exports = function errorHandler(err, req, res, next) {
  console.error(err);

  // Mongo duplicate key error (e.g., unique slug)
  if (err && err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate key', details: err.keyValue });
  }

  // Mongoose validation errors
  if (err && err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation error', details: err.errors });
  }

  return res.status(500).json({ error: 'Internal server error' });
};
