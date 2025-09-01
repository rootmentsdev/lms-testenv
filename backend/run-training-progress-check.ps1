# Training Progress Validation Script
# PowerShell version with better error handling

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Training Progress Validation Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Check if Node.js is installed
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) {
        Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
        Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
    
    # Check if the validation script exists
    $scriptPath = Join-Path $PSScriptRoot "check-dashboard-training-progress.js"
    if (-not (Test-Path $scriptPath)) {
        Write-Host "❌ Validation script not found: $scriptPath" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host "✅ Validation script found" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Starting training progress validation..." -ForegroundColor Yellow
    Write-Host ""
    
    # Run the validation script
    Set-Location $PSScriptRoot
    node check-dashboard-training-progress.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Validation completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "❌ Validation failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ Error running validation script: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor DarkGray
} finally {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Validation Complete" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Read-Host "Press Enter to exit"
}
