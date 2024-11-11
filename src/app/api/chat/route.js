import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req) {
  try {
    const { prompt, provider, model, apiKey } = await req.json();

    if (provider !== 'openai') {
      throw new Error('Apenas OpenAI é suportado para esta funcionalidade');
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em marketing digital e criação de conteúdo para redes sociais.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    return NextResponse.json({
      content: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar sugestões' },
      { status: 500 }
    );
  }
} 