Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   PACKAGING SIMONEV FOR DEPLOYMENT" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Sedang mengompres aplikasi (mengecualikan node_modules, .next, .git)..." -ForegroundColor Yellow

tar -a -c -f simonev_deploy.zip --exclude="node_modules" --exclude=".next" --exclude=".git" --exclude="*.zip" --exclude="*.bat" --exclude="*.ps1" --exclude=".env.local" --exclude="test-results" --exclude="playwright-report" .

Write-Host ""
Write-Host "------------------------------------------" -ForegroundColor Green
Write-Host "BERHASIL! File: simonev_deploy.zip siap dikirim ke server." -ForegroundColor Green
Write-Host "Lokasi: $(Get-Location)\simonev_deploy.zip" -ForegroundColor Green
Write-Host "------------------------------------------" -ForegroundColor Green
Write-Host "Tekan tombol apapun untuk keluar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
