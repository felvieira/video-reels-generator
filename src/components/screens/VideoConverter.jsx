import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import VideoUploader from '@/components/VideoUploader';
import { 
  Instagram, 
  Share2, 
  Youtube as YoutubeIcon,
  Gauge,
  Zap,
  Star,
  Download,
  Loader2,
  ArrowDown,
  Check,
  Video
} from 'lucide-react';

const translations = {
  en: {
    format: "CHOOSE FORMAT",
    quality: "QUALITY",
    downloadSeparate: "DOWNLOAD SEPARATE CONTENT",
    yes: "YES",
    no: "NO",
    generateReels: "GENERATE REELS",
    previewVideo: "Video preview will appear here",
    processingStatus: "Processing status will appear here",
    conversionComplete: "Conversion complete!",
    downloadVideo: "Download Converted Video"
  },
  pt: {
    format: "ESCOLHA O FORMATO",
    quality: "QUALIDADE",
    downloadSeparate: "BAIXAR CONTEÚDO SEPARADO",
    yes: "SIM",
    no: "NÃO",
    generateReels: "GERAR REELS",
    previewVideo: "Preview do vídeo aparecerá aqui",
    processingStatus: "Status do processamento aparecerá aqui",
    conversionComplete: "Conversão concluída!",
    downloadVideo: "Baixar Vídeo Convertido"
  }
};

export default function VideoConverter({ theme, language }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isYoutubeVideo, setIsYoutubeVideo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionComplete, setConversionComplete] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("reels");
  const [quality, setQuality] = useState("media");
  const [downloadSeparate, setDownloadSeparate] = useState("nao");
  const [downloadStatus, setDownloadStatus] = useState({
    stage: '',
    progress: 0,
    isLoading: false,
    error: false
  });
  const [outputPath, setOutputPath] = useState(null);

  const t = translations[language];

  const formats = [
    {
      value: "reels",
      label: "INSTAGRAM REELS",
      res: "1080x1920",
      icon: Instagram,
    },
    { value: "tiktok", label: "TIKTOK", res: "1080x1920", icon: Share2 },
    { value: "shorts", label: "SHORTS", res: "1080x1920", icon: YoutubeIcon },
  ];

  const qualities = [
    {
      value: "baixa",
      label: language === "en" ? "LOW" : "BAIXA",
      icon: Gauge,
    },
    {
      value: "media",
      label: language === "en" ? "MEDIUM" : "MÉDIA",
      icon: Zap,
    },
    {
      value: "alta",
      label: language === "en" ? "HIGH" : "ALTA",
      icon: Star,
    },
  ];

  useEffect(() => {
    if (!window.__TAURI__) return;

    const setupListener = async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event');
        const unsubscribe = await listen('conversion-progress', (event) => {
          const { stage, progress } = event.payload;
          console.log('Progresso da conversão:', stage, progress);
          setConversionProgress(progress);
          setDownloadStatus({
            stage: stage,
            progress: progress,
            isLoading: true
          });
        });

        return () => {
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao configurar listener:', error);
      }
    };

    setupListener();
  }, []);

  const handleConvert = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setConversionProgress(0);

    try {
      const { invoke } = await import('@tauri-apps/api/tauri');
      
      // Atualizar status inicial
      setDownloadStatus({
        stage: 'Iniciando conversão...',
        progress: 0,
        isLoading: true
      });

      console.log('Convertendo arquivo:', videoFile.path); // Debug

      const outputPath = await invoke('convert_to_reels', {
        inputPath: videoFile.path, // Usar o path diretamente
        quality: quality
      });

      console.log('Caminho de saída:', outputPath);
      setConversionComplete(true);

      // Atualizar status final
      setDownloadStatus({
        stage: 'Conversão concluída!',
        progress: 100,
        isLoading: false
      });

      // Salvar o outputPath para usar no download
      setOutputPath(outputPath);

    } catch (error) {
      console.error('Erro ao processar vídeo:', error);
      
      setDownloadStatus({
        stage: 'Erro ao converter vídeo',
        progress: 0,
        isLoading: false,
        error: true
      });

    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveVideo = async () => {
    try {
      const { save } = await import('@tauri-apps/api/dialog');
      const { invoke } = await import('@tauri-apps/api/tauri');

      // Abrir diálogo para salvar arquivo
      const savePath = await save({
        filters: [{
          name: 'Video',
          extensions: ['mp4']
        }],
        defaultPath: 'video_convertido.mp4'
      });

      if (savePath) {
        // Copiar o arquivo convertido para o local escolhido
        await invoke('save_converted_video', {
          sourcePath: outputPath,
          destinationPath: savePath
        });

        toast({
          title: 'Vídeo salvo com sucesso!',
          status: 'success',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
      toast({
        title: 'Erro ao salvar vídeo',
        description: error.toString(),
        status: 'error',
        duration: 5000
      });
    }
  };

  return (
    <div className="grid grid-cols-[400px_1fr_400px] gap-6">
      {/* Left Panel - Upload/Preview */}
      <Card className={theme === "dark" ? "bg-[#141625]/80 border-none backdrop-blur-sm" : "bg-white"}>
        <CardContent className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {videoUrl ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <motion.video
                  key="video"
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg"
                />
                <Button
                  variant="outline"
                  className={cn(
                    "w-full transition-all duration-300",
                    theme === "dark"
                      ? "bg-[#1C1F2E] hover:bg-[#252942] border-none"
                      : "bg-gray-100 hover:bg-gray-200"
                  )}
                  onClick={() => {
                    setVideoFile(null);
                    setVideoUrl(null);
                    setIsYoutubeVideo(false);
                  }}
                >
                  Cancelar
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <VideoUploader 
                  onVideoSelect={(file) => {
                    setVideoFile(file);
                    setVideoUrl(file.url);
                    setIsYoutubeVideo(file.fromYoutube);
                  }}
                  onConvert={handleConvert}
                  language={language}
                  theme={theme}
                  onDownloadProgress={setDownloadStatus}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Center Panel - Options */}
      <Card className={theme === "dark" ? "bg-[#141625]/80 border-none backdrop-blur-sm" : "bg-white"}>
        <CardContent className="p-6">
          <motion.div
            className="space-y-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className={cn(
              "text-sm font-medium uppercase",
              selectedFormat
                ? theme === "dark"
                  ? "text-blue-400"
                  : "text-blue-600"
                : theme === "dark"
                ? "text-gray-400"
                : "text-gray-600"
            )}>
              {t.format}
            </h3>
            <RadioGroup
              value={selectedFormat}
              onValueChange={setSelectedFormat}
              className="grid grid-cols-2 gap-4"
            >
              {formats.map((format) => (
                <Label
                  key={format.value}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-300",
                    theme === "dark"
                      ? "bg-[#1C1F2E] hover:bg-[#252942]"
                      : "bg-gray-100 hover:bg-gray-200",
                    selectedFormat === format.value &&
                      (theme === "dark"
                        ? "ring-2 ring-blue-500"
                        : "ring-2 ring-blue-400")
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <format.icon
                      className={cn(
                        "w-6 h-6",
                        selectedFormat === format.value
                          ? theme === "dark"
                            ? "text-blue-400"
                            : "text-blue-600"
                          : theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      )}
                    />
                    <div className="space-y-1">
                      <div className={cn(
                        "font-medium",
                        selectedFormat === format.value
                          ? theme === "dark"
                            ? "text-white"
                            : "text-gray-900"
                          : theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      )}>
                        {format.label}
                      </div>
                      <div className={theme === "dark" ? "text-xs text-gray-400" : "text-xs text-gray-500"}>
                        {format.res}
                      </div>
                    </div>
                  </div>
                  <RadioGroupItem value={format.value} className={theme === "dark" ? "text-blue-500" : "text-blue-600"} />
                </Label>
              ))}
            </RadioGroup>
          </motion.div>

          <motion.div
            className="space-y-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className={cn(
              "text-sm font-medium uppercase",
              quality
                ? theme === "dark"
                  ? "text-blue-400"
                  : "text-blue-600"
                : theme === "dark"
                ? "text-gray-400"
                : "text-gray-600"
            )}>
              {t.quality}
            </h3>
            <RadioGroup
              value={quality}
              onValueChange={setQuality}
              className="flex gap-4"
            >
              {qualities.map((q) => (
                <Label
                  key={q.value}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-4 rounded-lg cursor-pointer transition-all duration-300",
                    theme === "dark"
                      ? "bg-[#1C1F2E] hover:bg-[#252942]"
                      : "bg-gray-100 hover:bg-gray-200",
                    quality === q.value &&
                      (theme === "dark"
                        ? "ring-2 ring-blue-500"
                        : "ring-2 ring-blue-400")
                  )}
                >
                  <q.icon
                    className={cn(
                      "w-5 h-5",
                      quality === q.value
                        ? theme === "dark"
                          ? "text-blue-400"
                          : "text-blue-600"
                        : theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    )}
                  />
                  <RadioGroupItem value={q.value} className="hidden" />
                  <span className={cn(
                    quality === q.value
                      ? theme === "dark"
                        ? "text-white"
                        : "text-gray-900"
                      : theme === "dark"
                      ? "text-gray-400"
                      : "text-gray-600"
                  )}>
                    {q.label}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </motion.div>

          <motion.div
            className="space-y-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className={cn(
              "text-sm font-medium uppercase",
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            )}>
              {t.downloadSeparate}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "sim", label: t.yes },
                { value: "nao", label: t.no },
              ].map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={cn(
                    "h-12 transition-all duration-300",
                    theme === "dark"
                      ? "bg-[#1C1F2E] border-none hover:bg-[#252942]"
                      : "bg-gray-100 hover:bg-gray-200",
                    downloadSeparate === option.value &&
                      (theme === "dark"
                        ? "ring-2 ring-blue-500"
                        : "ring-2 ring-blue-400")
                  )}
                  onClick={() => setDownloadSeparate(option.value)}
                >
                  <span
                    className={cn(
                      "mr-2",
                      downloadSeparate === option.value
                        ? theme === "dark"
                          ? "text-blue-500"
                          : "text-blue-600"
                        : theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    )}
                  >
                    {downloadSeparate === option.value ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </span>
                  <span
                    className={cn(
                      downloadSeparate === option.value
                        ? theme === "dark"
                          ? "text-white"
                          : "text-gray-900"
                        : theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-600"
                    )}
                  >
                    {option.label}
                  </span>
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Adicionar botão de converter após as opções */}
          <motion.div
            className="space-y-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button 
              className={cn(
                "w-full h-12 transition-all duration-300",
                theme === "dark"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              )}
              onClick={handleConvert}
              disabled={!videoFile || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t.converting}
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 mr-2" />
                  {t.generateReels}
                </>
              )}
            </Button>
          </motion.div>
        </CardContent>
      </Card>

      {/* Right Panel - Processing */}
      <Card className={theme === "dark" ? "bg-[#141625]/80 border-none backdrop-blur-sm" : "bg-white"}>
        <CardContent className="p-6">
          <AnimatePresence>
            {isProcessing ? (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <div className={cn(
                  "flex items-center justify-center aspect-square rounded-lg",
                  theme === "dark"
                    ? "bg-gradient-to-br from-blue-500/20 to-purple-600/20"
                    : "bg-gradient-to-br from-blue-100 to-purple-100"
                )}>
                  <div className="text-center">
                    <Loader2 className={cn(
                      "w-16 h-16 mx-auto mb-4 animate-spin",
                      theme === "dark" ? "text-blue-500" : "text-blue-600"
                    )} />
                    <p className={cn(
                      "text-lg font-semibold",
                      theme === "dark" ? "text-blue-400" : "text-blue-600"
                    )}>
                      {downloadStatus.stage || "Gerando VIDEO ..."}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Progress value={conversionProgress} className="w-full" />
                  <p className={theme === "dark" ? "text-sm text-gray-400" : "text-sm text-gray-600"}>
                    Progresso: {conversionProgress}%
                  </p>
                </div>
              </motion.div>
            ) : conversionComplete ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className={theme === "dark" ? "text-lg font-semibold text-green-400" : "text-lg font-semibold text-green-600"}>
                  {t.conversionComplete}
                </h3>
                <Button
                  className={cn(
                    "w-full transition-all duration-300",
                    theme === "dark"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-green-500 hover:bg-green-600"
                  )}
                  onClick={handleSaveVideo}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {t.downloadVideo}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                className={cn(
                  "flex items-center justify-center aspect-square rounded-lg",
                  theme === "dark"
                    ? "bg-gradient-to-br from-blue-500/10 to-purple-600/10"
                    : "bg-gradient-to-br from-blue-50 to-purple-50"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className={theme === "dark" ? "text-gray-400 text-lg" : "text-gray-600 text-lg"}>
                  {t.processingStatus}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
} 