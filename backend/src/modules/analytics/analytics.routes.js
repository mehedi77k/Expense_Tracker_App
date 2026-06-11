const { Router } = require('express');
const store = require('../../utils/dataStore');

const router = Router();

router.get('/overview', (_req, res) => {
	const items = store.transactions.all();
	const income = items.filter((item) => item.type === 'income').reduce((sum, item) => sum + Number(item.amount), 0);
	const expense = items.filter((item) => item.type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);
	res.json({ data: { income, expense, balance: income - expense } });
});

router.get('/by-category', (_req, res) => {
	const categories = store.categories.all();
	const totals = store.transactions.all().reduce((acc, transaction) => {
		if (transaction.type !== 'expense') return acc;
		acc[transaction.category_id] = (acc[transaction.category_id] || 0) + Number(transaction.amount);
		return acc;
	}, {});
	res.json({ data: categories.map((category) => ({ ...category, total: totals[category.id] || 0 })) });
});

router.get('/trend', (req, res) => {
	const period = req.query.period || 'day';
	const grouped = store.transactions.all().reduce((acc, transaction) => {
		const date = new Date(transaction.date);
		const key = period === 'year'
			? `${date.getFullYear()}`
			: period === 'month'
				? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
				: transaction.date;
		acc[key] = acc[key] || { income: 0, expense: 0 };
		acc[key][transaction.type] += Number(transaction.amount);
		return acc;
	}, {});
	res.json({ data: grouped });
});

router.get('/top-spending', (_req, res) => {
	const categories = store.categories.all();
	const totals = store.transactions.all().reduce((acc, transaction) => {
		if (transaction.type !== 'expense') return acc;
		acc[transaction.category_id] = (acc[transaction.category_id] || 0) + Number(transaction.amount);
		return acc;
	}, {});
	const rows = Object.entries(totals).map(([categoryId, total]) => ({
		category: categories.find((item) => Number(item.id) === Number(categoryId))?.name || 'Unknown',
		total,
	})).sort((a, b) => b.total - a.total).slice(0, 5);
	res.json({ data: rows });
});

router.get('/monthly-comparison', (_req, res) => {
	const items = store.transactions.all();
	const now = new Date();
	const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
	const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	const previousMonth = `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, '0')}`;
	const summary = (monthKey) => items.filter((item) => item.date.startsWith(monthKey)).reduce((acc, item) => {
		acc[item.type] += Number(item.amount);
		return acc;
	}, { income: 0, expense: 0 });
	res.json({ data: { current: summary(currentMonth), previous: summary(previousMonth) } });
});

module.exports = router;
