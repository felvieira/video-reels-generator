import { Inter } from 'next/font/google';
import './index.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Video Editor',
  description: 'Editor de vídeo para Reels',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <body className={inter.className}>{children}</body>
    </html>
  );
} 