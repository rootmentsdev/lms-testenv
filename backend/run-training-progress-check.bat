@echo off
echo ========================================
echo   Training Progress Validation Script
echo ========================================
echo.

echo Starting training progress validation...
echo.

cd /d "%~dp0"
node check-dashboard-training-progress.js

echo.
echo ========================================
echo   Validation Complete
echo ========================================
pause
