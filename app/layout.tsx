import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/hooks/use-theme';
import { I18nProvider } from '@/lib/hooks/use-i18n';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'AI Config Kit — Universal Multi-Modal AI Provider Configuration Center',
  description:
    'Plug-and-play multi-modal AI interface configuration module supporting LLM, Image, Video, TTS, ASR, PDF & Web Search with client/server dual-layer config and live connectivity testing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <I18nProvider>
            {children}
            <Toaster position="top-center" richColors />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
