#!/bin/bash
# ============================================
# SweetPOS - One-Command Setup Script (Linux/Mac)
# ============================================
set -e

echo ""
echo "  🍬  SweetPOS Setup"
echo "  ==================="
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "  ❌ Node.js (v20+) is required. Install from https://nodejs.org"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "  ❌ Docker is required. Install from https://docker.com"; exit 1; }
docker info >/dev/null 2>&1 || { echo "  ❌ Docker is not running. Please start Docker."; exit 1; }

echo "  ✓ Node.js $(node --version)"
echo "  ✓ Docker is running"

# Install pnpm
if ! command -v pnpm &> /dev/null; then
    echo "  → Installing pnpm..."
    npm install -g pnpm
fi
echo "  ✓ pnpm $(pnpm --version)"

# 1. Start PostgreSQL
echo ""
echo "  → Starting PostgreSQL..."
docker compose up -d 2>/dev/null || docker-compose up -d
echo "  → Waiting for database..."
until docker exec sweetpos-pg pg_isready -U sweetpos 2>/dev/null; do sleep 2; done
echo "  ✓ PostgreSQL ready on port 5432"

# 2. Install dependencies
echo "  → Installing dependencies..."
pnpm install --ignore-scripts 2>/dev/null
echo "  ✓ Dependencies installed"

# 3. Create .env
if [ ! -f .env ]; then
    cp .env.example .env
    sed -i 's/JWT_ACCESS_EXPIRY=15m/JWT_ACCESS_EXPIRY=8h/' .env 2>/dev/null || sed -i '' 's/JWT_ACCESS_EXPIRY=15m/JWT_ACCESS_EXPIRY=8h/' .env
    echo "  ✓ Created .env"
fi
cp .env apps/api/.env

# 4. Build API
echo "  → Building API..."
cd apps/api
npx nest build 2>/dev/null
cd ../..
echo "  ✓ API built"

# 5. Initialize database
echo "  → Initializing database tables..."
cd apps/api
node -r ./register-paths.js dist/apps/api/src/main &
API_PID=$!
sleep 8
kill $API_PID 2>/dev/null || true
cd ../..
echo "  ✓ Database tables created"

# 6. Seed data
echo "  → Seeding demo data..."
cat apps/api/seed-demo.sql | docker exec -i sweetpos-pg psql -U sweetpos -d sweetpos >/dev/null 2>&1
echo "  ✓ Demo data loaded"

echo ""
echo "  ============================================"
echo "  ✅  SweetPOS is ready!"
echo "  ============================================"
echo ""
echo "  Start the app:  pnpm run dev"
echo ""
echo "  Open: http://localhost:5173"
echo ""
echo "  Login:"
echo "    Admin   → admin / admin123"
echo "    Cashier → cashier / admin123"
echo ""
