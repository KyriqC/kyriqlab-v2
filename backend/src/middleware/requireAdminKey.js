module.exports = function requireAdminKey(req, res, next) {
  const key = req.header('x-admin-key');

  if (!process.env.ADMIN_API_KEY) {
    return res.status(500).json({ error: 'Server missing ADMIN_API_KEY' });
  }

  if (key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return next();
};
