"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Linkedin, 
  Instagram, 
  Facebook, 
  Youtube, 
  Share2, // Para TikTok
  Copy, 
  Check 
} from 'lucide-react';

const PLATFORMS = [
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { key: 'instagram', icon: Instagram, label: 'Instagram' },
  { key: 'tiktok', icon: Share2, label: 'TikTok' },
  { key: 'facebook', icon: Facebook, label: 'Facebook' },
  { key: 'youtube', icon: Youtube, label: 'YouTube' }
];

function SocialMediaResults({ results }) {
  const [copiedStates, setCopiedStates] = useState({});

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates({ ...copiedStates, [key]: true });
      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [key]: false });
      }, 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue={PLATFORMS[0].key} className="w-full">
        <TabsList className="w-full p-1 rounded-lg bg-[#1C1F2E]">
          {PLATFORMS.map(platform => (
            results[platform.key] && (
              <TabsTrigger
                key={platform.key}
                value={platform.key}
                className={cn(
                  "flex-1 rounded-md transition-all duration-300",
                  "data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                )}
              >
                <platform.icon className="w-5 h-5 mr-2" />
                {platform.label}
              </TabsTrigger>
            )
          ))}
        </TabsList>

        {PLATFORMS.map(platform => (
          results[platform.key] && (
            <TabsContent key={platform.key} value={platform.key} className="mt-6 space-y-6">
              {/* Títulos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Títulos Sugeridos</h3>
                <div className="space-y-2">
                  {results[platform.key].titles.map((title, index) => (
                    <div key={index} className="flex items-center justify-between gap-4 p-4 rounded-lg bg-[#1C1F2E]">
                      <p className="text-white">{title}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(title, `${platform.key}-title-${index}`)}
                      >
                        {copiedStates[`${platform.key}-title-${index}`] ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Hashtags</h3>
                <div className="relative">
                  <Textarea
                    value={results[platform.key].hashtags}
                    readOnly
                    className="min-h-[100px] bg-[#1C1F2E] border-none text-white"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(results[platform.key].hashtags, `${platform.key}-hashtags`)}
                  >
                    {copiedStates[`${platform.key}-hashtags`] ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Storytelling */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Storytelling</h3>
                <div className="relative">
                  <Textarea
                    value={results[platform.key].story}
                    readOnly
                    className="min-h-[200px] bg-[#1C1F2E] border-none text-white"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleCopy(results[platform.key].story, `${platform.key}-story`)}
                  >
                    {copiedStates[`${platform.key}-story`] ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          )
        ))}
      </Tabs>
    </div>
  );
}

export default SocialMediaResults;