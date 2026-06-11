module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      { name: 'Admin User', email: 'admin@example.com', password_hash: 'bcrypt-placeholder', avatar_url: null, currency: 'USD', timezone: 'UTC', is_verified: true, created_at: now, updated_at: now },
      { name: 'Regular User', email: 'user@example.com', password_hash: 'bcrypt-placeholder', avatar_url: null, currency: 'USD', timezone: 'UTC', is_verified: true, created_at: now, updated_at: now },
      { name: 'New User', email: 'new@example.com', password_hash: 'bcrypt-placeholder', avatar_url: null, currency: 'USD', timezone: 'UTC', is_verified: false, created_at: now, updated_at: now },
    ]);

    await queryInterface.bulkInsert('categories', [
      { user_id: null, name: 'Food', icon: 'food', color: '#FF6B6B', type: 'expense', is_default: true, created_at: now },
      { user_id: null, name: 'Transport', icon: 'transport', color: '#4D96FF', type: 'expense', is_default: true, created_at: now },
      { user_id: null, name: 'Shopping', icon: 'shopping', color: '#6C5CE7', type: 'expense', is_default: true, created_at: now },
      { user_id: null, name: 'Bills', icon: 'bills', color: '#F59E0B', type: 'expense', is_default: true, created_at: now },
      { user_id: null, name: 'Salary', icon: 'salary', color: '#00B894', type: 'income', is_default: true, created_at: now },
      { user_id: null, name: 'Health', icon: 'health', color: '#10B981', type: 'expense', is_default: true, created_at: now },
      { user_id: null, name: 'Entertainment', icon: 'entertainment', color: '#EC4899', type: 'expense', is_default: true, created_at: now },
      { user_id: null, name: 'Education', icon: 'education', color: '#8B5CF6', type: 'expense', is_default: true, created_at: now },
      { user_id: null, name: 'Travel', icon: 'travel', color: '#0EA5E9', type: 'expense', is_default: true, created_at: now },
      { user_id: null, name: 'Subscriptions', icon: 'subscription', color: '#F97316', type: 'expense', is_default: true, created_at: now },
      { user_id: null, name: 'Gifts', icon: 'gift', color: '#14B8A6', type: 'expense', is_default: true, created_at: now },
      { user_id: null, name: 'Investments', icon: 'investment', color: '#22C55E', type: 'income', is_default: true, created_at: now },
      { user_id: null, name: 'Freelance', icon: 'freelance', color: '#6366F1', type: 'income', is_default: true, created_at: now },
      { user_id: null, name: 'Refunds', icon: 'refund', color: '#A855F7', type: 'income', is_default: true, created_at: now },
      { user_id: null, name: 'Pet Care', icon: 'pet', color: '#84CC16', type: 'expense', is_default: true, created_at: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
