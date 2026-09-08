@echo off
chcp 65001 >nul
cls
echo ========================================
echo  PUSH TO GITHUB (ENGLISH VERSION)
echo ========================================
echo.

cd /d "%~dp0"

echo.
echo This script will execute:
echo   git init
echo   git add .
echo   git commit -m "Initial commit"
echo   git remote add origin https://github.com/ReLiXTs/launch.git
echo   git push -u origin main --force
echo.

set /p confirm="Continue? (y/n): "
if /i not "%confirm%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo [1/5] Initializing Git...
git init
if errorlevel 1 (
    echo ERROR: Git is not installed
    pause
    exit /b 1
)

echo [2/5] Configuring Git...
git config user.email "relx@example.com"
git config user.name "ReLiXTs"

echo [3/5] Adding all files...
git add .

echo [4/5] Creating commit...
git commit -m "Initial commit - Kamysh Launcher"
if errorlevel 1 (
    echo WARNING: Commit already exists, continuing...
)

echo [5/5] Setting up remote and pushing...
git remote remove origin 2>nul
git remote add origin https://github.com/ReLiXTs/launch.git
git branch -M main
git push -u origin main --force

if errorlevel 1 (
    echo.
    echo ERROR: Push failed!
    echo.
    echo This means your repository has BRANCH PROTECTION RULES enabled.
    echo You need to DISABLE them first.
    echo.
    echo SOLUTION:
    echo 1. Go to: https://github.com/ReLiXTs/launch/settings/branches
    echo 2. Find "main" branch protection rule
    echo 3. Click "Delete" or disable "Require a pull request before merging"
    echo 4. Come back and run this script again
    echo.
    echo OR use GitHub Desktop app instead
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  SUCCESS! Project uploaded to GitHub
echo ========================================
echo.
echo Open: https://github.com/ReLiXTs/launch
echo.
echo Wait for MSI build in Actions:
echo https://github.com/ReLiXTs/launch/actions
echo.
pause
