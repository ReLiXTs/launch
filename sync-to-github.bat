@echo off
echo ========================================
echo  Синхронизация изменений с GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo Проверка статуса Git...
git status

echo.
echo [1/3] Добавление изменений...
git add .

echo [2/3] Создание коммита...
set /p message="Введите сообщение коммита (или Enter для автоматического): "
if "%message%"=="" set message="Обновление контента %date% %time%"
git commit -m "%message%"

echo [3/3] Push на GitHub...
git push origin main

echo.
echo ========================================
echo  Синхронизация завершена!
echo ========================================
pause
