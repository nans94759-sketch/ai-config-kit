import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/hooks/use-theme';
import { I18nProvider } from '@/lib/hooks/use-i18n';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'AI Config Kit — Multi-Modal AI Provider & BYOK Settings UI for Next.js',
  description:
    'Drop-in multi-modal AI provider configuration center and BYOK (Bring Your Own Key) UI component for Next.js & React. Supports LLM (OpenAI, Claude, Gemini, DeepSeek, Qwen, Kimi), Image, Video, TTS, ASR, PDF & Web Search with Vercel AI SDK.',
  keywords: [
    'AI Config Kit',
    'BYOK UI',
    'Bring Your Own Key React',
    'AI Provider Settings UI',
    'Next.js AI Settings Component',
    'LLM Model Selector',
    'Vercel AI SDK UI',
    'OpenAI Compatible Relay Config',
    'Cherry Studio Settings UI',
    'LobeChat Settings UI',
    'OpenMAIC Settings',
    'Multi-Modal AI Configuration',
    'AI 接口配置模块',
    '大模型 API Key 设置界面',
  ],
  openGraph: {
    title: 'AI Config Kit — Universal Multi-Modal AI Provider Configuration Center',
    description:
      'Stop rebuilding the AI Provider Settings screen in every AI app. Drop-in 7-modality BYOK configuration UI & store for Next.js.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'AI Config Kit (ai-config-kit)',
    description:
      'Drop-in Multi-Modal AI Provider Configuration Center & BYOK Settings UI Module for Next.js and React applications (LLM, Image, Video, TTS, ASR, PDF, Web Search).',
    codeRepository: 'https://github.com/nans94759-sketch/ai-config-kit',
    programmingLanguage: ['TypeScript', 'React', 'Next.js'],
    runtimePlatform: 'Node.js / Next.js App Router',
    license: 'https://opensource.org/licenses/MIT',
  };

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
