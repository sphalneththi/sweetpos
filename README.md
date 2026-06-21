# 🍬 SweetPOS — Production-Grade Point of Sale System

A full-featured POS system for sweet shops, bakeries, and retail stores. Built with NestJS, React, PostgreSQL, and TypeScript.

![SweetPOS](https://img.shields.io/badge/SweetPOS-v1.0-e85d75?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?style=flat-square)
![NestJS](https://img.shields.io/badge/NestJS-10-ea2845?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square)

## Features

- 🛒 **POS Terminal** — Fast product search, barcode scanning (webcam), category filtering, cart management
- 💰 **Checkout** — Cash/Card/QR payments, change calculation, discounts (% or fixed), customer loyalty points
- 📊 **Dashboard** — Real-time revenue, transaction count, top products, revenue trends, low stock alerts
- 📦 **Product Management** — Full CRUD, categories, barcode assignment via camera, stock tracking
- 📋 **Inventory** — Stock-in/out/adjustment movements, supplier tracking, low stock alerts
- 👥 **Customers** — Customer database, loyalty points auto-earning, visit tracking
- 📈 **Reports** — Sales reports with charts, product revenue/profit analysis, inventory valuation
- ⚙️ **Settings** — User management (admin/cashier roles), supplier management
- 🔐 **Auth** — JWT authentication, role-based access, account lockout
- 🌙 **Dark/Light Mode** — Premium UI with theme toggle

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) v20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Setup (One Command)

```bash
# Clone the repo
git clone https://github.com/sphalneththi/sweetpos.git
cd sweetpos

# Windows (PowerShell)
./setup.ps1

# Linux / Mac
chmod +x setup.sh && ./setup.sh
```

### Start Development

```bash
pnpm run dev
```

This starts both the API (port 3000) and the frontend (port 5173).

**Open:** http://localhost:5173

### Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Cashier | `cashier` | `admin123` |

## Manual Setup

If you prefer to set up manually:

```bash
# 1. Install pnpm
npm install -g pnpm

# 2. Install dependencies
pnpm install --ignore-scripts

# 3. Start PostgreSQL
docker compose up -d

# 4. Create environment file
cp .env.example .env
cp .env apps/api/.env

# 5. Build the API
cd apps/api && npx nest build && cd ../..

# 6. Start API (creates tables automatically via TypeORM synchronize)
cd apps/api && node -r ./register-paths.js dist/apps/api/src/main
# Wait 5 seconds then stop with Ctrl+C

# 7. Seed demo data
cat apps/api/seed-demo.sql | docker exec -i sweetpos-pg psql -U sweetpos -d sweetpos

# 8. Start both services
pnpm run dev
```

## Project Structure

```
sweetpos/
├── apps/
│   ├── api/              # NestJS backend (REST API)
│   │   ├── src/modules/  # Feature modules (auth, sales, products, etc.)
│   │   └── seed-demo.sql # Demo data seed
│   ├── renderer/         # React frontend (Vite)
│   │   ├── src/features/ # Feature pages (POS, Dashboard, etc.)
│   │   ├── src/hooks/    # React Query hooks
│   │   └── src/components/ # Shared UI components
│   └── desktop/          # Electron wrapper (optional)
├── packages/
│   └── shared-types/     # TypeScript interfaces & enums
├── docker-compose.yml    # PostgreSQL setup
├── setup.ps1             # Windows setup script
├── setup.sh              # Linux/Mac setup script
└── package.json          # Turborepo monorepo config
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Zustand, TanStack Query, Recharts |
| Backend | NestJS 10, TypeORM, PostgreSQL 16, JWT |
| Monorepo | Turborepo, pnpm workspaces |
| Database | PostgreSQL 16 (Docker) |
| Barcode | html5-qrcode (webcam scanning) |

## API Documentation

Swagger docs available at: http://localhost:3000/api/docs

## Environment Variables

See `.env.example` for all configuration options. Key settings:

| Variable | Default | Description |
|----------|---------|-------------|
| `API_PORT` | 3000 | API server port |
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PASSWORD` | sweetpos_dev_password | Database password |
| `JWT_ACCESS_EXPIRY` | 8h | Token expiration |
| `NODE_ENV` | development | Enables auto-sync DB schema |

## License

Private — All rights reserved.
