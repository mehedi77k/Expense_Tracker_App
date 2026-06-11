const store = require('../../utils/dataStore');

function normalizeTransaction(payload) {
  return {
    user_id: Number(payload.user_id || 1),
    category_id: Number(payload.category_id),
    type: payload.type,
    amount: Number(payload.amount),
    currency: payload.currency || 'USD',
    note: payload.note || null,
    date: payload.date,
    payment_method: payload.payment_method || 'cash',
    attachment_url: payload.attachment_url || null,
    is_recurring: Boolean(payload.is_recurring),
    recurrence_rule: payload.recurrence_rule || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function queueOfflineOperation(operation) {
  return store.syncQueue.create({
    ...operation,
    status: 'pending',
    retries: 0,
    createdAt: new Date().toISOString(),
  });
}

function listTransactions(filters = {}) {
  return store.transactions.all().filter((transaction) => {
    if (filters.type && transaction.type !== filters.type) return false;
    if (filters.category_id && Number(transaction.category_id) !== Number(filters.category_id)) return false;
    if (filters.user_id && Number(transaction.user_id) !== Number(filters.user_id)) return false;
    if (filters.start_date && transaction.date < filters.start_date) return false;
    if (filters.end_date && transaction.date > filters.end_date) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const note = (transaction.note || '').toLowerCase();
      const category = (filters.categoryNameById?.[transaction.category_id] || '').toLowerCase();
      if (!note.includes(search) && !category.includes(search)) return false;
    }
    return true;
  });
}

function createTransaction(payload) {
  const transaction = store.transactions.create(normalizeTransaction(payload));
  queueOfflineOperation({ entity_type: 'transaction', entity_id: transaction.id, action: 'create', payload: transaction });
  return transaction;
}

function updateTransaction(id, payload) {
  return store.transactions.update(id, {
    ...payload,
    updated_at: new Date().toISOString(),
  });
}

function deleteTransaction(id) {
  return store.transactions.delete(id);
}

function transactionSummary(filters = {}) {
  const filtered = listTransactions(filters);
  const income = filtered.filter((item) => item.type === 'income').reduce((total, item) => total + Number(item.amount), 0);
  const expense = filtered.filter((item) => item.type === 'expense').reduce((total, item) => total + Number(item.amount), 0);
  return { income, expense, balance: income - expense };
}

module.exports = {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  transactionSummary,
};
