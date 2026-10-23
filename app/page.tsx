'use client';

import { useState } from 'react';
import {
  SettingsDialog,
  SettingsPanel,
  ModelSelector,
  MediaPopover,
} from '@/components/settings';
import type { SettingsSection } from '@/lib/types/settings';
import { useSettingsStore } from '@/lib/store/settings';
import { useI18n } from '@/lib/hooks/use-i18n';
import { useTheme } from '@/lib/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Bot,
  Image as ImageIcon,
  Video,
  Volume2,
  Mic,
  FileText,
  Globe,
  Settings2,
  Code2,
  Moon,
  Sun,
  Languages,
  Maximize2,
  CheckCircle2,
  Sparkles,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ShowcasePage() {
  const { locale, setLocale } = useI18n();
  const { resolvedTheme, setTheme } = useTheme();
  const isZh = locale === 'zh-CN';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>('providers');
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);

  // Store state for live inspector
  const providerId = useSettingsStore((s) => s.providerId);
  const modelId = useSettingsStore((s) => s.modelId);
  const providersConfig = useSettingsStore((s) => s.providersConfig);
  const imageGenerationEnabled = useSettingsStore((s) => s.imageGenerationEnabled);
  const imageProviderId = useSettingsStore((s) => s.imageProviderId);
  const imageModelId = useSettingsStore((s) => s.imageModelId);
  const videoGenerationEnabled = useSettingsStore((s) => s.videoGenerationEnabled);
  const videoProviderId = useSettingsStore((s) => s.videoProviderId);
  const videoModelId = useSettingsStore((s) => s.videoModelId);
  const ttsEnabled = useSettingsStore((s) => s.ttsEnabled);
  const ttsProviderId = useSettingsStore((s) => s.ttsProviderId);
  const ttsVoice = useSettingsStore((s) => s.ttsVoice);
  const asrEnabled = useSettingsStore((s) => s.asrEnabled);
  const asrProviderId = useSettingsStore((s) => s.asrProviderId);
  const pdfProviderId = useSettingsStore((s) => s.pdfProviderId);
  const webSearchProviderId = useSettingsStore((s) => s.webSearchProviderId);

  const openSectionInModal = (section: SettingsSection) => {
    setActiveSection(section);
    setDialogOpen(true);
  };

  const activeLlmConfig = providersConfig[providerId];
  const integrationSnippet = `// 1. Drop-in Modal or Embedded Panel anywhere in your React/Next.js app
import { SettingsDialog, SettingsPanel, ModelSelector, MediaPopover } from '@/components/settings';
import { useSettingsStore } from '@/lib/store/settings';

// 2. Read current user / server-merged configuration from Zustand store
const { providerId, modelId, providersConfig } = useSettingsStore.getState();
const currentProvider = providersConfig[providerId];

// Example request headers for your backend API routes:
const headers = {
  'x-model': \`\${providerId}:\${modelId}\`,
  'x-api-key': currentProvider?.apiKey || '',
  'x-base-url': currentProvider?.baseUrl || '',
  'x-provider-type': currentProvider?.type || 'openai',
};`;

  const statusCards = [
    {
      id: 'providers' as SettingsSection,
      icon: Bot,
      label: isZh ? 'LLM 大语言模型' : 'LLM Model',
      value: modelId ? `${providerId} / ${modelId}` : isZh ? '未选择模型' : 'Not Selected',
      active: !!modelId && (!!activeLlmConfig?.apiKey || !!activeLlmConfig?.isServerConfigured),
    },
    {
      id: 'image' as SettingsSection,
      icon: ImageIcon,
      label: isZh ? 'Image 图像生成' : 'Image Gen',
      value: imageGenerationEnabled
        ? `${imageProviderId} / ${imageModelId}`
        : isZh
          ? '已关闭'
          : 'Disabled',
      active: imageGenerationEnabled,
    },
    {
      id: 'video' as SettingsSection,
      icon: Video,
      label: isZh ? 'Video 视频生成' : 'Video Gen',
      value: videoGenerationEnabled
        ? `${videoProviderId} / ${videoModelId}`
        : isZh
          ? '已关闭'
          : 'Disabled',
      active: videoGenerationEnabled,
    },
    {
      id: 'tts' as SettingsSection,
      icon: Volume2,
      label: isZh ? 'TTS 语音合成' : 'TTS Speech',
      value: ttsEnabled ? `${ttsProviderId} (${ttsVoice})` : isZh ? '已关闭' : 'Disabled',
      active: ttsEnabled,
    },
    {
      id: 'asr' as SettingsSection,
      icon: Mic,
      label: isZh ? 'ASR 语音识别' : 'ASR Voice',
      value: asrEnabled ? asrProviderId : isZh ? '已关闭' : 'Disabled',
      active: asrEnabled,
    },
    {
      id: 'pdf' as SettingsSection,
      icon: FileText,
      label: isZh ? 'PDF 文档解析' : 'PDF Parser',
      value: pdfProviderId,
      active: true,
    },
    {
      id: 'web-search' as SettingsSection,
      icon: Globe,
      label: isZh ? 'Web 联网搜索' : 'Web Search',
      value: webSearchProviderId,
      active: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/15">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight">AI Config Kit</h1>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-mono">
                  v1.0.0
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                {isZh
                  ? '开箱即用的全模态 AI 接口配置中心模块（LLM / 生图 / 视频 / TTS / ASR / PDF / 联网搜索）'
                  : 'Drop-in Multi-Modal AI Interface Configuration Module'}
              </p>
            </div>
          </div>

          {/* Interactive Toolbar Demo: ModelSelector Popover + MediaPopover + Modal Trigger */}
          <div className="flex items-center gap-2 flex-wrap">
            <Popover>
              <PopoverTrigger asChild>
                <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer select-none border border-border/60 bg-muted/40 hover:bg-muted">
                  <Bot className="size-3.5 text-primary" />
                  <span className="max-w-[160px] truncate">
                    {modelId ? `${providerId} / ${modelId}` : isZh ? '选择默认模型' : 'Select LLM'}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[520px] p-0 border-0 shadow-xl">
                <ModelSelector />
              </PopoverContent>
            </Popover>

            <MediaPopover onSettingsOpen={(sec) => openSectionInModal(sec)} />

            <Button
              variant="default"
              size="sm"
              onClick={() => setDialogOpen(true)}
              className="rounded-full h-8 px-3 text-xs gap-1.5 shadow-xs"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              {isZh ? '弹窗模式预览' : 'Open Modal'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCodeSnippet(!showCodeSnippet)}
              className="rounded-full h-8 px-3 text-xs gap-1.5"
            >
              <Code2 className="h-3.5 w-3.5" />
              {isZh ? '接入代码' : 'Code'}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setLocale(isZh ? 'en-US' : 'zh-CN')}
              title={isZh ? 'Switch to English' : '切换中文'}
            >
              <Languages className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              title="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* Live Status Bar across 7 Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {statusCards.map((card) => {
            const Icon = card.icon;
            const isSelected = activeSection === card.id;
            return (
              <button
                key={card.id}
                onClick={() => setActiveSection(card.id)}
                className={`text-left rounded-xl p-3 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary/5 border-primary/40 shadow-xs'
                    : 'bg-background border-border/60 hover:border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className="h-4 w-4 text-primary" />
                  <span
                    className={`h-2 w-2 rounded-full ${
                      card.active ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                    }`}
                  />
                </div>
                <div className="text-[11px] font-medium text-muted-foreground">{card.label}</div>
                <div className="text-xs font-semibold truncate mt-0.5">{card.value}</div>
              </button>
            );
          })}
        </div>

        {/* Collapsible Integration Code Preview */}
        {showCodeSnippet && (
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>
                  {isZh
                    ? '3 步快速接入任意 Next.js / React AI 项目'
                    : 'Quick 3-Step Drop-in Integration'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => {
                  navigator.clipboard.writeText(integrationSnippet);
                  toast.success(isZh ? '已复制接入代码' : 'Copied snippet');
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                {isZh ? '复制' : 'Copy'}
              </Button>
            </div>
            <pre className="text-xs font-mono bg-muted/50 p-3.5 rounded-xl overflow-x-auto border border-border/40">
              {integrationSnippet}
            </pre>
          </div>
        )}

        {/* Embedded 3-Column SettingsPanel */}
        <div className="flex-1 flex flex-col min-h-[640px]">
          <SettingsPanel
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            className="h-[720px]"
          />
        </div>
      </main>

      {/* Modal SettingsDialog (triggered via navbar button or ModelSelector / MediaPopover) */}
      <SettingsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultSection={activeSection}
      />
    </div>
  );
}
