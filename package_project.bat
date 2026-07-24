@echo off
echo ==========================================
echo    PACKAGING SIMONEV FOR DEPLOYMENT
echo ==========================================
echo.
echo Sedang mengompres aplikasi (mengecualikan node_modules, .next, .git)...

tar -a -c -f simonev_deploy.zip --exclude="node_modules" --exclude=".next" --exclude=".git" --exclude="*.zip" --exclude="*.bat" .

echo.
echo ------------------------------------------
echo BERHASIL! File: simonev_deploy.zip siap dikirim.
echo ------------------------------------------
pause
