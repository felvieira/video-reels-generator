import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { 
  Linkedin,
  Instagram,
  Share2,
  Facebook,
  Youtube as YoutubeIcon
} from 'lucide-react';

const translations = {
  en: {
    contentType: "Content Type",
    generateText: "Generate Text",
    generateHashtags: "Generate Hashtags",
    socialNetworks: "Select Social Networks",
    contentGeneration: "Content Generation",
    transcriptionOptions: "Transcription Options"
  },
  pt: {
    contentType: "Tipo de Conteúdo",
    generateText: "Gerar Texto",
    generateHashtags: "Gerar Hashtags",
    socialNetworks: "Selecionar Redes Sociais",
    contentGeneration: "Geração de Conteúdo",
    transcriptionOptions: "Opções de Transcrição"
  }
};

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

export default function TranscriptionOptions({ 
  theme, 
  language,
  selectedContentType,
  setSelectedContentType,
  selectedSocialNetworks,
  setSelectedSocialNetworks
}) {
  const t = translations[language];

  return (
    <div className="space-y-4">
      <h3 className={cn(
        "text-sm font-medium uppercase",
        theme === "dark" ? "text-blue-400" : "text-blue-600"
      )}>
        {t.transcriptionOptions}
      </h3>
      
      <div className="space-y-4">
        <Label>{t.contentType}</Label>
        <RadioGroup
          value={selectedContentType}
          onValueChange={setSelectedContentType}
          className="grid grid-cols-3 gap-4"
        >
          {contentTypes.map((type) => (
            <Label
              key={type.value}
              className={cn(
                "flex items-center justify-center p-4 rounded-lg cursor-pointer transition-all duration-300",
                theme === "dark"
                  ? "bg-[#1C1F2E] hover:bg-[#252942]"
                  : "bg-gray-100 hover:bg-gray-200",
                selectedContentType === type.value &&
                  (theme === "dark"
                    ? "ring-2 ring-blue-500"
                    : "ring-2 ring-blue-400")
              )}
            >
              <RadioGroupItem value={type.value} className="hidden" />
              <span className={cn(
                selectedContentType === type.value
                  ? theme === "dark"
                    ? "text-white"
                    : "text-gray-900"
                  : theme === "dark"
                  ? "text-gray-400"
                  : "text-gray-600"
              )}>
                {type.label}
              </span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Redes Sociais */}
      <div className="space-y-4">
        <h3 className={cn(
          "text-sm font-medium uppercase",
          theme === "dark" ? "text-blue-400" : "text-blue-600"
        )}>
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
    </div>
  );
} 