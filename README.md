# Expense Tracker

Monorepo scaffold for a production-grade expense tracker with a Node.js REST API, MySQL, and a Flutter app.

## Structure

- `backend/` - Express API, Sequelize models, migrations, seeders, tests
- `mobile/` - Flutter app scaffold with Clean Architecture folders
- `docker-compose.yml` - MySQL, API, and Adminer

## Current scope

This workspace now has the project foundation in place:

- backend runtime and API bootstrap
- initial database schema migration
- mobile app shell and routing entry
- Docker compose for local development

The next implementation phase is feature work: auth flows, transaction CRUD, budgets, analytics, and offline sync.
