const { Router } = require('express');
const store = require('../../utils/dataStore');
const { getPagination } = require('../../utils/pagination');

const router = Router();

router.get('/', (req, res) => {
	const data = store.categories.all().filter((category) => {
		if (req.query.type && category.type !== req.query.type && category.type !== 'both') return false;
		if (req.query.scope === 'default') return category.is_default;
		if (req.query.scope === 'custom') return !category.is_default;
		return true;
	});
	const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
	res.json({ data: data.slice(offset, offset + limit), page, limit, total: data.length });
});

router.post('/', (req, res) => {
	const category = store.categories.create({
		user_id: req.body.user_id || 1,
		name: req.body.name,
		icon: req.body.icon,
		color: req.body.color,
		type: req.body.type || 'expense',
		is_default: false,
	});
	res.status(201).json({ data: category });
});

router.patch('/:id', (req, res) => {
	const category = store.categories.update(req.params.id, req.body);
	if (!category) return res.status(404).json({ message: 'Category not found' });
	return res.json({ data: category });
});

router.delete('/:id', (req, res) => {
	const deleted = store.categories.delete(req.params.id);
	if (!deleted) return res.status(404).json({ message: 'Category not found' });
	return res.status(204).send();
});

module.exports = router;
