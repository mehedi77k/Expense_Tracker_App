const { Router } = require('express');

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    name: 'Expense Tracker API',
    version: 'v1',
    baseUrl: '/api/v1',
    docs: '/api/v1/docs',
    routes: {
      auth: ['/register', '/login', '/refresh', '/logout', '/forgot-password', '/reset-password'],
      users: ['/me', '/me/password'],
      transactions: ['/', '/summary', '/export', '/:id'],
      categories: ['/', '/:id'],
      budgets: ['/', '/:id/progress'],
      analytics: ['/overview', '/by-category', '/trend', '/top-spending', '/monthly-comparison'],
      savings: ['/', '/:id/deposit'],
    },
  });
});

module.exports = router;
