"use client";

import { useState, useEffect } from 'react';
import { Select, Input, Button, VStack, Text } from '@chakra-ui/react';
import { Key } from 'lucide-react';
import { cn } from '@/lib/utils';

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

function LLMConfig({ provider, model, onProviderChange, onModelChange }) {
  const [apiKey, setApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
          if (!PROVIDERS[provider]?.models.includes(model)) {
            onModelChange(PROVIDERS[provider]?.models[0] || '');
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
  }, [provider, model, onModelChange]);

  const saveConfig = () => {
    const savedConfig = JSON.parse(localStorage.getItem('llmConfig') || '{}');
    savedConfig[provider] = {
      provider: provider,
      apiKey: apiKey,
      model: PROVIDERS[provider]?.models.includes(model) ? model : PROVIDERS[provider]?.models[0]
    };
    localStorage.setItem('llmConfig', JSON.stringify(savedConfig));
  };

  return (
    <VStack spacing={4} align="stretch">
      <div className="space-y-4">
        <div>
          <Text mb={2}>Provedor de IA:</Text>
          <Select
            value={provider}
            onChange={(e) => onProviderChange(e.target.value)}
            className={cn(
              "w-full",
              "bg-[#1C1F2E] border-none text-white"
            )}
          >
            {Object.entries(PROVIDERS).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
          </Select>
        </div>

        {PROVIDERS[provider]?.requiresKey && (
          <div>
            <Text mb={2}>API Key:</Text>
            <div className="relative">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`${PROVIDERS[provider].name} API Key`}
                className="h-12 bg-[#1C1F2E] border-none text-white placeholder-gray-500 pl-10"
              />
              <Key className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
            </div>
          </div>
        )}

        <div>
          <Text mb={2}>Modelo:</Text>
          <Select
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            isDisabled={isLoading}
            className={cn(
              "w-full",
              "bg-[#1C1F2E] border-none text-white"
            )}
          >
            {availableModels.map((modelName) => (
              <option key={modelName} value={modelName}>
                {modelName}
              </option>
            ))}
          </Select>
        </div>

        <Button
          className={cn(
            "w-full h-12 transition-all duration-300",
            "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          )}
          onClick={saveConfig}
          isDisabled={PROVIDERS[provider]?.requiresKey && !apiKey}
        >
          Salvar Configurações
        </Button>
      </div>
    </VStack>
  );
}

export default LLMConfig;