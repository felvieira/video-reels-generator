import { useState } from 'react';
import { verifyLicense } from '@/lib/appwrite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createCheckoutSession } from '@/lib/stripe';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Video, Sun, Moon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { appWindow } from '@tauri-apps/api/window';

const translations = {
    en: {
        title: "Video Editor Login",
        subtitle: "Enter your credentials to continue",
        email: "Email",
        serial: "Serial",
        login: "Login",
        purchase: "Purchase",
        verifying: "Verifying...",
        enter: "Enter",
        buyLicense: "Buy License",
        emailPlaceholder: "Enter your email",
        serialPlaceholder: "Enter your serial"
    },
    pt: {
        title: "Login do Editor de Vídeo",
        subtitle: "Digite suas credenciais para continuar",
        email: "Email",
        serial: "Serial",
        login: "Login",
        purchase: "Comprar",
        verifying: "Verificando...",
        enter: "Entrar",
        buyLicense: "Comprar Licença",
        emailPlaceholder: "Digite seu email",
        serialPlaceholder: "Digite seu serial"
    }
};

export default function LoginForm({ onSuccess, language = 'pt', theme = 'dark', onLanguageChange, onThemeChange }) {
    const [email, setEmail] = useState('');
    const [serial, setSerial] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const [paymentStatus, setPaymentStatus] = useState({
        isProcessing: false,
        message: '',
        type: '', // 'success' ou 'error'
        serial: ''
    });

    const t = translations[language];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const isValid = await verifyLicense(email, serial);
            if (!isValid) {
                throw new Error('Licença inválida');
            }

            localStorage.setItem('userEmail', email);
            localStorage.setItem('userSerial', serial);

            onSuccess();

            toast({
                title: 'Login realizado com sucesso!',
                status: 'success',
                duration: 3000
            });

        } catch (error) {
            console.error('Erro no login:', error);
            toast({
                title: 'Erro no login',
                description: error.message,
                status: 'error',
                duration: 5000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckout = async (email) => {
        try {
            setPaymentStatus({
                isProcessing: true,
                message: 'Complete o pagamento no navegador...',
                type: ''
            });

            await createCheckoutSession(email);

            // Iniciar polling para verificar status do pagamento
            const checkPaymentStatus = setInterval(async () => {
                try {
                    const result = await fetch('/api/check-payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email })
                    });

                    const data = await result.json();

                    if (data.status === 'success') {
                        clearInterval(checkPaymentStatus);
                        setPaymentStatus({
                            isProcessing: false,
                            message: 'Pagamento confirmado! Guarde seu serial com cuidado:',
                            type: 'success',
                            serial: data.serial
                        });

                        localStorage.setItem('userEmail', email);
                        localStorage.setItem('userSerial', data.serial);
                        
                        setTimeout(() => onSuccess(), 3000);
                    }
                    
                    if (data.status === 'failed') {
                        clearInterval(checkPaymentStatus);
                        setPaymentStatus({
                            isProcessing: false,
                            message: 'Pagamento cancelado ou falhou. Tente novamente.',
                            type: 'error'
                        });
                    }

                } catch (error) {
                    clearInterval(checkPaymentStatus);
                    setPaymentStatus({
                        isProcessing: false,
                        message: 'Erro ao verificar pagamento. Tente novamente.',
                        type: 'error'
                    });
                    console.error('Erro ao verificar status:', error);
                }
            }, 3000);

            // Detectar quando a janela do Stripe é fechada
            const checkWindowClosed = setInterval(() => {
                if (!document.hasFocus()) {
                    clearInterval(checkWindowClosed);
                    setTimeout(() => {
                        if (paymentStatus.isProcessing) {
                            setPaymentStatus({
                                isProcessing: false,
                                message: 'Pagamento cancelado. A janela foi fechada.',
                                type: 'error'
                            });
                        }
                    }, 1000);
                }
            }, 1000);

            // Limpar intervalos após 5 minutos
            setTimeout(() => {
                clearInterval(checkPaymentStatus);
                clearInterval(checkWindowClosed);
                if (paymentStatus.isProcessing) {
                    setPaymentStatus({
                        isProcessing: false,
                        message: 'Tempo limite excedido. Tente novamente.',
                        type: 'error'
                    });
                }
            }, 300000);

        } catch (error) {
            setPaymentStatus({
                isProcessing: false,
                message: 'Erro ao iniciar pagamento. Tente novamente.',
                type: 'error'
            });
            console.error('Erro ao criar sessão:', error);
        }
    };

    return (
        <div className={cn(
            "min-h-screen font-sans",
            theme === "dark" 
                ? "bg-gradient-to-br from-[#0A0C10] to-[#1A1C20] text-white" 
                : "bg-gradient-to-br from-gray-100 to-white text-gray-900"
        )}>
            {/* Barra de título customizada */}
            <div 
                data-tauri-drag-region 
                className="h-10 flex justify-between items-center px-4 bg-black/20 backdrop-blur-sm fixed top-0 left-0 right-0 z-50"
            >
                <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-white/60" />
                    <span className="text-sm text-white/60">Video Editor</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => appWindow.minimize()}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <span className="block w-3 h-0.5 bg-white/60" />
                    </button>
                    <button
                        onClick={() => appWindow.toggleMaximize()}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <div className="w-3 h-3 border border-white/60" />
                    </button>
                    <button
                        onClick={() => appWindow.close()}
                        className="p-2 hover:bg-red-500/50 rounded-lg transition-colors"
                    >
                        <span className="block w-3 h-3 text-white/60">×</span>
                    </button>
                </div>
            </div>

            {/* Resto do conteúdo com padding-top para compensar a barra fixa */}
            <div className="flex items-center justify-center min-h-screen pt-10">
                <Card className={cn(
                    "w-[400px]",
                    theme === 'dark' ? "bg-[#141625]/80 border-none backdrop-blur-sm" : "bg-white"
                )}>
                    <CardHeader>
                        <CardTitle className={cn(
                            "text-2xl font-bold",
                            theme === "dark" 
                                ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
                                : "text-blue-600"
                        )}>{t.title}</CardTitle>
                        <CardDescription className={theme === 'dark' ? "text-gray-400" : "text-gray-600"}>
                            {t.subtitle}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className={cn(
                                "w-full grid grid-cols-2 mb-4",
                                theme === 'dark' ? "bg-[#1C1F2E]" : "bg-gray-100"
                            )}>
                                <TabsTrigger value="login" className={cn(
                                    "transition-all duration-300",
                                    theme === 'dark' 
                                        ? "data-[state=active]:bg-blue-600 text-white" 
                                        : "data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                                )}>
                                    {t.login}
                                </TabsTrigger>
                                <TabsTrigger value="purchase" className={cn(
                                    "transition-all duration-300",
                                    theme === 'dark' 
                                        ? "data-[state=active]:bg-blue-600 text-white" 
                                        : "data-[state=active]:bg-blue-500 data-[state=active]:text-white"
                                )}>
                                    {t.purchase}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input
                                        type="email"
                                        placeholder={t.emailPlaceholder}
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
                                    <Input
                                        type="text"
                                        placeholder={t.serialPlaceholder}
                                        value={serial}
                                        onChange={(e) => setSerial(e.target.value)}
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
                                        disabled={isLoading} 
                                        className={cn(
                                            "w-full h-12 transition-all duration-300",
                                            theme === 'dark'
                                                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                        )}
                                    >
                                        {isLoading ? t.verifying : t.enter}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="purchase">
                                <div className="space-y-4">
                                    <Input
                                        type="email"
                                        placeholder={t.emailPlaceholder}
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
                                        className={cn(
                                            "w-full h-12 transition-all duration-300",
                                            theme === 'dark'
                                                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                                : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                                        )}
                                        onClick={() => handleCheckout(email)}
                                        disabled={!email || paymentStatus.isProcessing}
                                    >
                                        {paymentStatus.isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Processando...
                                            </>
                                        ) : (
                                            t.buyLicense
                                        )}
                                    </Button>

                                    {/* Status do Pagamento */}
                                    {paymentStatus.message && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn(
                                                "p-4 rounded-lg text-center",
                                                paymentStatus.type === 'success' 
                                                    ? theme === 'dark' ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-800"
                                                    : paymentStatus.type === 'error'
                                                    ? theme === 'dark' ? "bg-red-500/20 text-red-400" : "bg-red-100 text-red-800"
                                                    : theme === 'dark' ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-800"
                                            )}
                                        >
                                            <p>{paymentStatus.message}</p>
                                            {paymentStatus.serial && (
                                                <p className="mt-2 font-mono text-lg">{paymentStatus.serial}</p>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 