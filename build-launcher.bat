@echo off
echo ========================================
echo  Сборка лаунчера в .msi
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

echo [2/2] Сборка .msi установщика...
call npm run build:win
if errorlevel 1 (
    echo ОШИБКА: Не удалось собрать установщик
    pause
    exit /b 1
)

echo.
echo ========================================
echo  УСПЕХ! Установщик создан
echo ========================================
echo.
echo Файл находится в: launcher\dist\
echo.
explorer dist
pause
