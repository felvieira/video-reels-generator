import { NextResponse } from 'next/server';
import Stripe from 'stripe';
const { Client, Databases, ID } = require('node-appwrite');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});

// Configurar cliente Appwrite usando o SDK do Node
const client = new Client();

client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Função para gerar serial
const generateSerial = () => {
    return `VRG-${ID.unique().split('-')[0].toUpperCase()}`;
};

export async function POST(request) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const customerEmail = session.customer_email;
            const paymentId = session.payment_intent;
            const serial = generateSerial();

            // Criar licença usando o SDK do Node
            await databases.createDocument(
                'video_reels_db',
                'licenses',
                ID.unique(),
                {
                    email: customerEmail,
                    serial: serial,
                    paymentId: paymentId,
                    createdAt: new Date().toISOString(),
                    active: true
                }
            );

            console.log('Licença criada:', {
                email: customerEmail,
                serial: serial,
                paymentId: paymentId
            });
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Erro no webhook:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 400 }
        );
    }
} 