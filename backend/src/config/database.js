const { Sequelize } = require('sequelize');

function readBool(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

const useSsl = readBool(process.env.DB_SSL, false);
const rejectUnauthorized = readBool(process.env.DB_SSL_REJECT_UNAUTHORIZED, true);

const sequelize = new Sequelize(
  process.env.DB_NAME || 'expense_tracker',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'your_password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized,
          },
        }
      : {},
    pool: {
      min: 0,
      max: Number(process.env.DB_POOL_MAX || 10),
      acquire: 30000,
      idle: 10000,
    },
    logging: readBool(process.env.DB_LOGGING, false) ? console.log : false,
  }
);

module.exports = sequelize;
