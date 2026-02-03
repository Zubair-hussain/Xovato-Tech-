# Kill any running Next.js dev servers
Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like "*Next.js*" -or $_.CommandLine -like "*next dev*"} | Stop-Process -Force

# Remove lock file if it exists
if (Test-Path .next\dev\lock) {
    Remove-Item .next\dev\lock -Force
    Write-Host "Removed lock file"
}

Write-Host "Dev server processes cleaned up. You can now run 'npm run dev'"
