const { Router } = require('express');
const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { optionalAuth, requireAuth } = require('../../middleware/auth');
const { getPagination } = require('../../utils/pagination');

const router = Router();

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const where = [];
    const replacements = {};

    if (req.user?.id) {
      where.push('(user_id IS NULL OR user_id = :userId)');
      replacements.userId = Number(req.user.id);
    } else {
      where.push('user_id IS NULL');
    }

    if (req.query.type) {
      where.push('(type = :type OR type = "both")');
      replacements.type = req.query.type;
    }

    if (req.query.scope === 'default') where.push('is_default = true');
    if (req.query.scope === 'custom') where.push('is_default = false');

    const data = await sequelize.query(
      `SELECT * FROM categories WHERE ${where.join(' AND ')} ORDER BY is_default DESC, name ASC`,
      { replacements, type: QueryTypes.SELECT }
    );

    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    res.json({ data: data.slice(offset, offset + limit), page, limit, total: data.length });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const [id] = await sequelize.query(
      `INSERT INTO categories (user_id, name, icon, color, type, is_default)
       VALUES (:userId, :name, :icon, :color, :type, false)`,
      {
        replacements: {
          userId: Number(req.user.id),
          name: req.body.name,
          icon: req.body.icon || 'category',
          color: req.body.color || '#4D96FF',
          type: req.body.type || 'expense',
        },
        type: QueryTypes.INSERT,
      }
    );

    const category = await sequelize.query('SELECT * FROM categories WHERE id = :id', {
      replacements: { id },
      type: QueryTypes.SELECT,
      plain: true,
    });
    res.status(201).json({ data: category });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const allowed = ['name', 'icon', 'color', 'type'];
    const fields = [];
    const replacements = { id: Number(req.params.id), userId: Number(req.user.id) };

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        fields.push(`${field} = :${field}`);
        replacements[field] = req.body[field];
      }
    });

    if (!fields.length) {
      const category = await sequelize.query(
        'SELECT * FROM categories WHERE id = :id AND user_id = :userId',
        { replacements, type: QueryTypes.SELECT, plain: true }
      );
      if (!category) return res.status(404).json({ message: 'Category not found' });
      return res.json({ data: category });
    }

    await sequelize.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = :id AND user_id = :userId AND is_default = false`,
      { replacements, type: QueryTypes.UPDATE }
    );

    const category = await sequelize.query(
      'SELECT * FROM categories WHERE id = :id AND user_id = :userId',
      {
        replacements: { id: Number(req.params.id), userId: Number(req.user.id) },
        type: QueryTypes.SELECT,
        plain: true,
      }
    );
    if (!category) return res.status(404).json({ message: 'Category not found or cannot edit default category' });
    return res.json({ data: category });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const category = await sequelize.query(
      'SELECT id FROM categories WHERE id = :id AND user_id = :userId AND is_default = false',
      {
        replacements: { id: Number(req.params.id), userId: Number(req.user.id) },
        type: QueryTypes.SELECT,
        plain: true,
      }
    );
    if (!category) return res.status(404).json({ message: 'Category not found or cannot delete default category' });

    await sequelize.query(
      'DELETE FROM categories WHERE id = :id AND user_id = :userId AND is_default = false',
      {
        replacements: { id: Number(req.params.id), userId: Number(req.user.id) },
        type: QueryTypes.DELETE,
      }
    );
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
