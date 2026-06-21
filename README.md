# SweetPOS — Production-Grade POS System for Sweet Shop

🍬 A production-grade, offline-first, hybrid Point of Sale and Inventory Management System built with a unified TypeScript stack.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Desktop** | Electron 33 (electron-vite) |
| **Backend** | NestJS (TypeScript) |
| **Cloud DB** | PostgreSQL 16 |
| **Local DB** | SQLite (better-sqlite3) |
| **State** | Zustand |
| **Package Manager** | pnpm 9 + Turborepo |
| **Auth** | JWT + Refresh Tokens + bcrypt |
| **CI/CD** | GitHub Actions |
| **Deployment** | Docker + AWS ECS Fargate |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16 (or Docker)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd sweetpos

# Install dependencies
pnpm install

# Start PostgreSQL (using Docker)
docker compose -f docker/docker-compose.dev.yml up -d

# Copy environment config
cp .env.example .env

# Start development (API + Renderer)
pnpm dev
```

### Project Structure

```
sweetpos/
├── apps/
│   ├── api/            # NestJS Backend API
│   ├── desktop/        # Electron main process
│   └── renderer/       # React POS UI (Vite)
├── packages/
│   └── shared-types/   # Shared TypeScript interfaces
├── docker/             # Docker configs
└── .github/            # CI/CD workflows
```

### Development Commands

```bash
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps
pnpm test             # Run all tests
pnpm lint             # Lint all apps
pnpm format           # Format code with Prettier
```

### Default Login

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Cashier | cashier1 | cashier123 |

## Features

- ✅ Role-based access (Admin / Cashier)
- ✅ Real-time POS sales screen
- ✅ Barcode scanner support (USB HID)
- ✅ Shopping cart with discount & tax
- ✅ Multiple payment methods
- ✅ Thermal receipt printing
- ✅ Product & category management
- ✅ Inventory tracking & alerts
- ✅ Customer management & loyalty
- ✅ Comprehensive reporting
- ✅ Offline-first with cloud sync
- ✅ Dark / Light mode
- ✅ Keyboard shortcuts

## License

Proprietary — All rights reserved.
