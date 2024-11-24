import { useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useDropzone } from 'react-dropzone';
import { 
  FileText,
  Loader2,
  Download,
  ArrowDown,
  Upload,
  Mic
} from 'lucide-react';
import TranscriptionOptions from '@/components/TranscriptionOptions';

const translations = {
  en: {
    title: "Audio Transcription",
    transcribing: "Transcribing audio...",
    dropzone: "Drop your audio file here or click to select",
    processingStatus: "Processing status will appear here",
    transcriptionComplete: "Transcription complete!",
    downloadTranscription: "Download Transcription",
    downloadSRT: "Download SRT File",
    transcriptionPreview: "Transcription preview will appear here",
    audioPreview: "Audio preview will appear here"
  },
  pt: {
    title: "Transcrição de Áudio",
    transcribing: "Transcrevendo áudio...",
    dropzone: "Arraste seu arquivo de áudio aqui ou clique para selecionar",
    processingStatus: "Status do processamento aparecerá aqui",
    transcriptionComplete: "Transcrição concluída!",
    downloadTranscription: "Baixar Transcrição",
    downloadSRT: "Baixar Arquivo SRT",
    transcriptionPreview: "Preview da transcrição aparecerá aqui",
    audioPreview: "Preview do áudio aparecerá aqui"
  }
};

export default function AudioTranscriber({ theme, language }) {
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [transcriptionComplete, setTranscriptionComplete] = useState(false);
  const [transcriptionContent, setTranscriptionContent] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('text');

  const t = translations[language];

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setAudioFile(file);
    setAudioUrl(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.m4a', '.ogg'] },
    maxFiles: 1
  });

  const handleTranscribe = async () => {
    if (!audioFile) return;
    setIsProcessing(true);
    setTranscriptionProgress(0);

    try {
      // Aqui vai a lógica de transcrição que estava no MainApp
      const { invoke } = await import('@tauri-apps/api/tauri');
      const result = await invoke('transcribe_audio', {
        inputPath: audioFile.path,
        contentType: selectedContentType
      });

      setTranscriptionContent(result);
      setTranscriptionComplete(true);

    } catch (error) {
      console.error('Erro ao transcrever áudio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-[400px_1fr_400px] gap-6">
      {/* Left Panel - Upload */}
      <Card className={theme === "dark" ? "bg-[#141625]/80 border-none backdrop-blur-sm" : "bg-white"}>
        <CardContent className="p-6 space-y-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300",
              isDragActive && "border-blue-500 bg-blue-500/10",
              theme === "dark" ? "border-gray-600" : "border-gray-300"
            )}
          >
            <input {...getInputProps()} />
            <Mic className={cn(
              "w-12 h-12 mx-auto mb-4",
              theme === "dark" ? "text-blue-400" : "text-blue-600"
            )} />
            <p className={theme === "dark" ? "text-sm text-gray-400" : "text-sm text-gray-600"}>
              {t.dropzone}
            </p>
          </div>

          {audioFile && (
            <Button
              className={cn(
                "w-full transition-all duration-300",
                theme === "dark"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              )}
              onClick={handleTranscribe}
              disabled={isProcessing}
            >
              <FileText className="w-5 h-5 mr-2" />
              {t.title}
            </Button>
          )}
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
            disabled={!audioFile || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t.transcribing}
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                {t.transcribeAudio}
              </>
            )}
          </Button>
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
                      {t.transcribing}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <Progress value={transcriptionProgress} className="w-full" />
                  <p className={theme === "dark" ? "text-sm text-gray-400" : "text-sm text-gray-600"}>
                    Progresso: {transcriptionProgress}%
                  </p>
                </div>
              </motion.div>
            ) : transcriptionComplete ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className={theme === "dark" ? "text-lg font-semibold text-green-400" : "text-lg font-semibold text-green-600"}>
                  {t.transcriptionComplete}
                </h3>
                <div className="space-y-2">
                  <Button
                    className={cn(
                      "w-full transition-all duration-300",
                      theme === "dark"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-green-500 hover:bg-green-600"
                    )}
                    onClick={() => {
                      /* Implement download logic */
                    }}
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    {t.downloadTranscription}
                  </Button>
                  <Button
                    className={cn(
                      "w-full transition-all duration-300",
                      theme === "dark"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-500 hover:bg-blue-600"
                    )}
                    onClick={() => {
                      /* Implement SRT download logic */
                    }}
                  >
                    <ArrowDown className="w-5 h-5 mr-2" />
                    {t.downloadSRT}
                  </Button>
                </div>
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