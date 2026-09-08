@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   KAMYSHECHNYY LAUNCHER - MAIN MENU
echo ========================================
echo.
echo [1] Push to GitHub
echo [2] Start Launcher (Dev Mode)
echo [3] Build MSI Installer
echo [4] Sync Changes to GitHub
echo [5] Install Dependencies
echo [6] Exit
echo.
set /p choice="Choose option (1-6): "

if "%choice%"=="1" goto push
if "%choice%"=="2" goto dev
if "%choice%"=="3" goto build
if "%choice%"=="4" goto sync
if "%choice%"=="5" goto install
if "%choice%"=="6" goto end
goto menu

:push
echo.
echo Pushing to GitHub...
call push-to-github.bat
goto end

:dev
echo.
echo Starting launcher in dev mode...
call start-dev.bat
goto end

:build
echo.
echo Building MSI installer...
call build-launcher.bat
goto end

:sync
echo.
echo Syncing changes...
call sync-to-github.bat
goto end

:install
echo.
echo Installing dependencies...
cd launcher
call npm install
cd ..
echo.
echo Dependencies installed!
pause
goto menu

:end
echo.
echo Done!
pause
