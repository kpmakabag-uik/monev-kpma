@echo off
chcp 65001 >nul
title SiMONEV - Monitoring & Evaluasi Mutu PT
color 0B

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║         SiMONEV - Launcher Aplikasi                 ║
echo ║   Monitoring dan Evaluasi Mutu Perguruan Tinggi     ║
echo ╚══════════════════════════════════════════════════════╝
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan!
    echo Silakan install Node.js dari https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%a in ('node -v') do set NODE_VER=%%a
echo [OK] Node.js terdeteksi: %NODE_VER%

:: Check node_modules
if not exist "node_modules" (
    echo.
    echo [INFO] Menginstal dependensi... (npm install)
    echo Ini mungkin memakan waktu beberapa menit...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Gagal menginstal dependensi!
        pause
        exit /b 1
    )
    echo [OK] Dependensi berhasil diinstal.
) else (
    echo [OK] Dependensi sudah terinstal.
)

:: Generate Prisma Client
echo.
echo [INFO] Mempersiapkan database (Prisma Generate)...
call npx prisma generate >nul 2>&1
echo [OK] Prisma client siap.

:: Check if database needs seeding
if not exist "dev.db" (
    if not exist "prisma\dev.db" (
        echo.
        echo [INFO] Database belum ada, menjalankan migrasi dan seed...
        call npx prisma db push
        call npx prisma db seed
        echo [OK] Database berhasil dibuat dan di-seed.
    )
)

:: Start the dev server
echo.
echo ══════════════════════════════════════════════════════
echo   Menjalankan server...
echo   Buka browser di: http://localhost:3000
echo.
echo   Akun Default:
echo   ┌──────────┬──────────┬───────────────────────┐
echo   │ Username │ Password │ Role                  │
echo   ├──────────┼──────────┼───────────────────────┤
echo   │ admin    │ password │ KPMA (Admin Penuh)    │
echo   │ gkm      │ password │ GKM (Prodi)           │
echo   │ gpm      │ password │ GPM (Auditor)         │
echo   │ dekan    │ password │ Pimpinan Fakultas     │
echo   │ pimpinan │ password │ Pimpinan Universitas  │
echo   └──────────┴──────────┴───────────────────────┘
echo.
echo   Tekan Ctrl+C untuk menghentikan server.
echo ══════════════════════════════════════════════════════
echo.

call npm run dev
