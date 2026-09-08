@echo off
chcp 65001 >nul
cls
echo ========================================
echo  BUILD LAUNCHER (.msi)
echo ========================================
echo.

cd /d "%~dp0\launcher"

echo [1/2] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [2/2] Building .msi installer...
call npm run build:win
if errorlevel 1 (
    echo ERROR: Failed to build installer
    pause
    exit /b 1
)

echo.
echo ========================================
echo  SUCCESS! Installer created
echo ========================================
echo.
echo File location: launcher\dist\
echo.
explorer dist
pause
