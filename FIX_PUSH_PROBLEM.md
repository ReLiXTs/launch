# 🔴 ПРОБЛЕМА С PUSH - КАК ИСПРАВИТЬ

## Что случилось?

У вас ошибка: **"push declined due to repository rule violations"**

Это означает, что в вашем репозитории `ReLiXTs/launch` включена **защита ветки main**.

---

## ✅ РЕШЕНИЕ 1: Отключить защиту ветки (БЫСТРО)

### Пошаговая инструкция:

1. **Откройте настройки репозитория:**
   ```
   https://github.com/ReLiXTs/launch/settings
   ```

2. **Перейдите в раздел "Branches":**
   - В левом меню найдите **"Branches"**
   - Или откройте: https://github.com/ReLiXTs/launch/settings/branches

3. **Найдите правило для ветки "main":**
   - Вы увидите список правил защиты
   - Найдите правило для ветки `main`

4. **Удалите правило:**
   - Нажмите на правило для `main`
   - Внизу страницы нажмите **"Delete"** или **"Remove rule"**

5. **Попробуйте снова:**
   ```cmd
   cd C:\Users\Hoshino\Desktop\BRG
   .\push-to-github.bat
   ```

---

## ✅ РЕШЕНИЕ 2: Использовать GitHub Desktop (РЕКОМЕНДУЕТСЯ)

### Установка:

1. **Скачайте GitHub Desktop:**
   ```
   https://desktop.github.com/
   ```

2. **Установите и войдите:**
   - Запустите GitHub Desktop
   - Войдите в свой аккаунт GitHub

3. **Добавьте локальную папку:**
   - File → Add Local Repository
   - Выберите папку: `C:\Users\Hoshino\Desktop\BRG`
   - Если появится ошибка "This directory does not appear to be a Git repository"
   - Нажмите **"create a repository here"**

4. **Настройте репозиторий:**
   - Name: `launch`
   - Local Path: `C:\Users\Hoshino\Desktop\BRG`
   - Нажмите **"Create Repository"**

5. **Закоммитьте файлы:**
   - Слева увидите список изменений
   - Внизу напишите: `Initial commit`
   - Нажмите **"Commit to main"**

6. **Опубликуйте на GitHub:**
   - Нажмите **"Publish repository"**
   - Снимите галочку "Keep this code private"
   - Нажмите **"Publish Repository"**

7. **Готово!** Откройте https://github.com/ReLiXTs/launch

---

## ✅ РЕШЕНИЕ 3: Создать Pull Request (ПРАВИЛЬНЫЙ СПОСОБ)

Если вы не хотите отключать защиту:

### Шаг 1: Создайте новую ветку

```cmd
cd C:\Users\Hoshino\Desktop\BRG
git checkout -b feature/initial-setup
git push -u origin feature/initial-setup
```

### Шаг 2: Создайте Pull Request

1. Откройте: https://github.com/ReLiXTs/launch/pulls
2. Нажмите **"New pull request"**
3. Выберите `feature/initial-setup` → `main`
4. Нажмите **"Create pull request"**
5. Напишите заголовок: `Initial setup`
6. Нажмите **"Create pull request"**

### Шаг 3: Подтвердите сами

- Откройте созданный PR
- Нажмите **"Merge pull request"**
- Подтвердите

---

## ✅ РЕШЕНИЕ 4: Использовать Personal Access Token

Если проблема с аутентификацией:

### Создайте новый токен:

1. Откройте: https://github.com/settings/tokens
2. **"Generate new token (classic)"**
3. Name: `Kamysh Launcher`
4. Expiration: `No expiration`
5. Отметьте галочки:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
6. Нажмите **"Generate token"**
7. **СКОПИРУЙТЕ ТОКЕН** (он показывается только один раз!)

### Используйте токен:

```cmd
cd C:\Users\Hoshino\Desktop\BRG
git remote set-url origin https://YOUR_TOKEN@github.com/ReLiXTs/launch.git
git push -u origin main --force
```

Замените `YOUR_TOKEN` на ваш скопированный токен.

---

## 🎯 БЫСТРАЯ ПРОВЕРКА

Откройте эту ссылку и проверьте настройки:
```
https://github.com/ReLiXTs/launch/settings/branches
```

Если там есть правило для `main` - удалите его!

---

## 📞 Если ничего не помогает

Напишите мне:
1. Скриншот ошибки
2. Скриншот https://github.com/ReLiXTs/launch/settings/branches
3. Версию Git: `git --version`

---

## ⚠️ НЕ ЗАБУДЬТЕ!

**Отозвать старый токен:**
```
https://github.com/settings/tokens
```
Найдите токен `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` и нажмите **Delete**!
