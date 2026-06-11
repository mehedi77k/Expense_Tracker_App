module.exports = {
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  accessSecret: process.env.JWT_ACCESS_SECRET || 'your_access_secret_256bit',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_256bit',
};
