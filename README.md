# Drop-It — Micro Task Platform

> A decentralized micro task marketplace where workers complete small tasks and earn **USDC stablecoin** paid on the **Hedera** network.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [Hedera & USDC Integration](#hedera--usdc-integration)
- [Database Schema](#database-schema)
- [Scripts Reference](#scripts-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Drop-It** connects task **requesters** who need small units of work done (data labelling, surveys, content moderation, writing, etc.) with **workers** who complete them and get paid instantly in USDC on Hedera.

### Core Flow

1. **Requester** creates a task with a USDC reward amount.
2. **Workers** browse open tasks, pick one, and submit completed work.
3. **Requester** reviews submissions — approves or rejects.
4. On **approval**, USDC payment is transferred on the Hedera network from the requester's account to the worker's account.

---

## Architecture

```
┌─────────────┐        ┌─────────────────┐        ┌──────────────┐
│   React UI  │──API──▶│  Express API    │──SQL──▶│  PostgreSQL  │
│  (Vite/TS)  │        │  (TypeScript)   │        │              │
└─────────────┘        └────────┬────────┘        └──────────────┘
                                │
                                │ Hedera SDK
                                ▼
                       ┌─────────────────┐
                       │  Hedera Network │
                       │  (USDC Token)   │
                       └─────────────────┘
```

---

## Tech Stack

| Layer      | Technology                                              |
| ---------- | ------------------------------------------------------- |
| Frontend   | React 18, TypeScript, Vite, React Router v6             |
| Backend    | Node.js, Express, TypeScript                            |
| Database   | PostgreSQL, Sequelize ORM                               |
| Payments   | Hedera Hashgraph (`@hashgraph/sdk`), USDC stablecoin    |
| Auth       | JWT (jsonwebtoken), bcrypt                               |
| Validation | Zod                                                     |
| Security   | Helmet, CORS, express-rate-limit                        |
| Monorepo   | Single repo, independently deployed apps               |

---

## Project Structure

```
drop-it/
├── package.json              # Root — convenience scripts
├── .gitignore
├── .nvmrc                    # Node version
├── README.md
│
├── apps/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .sequelizerc       # Sequelize CLI paths
│   │   ├── .env.example       # Environment template
│   │   └── src/
│   │       ├── server.ts      # Entry point — starts Express + DB
│   │       ├── app.ts         # Express app (middleware, routes)
│   │       │
│   │       ├── config/
│   │       │   ├── env.ts          # Typed env config (dotenv)
│   │       │   ├── database.ts     # Sequelize instance
│   │       │   └── database.js     # Sequelize CLI config
│   │       │
│   │       ├── models/
│   │       │   ├── index.ts        # Associations & re-exports
│   │       │   ├── User.ts
│   │       │   ├── Task.ts
│   │       │   ├── Submission.ts
│   │       │   └── Payment.ts
│   │       │
│   │       ├── routes/
│   │       │   ├── index.ts        # Route aggregator
│   │       │   ├── auth.routes.ts  # POST /register, /login
│   │       │   ├── task.routes.ts  # CRUD tasks & submissions
│   │       │   └── payment.routes.ts
│   │       │
│   │       ├── middleware/
│   │       │   ├── auth.middleware.ts      # JWT verify + role guard
│   │       │   ├── error.middleware.ts     # Global error handler
│   │       │   └── validate.middleware.ts  # Zod request validation
│   │       │
│   │       ├── services/
│   │       │   ├── auth.service.ts    # Register, login, token
│   │       │   ├── task.service.ts    # Task CRUD + submission flow
│   │       │   └── hedera.service.ts  # USDC transfers on Hedera
│   │       │
│   │       ├── utils/
│   │       │   ├── logger.ts    # Winston logger
│   │       │   └── errors.ts    # Custom error classes
│   │       │
│   │       └── database/
│   │           └── migrations/
│   │               └── 20240101000001-create-initial-tables.js
│   │
│   └── frontend/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── vite-env.d.ts
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── index.css
│           ├── lib/
│           │   └── api.ts          # Axios instance + interceptors
│           ├── context/
│           │   └── AuthContext.tsx  # Auth state (JWT, user)
│           ├── components/
│           │   └── Layout.tsx      # Nav + Outlet wrapper
│           └── pages/
│               ├── Home.tsx
│               ├── Login.tsx
│               ├── Register.tsx
│               ├── Tasks.tsx
│               ├── TaskDetail.tsx
│               ├── CreateTask.tsx
│               └── Dashboard.tsx
```

---

## Getting Started

### Prerequisites

| Tool       | Version |
| ---------- | ------- |
| Node.js    | ≥ 18    |
| npm        | ≥ 9     |
| PostgreSQL | ≥ 14    |

Optional: a **Hedera testnet account** for live USDC transfers. Create one free at [portal.hedera.com](https://portal.hedera.com/).

### Installation

```bash
# Clone the repo
git clone <your-repo-url> drop-it
cd drop-it

# Install all dependencies (backend + frontend)
npm run install:all

# Or install each app individually
cd apps/backend && npm install
cd ../frontend && npm install
```

Each app has its own `node_modules` and `package-lock.json` — there are no hoisted workspaces.

### Environment Variables

```bash
# Copy the template
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env` with your values:

| Variable               | Description                            |
| ---------------------- | -------------------------------------- |
| `PORT`                 | Backend port (default `5000`)          |
| `NODE_ENV`             | `development` / `production`           |
| `DB_HOST`              | PostgreSQL host                        |
| `DB_PORT`              | PostgreSQL port (default `5432`)       |
| `DB_NAME`              | Database name                          |
| `DB_USER`              | Database user                          |
| `DB_PASSWORD`          | Database password                      |
| `JWT_SECRET`           | Secret for signing JWTs — **change this** |
| `JWT_EXPIRES_IN`       | Token lifetime (e.g. `7d`)             |
| `HEDERA_NETWORK`       | `testnet` or `mainnet`                 |
| `HEDERA_OPERATOR_ID`   | Your Hedera account ID (e.g. `0.0.12345`) |
| `HEDERA_OPERATOR_KEY`  | Your Hedera private key (DER-encoded)  |
| `HEDERA_USDC_TOKEN_ID` | USDC token ID on Hedera                |
| `FRONTEND_URL`         | Frontend origin for CORS               |

### Database Setup

```bash
# Create the PostgreSQL database
createdb dropit_dev

# Run Sequelize migrations
npm run db:migrate
```

In development, the server also auto-syncs models on startup (`sequelize.sync({ alter: true })`).

### Running the App

```bash
# Start backend (from project root)
npm run dev:backend   # Express API on http://localhost:5000

# Start frontend (in a separate terminal)
npm run dev:frontend  # React UI on http://localhost:5173

# Or run directly inside each app folder
cd apps/backend && npm run dev
cd apps/frontend && npm run dev
```

The frontend proxies `/api` requests to the backend automatically (configured in `vite.config.ts`).

---

## API Reference

All endpoints are prefixed with `/api`.

### Health Check

```
GET /api/health
→ { "status": "ok", "timestamp": "..." }
```

### Authentication

```
POST /api/auth/register
Body: { "email", "username", "password", "role"?: "worker" | "requester" }
→ 201 { "status": "success", "data": { "user", "token" } }

POST /api/auth/login
Body: { "email", "password" }
→ 200 { "status": "success", "data": { "user", "token" } }
```

### Tasks

```
GET    /api/tasks?status=open&category=...&page=1&limit=20
GET    /api/tasks/:taskId
POST   /api/tasks                          ← requester only
Body: { "title", "description", "category", "rewardAmount", "maxSubmissions"?, "deadline"? }

POST   /api/tasks/:taskId/submissions      ← worker only
Body: { "content" }

POST   /api/tasks/submissions/:id/approve  ← requester only (triggers USDC payment)
POST   /api/tasks/submissions/:id/reject   ← requester only
Body: { "feedback" }
```

### Payments

```
GET /api/payments/history   ← authenticated (your sent + received payments)
GET /api/payments/balance   ← authenticated (USDC balance from Hedera)
```

> All authenticated endpoints require header: `Authorization: Bearer <token>`

---

## Hedera & USDC Integration

### How It Works

1. Users optionally link a Hedera account ID to their profile.
2. When a requester **approves** a submission, the backend:
   - Creates a `Payment` record (status: `pending`).
   - Calls `HederaService.processTaskPayment()`.
   - Builds a `TransferTransaction` transferring USDC tokens on Hedera.
   - Signs with the operator key, submits, and waits for a receipt.
   - Updates the payment record with `completed` status and the Hedera transaction ID.
3. If either party hasn't linked a Hedera account, payment is recorded off-chain for later settlement.

### USDC on Hedera

- USDC is a **Hedera Token Service (HTS)** token with **6 decimal places**.
- On **testnet**, you can use the USDC test token. Check [Hedera docs](https://docs.hedera.com/) for the current token ID.
- On **mainnet**, the USDC token ID is `0.0.456858`.

### Getting Testnet Credentials

1. Go to [portal.hedera.com](https://portal.hedera.com/) and create an account.
2. Copy your **Account ID** and **DER-encoded private key**.
3. Add them to your `.env` file.

---

## Database Schema

### `users`

| Column              | Type          | Notes                        |
| ------------------- | ------------- | ---------------------------- |
| `id`                | UUID (PK)     | Auto-generated               |
| `email`             | VARCHAR       | Unique                       |
| `password`          | VARCHAR       | bcrypt hashed (12 rounds)    |
| `username`          | VARCHAR(50)   | Unique                       |
| `role`              | ENUM          | `worker`, `requester`, `admin` |
| `hedera_account_id` | VARCHAR       | Nullable                     |
| `balance`           | DECIMAL(18,6) | Off-chain balance            |
| `is_active`         | BOOLEAN       | Default `true`               |

### `tasks`

| Column                | Type          | Notes                            |
| --------------------- | ------------- | -------------------------------- |
| `id`                  | UUID (PK)     |                                  |
| `title`               | VARCHAR(200)  |                                  |
| `description`         | TEXT          |                                  |
| `category`            | VARCHAR(50)   | Indexed                         |
| `reward_amount`       | DECIMAL(18,6) | USDC amount                     |
| `max_submissions`     | INTEGER       | Default 1                       |
| `current_submissions` | INTEGER       | Default 0                       |
| `status`              | ENUM          | `open`, `in_progress`, `under_review`, `completed`, `cancelled` |
| `deadline`            | TIMESTAMP     | Nullable                        |
| `requester_id`        | UUID (FK)     | → `users.id`                    |

### `submissions`

| Column      | Type      | Notes                                   |
| ----------- | --------- | --------------------------------------- |
| `id`        | UUID (PK) |                                         |
| `task_id`   | UUID (FK) | → `tasks.id`                            |
| `worker_id` | UUID (FK) | → `users.id`, unique with `task_id`     |
| `content`   | TEXT      | The completed work                      |
| `status`    | ENUM      | `pending`, `approved`, `rejected`       |
| `feedback`  | TEXT      | Nullable — requester feedback on reject |

### `payments`

| Column                  | Type          | Notes                                |
| ----------------------- | ------------- | ------------------------------------ |
| `id`                    | UUID (PK)     |                                      |
| `task_id`               | UUID (FK)     | → `tasks.id`                         |
| `from_user_id`          | UUID (FK)     | → `users.id` (requester)             |
| `to_user_id`            | UUID (FK)     | → `users.id` (worker)                |
| `amount`                | DECIMAL(18,6) | USDC amount                          |
| `currency`              | VARCHAR(10)   | Default `USDC`                       |
| `hedera_transaction_id` | VARCHAR       | Hedera tx hash (null until settled)  |
| `status`                | ENUM          | `pending`, `processing`, `completed`, `failed` |

---

## Scripts Reference

### Root-level convenience scripts

| Command                   | Description                                |
| ------------------------- | ------------------------------------------ |
| `npm run install:all`     | Install deps in both backend and frontend  |
| `npm run dev:backend`     | Start Express API with hot reload          |
| `npm run dev:frontend`    | Start Vite React dev server                |
| `npm run build:backend`   | Build backend for production               |
| `npm run build:frontend`  | Build frontend for production              |
| `npm run lint:backend`    | Lint backend code                          |
| `npm run lint:frontend`   | Lint frontend code                         |
| `npm run test:backend`    | Run backend tests                          |
| `npm run db:migrate`      | Run Sequelize migrations                   |
| `npm run db:migrate:undo` | Revert last migration                      |
| `npm run db:seed`         | Run database seeders                       |

### Backend scripts (`apps/backend/`)

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `npm run dev`      | Start with hot reload             |
| `npm run build`    | Compile TypeScript to `dist/`     |
| `npm start`        | Run compiled `dist/server.js`     |
| `npm run lint`     | Lint source files                 |
| `npm test`         | Run tests                         |
| `npm run db:migrate` | Run Sequelize migrations        |

### Frontend scripts (`apps/frontend/`)

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `npm run dev`      | Start Vite dev server             |
| `npm run build`    | Type-check + Vite production build|
| `npm run preview`  | Preview production build locally  |
| `npm run lint`     | Lint source files                 |

---

## Deployment

Backend and frontend are **deployed independently**. They share this repository but have separate dependency trees and build pipelines.

### Backend

```bash
cd apps/backend
npm install --production
npm run build
NODE_ENV=production node dist/server.js
```

- Output: `apps/backend/dist/`
- Set all env vars from `.env.example` in your hosting platform.
- Use a process manager like **PM2** or deploy to **Railway**, **Render**, **Fly.io**, etc.
- Run `npm run db:migrate` against your production database before starting.

### Frontend

```bash
cd apps/frontend
npm install
npm run build
```

- Output: `apps/frontend/dist/` (static files)
- Deploy to **Vercel**, **Netlify**, **Cloudflare Pages**, or any static host.
- Set `VITE_API_URL` environment variable to your production backend URL.

### Database

- Use `npx sequelize-cli db:migrate` inside `apps/backend/` to run migrations in production.
- Do **not** use `sequelize.sync()` in production — rely on migrations only.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Commit your changes with descriptive messages.
4. Push and open a pull request.

---

## License

MIT
