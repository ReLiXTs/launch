# 🌾 Камышечный - Minecraft Server Launcher

![Version](https://img.shields.io/badge/version-1.0.0-brightgreen)
![Platform](https://img.shields.io/badge/platform-Windows-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

Полноценная система для запуска и управления Minecraft сервером "Камышечный" с автоматическими обновлениями через GitHub.

## 🎯 Основные возможности

✅ **Автоматические обновления** - Лаунчер автоматически проверяет и загружает обновления с GitHub
✅ **Синхронизация контента** - Автоматическая синхронизация модов, конфигов, ресурспаков, шейдеров, миров и датапаков
✅ **Умная настройка ОЗУ** - Автоматическое определение оптимального выделения оперативной памяти
✅ **Поддержка загрузчиков** - Fabric и Forge
✅ **Современный UI** - Красивый и интуитивный интерфейс
✅ **MSI установщик** - Профессиональная установка для Windows
✅ **Логирование** - Подробные логи всех операций

## 🚀 Быстрый старт

### Шаг 1: Загрузить на GitHub

**Запустите:** `START.bat` → Выберите опцию **1**

Или вручную:
```bash
cd C:\Users\Hoshino\Desktop\BRG
.\setup-git.bat
```

⚠️ **ВАЖНО:** После выполнения отзовите токен в настройках GitHub!

### Шаг 2: Запустить лаунчер

**Запустите:** `START.bat` → Выберите опцию **2**

Или вручную:
```bash
cd launcher
npm install
npm start
```

### Шаг 3: Собрать установщик

**Запустите:** `START.bat` → Выберите опцию **3**

Или вручную:
```bash
cd launcher
npm run build:win
```

## 📁 Структура проекта

```
BRG/
├── launcher/                    # Electron приложение
│   ├── src/
│   │   ├── main.js             # Основной процесс Electron
│   │   ├── preload.js          # Мост между процессами
│   │   ├── updater.js          # Система обновлений с GitHub
│   │   ├── minecraft.js        # Логика запуска Minecraft
│   │   ├── config.json         # Конфигурация
│   │   └── renderer/           # UI (HTML/CSS/JavaScript)
│   ├── assets/                 # Иконки и ресурсы
│   ├── package.json            # Зависимости и скрипты
│   ├── version.json            # Текущая версия
│   └── README.md               # Документация лаунчера
│
├── server-data/                 # Контент сервера
│   ├── versions/               # Версии Minecraft
│   ├── mods/                   # Моды
│   ├── resourcepacks/          # Ресурспаки
│   ├── config/                 # Конфигурации модов
│   ├── shaderpacks/            # Шейдеры
│   ├── saves/                  # Миры и сохранения
│   ├── datapacks/              # Датапаки
│   └── README.md               # Документация контента
│
├── START.bat                   # 🎯 Меню быстрого старта
├── setup-git.bat               # Инициализация Git и push
├── start-dev.bat               # Запуск в режиме разработки
├── build-launcher.bat          # Сборка .msi установщика
├── sync-to-github.bat          # Синхронизация изменений
├── INSTRUCTION.md              # Подробная инструкция
└── README.md                   # Этот файл
```

## 🎮 Использование

### Для игроков

1. **Установите** лаунчер из `launcher\dist\`
2. **Запустите** лаунчер
3. **Введите** никнейм
4. **Настройте** ОЗУ (или используйте автонастройку)
5. **Нажмите** "Запустить Minecraft"

### Для администратора

#### Добавление новых модов

```bash
# 1. Поместите моды в server-data\mods\
server-data\mods\
├── sodium-fabric-1.21.1.jar
├── lithium-fabric-1.21.1.jar
└── phosphor-fabric-1.21.1.jar

# 2. Синхронизируйте с GitHub
cd C:\Users\Hoshino\Desktop\BRG
.\sync-to-github.bat

# 3. Готово! Лаунчер автоматически обновится
```

#### Добавление новой версии Minecraft

```bash
# 1. Создайте папку в server-data\versions\
server-data\versions\
└── fabric-loader-1.21.1\
    └── fabric-loader-1.21.1.jar

# 2. Добавьте конфиги в server-data\config\
# 3. Синхронизируйте
.\sync-to-github.bat
```

## 🔧 Технические детали

### Автоматическая настройка ОЗУ

Лаунчер использует умный алгоритм для определения оптимального ОЗУ:

```javascript
// Формула: 60% от общей памяти системы
optimalRam = totalMemory * 0.6

// Ограничения
min = 2048 MB  // 2 ГБ
max = 8192 MB  // 8 ГБ
```

**Примеры:**
- 8 ГБ ОЗУ → Рекомендуется 4.8 ГБ
- 16 ГБ ОЗУ → Рекомендуется 8 ГБ
- 32 ГБ ОЗУ → Рекомендуется 8 ГБ (максимум)

### Система обновлений

1. **Проверка** - Каждые 5 минут проверяется последний коммит на GitHub
2. **Сравнение** - Сравнивается локальная версия с удаленной
3. **Уведомление** - Пользователь видит уведомление об обновлении
4. **Загрузка** - Скачивается архив с изменениями
5. **Синхронизация** - Файлы из `server-data\` копируются в `.minecraft`

### Оптимизация JVM

Лаунчер использует оптимизированные флаги JVM (Aikar's flags):

```bash
-XX:+UseG1GC
-XX:+ParallelRefProcEnabled
-XX:MaxGCPauseMillis=200
-XX:+UnlockExperimentalVMOptions
-XX:G1NewSizePercent=30
-XX:G1MaxNewSizePercent=40
-XX:G1HeapRegionSize=8M
```

## 📦 Поддерживаемый контент

| Папка | Описание | Пример |
|-------|----------|--------|
| `versions/` | Версии Minecraft | `fabric-loader-1.21.1/` |
| `mods/` | Моды | `sodium.jar`, `lithium.jar` |
| `resourcepacks/` | Ресурспаки | `Faithful-32x.zip` |
| `config/` | Конфиги модов | `sodium-options.json` |
| `shaderpacks/` | Шейдеры | `BSL_Shaders.zip` |
| `saves/` | Миры | `KamyshServer/` |
| `datapacks/` | Датапаки | `custom-recipes.zip` |

## 🛠️ Разработка

### Требования

- **Node.js** 18+
- **npm** 9+
- **Git** 2.30+
- **Java** 17+ (для Minecraft 1.17+)

### Запуск в режиме разработки

```bash
cd launcher
npm install
npm start -- --dev
```

### Сборка для разных платформ

```bash
# Windows (.exe + .msi)
npm run build:win

# Linux (.AppImage)
npm run build:linux

# macOS (.dmg)
npm run build:mac
```

## 🔐 Безопасность

⚠️ **НИКОГДА** не коммитьте токены в репозиторий!

Используйте переменные окружения:
```bash
# .env файл (добавить в .gitignore)
GITHUB_TOKEN=your_token_here
```

## 📊 Производительность

- **Проверка обновлений:** < 1 секунда
- **Загрузка обновления:** Зависит от размера и скорости интернета
- **Синхронизация файлов:** < 5 секунд для 1000 файлов
- **Запуск Minecraft:** ~2-3 секунды

## 🐛 Известные проблемы

- [ ] Поддержка Linux/macOS для автоопределения Java
- [ ] Git LFS для больших файлов
- [ ] Мультиязычность интерфейса

## 📝 Changelog

### v1.0.0 (2024-01-01)
- ✅ Инициализация проекта
- ✅ Базовая функциональность лаунчера
- ✅ Система автоматических обновлений
- ✅ Автоматическая настройка ОЗУ
- ✅ Поддержка Fabric и Forge
- ✅ Создание .msi установщика

## 🤝 Вклад

Приветствуются pull requests! Для крупных изменений сначала откройте issue.

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE)

## 👨‍💻 Автор

**ReLiXTs** - [GitHub](https://github.com/ReLiXTs)

## 🙏 Благодарности

- Minecraft - Mojang Studios
- Electron - GitHub
- Fabric - FabricMC
- Forge - MinecraftForge
- Aikar's Flags - Aikar

---

<p align="center">
  <strong>🌾 Камышечный Лаунчер - Ваш лучший выбор для Minecraft!</strong>
</p>
