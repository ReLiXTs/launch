const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

class MinecraftLauncher {
  constructor() {
    this.minecraftPath = this.getMinecraftPath();
  }

  getMinecraftPath() {
    const home = os.homedir();
    switch (os.platform()) {
      case 'win32':
        return path.join(home, 'AppData', 'Roaming', '.minecraft');
      case 'darwin':
        return path.join(home, 'Library', 'Application Support', 'minecraft');
      case 'linux':
        return path.join(home, '.minecraft');
      default:
        return path.join(home, '.minecraft');
    }
  }

  getOptimalRam() {
    const totalMemory = os.totalmem() / 1024 / 1024; // MB
    const freeMemory = os.freemem() / 1024 / 1024; // MB

    // Рекомендуемая формула: 60-70% от общей памяти, но не более 8GB
    let optimalRam = Math.floor(totalMemory * 0.6);
    
    // Минимум 2GB, максимум 8GB
    optimalRam = Math.max(2048, Math.min(8192, optimalRam));

    return {
      recommended: optimalRam,
      min: 2048,
      max: Math.floor(totalMemory * 0.8),
      totalSystemRam: Math.floor(totalMemory),
      freeSystemRam: Math.floor(freeMemory)
    };
  }

  async launch(options) {
    const {
      version = '1.21.1',
      modLoader = 'fabric',
      ram = this.getOptimalRam().recommended,
      username = 'Player',
      javaPath = this.getJavaPath()
    } = options;

    // Копируем файлы из server-data в .minecraft
    await this.syncServerData();

    // Формируем аргументы запуска
    const args = this.buildLaunchArgs(version, modLoader, ram, username);

    return new Promise((resolve, reject) => {
      const java = spawn(javaPath, args, {
        cwd: this.minecraftPath
      });

      java.stdout.on('data', (data) => {
        console.log(`Minecraft: ${data}`);
      });

      java.stderr.on('data', (data) => {
        console.error(`Minecraft Error: ${data}`);
      });

      java.on('close', (code) => {
        if (code === 0) {
          resolve({ message: 'Minecraft запущен успешно' });
        } else {
          reject(new Error(`Minecraft завершился с кодом: ${code}`));
        }
      });

      java.on('error', (error) => {
        reject(error);
      });
    });
  }

  buildLaunchArgs(version, modLoader, ram, username) {
    const args = [
      `-Xms${Math.floor(ram * 0.3)}M`,
      `-Xmx${ram}M`,
      '-XX:+UseG1GC',
      '-XX:+ParallelRefProcEnabled',
      '-XX:MaxGCPauseMillis=200',
      '-XX:+UnlockExperimentalVMOptions',
      '-XX:+DisableExplicitGC',
      '-XX:G1NewSizePercent=30',
      '-XX:G1MaxNewSizePercent=40',
      '-XX:G1HeapRegionSize=8M',
      '-XX:G1ReservePercent=20',
      '-XX:G1HeapWastePercent=5',
      '-XX:G1MixedGCCountTarget=4',
      '-XX:InitiatingHeapOccupancyPercent=15',
      '-XX:G1MixedGCLiveThresholdPercent=90',
      '-XX:G1RSetUpdatingPauseTimePercent=5',
      '-XX:SurvivorRatio=32',
      '-XX:+PerfDisableSharedMem',
      '-XX:MaxTenuringThreshold=1',
      '-Dusing.aikars.flags=https://mcflags.emc.gs',
      '-Daikars.new.flags=true',
      '-Dfml.ignoreInvalidMinecraftCertificates=true',
      '-Dfml.ignorePatchDiscrepancies=true',
      '-Dlog4j2.formatMsgNoLookups=true'
    ];

    // Добавляем специфичные для загрузчика аргументы
    if (modLoader === 'fabric') {
      args.push(
        `-Dfabric.loader.version=0.15.0`,
        `-Dfabric.gameVersion=${version}`
      );
    } else if (modLoader === 'forge') {
      args.push(
        `-Dforge.version=1.21.1-47.2.0`
      );
    }

    // Добавляем путь к jar файлу
    const jarPath = this.getJarPath(version, modLoader);
    args.push('-jar', jarPath);

    // Аргументы для Minecraft
    args.push(
      '--username', username,
      '--version', version,
      '--gameDir', this.minecraftPath,
      '--assetsDir', path.join(this.minecraftPath, 'assets'),
      '--assetIndex', version,
      '--accessToken', '0'
    );

    return args;
  }

  getJavaPath() {
    // Пытаемся найти Java
    const possiblePaths = [
      'C:\\Program Files\\Java\\jre-1.8\\bin\\java.exe',
      'C:\\Program Files\\Java\\jdk-17\\bin\\java.exe',
      'C:\\Program Files\\Java\\jdk-21\\bin\\java.exe',
      'C:\\Program Files\\Eclipse Adoptium\\jdk-17*\\bin\\java.exe',
      'C:\\Program Files\\Eclipse Adoptium\\jdk-21*\\bin\\java.exe',
      'java' // Из PATH
    ];

    for (const javaPath of possiblePaths) {
      if (fs.existsSync(javaPath)) {
        return javaPath;
      }
    }

    return 'java';
  }

  getJarPath(version, modLoader) {
    const versionsPath = path.join(this.minecraftPath, 'versions');
    
    // Пытаемся найти соответствующий jar
    if (modLoader === 'fabric') {
      return path.join(versionsPath, `fabric-loader-${version}`, `fabric-loader-${version}.jar`);
    } else if (modLoader === 'forge') {
      return path.join(versionsPath, `${version}-forge`, `${version}-forge.jar`);
    }
    
    return path.join(versionsPath, version, `${version}.jar`);
  }

  async syncServerData() {
    const sourcePath = path.join(__dirname, '..', 'server-data');
    const categories = ['versions', 'mods', 'resourcepacks', 'config', 'shaderpacks', 'saves', 'datapacks'];

    for (const category of categories) {
      const sourceDir = path.join(sourcePath, category);
      const targetDir = path.join(this.minecraftPath, category);

      if (!fs.existsSync(sourceDir)) continue;

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Копируем все файлы из категории
      await this.copyDirectory(sourceDir, targetDir);
    }
  }

  async copyDirectory(source, target) {
    if (!fs.existsSync(source)) return;

    const items = fs.readdirSync(source);

    for (const item of items) {
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);

      const stats = fs.statSync(sourcePath);

      if (stats.isDirectory()) {
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath, { recursive: true });
        }
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        // Копируем только если файл новее или отсутствует
        if (!fs.existsSync(targetPath) || 
            stats.mtime > fs.statSync(targetPath).mtime) {
          fs.copyFileSync(sourcePath, targetPath);
        }
      }
    }
  }
}

module.exports = MinecraftLauncher;
