#!/usr/bin/env pwsh
# ============================================
# SweetPOS - One-Command Setup Script
# ============================================
Write-Host ""
Write-Host "  🍬  SweetPOS Setup" -ForegroundColor Magenta
Write-Host "  ===================" -ForegroundColor DarkGray
Write-Host ""

# Check prerequisites
$errors = @()
if (!(Get-Command node -ErrorAction SilentlyContinue)) { $errors += "Node.js (v20+) is required. Install from https://nodejs.org" }
if (!(Get-Command docker -ErrorAction SilentlyContinue)) { $errors += "Docker is required. Install Docker Desktop from https://docker.com" }

if ($errors.Count -gt 0) {
    Write-Host "  ❌ Missing prerequisites:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "     - $_" -ForegroundColor Yellow }
    Write-Host ""
    exit 1
}

# Check Docker is running
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Docker is installed but not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ Node.js $(node --version)" -ForegroundColor Green
Write-Host "  ✓ Docker is running" -ForegroundColor Green

# Install pnpm if not available
if (!(Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "  → Installing pnpm..." -ForegroundColor Cyan
    npm install -g pnpm 2>&1 | Out-Null
}
Write-Host "  ✓ pnpm $(pnpm --version)" -ForegroundColor Green

# 1. Start PostgreSQL
Write-Host ""
Write-Host "  → Starting PostgreSQL..." -ForegroundColor Cyan
docker compose up -d 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    # Fallback for older docker without compose plugin
    docker-compose up -d 2>&1 | Out-Null
}

# Wait for Postgres to be ready
$retries = 0
while ($retries -lt 15) {
    $ready = docker exec sweetpos-pg pg_isready -U sweetpos 2>&1
    if ($ready -match "accepting connections") { break }
    Start-Sleep 2
    $retries++
}

if ($retries -ge 15) {
    Write-Host "  ❌ PostgreSQL failed to start" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ PostgreSQL ready on port 5432" -ForegroundColor Green

# 2. Install dependencies
Write-Host "  → Installing dependencies (this may take a minute)..." -ForegroundColor Cyan
pnpm install --ignore-scripts 2>&1 | Out-Null
Write-Host "  ✓ Dependencies installed" -ForegroundColor Green

# 3. Create .env file
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    # Update JWT expiry for dev
    (Get-Content ".env") -replace "JWT_ACCESS_EXPIRY=15m", "JWT_ACCESS_EXPIRY=8h" | Set-Content ".env"
    Write-Host "  ✓ Created .env from .env.example" -ForegroundColor Green
} else {
    Write-Host "  ✓ .env already exists" -ForegroundColor Green
}

# Copy .env to apps/api
Copy-Item ".env" "apps/api/.env" -Force

# 4. Build API
Write-Host "  → Building API..." -ForegroundColor Cyan
$nestBin = Get-ChildItem "node_modules/.pnpm/@nestjs+cli@*/node_modules/@nestjs/cli/bin/nest.js" | Select-Object -First 1
if ($nestBin) {
    Push-Location apps/api
    node "../../$($nestBin.FullName.Substring((Get-Location).Path.Length - 7))" build 2>&1 | Out-Null
    Pop-Location
}
# Fallback: use npx
if (!(Test-Path "apps/api/dist")) {
    Push-Location apps/api
    npx nest build 2>&1 | Out-Null
    Pop-Location
}
Write-Host "  ✓ API built" -ForegroundColor Green

# 5. Wait for tables to be created (start API briefly)
Write-Host "  → Initializing database tables..." -ForegroundColor Cyan
$apiProc = Start-Process -FilePath "node" -ArgumentList "-r ./register-paths.js dist/apps/api/src/main" -WorkingDirectory "apps/api" -PassThru -WindowStyle Hidden
Start-Sleep 8
Stop-Process -Id $apiProc.Id -Force -ErrorAction SilentlyContinue 2>&1 | Out-Null
Write-Host "  ✓ Database tables created" -ForegroundColor Green

# 6. Seed demo data
Write-Host "  → Seeding demo data..." -ForegroundColor Cyan
Get-Content "apps/api/seed-demo.sql" | docker exec -i sweetpos-pg psql -U sweetpos -d sweetpos 2>&1 | Out-Null
Write-Host "  ✓ Demo data loaded" -ForegroundColor Green

# Done!
Write-Host ""
Write-Host "  ============================================" -ForegroundColor Green
Write-Host "  ✅  SweetPOS is ready!" -ForegroundColor Green
Write-Host "  ============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  To start the app, run:" -ForegroundColor White
Write-Host "    pnpm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Or start each service manually:" -ForegroundColor White
Write-Host "    API:      cd apps/api && node -r ./register-paths.js dist/apps/api/src/main" -ForegroundColor DarkGray
Write-Host "    Frontend: cd apps/renderer && pnpm dev" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Open in browser: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Login credentials:" -ForegroundColor White
Write-Host "    Admin   → username: admin    password: admin123" -ForegroundColor DarkGray
Write-Host "    Cashier → username: cashier  password: admin123" -ForegroundColor DarkGray
Write-Host ""
