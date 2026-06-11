module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'expense_tracker',
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password',
    database: `${process.env.DB_NAME || 'expense_tracker'}_test`,
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
  },
  production: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'your_password',
    database: process.env.DB_NAME || 'expense_tracker',
    host: process.env.DB_HOST || 'mysql',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
  },
};
