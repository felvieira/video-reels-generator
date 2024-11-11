import { useState } from 'react';
import { ChakraProvider, Box, VStack, Heading } from '@chakra-ui/react';
import VideoUploader from './components/VideoUploader';
import VideoEditor from './components/VideoEditor';

function App() {
  const [videoFile, setVideoFile] = useState(null);

  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50" py={8}>
        <VStack spacing={8} w="full" maxW="container.xl" mx="auto" px={4}>
          <Heading>Video Editor para Reels</Heading>
          
          {!videoFile ? (
            <VideoUploader onVideoSelect={setVideoFile} />
          ) : (
            <VideoEditor videoFile={videoFile} />
          )}
        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;