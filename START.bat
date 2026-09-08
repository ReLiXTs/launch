@echo off
chcp 65001 >nul
cls
echo ========================================
echo  KAMYSH LAUNCHER - QUICK START
echo ========================================
echo.
echo Select action:
echo.
echo [1] Push to GitHub (first time)
echo [2] Start launcher (dev mode)
echo [3] Build .msi installer
echo [4] Open project folder
echo [5] Open documentation
echo [6] Read FIX_PUSH_PROBLEM.md
echo [0] Exit
echo.
set /p choice="Enter number (0-6): "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto dev
if "%choice%"=="3" goto build
if "%choice%"=="4" goto folder
if "%choice%"=="5" goto docs
if "%choice%"=="6" goto fix
if "%choice%"=="0" exit

echo Invalid choice!
pause
goto end

:setup
cls
echo Starting Git initialization...
call push-to-github.bat
goto end

:dev
cls
echo Starting launcher in dev mode...
call start-dev.bat
goto end

:build
cls
echo Building .msi installer...
call build-launcher.bat
goto end

:folder
explorer "%~dp0"
goto end

:docs
start INSTRUCTION.md
goto end

:fix
start FIX_PUSH_PROBLEM.md
goto end

:end
