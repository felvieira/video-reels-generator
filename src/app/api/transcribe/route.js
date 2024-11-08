import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import os from 'os';

// Função para transcrever usando OpenAI
async function transcribeWithOpenAI(audioFile, apiKey) {
  const openai = new OpenAI({ apiKey });
  
  try {
    // Criar um arquivo temporário
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, 'temp-audio.mp3');
    
    // Converter o arquivo para buffer e salvar
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(tempFilePath, buffer);
    
    // Criar ReadStream e enviar para OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: 'whisper-1',
      response_format: 'text'
    });
    
    // Limpar arquivo temporário
    fs.unlinkSync(tempFilePath);
    
    return transcription;
  } catch (error) {
    console.error('OpenAI transcription error:', error);
    throw error;
  }
}

// Função para transcrever usando Ollama
async function transcribeWithOllama(audioFile, model) {
  const response = await axios.post('http://localhost:11434/api/audio', {
    model: model,
    audio: audioFile
  });
  return response.data.text;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    const provider = formData.get('provider');
    const model = formData.get('model');
    const apiKey = formData.get('apiKey');

    if (!audioFile) {
      throw new Error('Arquivo de áudio não fornecido');
    }

    let transcription;

    switch (provider) {
      case 'openai':
        if (!apiKey) throw new Error('API Key da OpenAI não configurada');
        transcription = await transcribeWithOpenAI(audioFile, apiKey);
        break;

      case 'ollama':
        transcription = await transcribeWithOllama(audioFile, model);
        break;

      default:
        throw new Error('Provider não suportado para transcrição');
    }

    return NextResponse.json({ transcription });

  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro na transcrição' },
      { status: 500 }
    );
  }
} 