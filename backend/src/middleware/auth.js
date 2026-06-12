const jwt = require('jsonwebtoken');
const { accessSecret } = require('../config/jwt');

function extractBearerToken(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

function verifyAccessToken(token) {
  const decoded = jwt.verify(token, accessSecret, { algorithms: ['HS256'] });
  const id = Number(decoded.sub);
  if (!id) {
    const error = new Error('Invalid token subject');
    error.status = 401;
    throw error;
  }
  return {
    id,
    email: decoded.email,
  };
}

function requireAuth(req, _res, next) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    }

    req.authToken = token;
    req.user = verifyAccessToken(token);
    return next();
  } catch (_error) {
    const error = new Error('Unauthorized');
    error.status = 401;
    return next(error);
  }
}

function optionalAuth(req, _res, next) {
  try {
    const token = extractBearerToken(req);
    if (token) {
      req.authToken = token;
      req.user = verifyAccessToken(token);
    }
  } catch (_error) {
    req.user = null;
  }
  return next();
}

module.exports = { requireAuth, optionalAuth };
