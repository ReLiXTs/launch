@echo off
chcp 65001 >nul
cls
echo ========================================
echo  АВТОМАТИЧЕСКИЙ PULL НА GITHUB
echo ========================================
echo.

cd /d "%~dp0"

echo.
echo Этот скрипт выполнит следующие команды:
echo   git init
echo   git add .
echo   git commit -m "Initial commit"
echo   git remote add origin https://github.com/ReLiXTs/launch.git
echo   git push -u origin main --force
echo.

set /p confirm="Продолжить? (y/n): "
if /i not "%confirm%"=="y" (
    echo Отменено.
    pause
    exit /b 0
)

echo.
echo [1/5] Инициализация Git...
git init
if errorlevel 1 (
    echo ОШИБКА: Git не установлен или не работает
    pause
    exit /b 1
)

echo [2/5] Настройка Git...
git config user.email "relx@example.com"
git config user.name "ReLiXTs"

echo [3/5] Добавление всех файлов...
git add .

echo [4/5] Создание коммита...
git commit -m "Initial commit - Kamysh Launcher"
if errorlevel 1 (
    echo ВНИМАНИЕ: Коммит уже существует, продолжаем...
)

echo [5/5] Настройка remote и push...
git remote remove origin 2>nul
git remote add origin https://github.com/ReLiXTs/launch.git
git branch -M main
git push -u origin main --force

if errorlevel 1 (
    echo.
    echo ОШИБКА: Push не удался!
    echo.
    echo Возможные причины:
    echo 1. Не установлена аутентификация Git
    echo 2. Неверный логин или токен
    echo 3. Репозиторий не существует
    echo.
    echo РЕШЕНИЕ:
    echo 1. Установите Git Credential Manager:
    echo    git config --global credential.helper manager
    echo.
    echo 2. Или используйте GitHub CLI:
    echo    winget install GitHub.cli
    echo    gh auth login
    echo.
    echo 3. Или используйте Personal Access Token:
    echo    https://github.com/settings/tokens
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  УСПЕХ! Проект загружен на GitHub
echo ========================================
echo.
echo Откройте: https://github.com/ReLiXTs/launch
echo.
echo Дождитесь сборки MSI в Actions:
echo https://github.com/ReLiXTs/launch/actions
echo.
pause
