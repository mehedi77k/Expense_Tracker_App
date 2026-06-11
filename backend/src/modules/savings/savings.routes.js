const { Router } = require('express');
const store = require('../../utils/dataStore');
const { getPagination } = require('../../utils/pagination');

const router = Router();

router.get('/', (req, res) => {
	const data = store.savingsGoals.all().filter((goal) => !req.query.user_id || Number(goal.user_id) === Number(req.query.user_id));
	const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
	res.json({ data: data.slice(offset, offset + limit), page, limit, total: data.length });
});

router.post('/', (req, res) => {
	const goal = store.savingsGoals.create({
		user_id: req.body.user_id || 1,
		name: req.body.name,
		target_amount: Number(req.body.target_amount),
		saved_amount: Number(req.body.saved_amount || 0),
		target_date: req.body.target_date ?? null,
		icon: req.body.icon,
		color: req.body.color,
	});
	res.status(201).json({ data: goal });
});

router.patch('/:id', (req, res) => {
	const goal = store.savingsGoals.update(req.params.id, req.body);
	if (!goal) return res.status(404).json({ message: 'Goal not found' });
	return res.json({ data: goal });
});

router.delete('/:id', (req, res) => {
	const deleted = store.savingsGoals.delete(req.params.id);
	if (!deleted) return res.status(404).json({ message: 'Goal not found' });
	return res.status(204).send();
});

router.post('/:id/deposit', (req, res) => {
	const goal = store.savingsGoals.findById(req.params.id);
	if (!goal) return res.status(404).json({ message: 'Goal not found' });
	const updated = store.savingsGoals.update(req.params.id, {
		saved_amount: Number(goal.saved_amount) + Number(req.body.amount || 0),
	});
	return res.json({ data: updated });
});

module.exports = router;
