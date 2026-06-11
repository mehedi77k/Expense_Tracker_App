const { getPagination } = require('../../utils/pagination');
const store = require('../../utils/dataStore');
const {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  transactionSummary,
} = require('./transactions.service');

function buildCategoryNameMap() {
  return store.categories.all().reduce((acc, category) => {
    acc[category.id] = category.name;
    return acc;
  }, {});
}

function list(req, res) {
  const filters = { ...req.query, categoryNameById: buildCategoryNameMap() };
  const items = listTransactions(filters);
  const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
  res.json({ data: items.slice(offset, offset + limit), page, limit, total: items.length });
}

function create(req, res) {
  const item = createTransaction({ ...req.body, user_id: req.user?.id || 1 });
  res.status(201).json({ data: item });
}

function getOne(req, res) {
  const item = store.transactions.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Transaction not found' });
  return res.json({ data: item });
}

function update(req, res) {
  const item = updateTransaction(req.params.id, req.body);
  if (!item) return res.status(404).json({ message: 'Transaction not found' });
  return res.json({ data: item });
}

function remove(req, res) {
  const deleted = deleteTransaction(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Transaction not found' });
  return res.status(204).send();
}

function summary(req, res) {
  res.json({ data: transactionSummary(req.query) });
}

function exportTransactions(req, res) {
  const rows = listTransactions(req.query);
  const csv = ['id,type,amount,currency,date,note'];
  rows.forEach((row) => {
    csv.push([row.id, row.type, row.amount, row.currency, row.date, JSON.stringify(row.note || '')].join(','));
  });
  res.type('text/csv').send(csv.join('\n'));
}

module.exports = { list, create, getOne, update, remove, summary, exportTransactions };
