@echo off
echo ========================================
echo  Быстрый старт - Камышечный Лаунчер
echo ========================================
echo.
echo Выберите действие:
echo.
echo [1] Загрузить проект на GitHub (первый раз)
echo [2] Запустить лаунчер (режим разработки)
echo [3] Собрать .msi установщик
echo [4] Открыть папку проекта
echo [5] Открыть документацию
echo [0] Выход
echo.
set /p choice="Введите номер (0-5): "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto dev
if "%choice%"=="3" goto build
if "%choice%"=="4" goto folder
if "%choice%"=="5" goto docs
if "%choice%"=="0" exit

echo Неверный выбор!
pause
goto end

:setup
cls
echo Запуск инициализации Git...
call setup-git.bat
goto end

:dev
cls
echo Запуск лаунчера в режиме разработки...
call start-dev.bat
goto end

:build
cls
echo Сборка .msi установщика...
call build-launcher.bat
goto end

:folder
explorer "%~dp0"
goto end

:docs
start INSTRUCTION.md
goto end

:end
