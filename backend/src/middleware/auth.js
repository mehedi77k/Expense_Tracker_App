function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    const error = new Error('Unauthorized');
    error.status = 401;
    return next(error);
  }

  const token = header.slice(7);
  req.authToken = token;
  req.user = { id: 1 };
  return next();
}

module.exports = { requireAuth };
