const https = require('https');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const RESOURCES_DIR = path.join(__dirname, '..', 'resources');

const FFMPEG_URLS = {
  win32: 'https://github.com/GyanD/codexffmpeg/releases/download/6.1.1/ffmpeg-6.1.1-full_build.zip',
  darwin: 'https://evermeet.cx/ffmpeg/getrelease/zip',
  linux: 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz'
};

const YT_DLP_URL = 'https://github.com/yt-dlp/yt-dlp/releases/download/2023.12.30/yt-dlp.exe';

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    }, response => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      const file = fs.createWriteStream(destPath);
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      response.pipe(file);

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const percent = ((downloadedSize / totalSize) * 100).toFixed(2);
        process.stdout.write(`Progresso: ${percent}% (${downloadedSize}/${totalSize} bytes)\r`);
      });

      file.on('finish', () => {
        file.close();
        console.log('\nDownload completado!');
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(destPath, () => reject(err));
      });
    });

    request.on('error', (err) => reject(err));
  });
}

async function downloadFFmpeg() {
  try {
    if (!fs.existsSync(RESOURCES_DIR)) {
      fs.mkdirSync(RESOURCES_DIR, { recursive: true });
    }

    const platform = process.platform;
    const ffmpegUrl = FFMPEG_URLS[platform];
    
    if (!ffmpegUrl) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const finalPath = path.join(RESOURCES_DIR, platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
    const zipPath = path.join(RESOURCES_DIR, 'ffmpeg.zip');

    // Verificar se o FFmpeg já existe
    if (fs.existsSync(finalPath)) {
      console.log('FFmpeg já existe, pulando download...');
      return;
    }

    console.log(`Baixando FFmpeg para ${platform}...`);
    await downloadFile(ffmpegUrl, zipPath);

    console.log('Extraindo FFmpeg...');
    const zip = new AdmZip(zipPath);
    const ffmpegEntry = zip.getEntries().find(entry => {
      return entry.entryName.toLowerCase().includes('bin/ffmpeg.exe');
    });

    if (!ffmpegEntry) {
      throw new Error('FFmpeg executable not found in archive');
    }

    console.log('Found FFmpeg at:', ffmpegEntry.entryName);
    zip.extractEntryTo(ffmpegEntry.entryName, RESOURCES_DIR, false, true);

    console.log('Moving FFmpeg to final location...');
    const extractedPath = path.join(RESOURCES_DIR, path.basename(ffmpegEntry.entryName));
    
    console.log('From:', extractedPath);
    console.log('To:', finalPath);

    if (fs.existsSync(finalPath)) {
      fs.unlinkSync(finalPath);
    }

    fs.renameSync(extractedPath, finalPath);
    fs.unlinkSync(zipPath);

    if (platform !== 'win32') {
      fs.chmodSync(finalPath, '755');
    }

    console.log('FFmpeg instalado com sucesso!');

  } catch (error) {
    console.error('Erro ao baixar FFmpeg:', error);
    process.exit(1);
  }
}

async function downloadYtDlp() {
  try {
    const ytDlpPath = path.join(RESOURCES_DIR, 'yt-dlp.exe');

    // Verificar se o yt-dlp já existe
    if (fs.existsSync(ytDlpPath)) {
      console.log('yt-dlp já existe, pulando download...');
      return;
    }

    console.log('Baixando yt-dlp...');
    await downloadFile(YT_DLP_URL, ytDlpPath);

    if (process.platform !== 'win32') {
      fs.chmodSync(ytDlpPath, '755');
    }

    console.log('yt-dlp instalado com sucesso em:', ytDlpPath);

  } catch (error) {
    console.error('Erro ao baixar yt-dlp:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    await downloadFFmpeg();
    await downloadYtDlp();
    console.log('Todos os downloads concluídos com sucesso!');
  } catch (error) {
    console.error('Erro durante os downloads:', error);
    process.exit(1);
  }
}

main();