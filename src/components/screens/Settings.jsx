import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { createCheckoutSession } from '@/lib/stripe';
import { 
  Settings as SettingsIcon,
  Key,
  CreditCard,
  LogOut,
  Wand2,
  Bot,
  User,
  Save
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const translations = {
  en: {
    aiSettings: "AI Settings",
    accountSettings: "Account Settings",
    provider: "AI Provider",
    model: "AI Model",
    apiKey: "API Key",
    saveSettings: "Save Settings",
    email: "Email",
    serial: "Serial",
    buyLicense: "Buy License",
    logout: "Logout",
    settingsSaved: "Settings saved successfully!",
    enterApiKey: "Enter your API key here",
    selectProvider: "Select AI provider",
    selectModel: "Select AI model"
  },
  pt: {
    aiSettings: "Configurações de IA",
    accountSettings: "Configurações da Conta",
    provider: "Provedor de IA",
    model: "Modelo de IA",
    apiKey: "Chave da API",
    saveSettings: "Salvar Configurações",
    email: "Email",
    serial: "Serial",
    buyLicense: "Comprar Licença",
    logout: "Sair",
    settingsSaved: "Configurações salvas com sucesso!",
    enterApiKey: "Digite sua chave de API aqui",
    selectProvider: "Selecione o provedor de IA",
    selectModel: "Selecione o modelo de IA"
  }
};

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

export default function Settings({ theme, language, isAuthenticated }) {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [email, setEmail] = useState('');
  const [serial, setSerial] = useState('');
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  const t = translations[language];

  // Carregar configurações salvas
  useEffect(() => {
    const savedConfig = JSON.parse(localStorage.getItem('llmConfig') || '{}');
    const savedEmail = localStorage.getItem('userEmail');
    const savedSerial = localStorage.getItem('userSerial');

    if (savedConfig[provider]?.apiKey) {
      setApiKey(savedConfig[provider].apiKey);
      setModel(savedConfig[provider].model || PROVIDERS[provider]?.models[0]);
    }

    if (savedEmail) setEmail(savedEmail);
    if (savedSerial) setSerial(savedSerial);
  }, [provider]);

  // Carregar modelos disponíveis
  useEffect(() => {
    const fetchModels = async () => {
      try {
        if (provider === 'ollama') {
          const response = await fetch('http://localhost:11434/api/tags');
          const data = await response.json();
          if (data.models) {
            setAvailableModels(data.models.map(m => m.name));
          }
        } else {
          setAvailableModels(PROVIDERS[provider]?.models || []);
        }
      } catch (error) {
        console.error('Erro ao buscar modelos:', error);
        setAvailableModels([]);
      }
    };

    fetchModels();
  }, [provider]);

  const handleSaveSettings = () => {
    const config = {
      [provider]: {
        provider,
        apiKey,
        model
      }
    };

    localStorage.setItem('llmConfig', JSON.stringify(config));
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userSerial');
    window.location.reload();
  };

  const handlePurchase = async () => {
    if (!email) return;
    try {
      await createCheckoutSession(email);
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
    }
  };

  return (
    <div className="grid grid-cols-[1fr_1fr] gap-6">
      {/* AI Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={theme === "dark" ? "bg-[#141625]/80 border-none backdrop-blur-sm" : "bg-white"}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={theme === "dark" ? "text-white" : "text-gray-900"}>
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                {t.aiSettings}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t.provider}</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className={cn(
                  theme === 'dark' 
                    ? "bg-[#1C1F2E] border-none text-white" 
                    : "bg-gray-100 border-gray-300"
                )}>
                  <SelectValue placeholder={t.selectProvider} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDERS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t.model}</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className={cn(
                  theme === 'dark' 
                    ? "bg-[#1C1F2E] border-none text-white" 
                    : "bg-gray-100 border-gray-300"
                )}>
                  <SelectValue placeholder={t.selectModel} />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {PROVIDERS[provider]?.requiresKey && (
              <div className="space-y-2">
                <Label>{t.apiKey}</Label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t.enterApiKey}
                  className={cn(
                    theme === 'dark' 
                      ? "bg-[#1C1F2E] border-none text-white placeholder-gray-500" 
                      : "bg-gray-100 border-gray-300"
                  )}
                />
              </div>
            )}

            <Button 
              onClick={handleSaveSettings}
              className={cn(
                "w-full transition-all duration-300",
                theme === 'dark'
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              )}
            >
              <Save className="w-4 h-4 mr-2" />
              {t.saveSettings}
            </Button>

            {showSavedMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={theme === "dark" ? "text-green-400 text-center" : "text-green-600 text-center"}
              >
                {t.settingsSaved}
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className={theme === "dark" ? "bg-[#141625]/80 border-none backdrop-blur-sm" : "bg-white"}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className={theme === "dark" ? "text-white" : "text-gray-900"}>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t.accountSettings}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t.email}</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  theme === 'dark' 
                    ? "bg-[#1C1F2E] border-none text-white" 
                    : "bg-gray-100 border-gray-300"
                )}
                readOnly={isAuthenticated}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.serial}</Label>
              <Input
                type="text"
                value={serial}
                className={cn(
                  theme === 'dark' 
                    ? "bg-[#1C1F2E] border-none text-white" 
                    : "bg-gray-100 border-gray-300"
                )}
                readOnly
              />
            </div>

            <div className="space-y-2">
              {!isAuthenticated ? (
                <Button
                  onClick={handlePurchase}
                  className={cn(
                    "w-full transition-all duration-300",
                    theme === 'dark'
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  )}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {t.buyLicense}
                </Button>
              ) : (
                <Button
                  onClick={handleLogout}
                  className={cn(
                    "w-full transition-all duration-300",
                    theme === 'dark'
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-red-500 hover:bg-red-600"
                  )}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t.logout}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
} 