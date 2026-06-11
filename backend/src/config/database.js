const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'expense_tracker',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'your_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    pool: {
      min: 5,
      max: 20,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  }
);

module.exports = sequelize;
