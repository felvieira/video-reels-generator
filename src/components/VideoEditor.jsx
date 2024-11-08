"use client";

import { useState, useEffect, useRef } from 'react';
import { Box, Button, VStack, HStack, Progress, Text, useToast, Tabs, TabList, TabPanels, Tab, TabPanel, Heading } from '@chakra-ui/react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import LLMConfig from './LLMConfig';
import SocialMediaResults from './SocialMediaResults';
import { SOCIAL_MEDIA_PROMPT } from '../utils/prompts';

function VideoEditor({ videoFile }) {
  const [ffmpeg] = useState(() => new FFmpeg());
  const [isReady, setIsReady] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [transcription, setTranscription] = useState('');
  const [llmProvider, setLlmProvider] = useState('openai');
  const [llmModel, setLlmModel] = useState('gpt-3.5-turbo');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const toast = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [videoQuality, setVideoQuality] = useState('medium');
  const [debugMode, setDebugMode] = useState(false);
  const [socialMediaResults, setSocialMediaResults] = useState(null);

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoFile]);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        await ffmpeg.load({
          coreURL: '/ffmpeg/ffmpeg-core.js',
          wasmURL: '/ffmpeg/ffmpeg-core.wasm',
          workerURL: '/ffmpeg/ffmpeg-core.worker.js'
        });
        setIsReady(true);
      } catch (error) {
        console.error('Error loading FFmpeg:', error);
      }
    };
    
    loadFFmpeg();
  }, []);

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedConfig = JSON.parse(localStorage.getItem('llmConfig') || '{}');
    
    // Se não tiver configuração salva, criar configuração padrão
    if (!Object.keys(savedConfig).length) {
      const defaultConfig = {
        openai: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          apiKey: ''
        }
      };
      localStorage.setItem('llmConfig', JSON.stringify(defaultConfig));
      setLlmProvider('openai');
      setLlmModel('gpt-3.5-turbo');
    } 
    // Se tiver configuração, usar a configuração salva
    else {
      // Pegar o primeiro provider configurado ou usar openai como fallback
      const firstProvider = Object.keys(savedConfig)[0] || 'openai';
      const config = savedConfig[firstProvider];
      
      if (config) {
        setLlmProvider(config.provider);
        setLlmModel(config.model);
      } else {
        setLlmProvider('openai');
        setLlmModel('gpt-3.5-turbo');
      }
    }
  }, []);

  const getQualitySettings = (quality) => {
    const settings = {
      high: {
        preset: 'slow',
        crf: '18'
      },
      medium: {
        preset: 'medium',
        crf: '23'
      },
      low: {
        preset: 'ultrafast',
        crf: '28'
      }
    };
    return settings[quality];
  };

  const extractFaceAndConvert = async () => {
    // Verificar tamanho do arquivo (2GB em bytes)
    const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
    
    if (videoFile.size > MAX_FILE_SIZE) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 2GB',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    if (!videoFile || !isReady) {
      toast({
        title: 'Erro',
        description: 'Aguarde o FFmpeg carregar ou selecione um vídeo',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }
  
    setProcessing(true);
    setProgress(0);
    try {
      setStage('Lendo arquivo...');
      console.log('Iniciando conversão...');
  
      // Processar o arquivo em chunks
      const CHUNK_SIZE = 1024 * 1024 * 10; // 10MB chunks
      const totalChunks = Math.ceil(videoFile.size / CHUNK_SIZE);
      let processedChunks = 0;
      
      // Criar um array para armazenar todos os chunks
      const chunks = [];
      
      setStage('Carregando arquivo...');
      // Ler o arquivo em chunks
      for (let start = 0; start < videoFile.size; start += CHUNK_SIZE) {
        const chunk = videoFile.slice(start, start + CHUNK_SIZE);
        const arrayBuffer = await chunk.arrayBuffer();
        chunks.push(new Uint8Array(arrayBuffer));
        
        processedChunks++;
        const uploadProgress = (processedChunks / totalChunks) * 30; // Primeiros 30%
        setProgress(uploadProgress);
        console.log(`Processando chunk ${processedChunks}/${totalChunks}`);
      }
  
      // Concatenar todos os chunks
      setStage('Processando arquivo...');
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const videoData = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        videoData.set(chunk, offset);
        offset += chunk.length;
        setProgress(30 + (offset / totalLength) * 10);
      }
  
      console.log('Arquivo carregado, tamanho:', videoData.length);
      
      // Escrever arquivo de entrada
      await ffmpeg.writeFile('input.mp4', videoData);
      setProgress(40);
      console.log('Arquivo escrito no FFmpeg');
  
      setStage('Detectando e extraindo conteúdo...');
      console.log('Extraindo conteúdo...');
      const qualitySettings = getQualitySettings(videoQuality);
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', 'crop=iw*0.66:ih:0:0',
        '-c:v', 'libx264',
        '-preset', qualitySettings.preset,
        '-crf', qualitySettings.crf,
        '-y',
        'content.mp4'
      ]);
      setProgress(60);
  
      setStage('Detectando e extraindo face...');
      console.log('Extraindo face...');
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', 'crop=iw*0.34:ih/2:iw*0.66:ih/2',
        '-c:v', 'libx264',
        '-preset', qualitySettings.preset,
        '-crf', qualitySettings.crf,
        '-y',
        'face.mp4'
      ]);
      setProgress(80);
  
      setStage('Combinando vídeos...');
      console.log('Combinando vídeos...');

      try {
        // Verificar os arquivos antes de começar
        const contentCheck = await ffmpeg.readFile('content.mp4');
        const faceCheck = await ffmpeg.readFile('face.mp4');
        console.log('Arquivos disponíveis para combinar:', {
          content: contentCheck.length,
          face: faceCheck.length
        });

        // Combinar os vídeos em um único comando
        const qualitySettings = getQualitySettings(videoQuality);
        const command = [
          '-i', 'content.mp4',
          '-i', 'face.mp4',
          '-filter_complex',
          '[0:v]scale=1080:1350:force_original_aspect_ratio=decrease,pad=1080:1350:(ow-iw)/2:(oh-ih)/2[v0];' +
          '[1:v]scale=1080:730:force_original_aspect_ratio=decrease,pad=1080:730:(ow-iw)/2:(oh-ih)/2[v1];' +
          '[v0][v1]vstack',
          '-map', '0:a?',
          '-c:v', 'libx264',
          '-preset', qualitySettings.preset,
          '-pix_fmt', 'yuv420p',
          '-crf', qualitySettings.crf,
          '-y',
          'output.mp4'
        ];
        

        console.log('Executando comando final:', command.join(' '));
        await ffmpeg.exec(command);

        // Verificar se output.mp4 foi criado
        const outputData = await ffmpeg.readFile('output.mp4');
        console.log('Tamanho do output.mp4:', outputData.length);

        if (outputData.length === 0) {
          throw new Error('Não foi possível combinar os vídeos');
        }

        // Criar blob e URL para download
        const outputBlob = new Blob([outputData.buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(outputBlob);

        // Download do arquivo final
        const a = document.createElement('a');
        a.href = url;
        a.download = 'video_reels.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Limpar
        URL.revokeObjectURL(url);
        await ffmpeg.deleteFile('content.mp4');
        await ffmpeg.deleteFile('face.mp4');
        await ffmpeg.deleteFile('input.mp4');
        await ffmpeg.deleteFile('output.mp4');

        setProgress(100);
        setStage('Concluído!');
        toast({
          title: 'Vídeo convertido com sucesso',
          status: 'success',
          duration: 5000,
          isClosable: true
        });

      } catch (error) {
        console.error('Erro ao combinar vídeos:', error);
        throw error;
      }
  
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Erro ao processar vídeo',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setProcessing(false);
      setTimeout(() => {
        setProgress(0);
        setStage('');
      }, 3000);
    }
};
  
  const transcribeAudio = async () => {
    if (!videoFile) return;
    
    if (!isReady) {
      toast({
        title: 'FFmpeg não está pronto',
        description: 'Aguarde o FFmpeg carregar completamente',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    const savedConfig = JSON.parse(localStorage.getItem('llmConfig') || '{}');
    const currentConfig = savedConfig[llmProvider];

    if (!currentConfig) {
      toast({
        title: 'Configuração não encontrada',
        description: 'Configure o provedor nas configurações',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    try {
      setProcessing(true);
      setStage('Extraindo áudio...');

      // Primeiro, vamos verificar se o arquivo de vídeo está correto
      console.log('Video file:', videoFile);

      await ffmpeg.writeFile('input.mp4', new Uint8Array(await videoFile.arrayBuffer()));
      
      // Extrair áudio em formato MP3
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vn',                // Remove vídeo
        '-acodec', 'libmp3lame', // Usa codec MP3
        '-ac', '1',          // Mono
        '-ar', '16000',      // Sample rate 16kHz
        '-b:a', '64k',       // Bitrate 64k
        '-f', 'mp3',         // Força formato MP3
        'output.mp3'
      ]);

      const audioData = await ffmpeg.readFile('output.mp3');
      console.log('Audio data size:', audioData.length);

      // Criar arquivo com tipo MIME correto
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      const audioFile = new File([audioBlob], 'audio.mp3', { 
        type: 'audio/mpeg',
        lastModified: new Date().getTime()
      });

      console.log('Audio file:', audioFile);

      setStage('Transcrevendo áudio...');

      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('provider', currentConfig.provider);
      formData.append('model', 'whisper-1'); // Sempre whisper-1 para OpenAI
      formData.append('apiKey', currentConfig.apiKey || '');

      // Log do FormData para debug
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setTranscription(data.transcription);
      
      toast({
        title: 'Transcrição concluída',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: 'Erro na transcrição',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setProcessing(false);
      setStage('');
      
      try {
        await ffmpeg.deleteFile('input.mp4');
        await ffmpeg.deleteFile('output.mp3');
      } catch (e) {
        console.error('Erro ao limpar arquivos temporários:', e);
      }
    }
  };

  const extractHighlight = async () => {
    if (!videoFile || !transcription) return;

    try {
      const response = await fetch('/api/highlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcription,
          provider: llmProvider,
          model: llmModel
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Processar o highlight
      await processHighlight(data.timestamp);
    } catch (error) {
      toast({
        title: 'Erro ao extrair highlight',
        description: error.message,
        status: 'error'
      });
    }
  };

  const generateSocialMediaPosts = async () => {
    if (!transcription) {
      toast({
        title: 'Transcrição necessária',
        description: 'Faça a transcrição do vídeo primeiro',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setProcessing(true);
      setStage('Gerando sugestões para redes sociais...');

      const savedConfig = JSON.parse(localStorage.getItem('llmConfig') || '{}');
      const currentConfig = savedConfig[llmProvider];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: SOCIAL_MEDIA_PROMPT.replace('{{transcription}}', transcription),
          provider: currentConfig.provider,
          model: currentConfig.model,
          apiKey: currentConfig.apiKey
        })
      });

      if (!response.ok) throw new Error('Falha ao gerar sugestões');

      const data = await response.json();
      setSocialMediaResults(JSON.parse(data.content));

      toast({
        title: 'Sugestões geradas com sucesso',
        status: 'success',
        duration: 3000,
      });

    } catch (error) {
      console.error('Error generating social media posts:', error);
      toast({
        title: 'Erro ao gerar sugestões',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setProcessing(false);
      setStage('');
    }
  };

  return (
    <VStack spacing={6} w="full">
      <Tabs w="full">
        <TabList>
          <Tab>Editor</Tab>
          <Tab>Configurações</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={6}>
              <Box w="full" maxW="xl" position="relative">
                {videoFile && (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    style={{ width: '100%' }}
                  />
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </Box>

              <HStack spacing={4} wrap="wrap" justify="center">
                <Button
                  colorScheme="blue"
                  onClick={extractFaceAndConvert}
                  isLoading={processing}
                  isDisabled={!isReady}
                >
                  Converter para Reels
                </Button>
                <Button
                  colorScheme="green"
                  onClick={transcribeAudio}
                  isDisabled={!videoFile || !isReady || processing}
                  isLoading={processing && stage.includes('Transcrevendo')}
                >
                  Transcrever Áudio
                </Button>
                <Button
                  colorScheme="purple"
                  onClick={extractHighlight}
                  isDisabled={!transcription}
                >
                  Extrair Highlight
                </Button>
                <Button
                  colorScheme="teal"
                  onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                >
                  {subtitlesEnabled ? 'Desativar Legendas' : 'Ativar Legendas'}
                </Button>
              </HStack>

              <Box w="full">
                <Text mb={2}>Qualidade do Vídeo:</Text>
                <HStack spacing={4}>
                  <Button
                    size="sm"
                    colorScheme={videoQuality === 'low' ? 'blue' : 'gray'}
                    onClick={() => setVideoQuality('low')}
                  >
                    Baixa (Mais Rápido)
                  </Button>
                  <Button
                    size="sm"
                    colorScheme={videoQuality === 'medium' ? 'blue' : 'gray'}
                    onClick={() => setVideoQuality('medium')}
                  >
                    Média
                  </Button>
                  <Button
                    size="sm"
                    colorScheme={videoQuality === 'high' ? 'blue' : 'gray'}
                    onClick={() => setVideoQuality('high')}
                  >
                    Alta (Mais Lento)
                  </Button>
                </HStack>
              </Box>

              <Box w="full">
                <Button
                  size="sm"
                  colorScheme={debugMode ? 'orange' : 'gray'}
                  onClick={() => setDebugMode(!debugMode)}
                >
                  {debugMode ? 'Modo Debug: Ativado' : 'Modo Debug: Desativado'}
                </Button>
              </Box>

              {processing && (
                <VStack w="full" spacing={2}>
                  <Progress 
                    size="sm" 
                    value={progress} 
                    w="full" 
                    colorScheme="blue"
                    hasStripe
                    isAnimated
                  />
                  <Text fontSize="sm" color="gray.600">
                    {stage} ({Math.round(progress)}%)
                  </Text>
                </VStack>
              )}
              
              {transcription && (
                <Box w="full" p={4} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold">Transcrição:</Text>
                  <Text>{transcription}</Text>
                </Box>
              )}
            </VStack>
          </TabPanel>

          <TabPanel>
            <LLMConfig
              provider={llmProvider}
              model={llmModel}
              onProviderChange={setLlmProvider}
              onModelChange={setLlmModel}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <HStack spacing={4}>
        <Button
          colorScheme="green"
          onClick={transcribeAudio}
          isDisabled={!videoFile || !isReady || processing}
          isLoading={processing && stage.includes('Transcrevendo')}
        >
          Transcrever Áudio
        </Button>

        <Button
          colorScheme="pink"
          onClick={generateSocialMediaPosts}
          isDisabled={!transcription || processing}
          isLoading={processing && stage.includes('Gerando sugestões')}
        >
          Preparar Posts para Redes Sociais
        </Button>
      </HStack>

      {transcription && (
        <Box w="full" p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="bold">Transcrição:</Text>
          <Text>{transcription}</Text>
        </Box>
      )}

      {socialMediaResults && (
        <Box mt={6} w="full">
          <Heading size="md" mb={4}>Sugestões para Redes Sociais</Heading>
          <SocialMediaResults results={socialMediaResults} />
        </Box>
      )}
    </VStack>
  );
}

function generateSRT(transcription) {
  // Dividir o texto em segmentos de aproximadamente 7 palavras
  const words = transcription.split(' ');
  const segments = [];
  let currentSegment = [];
  let index = 1;
  let timeOffset = 0;

  for (const word of words) {
    currentSegment.push(word);
    if (currentSegment.length >= 7) {
      const duration = 3; // 3 segundos por segmento
      const startTime = formatSRTTime(timeOffset);
      timeOffset += duration;
      const endTime = formatSRTTime(timeOffset);

      segments.push(`${index}\n${startTime} --> ${endTime}\n${currentSegment.join(' ')}\n\n`);
      currentSegment = [];
      index++;
    }
  }

  if (currentSegment.length > 0) {
    const duration = 3;
    const startTime = formatSRTTime(timeOffset);
    timeOffset += duration;
    const endTime = formatSRTTime(timeOffset);
    segments.push(`${index}\n${startTime} --> ${endTime}\n${currentSegment.join(' ')}\n\n`);
  }

  return segments.join('');
}

function formatSRTTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

export default VideoEditor;