# 📦 Контент сервера "Камышечный"

Эта папка содержит все файлы, которые автоматически синхронизируются с лаунчером.

## 📂 Структура папок

### `versions/`
Версии Minecraft и загрузчики модов (Fabric, Forge)
```
versions/
├── fabric-loader-1.21.1/
│   └── fabric-loader-1.21.1.jar
└── 1.20.4-forge/
    └── 1.20.4-forge.jar
```

### `mods/`
Все моды для сервера
```
mods/
├── sodium-fabric-mc1.21.1.jar
├── lithium-fabric-mc1.21.1.jar
└── ...
```

### `resourcepacks/`
Ресурспаки
```
resourcepacks/
├── Faithful-32x.zip
└── ...
```

### `config/`
Конфигурации модов
```
config/
├── sodium-options.json
├── lithium.properties
└── ...
```

### `shaderpacks/`
Шейдеры
```
shaderpacks/
├── BSL_Shaders_v8.2.04.zip
├── ComplementaryReimagined_r5.2.2.zip
└── ...
```

### `saves/`
Миры и сохранения
```
saves/
├── KamyshServer/
│   ├── level.dat
│   └── ...
└── ...
```

### `datapacks/`
Датапаки
```
datapacks/
├── custom-recipes.zip
└── ...
```

## 🔄 Как добавить обновление

1. **Добавьте файлы** в соответствующие папки
2. **Закоммитьте** изменения:
   ```bash
   git add .
   git commit -m "Добавлены новые моды для Fabric 1.21.1"
   ```
3. **Запушьте** в GitHub:
   ```bash
   git push origin main
   ```
4. **Лаунчер автоматически** обнаружит изменения при следующем запуске

## ⚠️ Важно

- **НЕ** добавляйте большие файлы (>100MB) напрямую в git
- Используйте **Git LFS** для больших файлов (моды, ресурспаки)
- Проверяйте изменения перед коммитом
- Ведите **changelog** для отслеживания изменений

## 📝 Changelog

### 2024-01-01
- Инициализация проекта
