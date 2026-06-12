const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/database');

function parseAmount(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function getCategoryId(userId, type, categoryId) {
  if (categoryId) return Number(categoryId);

  const category = await sequelize.query(
    `SELECT id
       FROM categories
      WHERE (user_id = :userId OR user_id IS NULL)
        AND (type = :type OR type = 'both')
      ORDER BY is_default DESC, id ASC
      LIMIT 1`,
    {
      replacements: { userId, type },
      type: QueryTypes.SELECT,
      plain: true,
    }
  );

  if (!category) {
    const error = new Error('No category found. Create a category first.');
    error.status = 400;
    throw error;
  }

  return category.id;
}

function buildTransactionWhere(userId, filters = {}) {
  const where = ['t.user_id = :userId'];
  const replacements = { userId };

  if (filters.type) {
    where.push('t.type = :type');
    replacements.type = filters.type;
  }

  if (filters.category_id) {
    where.push('t.category_id = :categoryId');
    replacements.categoryId = Number(filters.category_id);
  }

  if (filters.start_date) {
    where.push('t.date >= :startDate');
    replacements.startDate = filters.start_date;
  }

  if (filters.end_date) {
    where.push('t.date <= :endDate');
    replacements.endDate = filters.end_date;
  }

  if (filters.search) {
    where.push('(LOWER(t.note) LIKE :search OR LOWER(c.name) LIKE :search)');
    replacements.search = `%${String(filters.search).toLowerCase()}%`;
  }

  return { where: where.join(' AND '), replacements };
}

async function listTransactions(userId, filters = {}) {
  const { where, replacements } = buildTransactionWhere(userId, filters);
  return sequelize.query(
    `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
      WHERE ${where}
      ORDER BY t.date DESC, t.id DESC`,
    {
      replacements,
      type: QueryTypes.SELECT,
    }
  );
}

async function getTransaction(userId, id) {
  return sequelize.query(
    `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = :userId AND t.id = :id
      LIMIT 1`,
    {
      replacements: { userId, id: Number(id) },
      type: QueryTypes.SELECT,
      plain: true,
    }
  );
}

async function queueOfflineOperation(operation) {
  await sequelize.query(
    `INSERT INTO sync_queue (user_id, entity_type, entity_id, action, payload, status, retries)
     VALUES (:userId, :entityType, :entityId, :action, :payload, 'pending', 0)`,
    {
      replacements: {
        userId: operation.user_id,
        entityType: operation.entity_type,
        entityId: operation.entity_id,
        action: operation.action,
        payload: JSON.stringify(operation.payload),
      },
      type: QueryTypes.INSERT,
    }
  );
}

async function createTransaction(userId, payload) {
  const type = payload.type === 'income' ? 'income' : 'expense';
  const categoryId = await getCategoryId(userId, type, payload.category_id);
  const amount = parseAmount(payload.amount);

  if (amount <= 0) {
    const error = new Error('Amount must be greater than 0');
    error.status = 400;
    throw error;
  }

  const [id] = await sequelize.query(
    `INSERT INTO transactions
       (user_id, category_id, type, amount, currency, note, date, payment_method,
        attachment_url, is_recurring, recurrence_rule)
     VALUES
       (:userId, :categoryId, :type, :amount, :currency, :note, :date, :paymentMethod,
        :attachmentUrl, :isRecurring, :recurrenceRule)`,
    {
      replacements: {
        userId,
        categoryId,
        type,
        amount,
        currency: payload.currency || 'USD',
        note: payload.note || null,
        date: payload.date || todayIso(),
        paymentMethod: payload.payment_method || 'cash',
        attachmentUrl: payload.attachment_url || null,
        isRecurring: Boolean(payload.is_recurring),
        recurrenceRule: payload.recurrence_rule || null,
      },
      type: QueryTypes.INSERT,
    }
  );

  const transaction = await getTransaction(userId, id);
  await queueOfflineOperation({
    user_id: userId,
    entity_type: 'transaction',
    entity_id: id,
    action: 'create',
    payload: transaction,
  });
  return transaction;
}

async function updateTransaction(userId, id, payload) {
  const existing = await getTransaction(userId, id);
  if (!existing) return null;

  const allowed = [
    'category_id',
    'type',
    'amount',
    'currency',
    'note',
    'date',
    'payment_method',
    'attachment_url',
    'is_recurring',
    'recurrence_rule',
  ];
  const fields = [];
  const replacements = { userId, id: Number(id) };

  allowed.forEach((field) => {
    if (payload[field] !== undefined) {
      fields.push(`${field} = :${field}`);
      replacements[field] = field === 'amount' ? parseAmount(payload[field]) : payload[field];
    }
  });

  if (!fields.length) return existing;

  await sequelize.query(
    `UPDATE transactions
        SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = :id AND user_id = :userId`,
    { replacements, type: QueryTypes.UPDATE }
  );

  const transaction = await getTransaction(userId, id);
  await queueOfflineOperation({
    user_id: userId,
    entity_type: 'transaction',
    entity_id: Number(id),
    action: 'update',
    payload: transaction,
  });
  return transaction;
}

async function deleteTransaction(userId, id) {
  const existing = await getTransaction(userId, id);
  if (!existing) return false;

  await sequelize.query('DELETE FROM transactions WHERE id = :id AND user_id = :userId', {
    replacements: { id: Number(id), userId },
    type: QueryTypes.DELETE,
  });

  await queueOfflineOperation({
    user_id: userId,
    entity_type: 'transaction',
    entity_id: Number(id),
    action: 'delete',
    payload: existing,
  });
  return true;
}

async function transactionSummary(userId, filters = {}) {
  const { where, replacements } = buildTransactionWhere(userId, filters);
  const row = await sequelize.query(
    `SELECT
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expense
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
      WHERE ${where}`,
    {
      replacements,
      type: QueryTypes.SELECT,
      plain: true,
    }
  );

  const income = parseAmount(row.income);
  const expense = parseAmount(row.expense);
  return { income, expense, balance: income - expense };
}

module.exports = {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  transactionSummary,
};
