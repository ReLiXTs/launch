@echo off
echo ========================================
echo  Запуск лаунчера в режиме разработки
echo ========================================
echo.

cd /d "%~dp0\launcher"

echo [1/2] Установка зависимостей...
call npm install
if errorlevel 1 (
    echo ОШИБКА: Не удалось установить зависимости
    pause
    exit /b 1
)

echo [2/2] Запуск лаунчера...
call npm start -- --dev

pause
