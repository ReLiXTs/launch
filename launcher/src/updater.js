const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const os = require('os');
const AdmZip = require('adm-zip');

let electronApp = null;
try {
  electronApp = require('electron').app;
} catch {
  electronApp = null;
}

class Updater {
  constructor(githubConfig) {
    this.owner = githubConfig.owner;
    this.repo = githubConfig.repo;
    this.branch = githubConfig.branch;
    this.apiUrl = `https://api.github.com/repos/${this.owner}/${this.repo}`;

    // БАГ: раньше version.json писался рядом с исходниками (path.join(__dirname, '..', 'version.json')).
    // В собранном приложении это внутри app.asar — файл только для чтения, запись падала молча/с ошибкой.
    // Теперь используем userData — папку, которая всегда доступна для записи.
    const userDataDir = electronApp ? electronApp.getPath('userData') : path.join(__dirname, '..');
    this.localVersionFile = path.join(userDataDir, 'version.json');
  }

  // БАГ: путь к server-data считался как path.join(__dirname, '..', 'server-data') —
  // на один уровень выше, чем нужно, и не учитывал запакованное приложение.
  getServerDataPath() {
    if (electronApp && electronApp.isPackaged) {
      return path.join(process.resourcesPath, 'server-data');
    }
    return path.join(__dirname, '..', '..', 'server-data');
  }

  async checkForUpdates() {
    try {
      const commitUrl = `${this.apiUrl}/commits?sha=${this.branch}&per_page=1`;
      const commitResponse = await fetch(commitUrl, {
        headers: { 'User-Agent': 'KamyshLauncher/1.0' }
      });

      if (!commitResponse.ok) {
        throw new Error('Не удалось получить информацию о коммитах');
      }

      const commits = await commitResponse.json();
      if (!commits || commits.length === 0) {
        return { hasUpdate: false };
      }

      const latestCommit = commits[0];
      const remoteVersion = latestCommit.sha.substring(0, 7);

      let localVersion = 'unknown';
      if (fs.existsSync(this.localVersionFile)) {
        const localData = JSON.parse(fs.readFileSync(this.localVersionFile, 'utf-8'));
        localVersion = localData.version || 'unknown';
      }

      if (remoteVersion !== localVersion) {
        const changes = await this.getChangedFiles(latestCommit.sha);
        return {
          hasUpdate: true,
          remoteVersion,
          localVersion,
          commitMessage: latestCommit.commit.message,
          commitDate: latestCommit.commit.author.date,
          changedFiles: changes
        };
      }

      return { hasUpdate: false, remoteVersion, localVersion };
    } catch (error) {
      console.error('Ошибка проверки обновлений:', error);
      throw error;
    }
  }

  async getChangedFiles(commitSha) {
    try {
      const url = `${this.apiUrl}/commits/${commitSha}`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'KamyshLauncher/1.0' }
      });

      if (!response.ok) return [];

      const commitData = await response.json();
      const changedPaths = (commitData.files || []).map((file) => file.filename);

      const categories = ['versions/', 'mods/', 'resourcepacks/', 'config/', 'shaderpacks/', 'saves/', 'datapacks/'];
      return changedPaths.filter((p) => categories.some((cat) => p.startsWith(`server-data/${cat}`)));
    } catch {
      return [];
    }
  }

  async downloadUpdate(version, progressCallback) {
    // БАГ: раньше zip писался в path.join(__dirname, '..', 'temp-update.zip') —
    // в собранном приложении это внутри app.asar (нельзя писать). Теперь всегда tmpdir().
    const tempPath = path.join(os.tmpdir(), `kamysh-update-${Date.now()}.zip`);

    try {
      const downloadUrl = `${this.apiUrl}/zipball/${this.branch}`;
      progressCallback({ status: 'downloading', progress: 0 });

      const response = await fetch(downloadUrl, {
        headers: { 'User-Agent': 'KamyshLauncher/1.0' }
      });

      if (!response.ok) {
        throw new Error('Не удалось скачать обновление');
      }

      const totalBytes = parseInt(response.headers.get('content-length') || '0', 10);
      let downloadedBytes = 0;
      const fileStream = fs.createWriteStream(tempPath);

      await new Promise((resolve, reject) => {
        response.body.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          const progress = totalBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
          progressCallback({ status: 'downloading', progress });
        });

        response.body.pipe(fileStream);
        response.body.on('error', reject);
        fileStream.on('finish', resolve);
        fileStream.on('error', reject);
      });

      progressCallback({ status: 'extracting', progress: 100 });
      await this.extractUpdate(tempPath);

      fs.writeFileSync(
        this.localVersionFile,
        JSON.stringify({ version, lastUpdated: new Date().toISOString() }, null, 2)
      );

      progressCallback({ status: 'complete', progress: 100 });
      return { success: true, version };
    } catch (error) {
      console.error('Ошибка загрузки обновления:', error);
      throw error;
    } finally {
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch {
          /* не критично */
        }
      }
    }
  }

  async extractUpdate(zipPath) {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    if (entries.length === 0) return;

    const prefix = entries[0].entryName.split('/')[0] + '/';
    const destRoot = this.getServerDataPath();
    const destParent = path.dirname(destRoot);

    for (const entry of entries) {
      if (!entry.entryName.startsWith(`${prefix}server-data/`)) continue;

      const relativePath = entry.entryName.substring(prefix.length);
      const targetPath = path.join(destParent, relativePath);

      if (entry.isDirectory) {
        if (!fs.existsSync(targetPath)) fs.mkdirSync(targetPath, { recursive: true });
      } else {
        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(targetPath, entry.getData());
      }
    }
  }
}

module.exports = Updater;
