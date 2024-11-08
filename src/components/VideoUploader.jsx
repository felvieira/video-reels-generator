"use client";

import { useCallback, useState } from 'react';
import { Box, Button, Input, Text, VStack, useColorModeValue, useToast } from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';

function VideoUploader({ onVideoSelect }) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const toast = useToast();

  const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('video/')) {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O arquivo deve ter no máximo 2GB',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
        return;
      }
      onVideoSelect(file);
    }
  }, [onVideoSelect]);

  const handleYoutubeDownload = async () => {
    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao baixar vídeo');
      }

      // Criar um blob do stream
      const blob = await response.blob();
      
      // Criar um arquivo a partir do blob
      const file = new File([blob], 'youtube-video.mp4', { type: 'video/mp4' });
      
      // Chamar o callback com o arquivo
      onVideoSelect(file);

    } catch (error) {
      console.error('YouTube download error:', error);
      toast({
        title: 'Erro ao baixar vídeo',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.webm', '.ogg'] },
    multiple: false
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
      >
        <input {...getInputProps()} />
        <Text textAlign="center">
          {isDragActive
            ? 'Solte o vídeo aqui...'
            : 'Arraste um vídeo ou clique para selecionar'}
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