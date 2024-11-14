import { loadStripe } from '@stripe/stripe-js';
import { shell } from '@tauri-apps/api';

// Usar a chave do ambiente
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export const createCheckoutSession = async (email) => {
    try {
        const response = await fetch('/api/stripe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            throw new Error('Erro ao criar sessão de checkout');
        }

        const { url } = await response.json();

        try {
            // Tentar abrir com Tauri shell primeiro
            await shell.open(url);
        } catch (shellError) {
            console.warn('Erro ao abrir com Tauri shell, tentando window.open:', shellError);
            // Fallback para window.open se shell.open falhar
            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
                throw new Error('Popup bloqueado. Por favor, permita popups para este site.');
            }
        }

    } catch (error) {
        console.error('Erro ao criar sessão:', error);
        throw error;
    }
}; 