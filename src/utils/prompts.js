export const SOCIAL_MEDIA_PROMPT = `Analise a transcrição do vídeo a seguir e crie sugestões de posts otimizados para diferentes plataformas de mídia social.

Para cada plataforma (YouTube, TikTok, Instagram, Facebook e LinkedIn), forneça:

1. 10 sugestões de títulos altamente conversivos específicos para a plataforma
2. Hashtags relevantes e otimizadas (separadas por vírgula)
3. Um resumo em formato storytelling que inclua:
   - Do que se trata o vídeo
   - Situações em que este conteúdo seria útil
   - Problemas que este vídeo ajuda a resolver

Formate a resposta em JSON seguindo esta estrutura:

{
  "youtube": {
    "titles": ["título1", "título2", ...],
    "hashtags": "hashtag1, hashtag2, ...",
    "story": "texto do storytelling"
  },
  "tiktok": {
    "titles": ["título1", "título2", ...],
    "hashtags": "hashtag1, hashtag2, ...",
    "story": "texto do storytelling"
  },
  "instagram": {
    "titles": ["título1", "título2", ...],
    "hashtags": "hashtag1, hashtag2, ...",
    "story": "texto do storytelling"
  },
  "facebook": {
    "titles": ["título1", "título2", ...],
    "hashtags": "hashtag1, hashtag2, ...",
    "story": "texto do storytelling"
  },
  "linkedin": {
    "titles": ["título1", "título2", ...],
    "hashtags": "hashtag1, hashtag2, ...",
    "story": "texto do storytelling"
  }
}

Transcrição do vídeo:
{{transcription}}`; 