const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

let electronApp = null;
try {
  electronApp = require('electron').app;
} catch {
  electronApp = null; // модуль может импортироваться вне Electron (например, тестами)
}

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
      default:
        return path.join(home, '.minecraft');
    }
  }

  // БАГ: раньше было path.join(__dirname, '..', 'server-data'), что в dev давало
  // launcher/server-data (папки не существует — она на уровень выше), а в собранном
  // приложении указывало бы вообще внутрь app.asar. Теперь путь считается верно
  // и для dev, и для запакованного приложения (extraResources).
  getServerDataPath() {
    if (electronApp && electronApp.isPackaged) {
      return path.join(process.resourcesPath, 'server-data');
    }
    // src -> launcher -> корень проекта -> server-data
    return path.join(__dirname, '..', '..', 'server-data');
  }

  getOptimalRam() {
    const totalMemory = os.totalmem() / 1024 / 1024; // МБ
    const freeMemory = os.freemem() / 1024 / 1024;

    let optimalRam = Math.floor(totalMemory * 0.6);
    optimalRam = Math.max(2048, Math.min(8192, optimalRam));

    return {
      recommended: optimalRam,
      min: 2048,
      max: Math.max(2048, Math.floor(totalMemory * 0.8)),
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
      account = null, // { profile: {id, name}, accessToken } из auth.js, если пользователь вошёл
      javaPath = this.getJavaPath()
    } = options;

    await this.syncServerData();

    const jarPath = this.getJarPath(version, modLoader);
    if (!fs.existsSync(jarPath)) {
      // БАГ: раньше отсутствие jar-файла приводило к невнятной ошибке спавна процесса.
      throw new Error(
        `Не найден файл клиента: ${jarPath}. Проверьте, что версия ${version} (${modLoader}) ` +
          'загружена в server-data/versions.'
      );
    }

    const args = this.buildLaunchArgs(version, ram, username, jarPath, account);

    return new Promise((resolve, reject) => {
      const java = spawn(javaPath, args, { cwd: this.minecraftPath });

      java.stdout.on('data', (data) => console.log(`Minecraft: ${data}`));
      java.stderr.on('data', (data) => console.error(`Minecraft Error: ${data}`));

      java.on('close', (code) => {
        if (code === 0) {
          resolve({ message: 'Minecraft запущен успешно' });
        } else {
          reject(new Error(`Minecraft завершился с кодом: ${code}`));
        }
      });

      java.on('error', (error) => {
        if (error.code === 'ENOENT') {
          reject(new Error('Java не найдена. Установите Java 17+ и повторите попытку.'));
        } else {
          reject(error);
        }
      });
    });
  }

  buildLaunchArgs(version, ram, username, jarPath, account) {
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
      '-Dfml.ignoreInvalidMinecraftCertificates=true',
      '-Dfml.ignorePatchDiscrepancies=true',
      '-Dlog4j2.formatMsgNoLookups=true',
      '-jar',
      jarPath
    ];

    const online = !!(account && account.profile && account.accessToken);

    args.push(
      '--username', online ? account.profile.name : username,
      '--version', version,
      '--gameDir', this.minecraftPath,
      '--assetsDir', path.join(this.minecraftPath, 'assets'),
      '--assetIndex', version,
      '--uuid', online ? account.profile.id : '0',
      '--accessToken', online ? account.accessToken : '0',
      '--userType', online ? 'msa' : 'legacy'
    );

    return args;
  }

  // БАГ: раньше здесь были пути с "*" (например 'jdk-17*\\bin\\java.exe'), которые
  // fs.existsSync никогда не находил, так как existsSync не раскрывает wildcard-маски.
  // Теперь сначала ищем java через PATH (where/which), затем сканируем папки JDK по-настоящему.
  getJavaPath() {
    try {
      const cmd = os.platform() === 'win32' ? 'where java' : 'which java';
      const found = execSync(cmd, { encoding: 'utf-8' }).split(/\r?\n/)[0].trim();
      if (found && fs.existsSync(found)) return found;
    } catch {
      // java не в PATH — пробуем известные пути установки ниже
    }

    const candidates = [
      'C:\\Program Files\\Java\\jdk-21\\bin\\java.exe',
      'C:\\Program Files\\Java\\jdk-17\\bin\\java.exe',
      'C:\\Program Files\\Java\\jre-1.8\\bin\\java.exe'
    ];

    const adoptiumRoot = 'C:\\Program Files\\Eclipse Adoptium';
    if (fs.existsSync(adoptiumRoot)) {
      for (const entry of fs.readdirSync(adoptiumRoot)) {
        const candidate = path.join(adoptiumRoot, entry, 'bin', 'java.exe');
        if (fs.existsSync(candidate)) candidates.unshift(candidate);
      }
    }

    for (const javaPath of candidates) {
      if (fs.existsSync(javaPath)) return javaPath;
    }

    return 'java'; // последняя надежда — вдруг всё же есть в PATH при запуске
  }

  getJarPath(version, modLoader) {
    const versionsPath = path.join(this.minecraftPath, 'versions');
    if (modLoader === 'fabric') {
      return path.join(versionsPath, `fabric-loader-${version}`, `fabric-loader-${version}.jar`);
    } else if (modLoader === 'forge') {
      return path.join(versionsPath, `${version}-forge`, `${version}-forge.jar`);
    }
    return path.join(versionsPath, version, `${version}.jar`);
  }

  async syncServerData() {
    const sourcePath = this.getServerDataPath();
    const categories = ['versions', 'mods', 'resourcepacks', 'config', 'shaderpacks', 'saves', 'datapacks'];

    for (const category of categories) {
      const sourceDir = path.join(sourcePath, category);
      const targetDir = path.join(this.minecraftPath, category);

      if (!fs.existsSync(sourceDir)) continue;
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      await this.copyDirectory(sourceDir, targetDir);
    }
  }

  async copyDirectory(source, target) {
    if (!fs.existsSync(source)) return;

    const items = fs.readdirSync(source);

    for (const item of items) {
      const sourceItemPath = path.join(source, item);
      const targetItemPath = path.join(target, item);
      const stats = fs.statSync(sourceItemPath);

      if (stats.isDirectory()) {
        if (!fs.existsSync(targetItemPath)) fs.mkdirSync(targetItemPath, { recursive: true });
        await this.copyDirectory(sourceItemPath, targetItemPath);
      } else if (!fs.existsSync(targetItemPath) || stats.mtime > fs.statSync(targetItemPath).mtime) {
        fs.copyFileSync(sourceItemPath, targetItemPath);
      }
    }
  }
}

module.exports = MinecraftLauncher;
