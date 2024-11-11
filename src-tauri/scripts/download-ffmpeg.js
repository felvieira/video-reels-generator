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

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      },
      followRedirect: true
    }, response => {
      if (response.statusCode === 302 || response.statusCode === 303) {
        downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
        return;
      }

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      const file = fs.createWriteStream(destPath);
      
      response.pipe(file);

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const percent = ((downloadedSize / totalSize) * 100).toFixed(2);
        process.stdout.write(`Progresso: ${percent}% (${downloadedSize}/${totalSize} bytes)\r`);
      });

      file.on('finish', () => {
        file.close(() => {
          if (fs.statSync(destPath).size === 0) {
            reject(new Error('Downloaded file is empty'));
            return;
          }
          console.log('\nDownload completado!');
          resolve();
        });
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
    // Criar diretório resources se não existir
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

    console.log(`Downloading FFmpeg for ${platform}...`);
    await downloadFile(ffmpegUrl, zipPath);

    console.log('Extracting FFmpeg...');
    const zip = new AdmZip(zipPath);
    
    // Procurar o executável do FFmpeg no arquivo zip
    const ffmpegEntry = zip.getEntries().find(entry => {
      return entry.entryName.toLowerCase().includes('bin/ffmpeg.exe');
    });

    if (!ffmpegEntry) {
      throw new Error('FFmpeg executable not found in archive');
    }

    console.log('Found FFmpeg at:', ffmpegEntry.entryName);

    // Extrair para um diretório temporário primeiro
    const tempDir = path.join(RESOURCES_DIR, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Extrair o arquivo
    zip.extractEntryTo(ffmpegEntry.entryName, tempDir, false, true);

    // Caminho completo do arquivo extraído
    const extractedPath = path.join(tempDir, path.basename(ffmpegEntry.entryName));
    
    console.log('Moving FFmpeg...');
    console.log('From:', extractedPath);
    console.log('To:', finalPath);

    // Remover arquivo existente se houver
    if (fs.existsSync(finalPath)) {
      fs.unlinkSync(finalPath);
    }

    // Mover o arquivo
    fs.renameSync(extractedPath, finalPath);

    // Limpar arquivos temporários
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.unlinkSync(zipPath);

    // Dar permissão de execução no Unix
    if (platform !== 'win32') {
      fs.chmodSync(finalPath, '755');
    }

    // Verificar se o arquivo existe no destino final
    if (!fs.existsSync(finalPath)) {
      throw new Error('FFmpeg file not found after extraction');
    }

    console.log('FFmpeg downloaded and extracted successfully!');
    console.log('Final FFmpeg path:', finalPath);
    console.log('File exists:', fs.existsSync(finalPath));
    console.log('File size:', fs.statSync(finalPath).size);

  } catch (error) {
    console.error('Error downloading FFmpeg:', error);
    process.exit(1);
  }
}

downloadFFmpeg();