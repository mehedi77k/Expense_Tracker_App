const { Router } = require('express');
const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/database');

const router = Router();

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

router.get('/overview', async (req, res, next) => {
  try {
    const row = await sequelize.query(
      `SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
         FROM transactions
        WHERE user_id = :userId`,
      { replacements: { userId: Number(req.user.id) }, type: QueryTypes.SELECT, plain: true }
    );

    const income = number(row.income);
    const expense = number(row.expense);
    res.json({ data: { income, expense, balance: income - expense } });
  } catch (error) {
    next(error);
  }
});

router.get('/by-category', async (req, res, next) => {
  try {
    const rows = await sequelize.query(
      `SELECT c.*, COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS total
         FROM categories c
         LEFT JOIN transactions t
           ON t.category_id = c.id AND t.user_id = :userId AND t.type = 'expense'
        WHERE c.user_id IS NULL OR c.user_id = :userId
        GROUP BY c.id
        ORDER BY total DESC, c.name ASC`,
      { replacements: { userId: Number(req.user.id) }, type: QueryTypes.SELECT }
    );
    res.json({ data: rows.map((row) => ({ ...row, total: number(row.total) })) });
  } catch (error) {
    next(error);
  }
});

router.get('/trend', async (req, res, next) => {
  try {
    const period = req.query.period || 'day';
    const keyExpression = period === 'year'
      ? 'DATE_FORMAT(date, "%Y")'
      : period === 'month'
        ? 'DATE_FORMAT(date, "%Y-%m")'
        : 'DATE_FORMAT(date, "%Y-%m-%d")';

    const rows = await sequelize.query(
      `SELECT ${keyExpression} AS period_key,
              COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
              COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
         FROM transactions
        WHERE user_id = :userId
        GROUP BY period_key
        ORDER BY period_key ASC`,
      { replacements: { userId: Number(req.user.id) }, type: QueryTypes.SELECT }
    );

    const data = rows.reduce((acc, row) => {
      acc[row.period_key] = { income: number(row.income), expense: number(row.expense) };
      return acc;
    }, {});

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/top-spending', async (req, res, next) => {
  try {
    const rows = await sequelize.query(
      `SELECT c.name AS category, COALESCE(SUM(t.amount), 0) AS total
         FROM transactions t
         LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.user_id = :userId AND t.type = 'expense'
        GROUP BY c.id, c.name
        ORDER BY total DESC
        LIMIT 5`,
      { replacements: { userId: Number(req.user.id) }, type: QueryTypes.SELECT }
    );
    res.json({ data: rows.map((row) => ({ ...row, total: number(row.total) })) });
  } catch (error) {
    next(error);
  }
});

router.get('/monthly-comparison', async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonth = `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`;

    const rows = await sequelize.query(
      `SELECT DATE_FORMAT(date, "%Y-%m") AS month_key,
              COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
              COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
         FROM transactions
        WHERE user_id = :userId AND DATE_FORMAT(date, "%Y-%m") IN (:months)
        GROUP BY month_key`,
      {
        replacements: { userId: Number(req.user.id), months: [currentMonth, previousMonth] },
        type: QueryTypes.SELECT,
      }
    );

    const byMonth = rows.reduce((acc, row) => {
      acc[row.month_key] = { income: number(row.income), expense: number(row.expense) };
      return acc;
    }, {});

    res.json({
      data: {
        current: byMonth[currentMonth] || { income: 0, expense: 0 },
        previous: byMonth[previousMonth] || { income: 0, expense: 0 },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
