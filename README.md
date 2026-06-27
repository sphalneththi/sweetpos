# 🍬 SweetPOS v2.0 — Hybrid Offline-First POS System

A production-grade Point of Sale system with **offline-first Flutter app** and **Spring Boot cloud backend**. The POS works fully offline with local SQLite, syncs to cloud when connected, and provides a cloud admin portal.

![SweetPOS](https://img.shields.io/badge/SweetPOS-v2.0-e85d75?style=for-the-badge)
![Java](https://img.shields.io/badge/Java-21-007396?style=flat-square)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?style=flat-square)
![Flutter](https://img.shields.io/badge/Flutter-3.24-02569B?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square)

## Architecture

```
┌──────────────────────┐         ┌───────────────────────────┐
│   Flutter POS App    │◄──sync──►│   Spring Boot Backend     │
│  (Offline-first)     │         │   (Cloud API)             │
│                      │         │                           │
│  • SQLite (Drift)    │         │  • PostgreSQL             │
│  • Riverpod state    │  REST   │  • JWT Auth               │
│  • Barcode scanner   │◄───────►│  • WebSocket (real-time)  │
│  • Sync engine       │         │  • Sync Engine            │
│  • Works offline     │         │  • Admin Portal API       │
└──────────────────────┘         └───────────────────────────┘
```

## Features

### POS Terminal (Flutter App)
- 🛒 **Fast checkout** — Product grid, barcode scanning, cart management
- 📴 **Offline-first** — Works without internet, syncs when connected
- 💰 **Multiple payments** — Cash, Card, QR
- 🔄 **Auto-sync** — Background sync with conflict resolution
- 👥 **Customer loyalty** — Points earning & redemption
- 📱 **Cross-platform** — Windows, Android, iOS, Web

### Cloud Backend (Spring Boot)
- 📊 **Dashboard** — Real-time revenue, top products, low stock alerts
- 📦 **Product management** — Full CRUD, categories, barcode assignment
- 📋 **Inventory** — Stock in/out/adjustment with audit trail
- 👥 **Customer database** — Loyalty points, visit tracking
- 📈 **Reports** — Sales reports, product analysis
- ⚙️ **Settings** — User management, supplier management
- 🔐 **Security** — JWT auth, role-based access, account lockout
- 🔌 **WebSocket** — Real-time push notifications to all terminals
- 🔄 **Sync API** — Batch sync with idempotency & conflict detection

## Quick Start

### Prerequisites
- [Java JDK 21+](https://www.oracle.com/java/technologies/downloads/)
- [Maven 3.9+](https://maven.apache.org/download.cgi)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Flutter SDK 3.24+](https://docs.flutter.dev/get-started/install) (for the POS app)

### 1. Start Backend (Cloud)

```bash
# Start PostgreSQL
docker compose up postgres -d

# Build and run Spring Boot backend
cd backend
mvn spring-boot:run
```

Backend runs at **http://localhost:8080**

The database tables are created automatically and seeded with demo data on first run.

### 2. Start Flutter POS App

```bash
cd flutter_app
flutter pub get
flutter run -d windows   # or: flutter run -d chrome
```

### 3. Full Stack with Docker

```bash
docker compose up -d
```

This starts both PostgreSQL and the Spring Boot backend. Then run the Flutter app separately.

### Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Cashier | `cashier` | `admin123` |

## Project Structure

```
sweetpos/
├── backend/                    # Spring Boot cloud backend
│   ├── src/main/java/com/sweetpos/
│   │   ├── config/            # Security, WebSocket, CORS config
│   │   ├── controller/        # REST API endpoints
│   │   ├── dto/               # Request/Response DTOs
│   │   ├── entity/            # JPA entities
│   │   ├── repository/        # Spring Data repositories
│   │   ├── security/          # JWT filter & service
│   │   ├── service/           # Business logic
│   │   └── sync/              # Cloud sync engine
│   ├── src/main/resources/
│   │   └── application.yml    # Configuration
│   ├── Dockerfile
│   └── pom.xml
├── flutter_app/                # Flutter POS client
│   ├── lib/
│   │   ├── database/          # Drift SQLite (offline storage)
│   │   ├── models/            # Data models
│   │   ├── providers/         # Riverpod state management
│   │   ├── screens/           # UI screens
│   │   ├── services/          # API & connectivity
│   │   ├── sync/              # Offline sync engine
│   │   ├── utils/             # Theme, constants
│   │   ├── widgets/           # Shared UI components
│   │   └── main.dart          # App entry point
│   └── pubspec.yaml
├── docker-compose.yml          # PostgreSQL + Backend
└── README.md
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login |
| `/api/auth/refresh` | POST | Refresh token |
| `/api/auth/users` | GET/POST | User management |
| `/api/products` | GET/POST/PUT/DELETE | Products CRUD |
| `/api/products/barcode/{code}` | GET | Lookup by barcode |
| `/api/categories` | GET/POST/PUT/DELETE | Categories |
| `/api/customers` | GET/POST/PUT/DELETE | Customers |
| `/api/sales` | GET/POST | Sales |
| `/api/sales/{id}/cancel` | POST | Cancel sale |
| `/api/inventory/stock-in` | POST | Stock in |
| `/api/inventory/stock-out` | POST | Stock out |
| `/api/dashboard` | GET | Dashboard summary |
| `/api/reports/sales` | GET | Sales report |
| `/api/sync` | POST | Batch sync from device |
| `/api/health` | GET | Health check |
| `/ws` | WebSocket | Real-time updates |

## Offline-First Sync Flow

1. **Sale created offline** → Saved to local SQLite + added to sync queue
2. **Device comes online** → Sync engine sends pending items to cloud
3. **Cloud processes** → Returns success/failure per item + any cloud changes
4. **Cloud changes** → Product/price/category updates pushed to local DB
5. **Real-time** → WebSocket notifies admin portal of new sales instantly

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_NAME` | sweetpos | Database name |
| `DB_USERNAME` | sweetpos | Database user |
| `DB_PASSWORD` | sweetpos_dev_password | Database password |
| `JWT_SECRET` | (built-in dev secret) | JWT signing key |
| `CORS_ORIGINS` | http://localhost:5173 | Allowed CORS origins |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| POS App | Flutter 3.24, Dart, Riverpod, Drift (SQLite) |
| Backend | Spring Boot 3.4, Java 21, Spring Security, JPA |
| Database | PostgreSQL 16 (cloud), SQLite (local) |
| Sync | REST + WebSocket (STOMP) |
| Build | Maven (backend), Flutter CLI (app) |
| Container | Docker, Docker Compose |

## License

Private — All rights reserved.
