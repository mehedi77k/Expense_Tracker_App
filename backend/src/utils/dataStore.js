const defaultCategories = [
  { id: 1, user_id: null, name: 'Food', icon: 'food', color: '#FF6B6B', type: 'expense', is_default: true },
  { id: 2, user_id: null, name: 'Transport', icon: 'transport', color: '#4D96FF', type: 'expense', is_default: true },
  { id: 3, user_id: null, name: 'Shopping', icon: 'shopping', color: '#6C5CE7', type: 'expense', is_default: true },
  { id: 4, user_id: null, name: 'Bills', icon: 'bills', color: '#F59E0B', type: 'expense', is_default: true },
  { id: 5, user_id: null, name: 'Salary', icon: 'salary', color: '#00B894', type: 'income', is_default: true },
  { id: 6, user_id: null, name: 'Health', icon: 'health', color: '#10B981', type: 'expense', is_default: true },
  { id: 7, user_id: null, name: 'Entertainment', icon: 'entertainment', color: '#EC4899', type: 'expense', is_default: true },
  { id: 8, user_id: null, name: 'Education', icon: 'education', color: '#8B5CF6', type: 'expense', is_default: true },
  { id: 9, user_id: null, name: 'Travel', icon: 'travel', color: '#0EA5E9', type: 'expense', is_default: true },
  { id: 10, user_id: null, name: 'Subscriptions', icon: 'subscription', color: '#F97316', type: 'expense', is_default: true },
  { id: 11, user_id: null, name: 'Gifts', icon: 'gift', color: '#14B8A6', type: 'expense', is_default: true },
  { id: 12, user_id: null, name: 'Investments', icon: 'investment', color: '#22C55E', type: 'income', is_default: true },
  { id: 13, user_id: null, name: 'Freelance', icon: 'freelance', color: '#6366F1', type: 'income', is_default: true },
  { id: 14, user_id: null, name: 'Refunds', icon: 'refund', color: '#A855F7', type: 'income', is_default: true },
  { id: 15, user_id: null, name: 'Pet Care', icon: 'pet', color: '#84CC16', type: 'expense', is_default: true },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createCollection(initialItems = []) {
  let nextId = initialItems.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
  const items = [...initialItems];

  return {
    all() {
      return clone(items);
    },
    findById(id) {
      return items.find((item) => Number(item.id) === Number(id)) || null;
    },
    create(data) {
      const item = { id: nextId, ...data };
      nextId += 1;
      items.push(item);
      return clone(item);
    },
    update(id, data) {
      const index = items.findIndex((item) => Number(item.id) === Number(id));
      if (index < 0) return null;
      items[index] = { ...items[index], ...data };
      return clone(items[index]);
    },
    delete(id) {
      const index = items.findIndex((item) => Number(item.id) === Number(id));
      if (index < 0) return false;
      items.splice(index, 1);
      return true;
    },
  };
}

module.exports = {
  categories: createCollection(defaultCategories),
  transactions: createCollection([]),
  budgets: createCollection([]),
  savingsGoals: createCollection([]),
  syncQueue: createCollection([]),
};
