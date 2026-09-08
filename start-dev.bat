@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   START LAUNCHER (DEV MODE)
echo ========================================
echo.

cd launcher

echo Installing dependencies...
call npm install

echo.
echo Starting launcher...
call npm run dev

cd ..
