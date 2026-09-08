@echo off
echo ========================================
echo  Инициализация Git и Push на GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Инициализация Git репозитория...
git init
if errorlevel 1 (
    echo ОШИБКА: Не удалось инициализировать Git
    pause
    exit /b 1
)

echo [2/5] Настройка Git...
git config user.email "relx@example.com"
git config user.name "ReLiXTs"

echo [3/5] Добавление всех файлов...
git add .

echo [4/5] Создание первого коммита...
git commit -m "🎉 Инициализация проекта Камышечный Лаунчер"
if errorlevel 1 (
    echo ОШИБКА: Не удалось создать коммит
    pause
    exit /b 1
)

echo [5/5] Настройка remote и push на GitHub...
git remote remove origin 2>nul
git remote add origin https://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@github.com/ReLiXTs/launch.git

echo Push в main ветку...
git branch -M main
git push -u origin main --force
if errorlevel 1 (
    echo ОШИБКА: Не удалось выполнить push на GitHub
    pause
    exit /b 1
)

echo.
echo ========================================
echo  УСПЕХ! Проект загружен на GitHub
echo ========================================
echo.
echo ВАЖНО: Отозвите токен в настройках GitHub!
echo Settings -^> Developer settings -^> Personal access tokens
echo.
pause
