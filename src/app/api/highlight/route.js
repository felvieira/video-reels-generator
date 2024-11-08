import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req) {
  try {
    const { transcription, provider, model } = await req.json();

    switch (provider) {
      case 'ollama':
        try {
          const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
            model,
            prompt: `Given this video transcription, identify the most important 1-minute segment that would make a good highlight. Return only the timestamp in format MM:SS-MM:SS.\n\nTranscription: ${transcription}`
          });

          return NextResponse.json({ 
            timestamp: ollamaResponse.data.response.trim(),
            source: 'ollama'
          });
        } catch (error) {
          throw new Error('Ollama não está disponível. Tente outro provedor.');
        }

      case 'openai':
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [{
              role: 'user',
              content: `Given this video transcription, identify the most important 1-minute segment that would make a good highlight. Return only the timestamp in format MM:SS-MM:SS.\n\nTranscription: ${transcription}`
            }]
          })
        });

        const openaiData = await openaiResponse.json();
        return NextResponse.json({
          timestamp: openaiData.choices[0].message.content.trim(),
          source: 'openai'
        });

      case 'openrouter':
        const openRouterResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
          model,
          messages: [{
            role: 'user',
            content: `Given this video transcription, identify the most important 1-minute segment that would make a good highlight. Return only the timestamp in format MM:SS-MM:SS.\n\nTranscription: ${transcription}`
          }]
        }, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_URL,
            'X-Title': 'Video Editor App'
          }
        });

        return NextResponse.json({
          timestamp: openRouterResponse.data.choices[0].message.content.trim(),
          source: 'openrouter'
        });

      default:
        throw new Error('Provedor de IA não suportado');
    }
  } catch (error) {
    console.error('Highlight extraction error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}