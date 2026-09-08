# 🌾 ПОДРОБНАЯ ИНСТРУКЦИЯ - Камышечный Лаунчер

## Содержание

1. [Первичная настройка](#1-первичная-настройка)
2. [Загрузка на GitHub](#2-загрузка-на-github)
3. [Получение установщика .msi](#3-получение-установщика-msi)
4. [Запуск лаунчера](#4-запуск-лаунчера)
5. [Добавление контента](#5-добавление-контента)
6. [Система обновлений](#6-система-обновлений)
7. [Решение проблем](#7-решение-проблем)

---

## ⚠️ ВАЖНО: Отозвать токен!

**НЕМЕДЛЕННО** отзовите скомпрометированный токен:
- Откройте: https://github.com/settings/tokens
- Найдите токен `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`
- Нажмите **Delete**
- Создайте новый токен при необходимости

---

## 1. Первичная настройка

### Требования

Перед началом убедитесь что у вас установлены:

- **Git** (https://git-scm.com/download/win)
- **Node.js 18+** (https://nodejs.org/)
- **Java 17+** (https://adoptium.net/)

### Проверка установки

Откройте CMD и выполните:
```bash
git --version
node --version
npm --version
java -version
```

Все команды должны вернуть версии без ошибок.

---

## 2. Загрузка на GitHub

### Автоматический способ (рекомендуется)

1. **Дважды кликните** на `START.bat`
2. Введите цифру **1** и нажмите Enter
3. Дождитесь завершения инициализации Git
4. При появлении запроса введите:
   - **Username:** Ваш логин GitHub (ReLiXTs)
   - **Password:** Ваш Personal Access Token (не пароль!)

### Ручной способ

```bash
cd C:\Users\Hoshino\Desktop\BRG

# Инициализация Git
git init
git config user.email "relx@example.com"
git config user.name "ReLiXTs"

# Добавление файлов
git add .
git commit -m "🎉 Инициализация проекта Камышечный Лаунчер"

# Настройка remote
git remote add origin https://github.com/ReLiXTs/launch.git

# Push
git branch -M main
git push -u origin main --force
```

### Создание Personal Access Token

Если у вас нет токена:
1. Откройте: https://github.com/settings/tokens
2. Нажмите **Generate new token (classic)**
3. Выберите scopes: `repo`, `workflow`
4. Нажмите **Generate token**
5. **Скопируйте токен** (он показывается только один раз!)
6. Используйте этот токен вместо пароля при push

---

## 3. Получение установщика .msi

### Автоматическая сборка через GitHub Actions

После push на GitHub автоматически запускается сборка:

1. **Откройте Actions:** https://github.com/ReLiXTs/launch/actions
2. **Дождитесь** завершения сборки (зелёная галочка)
3. **Нажмите** на последний запуск
4. **Скачайте** `kamysh-launcher-msi` из раздела **Artifacts**
5. **Распакуйте** ZIP архив
6. **Установите** .msi файл

### Локальная сборка (без GitHub Actions)

```bash
cd C:\Users\Hoshino\Desktop\BRG\launcher

# Установка зависимостей
npm install

# Сборка установщика
npm run build:win
```

Установщик будет в `launcher\dist\`

---

## 4. Запуск лаунчера

### Режим разработки

```bash
cd C:\Users\Hoshino\Desktop\BRG

# Через START.bat
.\start-dev.bat

# Или вручную
cd launcher
npm install
npm start
```

### Интерфейс лаунчера

При запуске вы увидите:
- **Никнейм** - Введите имя игрока
- **Версия** - Выберите версию Minecraft
- **ОЗУ** - Настройте выделение памяти (или нажмите "Автонастройка")
- **Загрузчик** - Fabric или Forge
- **Системная информация** - Общая и свободная ОЗУ
- **Кнопка запуска** - Запустить Minecraft

---

## 5. Добавление контента

### Структура папок

```
server-data/
├── versions/          # Версии Minecraft
├── mods/              # Моды (.jar)
├── resourcepacks/     # Ресурспаки (.zip)
├── config/            # Конфиги модов
├── shaderpacks/       # Шейдеры (.zip)
├── saves/             # Миры (папки)
└── datapacks/         # Датапаки (.zip)
```

### Пример: Добавление Fabric 1.21.1 с модами

#### Шаг 1: Скачать файлы

Скачайте необходимые файлы:
- Fabric Loader: https://fabricmc.net/use/
- Sodium: https://modrinth.com/mod/sodium
- Lithium: https://modrinth.com/mod/lithium
- Phosphor: https://modrinth.com/mod/phosphor

#### Шаг 2: Поместить файлы

```bash
# Создайте папку версии
mkdir "server-data\versions\fabric-loader-1.21.1"

# Поместите файлы
server-data\
├── versions\
│   └── fabric-loader-1.21.1\
│       └── fabric-loader-1.21.1.jar
│
├── mods\
│   ├── sodium-fabric-mc1.21.1-0.5.8.jar
│   ├── lithium-fabric-mc1.21.1-0.12.1.jar
│   └── phosphor-fabric-mc1.21.1-0.8.1.jar
│
└── config\
    ├── sodium-options.json
    └── lithium.properties
```

#### Шаг 3: Синхронизировать с GitHub

```bash
cd C:\Users\Hoshino\Desktop\BRG
.\sync-to-github.bat
```

При запросе введите сообщение коммита, например:
```
Добавлена сборка Fabric 1.21.1 с модами Sodium, Lithium, Phosphor
```

#### Шаг 4: Дождаться сборки

1. Откройте Actions: https://github.com/ReLiXTs/launch/actions
2. Дождитесь зелёной галочки
3. Скачайте новый установщик из Artifacts

---

## 6. Система обновлений

### Как работает

1. **Проверка обновлений**
   - Лаунчер проверяет GitHub каждые 5 минут
   - Сравнивается SHA последнего коммита

2. **Уведомление**
   - При обнаружении обновления появляется уведомление
   - Показывается информация о новой версии

3. **Загрузка**
   - Пользователь нажимает "Обновить"
   - Скачивается ZIP архив с последним коммитом
   - Отображается прогресс загрузки

4. **Синхронизация**
   - Архив распаковывается
   - Файлы из `server-data/` копируются в `.minecraft`
   - Обновляется файл `version.json`

5. **Запуск**
   - Пользователь может запустить игру с новыми настройками

### Мониторинг версий

Локальная версия хранится в `launcher/version.json`:
```json
{
  "version": "abc1234",
  "lastUpdated": "2024-01-01T12:00:00.000Z"
}
```

---

## 7. Решение проблем

### BAT файлы показывают непонятные символы

**Причина:** Кодировка CMD не поддерживает UTF-8

**Решение:**
Все BAT файлы используют `chcp 65001` для переключения в UTF-8.

Если проблема сохраняется:
1. Откройте CMD от имени администратора
2. Выполните: `chcp 65001`
3. Запустите BAT файл снова

### Git push не работает

**Причина:** Не настроена аутентификация

**Решение 1: Git Credential Manager**
```bash
git config --global credential.helper manager
git push
# При запросе войдите через браузер
```

**Решение 2: GitHub CLI**
```bash
# Установите GitHub CLI
winget install GitHub.cli

# Войдите
gh auth login

# Выполните push
git push
```

**Решение 3: Personal Access Token**
1. Создайте токен: https://github.com/settings/tokens
2. При запросе пароля вставьте токен

### GitHub Actions падает

**Проверьте:**
1. Откройте Actions: https://github.com/ReLiXTs/launch/actions
2. Нажмите на упавший запуск
3. Посмотрите логи сборки
4. Проверьте:
   - Node.js версия 20
   - Все зависимости установлены
   - package.json корректен

**Частые ошибки:**
- `npm ci failed` - Проверьте package-lock.json
- `electron-builder failed` - Проверьте наличие иконки
- `MSI creation failed` - Проверьте Windows SDK

### Лаунчер не запускается

**Причина 1: Не установлены зависимости**
```bash
cd launcher
npm install
```

**Причина 2: Нет Node.js**
- Установите Node.js 18+: https://nodejs.org/

**Причина 3: Нет Java**
- Установите Java 17+: https://adoptium.net/

**Причина 4: Порт заблокирован**
- Проверьте антивирус/фаервол

### Minecraft не запускается

**Причина 1: Не найдена Java**
```bash
java -version
# Если ошибка - установите Java 17+
```

**Причина 2: Не найдена версия**
- Проверьте что версия существует в `server-data/versions/`
- Проверьте что Fabric/Forge установлен правильно

**Причина 3: Недостаточно ОЗУ**
- Увеличьте выделение ОЗУ в лаунчере
- Закройте другие программы

### Обновления не загружаются

**Причина 1: Нет интернета**
- Проверьте подключение к интернету

**Причина 2: GitHub API rate limit**
- Подождите час или создайте Personal Access Token

**Причина 3: Нет прав доступа**
- Убедитесь что репозиторий публичный
- Или используйте токен с правами `repo`

---

## 📊 Производительность

| Операция | Время |
|----------|-------|
| Проверка обновлений | < 1 сек |
| Загрузка обновления | Зависит от размера |
| Синхронизация файлов | < 5 сек (1000 файлов) |
| Запуск Minecraft | ~2-3 сек |
| Сборка MSI (Actions) | ~3-5 мин |

---

## 🔐 Безопасность

### НИКОГДА не коммитьте:
- Personal Access Tokens
- Пароли
- Приватные ключи
- `.env` файлы

### Используйте:
- GitHub Secrets для токенов
- Переменные окружения
- `.gitignore` для чувствительных файлов

---

## 📞 Поддержка

- **GitHub:** https://github.com/ReLiXTs/launch
- **Issues:** https://github.com/ReLiXTs/launch/issues
- **Actions:** https://github.com/ReLiXTs/launch/actions

---

<p align="center">
  <strong>🌾 Удачи на сервере Камышечный!</strong>
</p>
