import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import VideoUploader from '@/components/VideoUploader';
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText,
  Loader2,
  Download,
  ArrowDown,
  Linkedin,
  Instagram,
  Share2,
  Facebook,
  YoutubeIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import TranscriptionOptions from '@/components/TranscriptionOptions';

const translations = {
  en: {
    title: "Video Transcription",
    transcribing: "Transcribing video...",
    previewVideo: "Video preview will appear here",
    processingStatus: "Processing status will appear here",
    transcriptionComplete: "Transcription complete!",
    downloadTranscription: "Download Transcription",
    downloadSRT: "Download SRT File",
    transcriptionPreview: "Transcription preview will appear here",
    contentType: "Content Type",
    generateText: "Generate Text",
    generateHashtags: "Generate Hashtags",
    socialNetworks: "Select Social Networks",
    contentGeneration: "Content Generation",
    transcriptionOptions: "Transcription Options",
    transcribeVideo: "Transcribe Video",
    downloadOptions: "Download Options"
  },
  pt: {
    title: "Transcrição de Vídeo",
    transcribing: "Transcrevendo vídeo...",
    previewVideo: "Preview do vídeo aparecerá aqui",
    processingStatus: "Status do processamento aparecerá aqui",
    transcriptionComplete: "Transcrição concluída!",
    downloadTranscription: "Baixar Transcrição",
    downloadSRT: "Baixar Arquivo SRT",
    transcriptionPreview: "Preview da transcrição aparecerá aqui",
    contentType: "Tipo de Conteúdo",
    generateText: "Gerar Texto",
    generateHashtags: "Gerar Hashtags",
    socialNetworks: "Selecionar Redes Sociais",
    contentGeneration: "Geração de Conteúdo",
    transcriptionOptions: "Opções de Transcrição",
    transcribeVideo: "Transcrever Vídeo",
    downloadOptions: "Opções de Download"
  }
};

export default function VideoTranscriber({ theme, language }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [transcriptionComplete, setTranscriptionComplete] = useState(false);
  const [transcriptionContent, setTranscriptionContent] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('text');
  const [selectedSocialNetworks, setSelectedSocialNetworks] = useState({
    linkedin: false,
    instagram: false,
    tiktok: false,
    facebook: false,
    youtube: false
  });
  const [downloadStatus, setDownloadStatus] = useState({
    stage: '',
    progress: 0,
    isLoading: false,
    error: false
  });

  const t = translations[language];

  const contentTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'hashtags', label: 'Hashtags' },
    { value: 'srt', label: 'Legendas (SRT)' }
  ];

  const socialNetworks = [
    { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
    { key: "instagram", icon: Instagram, label: "Instagram" },
    { key: "tiktok", icon: Share2, label: "TikTok" },
    { key: "facebook", icon: Facebook, label: "Facebook" },
    { key: "youtube", icon: YoutubeIcon, label: "YouTube" }
  ];

  const handleTranscribe = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setTranscriptionProgress(0);

    try {
      // Aqui vai a lógica de transcrição que estava no MainApp
      const { invoke } = await import('@tauri-apps/api/tauri');
      const result = await invoke('transcribe_video', {
        inputPath: videoFile.path,
        contentType: selectedContentType
      });

      setTranscriptionContent(result);
      setTranscriptionComplete(true);

    } catch (error) {
      console.error('Erro ao transcrever vídeo:', error);
    } finally {
      setIsProcessing(false);
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
                  }}
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
        <CardContent className="p-6 space-y-6">
          <TranscriptionOptions 
            theme={theme}
            language={language}
            selectedContentType={selectedContentType}
            setSelectedContentType={setSelectedContentType}
            selectedSocialNetworks={selectedSocialNetworks}
            setSelectedSocialNetworks={setSelectedSocialNetworks}
          />

          {/* Botão de Transcrever */}
          <Button 
            className={cn(
              "w-full h-12 transition-all duration-300",
              theme === "dark"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            )}
            onClick={handleTranscribe}
            disabled={!videoFile || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t.transcribing}
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                {t.transcribeVideo}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Right Panel - Preview e Download */}
      <Card className={theme === "dark" ? "bg-[#141625]/80 border-none backdrop-blur-sm" : "bg-white"}>
        <CardContent className="p-6">
          <AnimatePresence>
            {downloadStatus.isLoading ? (
              <motion.div
                className={cn(
                  "aspect-video rounded-lg flex items-center justify-center",
                  theme === 'dark' ? "bg-[#1C1F2E]" : "bg-gray-100"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center space-y-4">
                  <Loader2 className={cn(
                    "w-16 h-16 mx-auto animate-spin",
                    theme === 'dark' ? "text-blue-500" : "text-blue-600"
                  )} />
                  <p className={theme === 'dark' ? "text-gray-400" : "text-gray-600"}>
                    {downloadStatus.stage}
                  </p>
                  <Progress value={downloadStatus.progress} className="w-64 mx-auto" />
                </div>
              </motion.div>
            ) : videoUrl ? (
              <motion.video
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={videoUrl}
                controls
                className="w-full rounded-lg"
              />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "aspect-video rounded-lg flex items-center justify-center",
                  theme === "dark" ? "bg-[#1C1F2E]" : "bg-gray-100"
                )}
              >
                <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
                  {t.previewVideo}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {transcriptionContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Textarea
                value={transcriptionContent}
                readOnly
                className={cn(
                  "h-[200px] font-mono",
                  theme === "dark"
                    ? "bg-[#1C1F2E] border-none text-white"
                    : "bg-gray-100 border-gray-300 text-gray-900"
                )}
              />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 