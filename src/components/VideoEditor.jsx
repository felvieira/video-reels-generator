"use client";

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
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
  Moon
} from 'lucide-react';

const translations = {
  en: {
    title: "Convert Video to Instagram Reels",
    subtitle: "Transform your content effortlessly",
    // ... resto das traduções em inglês
  },
  pt: {
    title: "Converter Vídeo para Instagram Reels",
    subtitle: "Transforme seu conteúdo sem esforço",
    // ... resto das traduções em português
  }
};

function VideoEditor({ videoFile }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionComplete, setConversionComplete] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('reels');
  const [quality, setQuality] = useState('media');
  const [aiModel, setAiModel] = useState('gpt-4');
  const [downloadSeparate, setDownloadSeparate] = useState('nao');
  const [selectedSocialNetworks, setSelectedSocialNetworks] = useState({
    linkedin: false,
    instagram: false,
    tiktok: false,
    facebook: false,
    youtube: false
  });
  const [generatedContent, setGeneratedContent] = useState({
    linkedin: '',
    instagram: '',
    tiktok: '',
    facebook: '',
    youtube: ''
  });
  const [activeTab, setActiveTab] = useState('converter');
  const [transcriptionContent, setTranscriptionContent] = useState('');
  const [selectedContentType, setSelectedContentType] = useState('');
  const [language, setLanguage] = useState('pt');
  const [theme, setTheme] = useState('dark');
  const [stage, setStage] = useState('');

  const t = translations[language];

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  useEffect(() => {
    if (videoFile && videoFile.url) {
      setVideoUrl(videoFile.url);
    }
  }, [videoFile]);

  // Escutar eventos de progresso do Rust
  useEffect(() => {
    const unsubscribe = listen('conversion-progress', (event) => {
      const { stage, progress } = event.payload;
      setStage(stage);
      setConversionProgress(progress);
    });

    return () => {
      unsubscribe.then(fn => fn());
    };
  }, []);

  const handleConvert = async () => {
    if (!videoFile) return;

    try {
      setIsProcessing(true);
      setConversionProgress(0);

      console.log('Arquivo de vídeo:', videoFile);
      console.log('Caminho do arquivo:', videoFile.path);
      console.log('Qualidade selecionada:', quality);

      // Chamar a função Rust via Tauri
      const outputPath = await invoke('convert_to_reels', {
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

  const formats = [
    { value: 'reels', label: 'INSTAGRAM REELS', res: '1080x1920', icon: Instagram },
    { value: 'tiktok', label: 'TIKTOK', res: '1080x1920', icon: Share2 },
    { value: 'shorts', label: 'SHORTS', res: '1080x1920', icon: YoutubeIcon },
  ];

  const qualities = [
    { value: 'baixa', label: t.quality === 'QUALITY' ? 'LOW' : 'BAIXA', icon: Gauge },
    { value: 'media', label: t.quality === 'QUALITY' ? 'MEDIUM' : 'MÉDIA', icon: Zap },
    { value: 'alta', label: t.quality === 'QUALITY' ? 'HIGH' : 'ALTA', icon: Star },
  ];

  const socialNetworks = [
    { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
    { key: 'instagram', icon: Instagram, label: 'Instagram' },
    { key: 'tiktok', icon: Share2, label: 'TikTok' },
    { key: 'facebook', icon: Facebook, label: 'Facebook' },
    { key: 'youtube', icon: YoutubeIcon, label: 'YouTube' },
  ];

  return (
    <div className={cn(
      "min-h-screen font-sans",
      theme === 'dark' 
        ? "bg-gradient-to-br from-[#0A0C10] to-[#1A1C20] text-white" 
        : "bg-gradient-to-br from-gray-100 to-white text-gray-900"
    )}>
      <div className="container mx-auto p-6">
        <div className="flex justify-end space-x-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLanguage(prev => prev === 'en' ? 'pt' : 'en')}
          >
            {language === 'en' ? '🇺🇸' : '🇧🇷'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            theme === 'dark' ? "bg-gradient-to-br from-blue-500 to-purple-600" : "bg-gradient-to-br from-blue-400 to-purple-500"
          )}>
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={cn(
              "text-3xl font-bold",
              theme === 'dark' ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600" : "text-blue-600"
            )}>
              {t.title}
            </h1>
            <p className={theme === 'dark' ? "text-gray-400" : "text-gray-600"}>{t.subtitle}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-[400px_1fr_400px] gap-6">
          {/* Left Panel - Upload */}
          <Card className={theme === 'dark' ? "bg-[#141625]/80 border-none backdrop-blur-sm" : "bg-white"}>
            <CardContent className="p-6 space-y-6">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className={cn(
                  "text-lg font-semibold uppercase",
                  theme === 'dark' ? "text-blue-400" : "text-blue-600"
                )}>{t.format}</h2>
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
                        theme === 'dark' 
                          ? "bg-[#1C1F2E] hover:bg-[#252942]"
                          : "bg-gray-100 hover:bg-gray-200",
                        selectedFormat === format.value && (theme === 'dark' ? "ring-2 ring-blue-500" : "ring-2 ring-blue-400")
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <format.icon className={cn(
                          "w-5 h-5",
                          selectedFormat === format.value 
                            ? (theme === 'dark' ? "text-blue-400" : "text-blue-600")
                            : (theme === 'dark' ? "text-gray-400" : "text-gray-600")
                        )} />
                        <span className={theme === 'dark' ? "text-white" : "text-gray-900"}>{format.label}</span>
                      </div>
                      <span className={theme === 'dark' ? "text-gray-400" : "text-gray-600"}>{format.res}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </motion.div>

              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className={cn(
                  "text-lg font-semibold uppercase",
                  theme === 'dark' ? "text-blue-400" : "text-blue-600"
                )}>{t.quality}</h2>
                <RadioGroup
                  value={quality}
                  onValueChange={setQuality}
                  className="grid grid-cols-3 gap-4"
                >
                  {qualities.map((q) => (
                    <Label
                      key={q.value}
                      className={cn(
                        "flex items-center justify-center space-x-2 p-2 rounded-lg cursor-pointer transition-all duration-300",
                        theme === 'dark' 
                          ? "bg-[#1C1F2E] hover:bg-[#252942]"
                          : "bg-gray-100 hover:bg-gray-200",
                        quality === q.value && (theme === 'dark' ? "ring-2 ring-blue-500" : "ring-2 ring-blue-400")
                      )}
                    >
                      <q.icon className={cn(
                        "w-5 h-5",
                        quality === q.value 
                          ? (theme === 'dark' ? "text-blue-400" : "text-blue-600")
                          : (theme === 'dark' ? "text-gray-400" : "text-gray-600")
                      )} />
                      <span className={theme === 'dark' ? "text-white" : "text-gray-900"}>{q.label}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </motion.div>

              <Button 
                className={cn(
                  "w-full h-12 transition-all duration-300",
                  theme === 'dark'
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                )}
                onClick={handleConvert}
                disabled={isProcessing || !videoFile}
              >
                {isProcessing ? (
                  <motion.div
                    className="flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t.converting}
                  </motion.div>
                ) : (
                  <>
                    <Video className="w-5 h-5 mr-2" />
                    {t.generateReels}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Center Panel - Preview */}
          <Card className={theme === 'dark' ? "bg-[#141625]/80 border-none backdrop-blur-sm" : "bg-white"}>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className={cn(
                  "w-full p-1 rounded-lg",
                  theme === 'dark' ? "bg-[#1C1F2E]" : "bg-gray-100"
                )}>
                  <TabsTrigger 
                    value="converter" 
                    className={cn(
                      "flex-1 rounded-md transition-all duration-300",
                      theme === 'dark' 
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
                      theme === 'dark' 
                        ? "data-[state=active]:bg-purple-600" 
                        : "data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                    )}
                  >
                    {t.tools}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="converter" className="space-y-6">
                  <AnimatePresence>
                    {isLoading ? (
                      <Skeleton className="w-full aspect-video rounded-lg" />
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
                          theme === 'dark' ? "bg-[#1C1F2E]" : "bg-gray-100"
                        )}
                      >
                        <p className={theme === 'dark' ? "text-gray-400" : "text-gray-600"}>{t.previewVideo}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="ferramentas" className="space-y-6">
                  {/* Ferramentas de IA aqui */}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Right Panel - Processing and Generated Content */}
          <Card className={theme === 'dark' ? "bg-[#141625]/80 border-none backdrop-blur-sm" : "bg-white"}>
            <CardContent className="p-6">
              <AnimatePresence>
                {activeTab === 'converter' ? (
                  isProcessing ? (
                    <motion.div 
                      className="space-y-6"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className={cn(
                        "flex items-center justify-center aspect-square rounded-lg",
                        theme === 'dark' 
                          ? "bg-gradient-to-br from-blue-500/20 to-purple-600/20"
                          : "bg-gradient-to-br from-blue-100 to-purple-100"
                      )}>
                        <div className="text-center">
                          <Loader2 className={cn(
                            "w-16 h-16 mx-auto mb-4 animate-spin",
                            theme === 'dark' ? "text-blue-500" : "text-blue-600"
                          )} />
                          <p className={cn(
                            "text-lg font-semibold",
                            theme === 'dark' ? "text-blue-400" : "text-blue-600"
                          )}>{stage}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className={theme === 'dark' ? "text-lg font-semibold text-blue-400" : "text-lg font-semibold text-blue-600"}>{t.converting}</h3>
                        <Progress value={conversionProgress} className="w-full" />
                        <p className={theme === 'dark' ? "text-sm text-gray-400" : "text-sm text-gray-600"}>Progresso: {conversionProgress}%</p>
                      </div>
                    </motion.div>
                  ) : conversionComplete ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <h3 className={theme === 'dark' ? "text-lg font-semibold text-green-400" : "text-lg font-semibold text-green-600"}>{t.conversionComplete}</h3>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className={cn(
                        "flex items-center justify-center aspect-square rounded-lg",
                        theme === 'dark' 
                          ? "bg-gradient-to-br from-blue-500/10 to-purple-600/10"
                          : "bg-gradient-to-br from-blue-50 to-purple-50"
                      )}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <p className={theme === 'dark' ? "text-gray-400 text-lg" : "text-gray-600 text-lg"}>{t.processingStatus}</p>
                    </motion.div>
                  )
                ) : (
                  <div className="space-y-6">
                    {/* Conteúdo da aba de ferramentas */}
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default VideoEditor;