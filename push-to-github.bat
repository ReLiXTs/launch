@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   PUSH TO GITHUB
echo ========================================
echo.

echo Checking Git status...
git status

echo.
echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "Update launcher - %date% %time%"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo Next steps:
echo 1. Go to https://github.com/ReLiXTs/launch/actions
echo 2. Wait for build to complete (3-5 minutes)
echo 3. Download MSI from Artifacts
echo.
pause
