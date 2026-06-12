const { Router } = require('express');
const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { getPagination } = require('../../utils/pagination');

const router = Router();

async function getGoal(userId, id) {
  return sequelize.query(
    'SELECT * FROM savings_goals WHERE id = :id AND user_id = :userId LIMIT 1',
    {
      replacements: { id: Number(id), userId },
      type: QueryTypes.SELECT,
      plain: true,
    }
  );
}

router.get('/', async (req, res, next) => {
  try {
    const data = await sequelize.query(
      'SELECT * FROM savings_goals WHERE user_id = :userId ORDER BY created_at DESC',
      { replacements: { userId: Number(req.user.id) }, type: QueryTypes.SELECT }
    );
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    res.json({ data: data.slice(offset, offset + limit), page, limit, total: data.length });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const [id] = await sequelize.query(
      `INSERT INTO savings_goals (user_id, name, target_amount, saved_amount, target_date, icon, color)
       VALUES (:userId, :name, :targetAmount, :savedAmount, :targetDate, :icon, :color)`,
      {
        replacements: {
          userId,
          name: req.body.name,
          targetAmount: Number(req.body.target_amount),
          savedAmount: Number(req.body.saved_amount || 0),
          targetDate: req.body.target_date ?? null,
          icon: req.body.icon || 'savings',
          color: req.body.color || '#00B894',
        },
        type: QueryTypes.INSERT,
      }
    );

    const goal = await getGoal(userId, id);
    res.status(201).json({ data: goal });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const allowed = ['name', 'target_amount', 'saved_amount', 'target_date', 'icon', 'color'];
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
        `UPDATE savings_goals SET ${fields.join(', ')} WHERE id = :id AND user_id = :userId`,
        { replacements, type: QueryTypes.UPDATE }
      );
    }

    const goal = await getGoal(Number(req.user.id), req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    return res.json({ data: goal });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await sequelize.query('DELETE FROM savings_goals WHERE id = :id AND user_id = :userId', {
      replacements: { id: Number(req.params.id), userId: Number(req.user.id) },
      type: QueryTypes.DELETE,
    });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/deposit', async (req, res, next) => {
  try {
    const userId = Number(req.user.id);
    const goal = await getGoal(userId, req.params.id);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    await sequelize.query(
      `UPDATE savings_goals
          SET saved_amount = saved_amount + :amount
        WHERE id = :id AND user_id = :userId`,
      {
        replacements: { amount: Number(req.body.amount || 0), id: Number(req.params.id), userId },
        type: QueryTypes.UPDATE,
      }
    );

    const updated = await getGoal(userId, req.params.id);
    return res.json({ data: updated });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
