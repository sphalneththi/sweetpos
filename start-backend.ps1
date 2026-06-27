# SweetPOS Backend Startup Script
# Requires: Docker Desktop running, Java 21+, Maven 3.9+

Write-Host "🍬 SweetPOS v2.0 - Backend Startup" -ForegroundColor Magenta
Write-Host "==================================" -ForegroundColor Gray

# Check Docker
Write-Host "`n[1/3] Starting PostgreSQL..." -ForegroundColor Cyan
docker compose up postgres -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker failed. Make sure Docker Desktop is running." -ForegroundColor Red
    exit 1
}

# Wait for PostgreSQL to be ready
Write-Host "[2/3] Waiting for PostgreSQL..." -ForegroundColor Cyan
$retries = 0
do {
    Start-Sleep -Seconds 2
    $retries++
    $result = docker exec sweetpos-pg pg_isready -U sweetpos 2>$null
} while ($LASTEXITCODE -ne 0 -and $retries -lt 15)

if ($retries -ge 15) {
    Write-Host "❌ PostgreSQL did not become ready" -ForegroundColor Red
    exit 1
}
Write-Host "✓ PostgreSQL is ready" -ForegroundColor Green

# Start Spring Boot
Write-Host "[3/3] Starting Spring Boot backend..." -ForegroundColor Cyan
Write-Host "      API will be available at http://localhost:8080" -ForegroundColor Gray
Write-Host "      Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

Set-Location backend
mvn spring-boot:run
