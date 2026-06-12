# Expense Tracker Deployment Guide

This project contains:

- `backend/` — Node.js + Express API
- `mobile/` — Flutter app
- `docker-compose.yml` — local MySQL + API + Adminer setup

The backend has been patched to use MySQL persistence instead of the original in-memory store.

## 1. Local backend test with Docker

```bash
cd Expense_Tracker_Deployment_Ready
cp backend/.env.example backend/.env
```

Edit `backend/.env` if needed:

```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=expense_tracker
DB_USER=root
DB_PASSWORD=your_password
DB_SSL=false
DB_SSL_REJECT_UNAUTHORIZED=true
JWT_ACCESS_SECRET=replace_with_at_least_32_random_characters
JWT_REFRESH_SECRET=replace_with_another_32_random_characters
FRONTEND_URL=http://localhost:5173
```

Run:

```bash
docker compose up --build
```

API health check:

```bash
curl http://localhost:3000/health
```

Register user:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123"}'
```

## 2. Hosted MySQL on Aiven

Create Aiven MySQL Free service. Copy these fields from Aiven:

- Host
- Port
- Database
- User
- Password

Use these in Render environment variables:

```env
DB_HOST=your-aiven-host
DB_PORT=your-aiven-port
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=your-aiven-password
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

## 3. Deploy backend on Render

Render settings:

- New > Web Service
- Repository: `Expense_Tracker_App`
- Root Directory: `backend`
- Runtime: Node
- Build Command: `npm ci`
- Start Command: `npm run db:prepare && npm start`
- Health Check Path: `/health`

Environment variables:

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-aiven-host
DB_PORT=your-aiven-port
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=your-aiven-password
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
JWT_ACCESS_SECRET=generate-a-long-random-secret
JWT_REFRESH_SECRET=generate-another-long-random-secret
FRONTEND_URL=https://your-netlify-site.netlify.app
```

After deploy, test:

```bash
curl https://your-render-app.onrender.com/health
```

Register:

```bash
curl -X POST https://your-render-app.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123"}'
```

## 4. Build Flutter web locally

The uploaded project does not include platform folders. Generate them once:

```bash
cd mobile
flutter create .
flutter pub get
```

Build web using your Render API URL:

```bash
flutter build web --release --dart-define=API_BASE_URL=https://your-render-app.onrender.com/api/v1
```

The deployable static folder is:

```text
mobile/build/web
```

## 5. Deploy Flutter web on Netlify

Simplest method:

1. Go to Netlify dashboard.
2. Add new site.
3. Use Drag and Drop deployment.
4. Drag the `mobile/build/web` folder.
5. Copy the generated Netlify URL.
6. Update Render `FRONTEND_URL` with the Netlify URL.
7. Redeploy backend.

## 6. Build Android APK

```bash
cd mobile
flutter build apk --release --dart-define=API_BASE_URL=https://your-render-app.onrender.com/api/v1
```

APK output:

```text
mobile/build/app/outputs/flutter-apk/app-release.apk
```

## 7. Important limitation

Render Free web services spin down after inactivity. The first request after idle may take around a minute to wake up. For a project demo this is acceptable; for production use, upgrade the backend hosting plan.
