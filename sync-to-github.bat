@echo off
chcp 65001 >nul
cls
echo ========================================
echo  SYNC TO GITHUB
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Git status...
git status

echo.
echo [1/3] Adding changes...
git add .

echo [2/3] Creating commit...
set /p message="Enter commit message (or Enter for auto): "
if "%message%"=="" set message="Update content %date% %time%"
git commit -m "%message%"

echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo  Sync complete!
echo ========================================
pause
