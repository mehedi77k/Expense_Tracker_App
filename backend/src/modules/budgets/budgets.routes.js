const { Router } = require('express');
const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { getPagination } = require('../../utils/pagination');

const router = Router();

async function getBudget(userId, id) {
  return sequelize.query(
    `SELECT b.*, c.name AS category_name,
            COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS spent
       FROM budgets b
       LEFT JOIN categories c ON c.id = b.category_id
       LEFT JOIN transactions t
         ON t.user_id = b.user_id
        AND t.type = 'expense'
        AND (b.category_id IS NULL OR t.category_id = b.category_id)
      WHERE b.user_id = :userId AND b.id = :id
      GROUP BY b.id, c.name
      LIMIT 1`,
    { replacements: { userId, id: Number(id) }, type: QueryTypes.SELECT, plain: true }
  );
}

router.get('/', async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const data = await sequelize.query(
      `SELECT b.*, c.name AS category_name,
              COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS spent
         FROM budgets b
         LEFT JOIN categories c ON c.id = b.category_id
         LEFT JOIN transactions t
           ON t.user_id = b.user_id
          AND t.type = 'expense'
          AND (b.category_id IS NULL OR t.category_id = b.category_id)
        WHERE b.user_id = :userId
        GROUP BY b.id, c.name
        ORDER BY b.created_at DESC`,
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    const decorated = data.map((budget) => ({
      ...budget,
      spent: Number(budget.spent || 0),
      remaining: Number(budget.amount) - Number(budget.spent || 0),
    }));

    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    res.json({ data: decorated.slice(offset, offset + limit), page, limit, total: decorated.length });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const [id] = await sequelize.query(
      `INSERT INTO budgets (user_id, category_id, name, amount, period, start_date, end_date, alert_at)
       VALUES (:userId, :categoryId, :name, :amount, :period, :startDate, :endDate, :alertAt)`,
      {
        replacements: {
          userId,
          categoryId: req.body.category_id ?? null,
          name: req.body.name,
          amount: Number(req.body.amount),
          period: req.body.period || 'monthly',
          startDate: req.body.start_date,
          endDate: req.body.end_date ?? null,
          alertAt: Number(req.body.alert_at || 80),
        },
        type: QueryTypes.INSERT,
      }
    );

    const budget = await getBudget(userId, id);
    res.status(201).json({ data: { ...budget, remaining: Number(budget.amount) - Number(budget.spent || 0) } });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['category_id', 'name', 'amount', 'period', 'start_date', 'end_date', 'alert_at'];
    const fields = [];
    const replacements = { id: Number(req.params.id), userId: Number(req.user.id) };

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = :${field}`);
        replacements[field] = req.body[field];
      }
    });

    if (fields.length) {
      await sequelize.query(
        `UPDATE budgets SET ${fields.join(', ')} WHERE id = :id AND user_id = :userId`,
        { replacements, type: QueryTypes.UPDATE }
      );
    }

    const budget = await getBudget(Number(req.user.id), req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    return res.json({ data: { ...budget, remaining: Number(budget.amount) - Number(budget.spent || 0) } });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await sequelize.query('DELETE FROM budgets WHERE id = :id AND user_id = :userId', {
      replacements: { id: Number(req.params.id), userId: Number(req.user.id) },
      type: QueryTypes.DELETE,
    });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.get('/:id/progress', async (req, res, next) => {
  try {
    const budget = await getBudget(Number(req.user.id), req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    const spent = Number(budget.spent || 0);
    const amount = Number(budget.amount || 0);
    return res.json({
      data: {
        budget,
        spent,
        remaining: amount - spent,
        progress: amount ? Math.min((spent / amount) * 100, 100) : 0,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
