const { RateLimiterMemory } = require('rate-limiter-flexible');

const apiLimiterEngine = new RateLimiterMemory({ points: 100, duration: 60 });
const authLimiterEngine = new RateLimiterMemory({ points: 30, duration: 60 });

function createLimiter(engine) {
  return async (req, res, next) => {
    try {
      await engine.consume(req.ip);
      next();
    } catch (_error) {
      res.status(429).json({ message: 'Too many requests' });
    }
  };
}

const apiLimiter = createLimiter(apiLimiterEngine);
const authLimiter = createLimiter(authLimiterEngine);

module.exports = { apiLimiter, authLimiter };
