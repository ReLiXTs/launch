@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   SYNC CHANGES TO GITHUB
echo ========================================
echo.

echo Adding all changes...
git add .

echo.
echo Checking status...
git status

echo.
set /p msg="Enter commit message (or press Enter for default): "
if "%msg%"=="" set msg="Sync content - %date% %time%"

echo.
echo Committing...
git commit -m "%msg%"

echo.
echo Pushing...
git push origin main

echo.
echo ========================================
echo   SYNC COMPLETE!
echo ========================================
echo.
echo Go to https://github.com/ReLiXTs/launch/actions
echo to download the new MSI installer.
echo.
pause
