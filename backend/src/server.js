require('dotenv').config();

const sequelize = require('./config/database');
const { createApp } = require('./app');

const port = Number(process.env.PORT || 3000);
const app = createApp();

async function start() {
  try {
    await sequelize.authenticate();
    app.listen(port, () => {
      console.log(`Expense Tracker API listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start API:', error.message);
    process.exit(1);
  }
}

start();
