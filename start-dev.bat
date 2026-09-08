@echo off
chcp 65001 >nul
cls
echo ========================================
echo  STARTING LAUNCHER (DEV MODE)
echo ========================================
echo.

cd /d "%~dp0\launcher"

echo Installing dependencies...
call npm install

echo.
echo Starting launcher...
call npm start -- --dev

pause
