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
  Settings as SettingsIcon,
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
  Mic,
  LogOut,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import VideoUploader from '@/components/VideoUploader';
import LoginForm from '@/components/LoginForm';
import { verifyLicense } from '@/lib/appwrite';
import VideoConverter from './screens/VideoConverter';
import VideoTranscriber from './screens/VideoTranscriber';
import AudioTranscriber from './screens/AudioTranscriber';
import Settings from './screens/Settings';

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

function MainMenu({ onSelect, theme, isAuthenticated }) {
  const menuItems = [
    {
      id: 'convert',
      title: 'Converter Vídeo para 9:16',
      icon: Video,
      description: 'Transforme seus vídeos em formato vertical'
    },
    {
      id: 'transcribe-video',
      title: 'Transcrever Vídeo',
      icon: FileText,
      description: 'Gere transcrições a partir de vídeos'
    },
    {
      id: 'transcribe-audio',
      title: 'Transcrever Áudio',
      icon: Mic,
      description: 'Gere transcrições a partir de áudios'
    },
    {
      id: 'settings',
      title: 'Configurações',
      icon: SettingsIcon,
      description: 'Configurações de IA e conta'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      {menuItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            "group cursor-pointer",
            "p-6 rounded-xl transition-all duration-300",
            theme === 'dark' 
              ? "bg-[#141625]/80 hover:bg-[#1C1F2E]" 
              : "bg-white hover:bg-gray-50 shadow-lg"
          )}
          onClick={() => onSelect(item.id)}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className={cn(
              "p-4 rounded-full transition-all duration-300",
              theme === 'dark'
                ? "bg-gradient-to-br from-blue-500/20 to-purple-600/20 group-hover:from-blue-500/30 group-hover:to-purple-600/30"
                : "bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200"
            )}>
              <item.icon className={cn(
                "w-8 h-8",
                theme === 'dark' ? "text-blue-400" : "text-blue-600"
              )} />
            </div>
            
            <h3 className={cn(
              "text-lg font-semibold",
              theme === 'dark' ? "text-white" : "text-gray-900"
            )}>
              {item.title}
            </h3>
            
            <p className={cn(
              "text-sm",
              theme === 'dark' ? "text-gray-400" : "text-gray-600"
            )}>
              {item.description}
            </p>
          </div>
        </motion.div>
      ))}

      {/* Área de Configurações Extras */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={cn(
          "col-span-2 p-6 rounded-xl",
          theme === 'dark' ? "bg-[#141625]/80" : "bg-white shadow-lg"
        )}
      >
        <div className="flex justify-between items-center">
          {!isAuthenticated && (
            <Button
              onClick={() => onSelect('purchase')}
              className={cn(
                "transition-all duration-300",
                theme === 'dark'
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              )}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Comprar Licença
            </Button>
          )}
          
          <Button
            onClick={() => onSelect('logout')}
            variant="outline"
            className={cn(
              "transition-all duration-300",
              theme === 'dark' 
                ? "bg-[#1C1F2E] hover:bg-[#252942] border-none" 
                : "bg-gray-100 hover:bg-gray-200"
            )}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Adicione um componente para o botão de voltar
function BackButton({ onClick, theme }) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className={cn(
        "mb-6 transition-all duration-300",
        theme === 'dark' 
          ? "bg-[#1C1F2E] hover:bg-[#252942] border-none" 
          : "bg-gray-100 hover:bg-gray-200"
      )}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Voltar
    </Button>
  );
}

export default function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("pt");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stage, setStage] = useState("");

  const t = translations[language];

  // Verificar licença ao iniciar
  useEffect(() => {
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

  // Escutar eventos de progresso do Rust
  useEffect(() => {
    if (!isTauri || !tauriListen) return;

    const setupListener = async () => {
      const unsubscribe = await tauriListen('conversion-progress', (event) => {
        const { stage, progress } = event.payload;
        console.log('Progresso:', stage, progress);
        setStage(stage);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    };

    setupListener();
  }, []);

  const handleMenuSelect = (screenId) => {
    if (screenId === 'logout') {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userSerial');
      setIsAuthenticated(false);
      setCurrentScreen('menu');
    } else if (screenId === 'purchase') {
      // Lógica de compra
      const email = localStorage.getItem('userEmail');
      if (email) {
        createCheckoutSession(email);
      }
    } else {
      setCurrentScreen(screenId);
    }
  };

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

  const renderScreen = () => {
    switch(currentScreen) {
      case 'menu':
        return (
          <MainMenu 
            onSelect={handleMenuSelect} 
            theme={theme}
            isAuthenticated={isAuthenticated}
          />
        );
      case 'convert':
        return <VideoConverter theme={theme} language={language} />;
      case 'transcribe-video':
        return <VideoTranscriber theme={theme} language={language} />;
      case 'transcribe-audio':
        return <AudioTranscriber theme={theme} language={language} />;
      case 'settings':
        return <Settings theme={theme} language={language} isAuthenticated={isAuthenticated} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "min-h-screen font-sans",
      theme === "dark" 
        ? "bg-gradient-to-br from-[#0A0C10] to-[#1A1C20] text-white" 
        : "bg-gradient-to-br from-gray-100 to-white text-gray-900"
    )}>
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

        {currentScreen !== 'menu' && (
          <BackButton onClick={() => setCurrentScreen('menu')} theme={theme} />
        )}

        {renderScreen()}
      </div>
    </div>
  );
}
