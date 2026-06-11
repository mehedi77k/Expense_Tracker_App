const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { accessSecret, refreshSecret, accessTokenExpiresIn, refreshTokenExpiresIn } = require('../config/jwt');

function signAccessToken(payload) {
  return jwt.sign(payload, accessSecret, { algorithm: 'HS256', expiresIn: accessTokenExpiresIn });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, refreshSecret, { algorithm: 'HS256', expiresIn: refreshTokenExpiresIn });
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { signAccessToken, signRefreshToken, hashToken };
