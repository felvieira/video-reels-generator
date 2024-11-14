'use client';

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { appWindow } from '@tauri-apps/api/window';
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Youtube,
  Upload,
  Settings,
  Loader2,
  Video,
  FileText,
  Hash,
  Type,
  Linkedin,
  Instagram,
  Facebook,
  Youtube as YoutubeIcon,
  Wand2,
  Key,
  Download,
  Check,
  ArrowDown,
  Gauge,
  Zap,
  Star,
  Share2,
  Sun,
  Moon,
} from "lucide-react";
import VideoUploader from '@/components/VideoUploader';
import LoginForm from '@/components/LoginForm';
import { verifyLicense } from '@/lib/appwrite';

const translations = {
  en: {
    title: "Convert Video to Instagram Reels",
    subtitle: "Transform your content effortlessly",
    upload: "Upload from Computer",
    dropzone: "Drop your video here or click to choose from your computer",
    youtube: "YouTube",
    youtubeInput: "or paste a YouTube URL...",
    convertVideo: "CONVERT VIDEO",
    converting: "Converting Video...",
    format: "CHOOSE FORMAT",
    quality: "QUALITY",
    downloadSeparate: "DOWNLOAD SEPARATE CONTENT",
    yes: "YES",
    no: "NO",
    generateReels: "GENERATE REELS",
    tools: "AI TOOLS",
    transcription: "Audio Transcription",
    generateTranscription: "Generate Transcription (Text and SRT)",
    socialNetworks: "Select Social Networks",
    contentGeneration: "Content Generation",
    generateText: "Generate Text",
    generateHashtags: "Generate Hashtags",
    aiConfig: "AI Configuration",
    selectModel: "Select AI model",
    apiKey: "Enter your API key here",
    generateContent: "Generate Content with AI",
    processingStatus: "Processing status will appear here",
    previewVideo: "Video preview will appear here",
    generatedContent: "Generated content will appear here",
    conversionComplete: "Conversion complete!",
    downloadVideo: "Download Converted Video",
    generatedTranscription: "Generated Transcription",
    downloadTranscription: "Download Transcription",
    downloadMarkdown: "Download Content as Markdown",
  },
  pt: {
    title: "Converter Vídeo para Instagram Reels",
    subtitle: "Transforme seu conteúdo sem esforço",
    upload: "DO COMPUTADOR",
    dropzone:
      "Jogue seu vídeo aqui ou clique e escolha diretamente do seu computador",
    youtube: "YOUTUBE",
    youtubeInput: "ou cole uma url do youtube ...",
    convertVideo: "CONVERTER VÍDEO",
    converting: "Convertendo Vídeo...",
    format: "ESCOLHA O FORMATO",
    quality: "QUALIDADE",
    downloadSeparate: "BAIXAR CONTEÚDO SEPARADO",
    yes: "SIM",
    no: "NÃO",
    generateReels: "GERAR REELS",
    tools: "FERRAMENTAS IA",
    transcription: "Transcrição de Áudio",
    generateTranscription: "Gerar Transcrição (Texto e SRT)",
    socialNetworks: "Selecionar Redes Sociais",
    contentGeneration: "Geração de Conteúdo",
    generateText: "Gerar Texto",
    generateHashtags: "Gerar Hashtags",
    aiConfig: "Configuração da IA",
    selectModel: "Selecione o modelo de IA",
    apiKey: "Insira sua chave de API aqui",
    generateContent: "Gerar Conteúdo com IA",
    processingStatus: "Status do processamento aparecerá aqui",
    previewVideo: "Preview do vídeo aparecerá aqui",
    generatedContent: "Conteúdo gerado aparecerá aqui",
    conversionComplete: "Conversão concluída!",
    downloadVideo: "Baixar Vídeo Convertido",
    generatedTranscription: "Transcrição Gerada",
    downloadTranscription: "Baixar Transcrição",
    downloadMarkdown: "Baixar Conteúdo em Markdown",
  },
};

// Adicionar constante de providers
const PROVIDERS = {
  ollama: {
    name: 'Ollama (Local)',
    requiresKey: false,
    models: [] // Preenchido dinamicamente
  },
  openai: {
    name: 'OpenAI',
    requiresKey: true,
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
  },
  anthropic: {
    name: 'Anthropic',
    requiresKey: true,
    models: ['claude-2', 'claude-instant-1']
  }
};

// Verificar se estamos rodando no Tauri
const isTauri = window.__TAURI__ !== undefined;

// Importar APIs do Tauri apenas se estivermos no ambiente desktop
let tauriInvoke, tauriListen;
if (isTauri) {
  Promise.all([
    import('@tauri-apps/api/tauri'),
    import('@tauri-apps/api/event')
  ]).then(([tauri, event]) => {
    tauriInvoke = tauri.invoke;
    tauriListen = event.listen;
  });
}

export default function Home() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionComplete, setConversionComplete] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("reels");
  const [quality, setQuality] = useState("media");
  const [aiModel, setAiModel] = useState("gpt-4");
  const [downloadSeparate, setDownloadSeparate] = useState("nao");
  const [selectedSocialNetworks, setSelectedSocialNetworks] = useState({
    linkedin: false,
    instagram: false,
    tiktok: false,
    facebook: false,
    youtube: false,
  });
  const [generatedContent, setGeneratedContent] = useState({
    linkedin: "",
    instagram: "",
    tiktok: "",
    facebook: "",
    youtube: "",
  });
  const [activeTab, setActiveTab] = useState("converter");
  const [transcriptionContent, setTranscriptionContent] = useState("");
  const [selectedContentType, setSelectedContentType] = useState("");
  const [language, setLanguage] = useState("pt");
  const [theme, setTheme] = useState("dark");
  const [stage, setStage] = useState("");

  // Adicionar novos estados para LLM
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState([]);

  const [downloadStatus, setDownloadStatus] = useState({
    stage: '',
    progress: 0,
    isLoading: false,
    error: false
  });

  const [downloadProgress, setDownloadProgress] = useState({
    stage: '',
    progress: 0,
    isLoading: false
  });

  const [isYoutubeVideo, setIsYoutubeVideo] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const t = translations[language];

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Escutar eventos de progresso do Rust
  useEffect(() => {
    if (!isTauri || !tauriListen) return;

    const setupListener = async () => {
      const unsubscribe = await tauriListen('conversion-progress', (event) => {
        const { stage, progress } = event.payload;
        console.log('Progresso:', stage, progress);
        
        // Se for download do YouTube
        if (stage.includes('YouTube')) {
          setDownloadProgress({
            stage: stage,
            progress: progress,
            isLoading: true
          });
        } 
        // Se for conversão normal
        else {
          setStage(stage);
          setConversionProgress(progress);
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    };

    setupListener();
  }, []);

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedConfig = JSON.parse(localStorage.getItem('llmConfig') || '{}');
    if (savedConfig[provider]?.apiKey) {
      setApiKey(savedConfig[provider].apiKey);
    }
  }, [provider]);

  // Carregar modelos baseado no provider
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        if (provider === 'ollama') {
          const response = await fetch('http://localhost:11434/api/tags');
          const data = await response.json();
          if (data.models) {
            setAvailableModels(data.models.map(m => m.name));
          }
        } else {
          setAvailableModels(PROVIDERS[provider]?.models || []);
          if (!PROVIDERS[provider]?.models.includes(aiModel)) {
            setAiModel(PROVIDERS[provider]?.models[0] || '');
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar modelos do ${provider}:`, error);
        setAvailableModels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [provider, aiModel]);

  const saveConfig = () => {
    const savedConfig = JSON.parse(localStorage.getItem('llmConfig') || '{}');
    savedConfig[provider] = {
      provider: provider,
      apiKey: apiKey,
      model: PROVIDERS[provider]?.models.includes(aiModel) ? aiModel : PROVIDERS[provider]?.models[0]
    };
    localStorage.setItem('llmConfig', JSON.stringify(savedConfig));
  };

  const handleConvert = async () => {
    if (!videoFile || !tauriInvoke) return;

    try {
      setIsProcessing(true);
      setConversionProgress(0);

      console.log('Arquivo de vídeo:', videoFile);
      console.log('Caminho do arquivo:', videoFile.path);
      console.log('Qualidade selecionada:', quality);

      // Chamar a função Rust via Tauri
      const outputPath = await tauriInvoke('convert_to_reels', {
        inputPath: videoFile.path,
        quality: quality
      });

      console.log('Caminho de saída:', outputPath);
      setConversionComplete(true);

    } catch (error) {
      console.error('Erro detalhado:', error);
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
      setIsProcessing(false);
      setConversionProgress(0);
      setStage('');
    }
  };

  const handleGenerateContent = () => {
    setIsLoading(true);
    setTimeout(() => {
      const newContent = Object.keys(selectedSocialNetworks).reduce(
        (acc, network) => {
          if (selectedSocialNetworks[network]) {
            acc[
              network
            ] = `Generated content for ${network}:\n\nTitle: Amazing video content\n\nDescription: Check out this awesome video I made!\n\nHashtags: #VideoContent #AwesomeCreator #${network}`;
          }
          return acc;
        },
        {}
      );
      setGeneratedContent(newContent);
      setIsLoading(false);
    }, 3000);
  };

  const handleGenerateTranscription = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTranscriptionContent(
        "00:00:01,000 --> 00:00:05,000\nWelcome to this amazing video about content creation.\n\n00:00:05,500 --> 00:00:10,000\nIn this video, we'll explore various techniques to engage your audience."
      );
      setIsLoading(false);
    }, 3000);
  };

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
      label: t.quality === "QUALITY" ? "LOW" : "BAIXA",
      icon: Gauge,
    },
    {
      value: "media",
      label: t.quality === "QUALITY" ? "MEDIUM" : "MÉDIA",
      icon: Zap,
    },
    {
      value: "alta",
      label: t.quality === "QUALITY" ? "HIGH" : "ALTA",
      icon: Star,
    },
  ];

  const socialNetworks = [
    { key: "linkedin", icon: Linkedin, label: "LinkedIn" },
    { key: "instagram", icon: Instagram, label: "Instagram" },
    { key: "tiktok", icon: Share2, label: "TikTok" },
    { key: "facebook", icon: Facebook, label: "Facebook" },
    { key: "youtube", icon: YoutubeIcon, label: "YouTube" },
  ];

  useEffect(() => {
    // Verificar licença ao iniciar
    const checkLicense = async () => {
        const email = localStorage.getItem('userEmail');
        const serial = localStorage.getItem('userSerial');

        if (email && serial) {
            try {
                const isValid = await verifyLicense(email, serial);
                setIsAuthenticated(isValid);
            } catch (error) {
                console.error('Erro ao verificar licença:', error);
                setIsAuthenticated(false);
            }
        }
    };

    checkLicense();
  }, []);

  if (!isAuthenticated) {
    return (
        <LoginForm 
            onSuccess={() => setIsAuthenticated(true)} 
            language={language}
            theme={theme}
            onLanguageChange={setLanguage}
            onThemeChange={setTheme}
        />
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen font-sans",
        theme === "dark"
          ? "bg-gradient-to-br from-[#0A0C10] to-[#1A1C20] text-white"
          : "bg-gradient-to-br from-gray-100 to-white text-gray-900"
      )}
    >
      {/* Barra de título customizada */}
      <div 
        data-tauri-drag-region 
        className="h-10 flex justify-between items-center px-4 bg-black/20 backdrop-blur-sm fixed top-0 left-0 right-0 z-50"
      >
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-white/60" />
          <span className="text-sm text-white/60">Video Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => appWindow.minimize()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="block w-3 h-0.5 bg-white/60" />
          </button>
          <button
            onClick={() => appWindow.toggleMaximize()}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <div className="w-3 h-3 border border-white/60" />
          </button>
          <button
            onClick={() => appWindow.close()}
            className="p-2 hover:bg-red-500/50 rounded-lg transition-colors"
          >
            <span className="block w-3 h-3 text-white/60">×</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="flex justify-end space-x-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLanguage((prev) => (prev === "en" ? "pt" : "en"))}
          >
            {language === "en" ? "🇺🇸" : "🇧🇷"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              theme === "dark"
                ? "bg-gradient-to-br from-blue-500 to-purple-600"
                : "bg-gradient-to-br from-blue-400 to-purple-500"
            )}
          >
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1
              className={cn(
                "text-3xl font-bold",
                theme === "dark"
                  ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
                  : "text-blue-600"
              )}
            >
              {t.title}
            </h1>
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-600"}>
              {t.subtitle}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-[400px_1fr_400px] gap-6">
          {/* Left Panel - Upload */}
          <Card
            className={
              theme === "dark"
                ? "bg-[#141625]/80 border-none backdrop-blur-sm"
                : "bg-white"
            }
          >
            <CardContent className="p-6 space-y-6">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
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

        
            </CardContent>
          </Card>

          {/* Center Panel - Preview */}
          <Card
            className={
              theme === "dark"
                ? "bg-[#141625]/80 border-none backdrop-blur-sm"
                : "bg-white"
            }
          >
            <CardContent className="p-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
              >
                <TabsList
                  className={cn(
                    "w-full p-1 rounded-lg",
                    theme === "dark" ? "bg-[#1C1F2E]" : "bg-gray-100"
                  )}
                >
                  <TabsTrigger
                    value="converter"
                    className={cn(
                      "flex-1 rounded-md transition-all duration-300",
                      theme === "dark"
                        ? "data-[state=active]:bg-blue-600"
                        : "data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                    )}
                  >
                    {t.title}
                  </TabsTrigger>
                  <TabsTrigger
                    value="ferramentas"
                    className={cn(
                      "flex-1 rounded-md transition-all duration-300",
                      theme === "dark"
                        ? "data-[state=active]:bg-purple-600"
                        : "data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                    )}
                  >
                    {t.tools}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="converter" className="space-y-6">
                  <AnimatePresence>
                    {downloadProgress.isLoading ? (
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
                            {downloadProgress.stage}
                          </p>
                          <Progress value={downloadProgress.progress} className="w-64 mx-auto" />
                        </div>
                      </motion.div>
                    ) : isLoading ? (
                      <Skeleton className="w-full aspect-video rounded-lg" />
                    ) : videoUrl ? (
                      <div className="space-y-4">
                        <motion.video
                          key="video"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          src={videoUrl}
                          controls
                          className="w-full rounded-lg"
                        />
                        {isYoutubeVideo && (
                          <Button 
                            className={cn(
                              "w-full transition-all duration-300",
                              theme === 'dark'
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-red-500 hover:bg-red-600"
                            )}
                            onClick={async () => {
                              try {
                                const savePath = await save({
                                  title: 'Salvar vídeo do YouTube',
                                  defaultPath: 'youtube_video.mp4',
                                  filters: [{
                                    name: 'Video',
                                    extensions: ['mp4']
                                  }]
                                });

                                if (savePath) {
                                  await invoke('save_youtube_video', {
                                    sourcePath: videoFile.path,
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
                            }}
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Salvar vídeo do YouTube
                          </Button>
                        )}
                      </div>
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
                        <p
                          className={
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }
                        >
                          {t.previewVideo}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3
                      className={cn(
                        "text-sm font-medium uppercase",
                        selectedFormat
                          ? theme === "dark"
                            ? "text-blue-400"
                            : "text-blue-600"
                          : theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      )}
                    >
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
                              <div
                                className={cn(
                                  "font-medium",
                                  selectedFormat === format.value
                                    ? theme === "dark"
                                      ? "text-white"
                                      : "text-gray-900"
                                    : theme === "dark"
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                )}
                              >
                                {format.label}
                              </div>
                              <div
                                className={
                                  theme === "dark"
                                    ? "text-xs text-gray-400"
                                    : "text-xs text-gray-500"
                                }
                              >
                                {format.res}
                              </div>
                            </div>
                          </div>
                          <RadioGroupItem
                            value={format.value}
                            className={
                              theme === "dark"
                                ? "text-blue-500"
                                : "text-blue-600"
                            }
                          />
                        </Label>
                      ))}
                    </RadioGroup>
                  </motion.div>

                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3
                      className={cn(
                        "text-sm font-medium uppercase",
                        quality
                          ? theme === "dark"
                            ? "text-blue-400"
                            : "text-blue-600"
                          : theme === "dark"
                          ? "text-gray-400"
                          : "text-gray-600"
                      )}
                    >
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
                          <span
                            className={cn(
                              quality === q.value
                                ? theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                                : theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            )}
                          >
                            {q.label}
                          </span>
                        </Label>
                      ))}
                    </RadioGroup>
                  </motion.div>

                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3
                      className={cn(
                        "text-sm font-medium uppercase",
                        theme === "dark" ? "text-blue-400" : "text-blue-600"
                      )}
                    >
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

                  <Button
                    className={cn(
                      "w-full h-12 transition-all duration-300",
                      theme === "dark"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    )}
                    onClick={handleConvert}
                    disabled={isProcessing}
                  >
                    {t.generateReels}
                  </Button>
                </TabsContent>

                <TabsContent value="ferramentas" className="space-y-6">
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="space-y-4">
                      <h3
                        className={
                          theme === "dark"
                            ? "text-lg font-semibold text-purple-400"
                            : "text-lg font-semibold text-purple-600"
                        }
                      >
                        {t.transcription}
                      </h3>
                      <Button
                        className={cn(
                          "w-full transition-all duration-300",
                          theme === "dark"
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-purple-500 hover:bg-purple-600"
                        )}
                        onClick={handleGenerateTranscription}
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        {t.generateTranscription}
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <h3
                        className={
                          theme === "dark"
                            ? "text-lg font-semibold text-purple-400"
                            : "text-lg font-semibold text-purple-600"
                        }
                      >
                        {t.socialNetworks}
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        {socialNetworks.map((social) => (
                          <Button
                            key={social.key}
                            variant="outline"
                            className={cn(
                              "flex items-center justify-center space-x-2 p-2 rounded-lg cursor-pointer transition-all duration-300",
                              theme === "dark"
                                ? "bg-[#1C1F2E] hover:bg-[#252942] border-2 border-transparent"
                                : "bg-gray-100 hover:bg-gray-200 border-2 border-transparent",
                              selectedSocialNetworks[social.key] &&
                                (theme === "dark"
                                  ? "border-purple-500"
                                  : "border-purple-400")
                            )}
                            onClick={() =>
                              setSelectedSocialNetworks((prev) => ({
                                ...prev,
                                [social.key]: !prev[social.key],
                              }))
                            }
                          >
                            <social.icon
                              className={cn(
                                "w-5 h-5",
                                selectedSocialNetworks[social.key]
                                  ? theme === "dark"
                                    ? "text-purple-400"
                                    : "text-purple-600"
                                  : theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              )}
                            />
                            <span
                              className={cn(
                                selectedSocialNetworks[social.key]
                                  ? theme === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                  : theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              )}
                            >
                              {social.label}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {Object.values(selectedSocialNetworks).some(Boolean) && (
                      <>
                        <div className="space-y-4">
                          <h3
                            className={
                              theme === "dark"
                                ? "text-lg font-semibold text-purple-400"
                                : "text-lg font-semibold text-purple-600"
                            }
                          >
                            {t.contentGeneration}
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              className={cn(
                                "transition-all duration-300",
                                theme === "dark"
                                  ? "bg-[#1C1F2E] hover:bg-[#252942]"
                                  : "bg-gray-100 hover:bg-gray-200",
                                selectedContentType === "text" &&
                                  (theme === "dark"
                                    ? "ring-2 ring-purple-500"
                                    : "ring-2 ring-purple-400")
                              )}
                              onClick={() => setSelectedContentType("text")}
                            >
                              <Type className="w-5 h-5 mr-2" />
                              <span
                                className={
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }
                              >
                                {t.generateText}
                              </span>
                            </Button>
                            <Button
                              className={cn(
                                "transition-all duration-300",
                                theme === "dark"
                                  ? "bg-[#1C1F2E] hover:bg-[#252942]"
                                  : "bg-gray-100 hover:bg-gray-200",
                                selectedContentType === "hashtags" &&
                                  (theme === "dark"
                                    ? "ring-2 ring-purple-500"
                                    : "ring-2 ring-purple-400")
                              )}
                              onClick={() => setSelectedContentType("hashtags")}
                            >
                              <Hash className="w-5 h-5 mr-2" />
                              <span
                                className={
                                  theme === "dark"
                                    ? "text-white"
                                    : "text-gray-900"
                                }
                              >
                                {t.generateHashtags}
                              </span>
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3
                            className={
                              theme === "dark"
                                ? "text-lg font-semibold text-purple-400"
                                : "text-lg font-semibold text-purple-600"
                            }
                          >
                            {t.aiConfig}
                          </h3>
                          <Select value={provider} onValueChange={setProvider}>
                            <SelectTrigger className={cn(
                              "w-full",
                              theme === 'dark' 
                                ? "bg-[#1C1F2E] border-none text-white"
                                : "bg-gray-100 border-gray-300 text-gray-900"
                            )}>
                              <SelectValue placeholder="Selecione o provedor" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PROVIDERS).map(([key, value]) => (
                                <SelectItem key={key} value={key}>{value.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {PROVIDERS[provider]?.requiresKey && (
                            <Input
                              type="password"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              placeholder={t.apiKey}
                              className={cn(
                                "h-12",
                                theme === 'dark' 
                                  ? "bg-[#1C1F2E] border-none text-white placeholder-gray-500"
                                  : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"
                              )}
                            />
                          )}

                          <Select value={aiModel} onValueChange={setAiModel}>
                            <SelectTrigger className={cn(
                              "w-full",
                              theme === 'dark' 
                                ? "bg-[#1C1F2E] border-none text-white"
                                : "bg-gray-100 border-gray-300 text-gray-900"
                            )}>
                              <SelectValue placeholder={t.selectModel} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableModels.map((model) => (
                                <SelectItem key={model} value={model}>{model}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button 
                            className={cn(
                              "w-full h-12 transition-all duration-300",
                              theme === 'dark'
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                            )}
                            onClick={saveConfig}
                            disabled={PROVIDERS[provider]?.requiresKey && !apiKey}
                          >
                            <Key className="w-5 h-5 mr-2" />
                            <span className="text-white">Salvar Configurações</span>
                          </Button>
                        </div>

                        <Button
                          className={cn(
                            "w-full h-12 transition-all duration-300",
                            theme === 'dark'
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                              : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          )}
                          onClick={handleGenerateContent}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          ) : (
                            <Wand2 className="w-5 h-5 mr-2" />
                          )}
                          <span className="text-white">
                            {t.generateContent}
                          </span>
                        </Button>
                      </>
                    )}
                  </motion.div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Right Panel - Processing and Generated Content */}
          <Card
            className={
              theme === "dark"
                ? "bg-[#141625]/80 border-none backdrop-blur-sm"
                : "bg-white"
            }
          >
            <CardContent className="p-6">
              <AnimatePresence>
                {activeTab === "converter" ? (
                  isProcessing ? (
                    <motion.div
                      className="space-y-6"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center aspect-square rounded-lg",
                          theme === "dark"
                            ? "bg-gradient-to-br from-blue-500/20 to-purple-600/20"
                            : "bg-gradient-to-br from-blue-100 to-purple-100"
                        )}
                      >
                        <div className="text-center">
                          <Loader2
                            className={cn(
                              "w-16 h-16 mx-auto mb-4 animate-spin",
                              theme === "dark"
                                ? "text-blue-500"
                                : "text-blue-600"
                            )}
                          />
                          <p
                            className={cn(
                              "text-lg font-semibold",
                              theme === "dark"
                                ? "text-blue-400"
                                : "text-blue-600"
                            )}
                          >
                            Gerando VIDEO ...
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3
                          className={
                            theme === "dark"
                              ? "text-lg font-semibold text-blue-400"
                              : "text-lg font-semibold text-blue-600"
                          }
                        >
                          {t.converting}
                        </h3>
                        <Progress
                          value={conversionProgress}
                          className="w-full"
                        />
                        <p
                          className={
                            theme === "dark"
                              ? "text-sm text-gray-400"
                              : "text-sm text-gray-600"
                          }
                        >
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
                      <h3
                        className={
                          theme === "dark"
                            ? "text-lg font-semibold text-green-400"
                            : "text-lg font-semibold text-green-600"
                        }
                      >
                        {t.conversionComplete}
                      </h3>
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
                      <p
                        className={
                          theme === "dark"
                            ? "text-gray-400 text-lg"
                            : "text-gray-600 text-lg"
                        }
                      >
                        {t.processingStatus}
                      </p>
                    </motion.div>
                  )
                ) : transcriptionContent ? (
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3
                      className={
                        theme === "dark"
                          ? "text-lg font-semibold text-purple-400"
                          : "text-lg font-semibold text-purple-600"
                      }
                    >
                      {t.generatedTranscription}
                    </h3>
                    <Textarea
                      value={transcriptionContent}
                      readOnly
                      className={cn(
                        "h-64",
                        theme === "dark"
                          ? "bg-[#1C1F2E] border-none text-white"
                          : "bg-gray-100 border-gray-300 text-gray-900"
                      )}
                    />
                    <Button
                      className={cn(
                        "w-full transition-all duration-300",
                        theme === "dark"
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-purple-500 hover:bg-purple-600"
                      )}
                      onClick={() => {
                        /* Implement download logic */
                      }}
                    >
                      <ArrowDown className="w-5 h-5 mr-2" />
                      <span className="text-white">
                        {t.downloadTranscription}
                      </span>
                    </Button>
                  </motion.div>
                ) : Object.values(generatedContent).some(
                    (content) => content !== ""
                  ) ? (
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3
                      className={
                        theme === "dark"
                          ? "text-lg font-semibold text-purple-400"
                          : "text-lg font-semibold text-purple-600"
                      }
                    >
                      {t.contentGeneration}
                    </h3>
                    <Tabs
                      defaultValue={Object.keys(generatedContent).find(
                        (key) => generatedContent[key] !== ""
                      )}
                    >
                      <TabsList
                        className={cn(
                          "w-full p-1 rounded-lg",
                          theme === "dark" ? "bg-[#1C1F2E]" : "bg-gray-100"
                        )}
                      >
                        {Object.entries(generatedContent).map(
                          ([network, content]) =>
                            content && (
                              <TabsTrigger
                                key={network}
                                value={network}
                                className={cn(
                                  "flex-1 rounded-md transition-all duration-300",
                                  theme === "dark"
                                    ? "data-[state=active]:bg-purple-600"
                                    : "data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                                )}
                              >
                                {network.charAt(0).toUpperCase() +
                                  network.slice(1)}
                              </TabsTrigger>
                            )
                        )}
                      </TabsList>
                      {Object.entries(generatedContent).map(
                        ([network, content]) =>
                          content && (
                            <TabsContent
                              key={network}
                              value={network}
                              className="mt-4"
                            >
                              <Textarea
                                value={content}
                                readOnly
                                className={cn(
                                  "h-64",
                                  theme === "dark"
                                    ? "bg-[#1C1F2E] border-none text-white"
                                    : "bg-gray-100 border-gray-300 text-gray-900"
                                )}
                              />
                            </TabsContent>
                          )
                      )}
                    </Tabs>
                    <Button
                      className={cn(
                        "w-full transition-all duration-300",
                        theme === "dark"
                          ? "bg-purple-600 hover:bg-purple-700"
                          : "bg-purple-500 hover:bg-purple-600"
                      )}
                      onClick={() => {
                        /* Implement download logic */
                      }}
                    >
                      <ArrowDown className="w-5 h-5 mr-2" />
                      <span className="text-white">{t.downloadMarkdown}</span>
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
                    <p
                      className={
                        theme === "dark"
                          ? "text-gray-400 text-lg"
                          : "text-gray-600 text-lg"
                      }
                    >
                      {t.generatedContent}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
