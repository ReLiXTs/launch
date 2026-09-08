@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   BUILD MSI INSTALLER
echo ========================================
echo.

cd launcher

echo Installing dependencies...
call npm install

echo.
echo Building Windows installer...
call npm run build:win

echo.
echo ========================================
echo   BUILD COMPLETE!
echo ========================================
echo.
echo Output files:
dir dist\*.msi
dir dist\*.exe

cd ..
pause
