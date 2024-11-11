"use client";

import { useState, useEffect, useRef } from 'react';
import { Box, Button, VStack, HStack, Progress, Text, useToast, Tabs, TabList, TabPanels, Tab, TabPanel, Heading } from '@chakra-ui/react';
import LLMConfig from './LLMConfig';
import SocialMediaResults from './SocialMediaResults';
import { SOCIAL_MEDIA_PROMPT } from '../utils/prompts';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';

function VideoEditor({ videoFile }) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [transcription, setTranscription] = useState('');
  const [llmProvider, setLlmProvider] = useState('openai');
  const [llmModel, setLlmModel] = useState('gpt-3.5-turbo');
  const [videoQuality, setVideoQuality] = useState('medium');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const toast = useToast();
  const [videoUrl, setVideoUrl] = useState('');
  const [debugMode, setDebugMode] = useState(false);
  const [socialMediaResults, setSocialMediaResults] = useState(null);

  useEffect(() => {
    if (videoFile && videoFile.url) {
      setVideoUrl(videoFile.url);
    }
  }, [videoFile]);

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
    if (!videoFile) return;

    try {
      setProcessing(true);
      setProgress(0);

      console.log('Arquivo de vídeo:', videoFile);
      console.log('Caminho do arquivo:', videoFile.path);
      console.log('Qualidade selecionada:', videoQuality);

      // Chamar a função Rust via Tauri
      const outputPath = await invoke('convert_to_reels', {
        inputPath: videoFile.path,
        quality: videoQuality
      });

      console.log('Caminho de saída:', outputPath);

      toast({
        title: 'Vídeo convertido com sucesso',
        description: `Salvo em: ${outputPath}`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });

    } catch (error) {
      console.error('Erro detalhado:', error);
      
      // Não mostrar toast de erro se for cancelamento
      if (!error.toString().includes('cancelada pelo usuário')) {
        toast({
          title: 'Erro ao processar vídeo',
          description: error.toString(),
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
    } finally {
      setProcessing(false);
      setProgress(0);
      setStage('');
    }
  };

  // Escutar eventos de progresso do Rust
  useEffect(() => {
    const unsubscribe = listen('conversion-progress', (event) => {
      const { stage, progress } = event.payload;
      setStage(stage);
      setProgress(progress);
    });

    return () => {
      unsubscribe.then(fn => fn());
    };
  }, []);

  const transcribeAudio = async () => {
    if (!videoFile) return;

    try {
      setProcessing(true);
      setStage('Extraindo áudio...');

      // Usar Tauri/Rust para extrair o áudio
      const audioPath = await invoke('extract_audio', {
        inputPath: videoFile.path
      });

      setStage('Transcrevendo áudio...');

      const savedConfig = JSON.parse(localStorage.getItem('llmConfig') || '{}');
      const currentConfig = savedConfig[llmProvider];

      const formData = new FormData();
      formData.append('audio', audioPath);
      formData.append('provider', currentConfig.provider);
      formData.append('model', 'whisper-1');
      formData.append('apiKey', currentConfig.apiKey || '');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
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
                {videoFile && videoUrl && (
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
                  isDisabled={processing}
                >
                  Converter para Reels
                </Button>
                <Button
                  colorScheme="green"
                  onClick={transcribeAudio}
                  isDisabled={!videoFile || processing}
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
                    Baixa (Mais Rpido)
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
          isDisabled={!videoFile || processing}
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