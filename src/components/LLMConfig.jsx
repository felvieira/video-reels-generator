"use client";

import { useState, useEffect } from 'react';
import { Box, Select, Input, Button, VStack, Text, useToast } from '@chakra-ui/react';

const PROVIDERS = {
  ollama: {
    name: 'Ollama (Local)',
    requiresKey: false,
    models: [] // Preenchido dinamicamente
  },
  openai: {
    name: 'OpenAI',
    requiresKey: true,
    models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'] // Modelos fixos da OpenAI
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
  const toast = useToast();

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
          // Buscar modelos do Ollama
          const response = await fetch('http://localhost:11434/api/tags');
          const data = await response.json();
          if (data.models) {
            setAvailableModels(data.models.map(m => m.name));
          }
        } 
        else {
          // Para outros providers, usar lista estática
          setAvailableModels(PROVIDERS[provider]?.models || []);
          
          // Se o modelo atual não existe na lista do provider, selecionar o primeiro
          if (!PROVIDERS[provider]?.models.includes(model)) {
            onModelChange(PROVIDERS[provider]?.models[0] || '');
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar modelos do ${provider}:`, error);
        toast({
          title: `Erro ao buscar modelos do ${PROVIDERS[provider].name}`,
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true
        });
        setAvailableModels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [provider, model, onModelChange]);

  const saveConfig = () => {
    const savedConfig = JSON.parse(localStorage.getItem('llmConfig') || '{}');
    
    // Garantir que o modelo salvo existe para este provider
    const modelToSave = PROVIDERS[provider]?.models.includes(model) ? 
      model : 
      PROVIDERS[provider]?.models[0];

    savedConfig[provider] = {
      provider: provider,
      apiKey: apiKey,
      model: modelToSave
    };
    
    localStorage.setItem('llmConfig', JSON.stringify(savedConfig));

    toast({
      title: 'Configurações salvas',
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box>
        <Text mb={2}>Provedor de IA:</Text>
        <Select
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
        >
          {Object.entries(PROVIDERS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.name}
            </option>
          ))}
        </Select>
      </Box>

      {PROVIDERS[provider]?.requiresKey && (
        <Box>
          <Text mb={2}>API Key:</Text>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`${PROVIDERS[provider].name} API Key`}
          />
        </Box>
      )}

      <Box>
        <Text mb={2}>Modelo:</Text>
        <Select
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          isDisabled={isLoading}
        >
          {availableModels.map((modelName) => (
            <option key={modelName} value={modelName}>
              {modelName}
            </option>
          ))}
        </Select>
      </Box>

      <Button
        colorScheme="blue"
        onClick={saveConfig}
        isDisabled={PROVIDERS[provider]?.requiresKey && !apiKey}
      >
        Salvar Configurações
      </Button>
    </VStack>
  );
}

export default LLMConfig;