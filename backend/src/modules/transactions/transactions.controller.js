const { getPagination } = require('../../utils/pagination');
const {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  transactionSummary,
} = require('./transactions.service');

function list(req, res, next) {
  const userId = Number(req.user.id);
  listTransactions(userId, req.query)
    .then((items) => {
      const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
      res.json({ data: items.slice(offset, offset + limit), page, limit, total: items.length });
    })
    .catch(next);
}

function create(req, res, next) {
  createTransaction(Number(req.user.id), req.body)
    .then((item) => res.status(201).json({ data: item }))
    .catch(next);
}

function getOne(req, res, next) {
  getTransaction(Number(req.user.id), req.params.id)
    .then((item) => {
      if (!item) return res.status(404).json({ message: 'Transaction not found' });
      return res.json({ data: item });
    })
    .catch(next);
}

function update(req, res, next) {
  updateTransaction(Number(req.user.id), req.params.id, req.body)
    .then((item) => {
      if (!item) return res.status(404).json({ message: 'Transaction not found' });
      return res.json({ data: item });
    })
    .catch(next);
}

function remove(req, res, next) {
  deleteTransaction(Number(req.user.id), req.params.id)
    .then((deleted) => {
      if (!deleted) return res.status(404).json({ message: 'Transaction not found' });
      return res.status(204).send();
    })
    .catch(next);
}

function summary(req, res, next) {
  transactionSummary(Number(req.user.id), req.query)
    .then((data) => res.json({ data }))
    .catch(next);
}

function exportTransactions(req, res, next) {
  listTransactions(Number(req.user.id), req.query)
    .then((rows) => {
      const csv = ['id,type,amount,currency,date,note'];
      rows.forEach((row) => {
        csv.push([row.id, row.type, row.amount, row.currency, row.date, JSON.stringify(row.note || '')].join(','));
      });
      res.type('text/csv').send(csv.join('\n'));
    })
    .catch(next);
}

module.exports = { list, create, getOne, update, remove, summary, exportTransactions };
