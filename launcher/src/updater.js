const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const semver = require('semver');

class Updater {
  constructor(githubConfig) {
    this.owner = githubConfig.owner;
    this.repo = githubConfig.repo;
    this.branch = githubConfig.branch;
    this.apiUrl = `https://api.github.com/repos/${this.owner}/${this.repo}`;
    this.localVersionFile = path.join(__dirname, '..', 'version.json');
    this.serverDataPath = path.join(__dirname, '..', 'server-data');
  }

  async checkForUpdates() {
    try {
      // Получаем последний коммит с GitHub
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

      // Читаем локальную версию
      let localVersion = 'unknown';
      if (fs.existsSync(this.localVersionFile)) {
        const localData = JSON.parse(fs.readFileSync(this.localVersionFile, 'utf-8'));
        localVersion = localData.version || 'unknown';
      }

      if (remoteVersion !== localVersion) {
        // Проверяем изменения в папках server-data
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
      const changedPaths = commitData.files.map(file => file.filename);
      
      // Фильтруем только нужные папки
      const relevantPaths = changedPaths.filter(path => 
        path.startsWith('server-data/versions/') ||
        path.startsWith('server-data/mods/') ||
        path.startsWith('server-data/resourcepacks/') ||
        path.startsWith('server-data/config/') ||
        path.startsWith('server-data/shaderpacks/') ||
        path.startsWith('server-data/saves/') ||
        path.startsWith('server-data/datapacks/')
      );

      return relevantPaths;
    } catch (error) {
      return [];
    }
  }

  async downloadUpdate(version, progressCallback) {
    try {
      // Скачиваем архив с последним коммитом
      const downloadUrl = `${this.apiUrl}/zipball/${this.branch}`;
      
      progressCallback({ status: 'downloading', progress: 0 });

      const response = await fetch(downloadUrl, {
        headers: { 'User-Agent': 'KamyshLauncher/1.0' }
      });

      if (!response.ok) {
        throw new Error('Не удалось скачать обновление');
      }

      const totalBytes = parseInt(response.headers.get('content-length') || '0');
      let downloadedBytes = 0;

      const tempPath = path.join(__dirname, '..', 'temp-update.zip');
      const fileStream = fs.createWriteStream(tempPath);

      await new Promise((resolve, reject) => {
        response.body.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          const progress = totalBytes > 0 ? (downloadedBytes / totalBytes) * 100 : 0;
          progressCallback({ status: 'downloading', progress: Math.round(progress) });
        });

        response.body.pipe(fileStream);
        response.body.on('error', reject);
        fileStream.on('finish', resolve);
      });

      progressCallback({ status: 'extracting', progress: 100 });

      // Распаковываем архив
      await this.extractUpdate(tempPath);

      // Сохраняем новую версию
      fs.writeFileSync(this.localVersionFile, JSON.stringify({
        version: version,
        lastUpdated: new Date().toISOString()
      }, null, 2));

      // Удаляем временный файл
      fs.unlinkSync(tempPath);

      progressCallback({ status: 'complete', progress: 100 });
      
      return { success: true, version };
    } catch (error) {
      console.error('Ошибка загрузки обновления:', error);
      throw error;
    }
  }

  async extractUpdate(zipPath) {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    const prefix = entries[0].entryName.split('/')[0] + '/';

    // Извлекаем только файлы из server-data
    for (const entry of entries) {
      if (entry.entryName.startsWith(prefix + 'server-data/')) {
        const relativePath = entry.entryName.substring(prefix.length);
        const targetPath = path.join(__dirname, '..', relativePath);

        if (entry.isDirectory) {
          if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
          }
        } else {
          const dir = path.dirname(targetPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(targetPath, entry.getData());
        }
      }
    }
  }
}

module.exports = Updater;
