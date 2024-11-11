"use client";

import { useState } from 'react';
import { Box, Container, Heading } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import VideoUploader from '../components/VideoUploader';

// Carregamento dinâmico do VideoEditor com SSR desabilitado
const VideoEditor = dynamic(() => import('../components/VideoEditor'), {
  ssr: false,
  loading: () => (
    <Box p={4} textAlign="center">
      Carregando editor...
    </Box>
  )
});

export default function Home() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  return (
    <Container maxW="container.xl" py={8}>
      <Box textAlign="center" mb={8}>
        <Heading>Video Editor para Reels</Heading>
      </Box>
      
      {!selectedVideo ? (
        <VideoUploader onVideoSelect={setSelectedVideo} />
      ) : (
        <VideoEditor videoFile={selectedVideo} />
      )}
    </Container>
  );
}