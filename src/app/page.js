'use client';

import dynamic from 'next/dynamic';

// Importar o componente principal de forma dinâmica, sem SSR
const MainApp = dynamic(() => import('@/components/MainApp'), {
  ssr: false, // Desabilitar Server Side Rendering
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <p>Carregando...</p>
    </div>
  )
});

export default function Page() {
  return <MainApp />;
}