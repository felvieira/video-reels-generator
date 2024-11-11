"use client";

import { useCallback, useState } from 'react';
import { Box, Button, Input, Text, VStack, useColorModeValue, useToast } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { invoke } from '@tauri-apps/api/tauri';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';

function VideoUploader({ onVideoSelect }) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const toast = useToast();

  const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

  
  const handleFileSelect = async () => {
    try {
      // Abrir diálogo nativo de seleção de arquivo
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Video',
          extensions: ['mp4', 'webm', 'ogg']
        }]
      });

      if (!selected) return; // Usuário cancelou

      console.log('Arquivo selecionado:', selected);

      // Criar objeto de arquivo com o caminho absoluto
      const videoFile = {
        path: selected,
        name: selected.split('\\').pop().split('/').pop(),
        type: 'video/mp4',
        url: convertFileSrc(selected)
      };

      console.log('Objeto do vídeo:', videoFile);

      // Verificar se o arquivo existe
      const exists = await invoke('check_file_exists', { path: selected });
      if (!exists) {
        throw new Error('Arquivo não encontrado');
      }

      onVideoSelect(videoFile);

    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
      toast({
        title: 'Erro ao selecionar arquivo',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleYoutubeDownload = async () => {
    if (!youtubeUrl) return;

    try {
      // Chamar a função Rust para download do YouTube
      const videoPath = await invoke('download_youtube', {
        url: youtubeUrl
      });

      console.log('Vídeo baixado:', videoPath);

      // Criar objeto de arquivo com o caminho do vídeo baixado
      const videoFile = {
        path: videoPath,
        name: videoPath.split('\\').pop().split('/').pop(),
        type: 'video/mp4',
        url: convertFileSrc(videoPath)
      };

      onVideoSelect(videoFile);

      toast({
        title: 'Download concluído',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

    } catch (error) {
      console.error('Erro ao baixar vídeo:', error);
      toast({
        title: 'Erro ao baixar vídeo',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileSelect,
    noClick: true, // Desabilitar clique para usar nosso próprio botão
    noKeyboard: true,
    accept: { 'video/*': ['.mp4', '.webm', '.ogg'] }
  });

  const bgColor = useColorModeValue('white', 'gray.700');

  return (
    <VStack spacing={6} w="full" maxW="xl" mx="auto">
      <Box
        {...getRootProps()}
        p={6}
        bg={bgColor}
        borderRadius="lg"
        borderWidth={2}
        borderStyle="dashed"
        cursor="pointer"
        w="full"
        onClick={handleFileSelect}  // Usar nosso próprio handler
      >
        <Text textAlign="center">
          {isDragActive
            ? 'Solte o vídeo aqui...'
            : 'Clique para selecionar um vídeo'}
        </Text>
      </Box>

      <Box w="full">
        <Input
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="Cole a URL do YouTube"
          mb={2}
        />
        <Button
          onClick={handleYoutubeDownload}
          colorScheme="red"
          w="full"
          isDisabled={!youtubeUrl}
        >
          Baixar do YouTube
        </Button>
      </Box>
    </VStack>
  );
}

export default VideoUploader;