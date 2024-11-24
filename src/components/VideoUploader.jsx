"use client";

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { invoke } from '@tauri-apps/api/tauri';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { Youtube, Upload, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const translations = {
  en: {
    upload: "Upload from Computer",
    dropzone: "Drop your video here or click to choose from your computer",
    youtube: "YouTube",
    youtubeInput: "or paste a YouTube URL...",
    convertVideo: "CONVERT VIDEO",
    downloading: "Downloading from YouTube...",
    processing: "Processing video...",
    downloadYoutube: "Download from YouTube",
    generateReels: "GENERATE REELS"
  },
  pt: {
    upload: "DO COMPUTADOR",
    dropzone: "Jogue seu vídeo aqui ou clique e escolha diretamente do seu computador",
    youtube: "YOUTUBE",
    youtubeInput: "ou cole uma url do youtube ...",
    convertVideo: "CONVERTER VÍDEO",
    downloading: "Baixando do YouTube...",
    processing: "Processando vídeo...",
    downloadYoutube: "Baixar do YouTube",
    generateReels: "GERAR REELS"
  }
};

export default function VideoUploader({ onVideoSelect, onConvert, language = 'pt', theme = 'dark', onDownloadProgress }) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const { toast } = useToast();

  const t = translations[language];

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // Logar o arquivo recebido para debug
      console.log('Arquivo recebido:', {
        name: file.name,
        path: file.path,
        type: file.type,
        size: file.size
      });

      // Criar objeto com o caminho do arquivo
      const videoFile = {
        path: file.path,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        fromYoutube: false
      };

      onVideoSelect(videoFile);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      onDownloadProgress({
        stage: 'Erro ao processar arquivo',
        progress: 0,
        isLoading: false,
        error: true
      });
    }
  }, [onVideoSelect, onDownloadProgress]);

  // Adicionar função para selecionar arquivo via diálogo
  const handleFileSelect = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Video',
          extensions: ['mp4', 'webm', 'ogg']
        }]
      });

      if (selected) {
        // Criar objeto do vídeo
        const videoFile = {
          path: selected,
          name: selected.split('\\').pop().split('/').pop(),
          type: 'video/mp4',
          url: await convertFileSrc(selected),
          fromYoutube: false
        };

        console.log('Arquivo selecionado:', videoFile);
        onVideoSelect(videoFile);
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.webm', '.ogg'] },
    noClick: true, // Desabilitar clique para usar nosso próprio diálogo
    noKeyboard: true
  });

  const handleYoutubeDownload = async () => {
    if (!youtubeUrl) return;
    setIsLoading(true);

    try {
      // Mostrar progresso do download no preview
      onDownloadProgress({
        stage: 'Baixando vídeo do YouTube...',
        progress: 0,
        isLoading: true
      });

      const videoPath = await invoke('download_youtube', {
        url: youtubeUrl
      });

      console.log('Vídeo baixado:', videoPath);

      // Criar objeto do vídeo baixado
      const file = {
        path: videoPath,
        name: videoPath.split('\\').pop().split('/').pop(),
        type: 'video/mp4',
        url: convertFileSrc(videoPath),
        fromYoutube: true  // Marcar que veio do YouTube
      };

      // Atualizar estado local
      setVideoFile(file);
      
      // Notificar componente pai
      onVideoSelect(file);

      // Atualizar progresso para 100%
      onDownloadProgress({
        stage: 'Download concluído!',
        progress: 100,
        isLoading: false
      });

    } catch (error) {
      console.error('Erro ao baixar vídeo:', error);
      
      // Mostrar erro no toast
      toast({
        title: 'Erro ao baixar vídeo',
        description: error.toString(),
        status: 'error',
        duration: 5000,
        isClosable: true
      });

      // Mostrar erro no preview
      onDownloadProgress({
        stage: 'Erro ao baixar vídeo',
        progress: 0,
        isLoading: false,
        error: true
      });

    } finally {
      setIsLoading(false);
    }
  };

  // Escutar eventos de progresso do YouTube
  useEffect(() => {
    let unsubscribe;

    const setupListener = async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        unsubscribe = await listen('youtube-progress', (event) => {
          const progress = event.payload;
          console.log('Progresso do YouTube:', progress);
          setDownloadProgress(progress);
        });
      } catch (error) {
        console.error('Erro ao configurar listener:', error);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className={cn(
          "text-lg font-semibold uppercase",
          theme === 'dark' ? "text-blue-400" : "text-blue-600"
        )}>{t.upload}</h2>
        
        <div
          {...getRootProps()}
          onClick={handleFileSelect} // Usar nosso próprio handler de clique
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300",
            isDragActive && "border-blue-500 bg-blue-500/10",
            theme === "dark" ? "border-gray-600" : "border-gray-300"
          )}
        >
          <input {...getInputProps()} />
          <Upload className={cn(
            "w-12 h-12 mx-auto mb-4",
            theme === "dark" ? "text-blue-400" : "text-blue-600"
          )} />
          <p className={theme === "dark" ? "text-sm text-gray-400" : "text-sm text-gray-600"}>
            {t.dropzone}
          </p>
        </div>

        <Button 
          className={cn(
            "w-full h-12 transition-all duration-300",
            theme === 'dark'
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          )}
          onClick={onConvert}
          disabled={!videoFile}
        >
          <Video className="w-5 h-5 mr-2" />
          {t.generateReels}
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className={cn(
          "text-lg font-semibold uppercase",
          theme === 'dark' ? "text-blue-400" : "text-blue-600"
        )}>{t.youtube}</h2>
        
        <div className="space-y-4">
          <Input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder={t.youtubeInput}
            className={cn(
              "h-12",
              theme === 'dark' 
                ? "bg-[#1C1F2E] border-none text-white placeholder-gray-500" 
                : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"
            )}
          />
          <Button 
            className={cn(
              "w-full h-12 transition-all duration-300 relative overflow-hidden",
              theme === 'dark'
                ? "bg-red-600 hover:bg-red-700"
                : "bg-red-500 hover:bg-red-600"
            )}
            onClick={handleYoutubeDownload}
            disabled={!youtubeUrl || isLoading}
          >
            {/* Barra de progresso */}
            {isLoading && (
              <motion.div 
                className={cn(
                  "absolute left-0 top-0 h-full opacity-50",
                  theme === 'dark' ? "bg-red-600" : "bg-red-500"
                )}
                initial={{ width: "0%" }}
                animate={{ width: `${downloadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Conteúdo do botão */}
            <div className="relative z-10 flex items-center justify-center text-white">
              {isLoading ? (
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="animate-spin mr-2">⚪</span>
                  {downloadProgress > 0 
                    ? `${Math.round(downloadProgress)}% - ${downloadProgress > 95 ? t.processing : t.downloading}`
                    : t.downloading}
                </motion.div>
              ) : (
                <>
                  <Youtube className="w-5 h-5 mr-2" />
                  {t.downloadYoutube}
                </>
              )}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}