module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      avatar_url: { type: Sequelize.STRING(500), allowNull: true },
      currency: { type: Sequelize.CHAR(3), allowNull: false, defaultValue: 'USD' },
      timezone: { type: Sequelize.STRING(50), allowNull: false, defaultValue: 'UTC' },
      is_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('refresh_tokens', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      token_hash: { type: Sequelize.STRING(255), allowNull: false },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('categories', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      name: { type: Sequelize.STRING(80), allowNull: false },
      icon: { type: Sequelize.STRING(50), allowNull: false },
      color: { type: Sequelize.CHAR(7), allowNull: false },
      type: { type: Sequelize.ENUM('expense', 'income', 'both'), allowNull: false, defaultValue: 'expense' },
      is_default: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('transactions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      type: { type: Sequelize.ENUM('expense', 'income'), allowNull: false },
      amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      currency: { type: Sequelize.CHAR(3), allowNull: false },
      note: { type: Sequelize.TEXT, allowNull: true },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      payment_method: {
        type: Sequelize.ENUM('cash', 'card', 'bank_transfer', 'mobile_payment', 'other'),
        allowNull: false,
        defaultValue: 'cash',
      },
      attachment_url: { type: Sequelize.STRING(500), allowNull: true },
      is_recurring: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      recurrence_rule: { type: Sequelize.STRING(100), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('transactions', ['user_id', 'date'], { name: 'idx_user_date' });
    await queryInterface.addIndex('transactions', ['user_id', 'category_id'], { name: 'idx_user_category' });
    await queryInterface.addIndex('transactions', ['user_id', 'type'], { name: 'idx_user_type' });

    await queryInterface.createTable('budgets', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      period: { type: Sequelize.ENUM('weekly', 'monthly', 'yearly'), allowNull: false },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: true },
      alert_at: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 80 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    await queryInterface.createTable('savings_goals', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      name: { type: Sequelize.STRING(100), allowNull: false },
      target_amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      saved_amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0.0 },
      target_date: { type: Sequelize.DATEONLY, allowNull: true },
      icon: { type: Sequelize.STRING(50), allowNull: false },
      color: { type: Sequelize.CHAR(7), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('savings_goals');
    await queryInterface.dropTable('budgets');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('users');
  },
};
