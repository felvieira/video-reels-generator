import { NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY não está definida');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});

export async function POST(request) {
    console.log('Recebendo requisição POST para criar sessão do Stripe');
    
    try {
        const { email } = await request.json();
        console.log('Email recebido:', email);

        // Criar sessão de checkout
        console.log('Criando sessão do Stripe...');
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'brl',
                        product_data: {
                            name: 'Video Reels Generator - Licença',
                            description: 'Licença vitalícia para o Video Reels Generator'
                        },
                        unit_amount: 9900, // R$ 99,00
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
            customer_email: email,
            metadata: {
                email: email
            }
        });

        console.log('Sessão criada com sucesso:', session.id);
        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error('Erro detalhado ao criar sessão:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// Permitir CORS
export async function OPTIONS(request) {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        },
    });
} 