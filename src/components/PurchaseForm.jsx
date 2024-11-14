import { useState } from 'react';
import { createCheckoutSession } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PurchaseForm({ theme = 'dark' }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handlePurchase = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await createCheckoutSession(email);
        } catch (error) {
            console.error('Erro na compra:', error);
            toast({
                title: 'Erro ao processar pagamento',
                description: error.message,
                status: 'error',
                duration: 5000
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handlePurchase} className="space-y-4">
            <Input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={cn(
                    "h-12",
                    theme === 'dark' 
                        ? "bg-[#1C1F2E] border-none text-white placeholder-gray-500"
                        : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"
                )}
            />
            <Button 
                type="submit" 
                disabled={isLoading || !email}
                className={cn(
                    "w-full h-12 transition-all duration-300",
                    theme === 'dark'
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                )}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                    </>
                ) : (
                    <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Comprar Licença
                    </>
                )}
            </Button>
        </form>
    );
} 