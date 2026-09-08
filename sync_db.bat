@echo off
title SiMONEV - Sinkronisasi Database MySQL
chcp 65001 >nul
cd /d "%~dp0"

echo ======================================================
echo       SiMONEV KPMA - Sinkronisasi Database
echo ======================================================
echo.

:: Pastikan node terinstall
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan di komputer ini!
    echo Silakan install Node.js terlebih dahulu: https://nodejs.org/
    pause
    exit /b 1
)

:: Jalankan script sync interaktif
node scripts/sync-db.js

echo.
pause
