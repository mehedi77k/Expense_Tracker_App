const transactionRows = [];

for (let day = 0; day < 90; day += 1) {
  const date = new Date();
  date.setDate(date.getDate() - day);
  const isoDate = date.toISOString().slice(0, 10);

  transactionRows.push({
    user_id: 1,
    category_id: 1,
    type: 'expense',
    amount: (20 + (day % 7) * 3).toFixed(2),
    currency: 'USD',
    note: `Sample expense ${day + 1}`,
    date: isoDate,
    payment_method: 'card',
    attachment_url: null,
    is_recurring: false,
    recurrence_rule: null,
    created_at: date,
    updated_at: date,
  });
}

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('budgets', [
      { user_id: 1, category_id: 1, name: 'Food Budget', amount: 500, period: 'monthly', start_date: '2026-06-01', end_date: null, alert_at: 80, created_at: now },
      { user_id: 2, category_id: 1, name: 'Food Budget', amount: 400, period: 'monthly', start_date: '2026-06-01', end_date: null, alert_at: 80, created_at: now },
      { user_id: 3, category_id: 1, name: 'Food Budget', amount: 300, period: 'monthly', start_date: '2026-06-01', end_date: null, alert_at: 80, created_at: now },
    ]);

    await queryInterface.bulkInsert('savings_goals', [
      { user_id: 1, name: 'Emergency Fund', target_amount: 5000, saved_amount: 1200, target_date: '2027-06-01', icon: 'shield', color: '#00B894', created_at: now },
      { user_id: 2, name: 'Vacation', target_amount: 2000, saved_amount: 450, target_date: '2026-12-31', icon: 'flight', color: '#6C5CE7', created_at: now },
      { user_id: 3, name: 'Laptop', target_amount: 1500, saved_amount: 300, target_date: '2026-10-01', icon: 'laptop', color: '#FF6B6B', created_at: now },
    ]);

    await queryInterface.bulkInsert('transactions', transactionRows);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('transactions', null, {});
    await queryInterface.bulkDelete('savings_goals', null, {});
    await queryInterface.bulkDelete('budgets', null, {});
  },
};
