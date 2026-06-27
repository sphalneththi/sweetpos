# SweetPOS Flutter App Startup Script
# Requires: Flutter SDK installed and in PATH

Write-Host "🍬 SweetPOS v2.0 - Flutter POS App" -ForegroundColor Magenta
Write-Host "===================================" -ForegroundColor Gray

Set-Location flutter_app

# Check Flutter
$flutterCheck = Get-Command flutter -ErrorAction SilentlyContinue
if (-not $flutterCheck) {
    Write-Host "❌ Flutter SDK not found in PATH" -ForegroundColor Red
    Write-Host "   Install from: https://docs.flutter.dev/get-started/install/windows" -ForegroundColor Yellow
    Write-Host "   Or use: winget install Google.Flutter" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[1/3] Getting dependencies..." -ForegroundColor Cyan
flutter pub get

Write-Host "[2/3] Running build_runner (code generation)..." -ForegroundColor Cyan
dart run build_runner build --delete-conflicting-outputs

Write-Host "[3/3] Launching app..." -ForegroundColor Cyan
Write-Host "      Make sure backend is running at http://localhost:8080" -ForegroundColor Gray
Write-Host ""

# Run on Windows desktop by default, or web if no Windows support
flutter run -d windows
