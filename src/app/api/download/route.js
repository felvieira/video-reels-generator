import { NextResponse } from 'next/server';
import youtubeDl from 'youtube-dl-exec';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const { url } = await req.json();
    
    // Criar diretório temporário se não existir
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Nome do arquivo temporário
    const outputPath = path.join(tempDir, 'video.mp4');

    // Usar o caminho correto do yt-dlp instalado no container
    await youtubeDl(url, {
      output: outputPath,
      format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
      noCheckCertificates: true,
      preferFreeFormats: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
      binaryPath: '/usr/local/bin/yt-dlp' // Caminho correto do yt-dlp no container
    });

    // Ler o arquivo
    const videoBuffer = fs.readFileSync(outputPath);

    // Limpar arquivo temporário
    fs.unlinkSync(outputPath);

    // Configurar headers
    const headers = {
      'Content-Type': 'video/mp4',
      'Content-Disposition': 'attachment; filename="video.mp4"',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Retornar o vídeo como stream
    return new Response(videoBuffer, { headers });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ 
      error: error.message || 'Erro ao baixar vídeo' 
    }, { status: 500 });
  } finally {
    // Garantir que o diretório temporário seja limpo
    const tempDir = path.join(process.cwd(), 'temp');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}