const { Router } = require('express');
const store = require('../../utils/dataStore');
const { getPagination } = require('../../utils/pagination');

const router = Router();

router.get('/', (req, res) => {
	const data = store.budgets.all().filter((budget) => !req.query.user_id || Number(budget.user_id) === Number(req.query.user_id));
	const decorated = data.map((budget) => {
		const spent = store.transactions.all().filter((transaction) =>
			Number(transaction.user_id) === Number(budget.user_id)
			&& (budget.category_id ? Number(transaction.category_id) === Number(budget.category_id) : true)
			&& transaction.type === 'expense'
		).reduce((sum, transaction) => sum + Number(transaction.amount), 0);
		return { ...budget, spent, remaining: Number(budget.amount) - spent };
	});
	const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
	res.json({ data: decorated.slice(offset, offset + limit), page, limit, total: decorated.length });
});

router.post('/', (req, res) => {
	const budget = store.budgets.create({
		user_id: req.body.user_id || 1,
		category_id: req.body.category_id ?? null,
		name: req.body.name,
		amount: Number(req.body.amount),
		period: req.body.period,
		start_date: req.body.start_date,
		end_date: req.body.end_date ?? null,
		alert_at: Number(req.body.alert_at || 80),
	});
	res.status(201).json({ data: budget });
});

router.patch('/:id', (req, res) => {
	const budget = store.budgets.update(req.params.id, req.body);
	if (!budget) return res.status(404).json({ message: 'Budget not found' });
	return res.json({ data: budget });
});

router.delete('/:id', (req, res) => {
	const deleted = store.budgets.delete(req.params.id);
	if (!deleted) return res.status(404).json({ message: 'Budget not found' });
	return res.status(204).send();
});

router.get('/:id/progress', (req, res) => {
	const budget = store.budgets.findById(req.params.id);
	if (!budget) return res.status(404).json({ message: 'Budget not found' });
	const spent = store.transactions.all().filter((transaction) =>
		Number(transaction.user_id) === Number(budget.user_id)
		&& (budget.category_id ? Number(transaction.category_id) === Number(budget.category_id) : true)
		&& transaction.type === 'expense'
	).reduce((sum, transaction) => sum + Number(transaction.amount), 0);
	return res.json({
		data: {
			budget,
			spent,
			remaining: Number(budget.amount) - spent,
			progress: budget.amount ? Math.min((spent / Number(budget.amount)) * 100, 100) : 0,
		},
	});
});

module.exports = router;
