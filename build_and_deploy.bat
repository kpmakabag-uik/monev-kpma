@echo off
echo ======================================================
echo    SiMONEV - Build & Package for Deployment
echo ======================================================
echo.

:: 1. Build the application
echo [1/4] Menjalankan npm run build...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build gagal!
    pause
    exit /b 1
)

:: 2. Prepare deployment folder
echo [2/4] Menyiapkan folder 'deploy'...
if exist "deploy" rd /s /q "deploy"
mkdir "deploy"

:: 3. Copy standalone files
echo [3/4] Menyusun file ke folder 'deploy'...
xcopy /s /e /q ".next\standalone\*" "deploy\"
mkdir "deploy\public"
xcopy /s /e /q "public\*" "deploy\public\"
mkdir "deploy\.next\static"
xcopy /s /e /q ".next\static\*" "deploy\.next\static\"

:: Copy Prisma for database management on server
mkdir "deploy\prisma"
xcopy /s /e /q "prisma\*" "deploy\prisma\"

:: Copy .env and database (optional but helpful)
copy ".env" "deploy\.env"
if exist "dev.db" copy "dev.db" "deploy\dev.db"

:: 4. Create ZIP (PowerShell)
echo [4/4] Mengompres menjadi siap_upload.zip...
powershell -Command "Compress-Archive -Path 'deploy\*' -DestinationPath 'siap_upload.zip' -Force"

echo.
echo ======================================================
echo   BERHASIL! 
echo   Silakan upload file 'siap_upload.zip' ke server Anda.
echo ======================================================
echo.
pause
