"use client";

import { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Box, Button } from '@chakra-ui/react';

function WebcamCapture({ onCapture }) {
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc && onCapture) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  return (
    <Box>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={320}
        height={240}
      />
      <Button onClick={capture} mt={4}>
        Capturar
      </Button>
    </Box>
  );
}

export default WebcamCapture;