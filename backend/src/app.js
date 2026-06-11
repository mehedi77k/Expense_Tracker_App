const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/users.routes');
const transactionRoutes = require('./modules/transactions/transactions.routes');
const categoryRoutes = require('./modules/categories/categories.routes');
const budgetRoutes = require('./modules/budgets/budgets.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');
const savingsRoutes = require('./modules/savings/savings.routes');
const docsRoutes = require('./docs');

function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use('/api/v1', apiLimiter);
  app.use('/api/v1/auth', authLimiter, authRoutes);
  app.use('/api/v1/docs', docsRoutes);
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'expense-tracker-api' });
  });

  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/transactions', transactionRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/budgets', budgetRoutes);
  app.use('/api/v1/analytics', analyticsRoutes);
  app.use('/api/v1/savings', savingsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
