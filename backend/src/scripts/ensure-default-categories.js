require('dotenv').config();

const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

const defaultCategories = [
  { name: 'Food', icon: 'food', color: '#FF6B6B', type: 'expense' },
  { name: 'Transport', icon: 'transport', color: '#4D96FF', type: 'expense' },
  { name: 'Shopping', icon: 'shopping', color: '#6C5CE7', type: 'expense' },
  { name: 'Bills', icon: 'bills', color: '#F59E0B', type: 'expense' },
  { name: 'Salary', icon: 'salary', color: '#00B894', type: 'income' },
  { name: 'Health', icon: 'health', color: '#10B981', type: 'expense' },
  { name: 'Entertainment', icon: 'entertainment', color: '#EC4899', type: 'expense' },
  { name: 'Education', icon: 'education', color: '#8B5CF6', type: 'expense' },
  { name: 'Travel', icon: 'travel', color: '#0EA5E9', type: 'expense' },
  { name: 'Subscriptions', icon: 'subscription', color: '#F97316', type: 'expense' },
  { name: 'Gifts', icon: 'gift', color: '#14B8A6', type: 'expense' },
  { name: 'Investments', icon: 'investment', color: '#22C55E', type: 'income' },
  { name: 'Freelance', icon: 'freelance', color: '#6366F1', type: 'income' },
  { name: 'Refunds', icon: 'refund', color: '#A855F7', type: 'income' },
  { name: 'Pet Care', icon: 'pet', color: '#84CC16', type: 'expense' },
];

async function main() {
  await sequelize.authenticate();

  const row = await sequelize.query(
    'SELECT COUNT(*) AS count FROM categories WHERE is_default = true',
    { type: QueryTypes.SELECT, plain: true }
  );

  if (Number(row.count) > 0) {
    console.log('Default categories already exist. Skipping.');
    await sequelize.close();
    return;
  }

  for (const category of defaultCategories) {
    await sequelize.query(
      `INSERT INTO categories (user_id, name, icon, color, type, is_default)
       VALUES (NULL, :name, :icon, :color, :type, true)`,
      { replacements: category, type: QueryTypes.INSERT }
    );
  }

  console.log(`Inserted ${defaultCategories.length} default categories.`);
  await sequelize.close();
}

main().catch(async (error) => {
  console.error(error);
  await sequelize.close();
  process.exit(1);
});
