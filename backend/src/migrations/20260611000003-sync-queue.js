module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sync_queue', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      entity_type: { type: Sequelize.STRING(50), allowNull: false },
      entity_id: { type: Sequelize.INTEGER, allowNull: true },
      action: { type: Sequelize.STRING(20), allowNull: false },
      payload: { type: Sequelize.JSON, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'synced', 'failed'), allowNull: false, defaultValue: 'pending' },
      retries: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      last_error: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    await queryInterface.addIndex('sync_queue', ['user_id', 'status'], { name: 'idx_sync_user_status' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sync_queue');
  },
};
