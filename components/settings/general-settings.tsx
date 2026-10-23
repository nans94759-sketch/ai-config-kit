'use client';

import { useState, useRef } from 'react';
import { useI18n } from '@/lib/hooks/use-i18n';
import { useSettingsStore } from '@/lib/store/settings';
import { PROVIDERS } from '@/lib/ai/providers';
import { TTS_PROVIDERS } from '@/lib/audio/constants';
import type { ProviderId } from '@/lib/types/provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ModelSelector } from './model-selector';
import {
  Bot,
  Download,
  Upload,
  Copy,
  RotateCcw,
  Coins,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export function GeneralSettings() {
  const { locale } = useI18n();
  const isZh = locale === 'zh-CN';

  const providerId = useSettingsStore((s) => s.providerId);
  const modelId = useSettingsStore((s) => s.modelId);
  const providersConfig = useSettingsStore((s) => s.providersConfig);
  const setModel = useSettingsStore((s) => s.setModel);

  const costEstimationEnabled = useSettingsStore((s) => s.costEstimationEnabled);
  const setCostEstimationEnabled = useSettingsStore((s) => s.setCostEstimationEnabled);
  const providerPricings = useSettingsStore((s) => s.providerPricings);
  const setProviderPricing = useSettingsStore((s) => s.setProviderPricing);
  const ttsProviderPricings = useSettingsStore((s) => s.ttsProviderPricings);
  const setTtsProviderPricing = useSettingsStore((s) => s.setTtsProviderPricing);
  const ttsProvidersConfig = useSettingsStore((s) => s.ttsProvidersConfig);

  const exportConfigJson = useSettingsStore((s) => s.exportConfigJson);
  const importConfigJson = useSettingsStore((s) => s.importConfigJson);
  const resetAllSettings = useSettingsStore((s) => s.resetAllSettings);

  const [includeKeysOnExport, setIncludeKeysOnExport] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build available LLM provider groups
  const availableProviders = Object.entries(providersConfig)
    .filter(([, cfg]) => {
      if (!cfg) return false;
      const hasKey = !cfg.requiresApiKey || !!cfg.apiKey || !!cfg.isServerConfigured;
      return hasKey && cfg.models && cfg.models.length > 0;
    })
    .map(([pid, cfg]) => ({
      id: pid as ProviderId,
      name: cfg.name || PROVIDERS[pid as ProviderId]?.name || pid,
      icon: cfg.icon || PROVIDERS[pid as ProviderId]?.icon,
      models: cfg.models || [],
    }));

  const currentModelValue = providerId && modelId ? `${providerId}:${modelId}` : '';

  const handleModelChange = (val: string) => {
    const idx = val.indexOf(':');
    if (idx > 0) {
      const pid = val.slice(0, idx) as ProviderId;
      const mid = val.slice(idx + 1);
      setModel(pid, mid);
      toast.success(
        isZh ? `已切换默认模型为 ${pid} / ${mid}` : `Default model set to ${pid} / ${mid}`,
      );
    }
  };

  const handleDownloadJson = () => {
    const json = exportConfigJson(includeKeysOnExport);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-config-kit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isZh ? '配置文件已导出' : 'Configuration JSON exported');
  };

  const handleCopyJson = async () => {
    const json = exportConfigJson(includeKeysOnExport);
    await navigator.clipboard.writeText(json);
    toast.success(isZh ? '配置 JSON 已复制到剪贴板' : 'Configuration JSON copied to clipboard');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const res = importConfigJson(content);
      if (res.success) {
        toast.success(isZh ? '配置导入成功！' : 'Configuration imported successfully!');
      } else {
        toast.error(
          (isZh ? '导入失败：' : 'Import failed: ') + (res.error || 'Invalid JSON'),
        );
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetAllSettings();
    setConfirmReset(false);
    toast.success(isZh ? '已恢复出厂默认配置' : 'All local configurations have been reset');
  };

  const configuredProviders = Object.entries(providersConfig).filter(
    ([, cfg]) => cfg && (!!cfg.apiKey || !!cfg.isServerConfigured || !cfg.requiresApiKey),
  );
  const configuredTtsProviders = Object.entries(ttsProvidersConfig).filter(
    ([pid, cfg]) =>
      pid !== 'browser-native-tts' && cfg && (!!cfg.apiKey || !!cfg.isServerConfigured),
  );

  return (
    <div className="space-y-6">
      {/* 1. Default Active LLM Model */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">
                {isZh ? '默认激活大语言模型 (Default LLM)' : 'Default Active LLM Model'}
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              {isZh
                ? '从已配置 API 密钥的厂商中选择全局默认调用的大语言模型。'
                : 'Select the primary LLM model from providers with a configured API key.'}
            </p>
          </div>
          {currentModelValue && (
            <Badge variant="secondary" className="font-mono text-[11px]">
              {currentModelValue}
            </Badge>
          )}
        </div>

        <ModelSelector
          providerId={providerId}
          modelId={modelId}
          onModelChange={(pid, mid) => {
            setModel(pid, mid);
            toast.success(
              isZh ? `已切换默认模型为 ${pid} / ${mid}` : `Default model set to ${pid} / ${mid}`,
            );
          }}
          providersConfig={providersConfig}
        />
      </div>

      {/* 2. Configuration JSON Import / Export */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">
              {isZh ? '配置导入与导出 (JSON)' : 'Import & Export Configuration (JSON)'}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground">
            {isZh
              ? '一键备份或迁移全模态服务商配置（LLM、生图、视频、TTS、ASR、PDF、联网搜索）。'
              : 'Backup or migrate your multi-modal AI provider settings across devices or projects.'}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3.5 py-2.5 border border-border/40">
          <div className="space-y-0.5">
            <Label className="text-xs font-medium cursor-pointer" htmlFor="include-keys-switch">
              {isZh ? '导出时包含明文 API Key' : 'Include API Keys in Exported JSON'}
            </Label>
            <p className="text-[11px] text-muted-foreground">
              {isZh
                ? '关闭后将自动脱敏清空所有 API Key，适合公开分享配置模板'
                : 'When disabled, API keys are stripped so you can safely share config templates'}
            </p>
          </div>
          <Switch
            id="include-keys-switch"
            checked={includeKeysOnExport}
            onCheckedChange={setIncludeKeysOnExport}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJson}
            className="rounded-xl h-8 text-xs"
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {isZh ? '导出 JSON 文件' : 'Export JSON File'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyJson}
            className="rounded-xl h-8 text-xs"
          >
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            {isZh ? '复制配置 JSON' : 'Copy JSON'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl h-8 text-xs"
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            {isZh ? '导入 JSON 文件' : 'Import JSON File'}
          </Button>
        </div>
      </div>

      {/* 3. Cost Estimation & Token Pricing */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">
                {isZh ? 'Token 与语音费用估算配置' : 'Token & Audio Cost Estimation'}
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              {isZh
                ? '开启后可配置各厂商每百万 Token / 字符单价，用于业务端费用统计。'
                : 'Configure per-million token/character rates for cost tracking in your app.'}
            </p>
          </div>
          <Switch
            checked={costEstimationEnabled}
            onCheckedChange={setCostEstimationEnabled}
          />
        </div>

        {costEstimationEnabled && (
          <div className="space-y-4 pt-2 border-t border-border/40">
            {configuredProviders.length > 0 ? (
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  {isZh
                    ? 'LLM 厂商费率（元 / 百万 Tokens）'
                    : 'LLM Provider Rates (per 1M Tokens)'}
                </Label>
                <div className="grid gap-2">
                  {configuredProviders.map(([pid, cfg]) => {
                    const pricing = providerPricings[pid] || {
                      inputPricePerMillionTokens: 0,
                      outputPricePerMillionTokens: 0,
                    };
                    return (
                      <div
                        key={pid}
                        className="flex items-center gap-3 rounded-lg bg-muted/20 px-3 py-2 border border-border/40"
                      >
                        <span className="text-xs font-medium w-28 truncate">{cfg.name || pid}</span>
                        <div className="flex items-center gap-1.5 flex-1">
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {isZh ? '输入:' : 'In:'}
                          </span>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={pricing.inputPricePerMillionTokens}
                            onChange={(e) =>
                              setProviderPricing(pid, {
                                inputPricePerMillionTokens: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="h-7 text-xs font-mono rounded-lg"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 flex-1">
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {isZh ? '输出:' : 'Out:'}
                          </span>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={pricing.outputPricePerMillionTokens}
                            onChange={(e) =>
                              setProviderPricing(pid, {
                                outputPricePerMillionTokens: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="h-7 text-xs font-mono rounded-lg"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {configuredTtsProviders.length > 0 && (
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  {isZh
                    ? 'TTS 语音费率（元 / 百万字符）'
                    : 'TTS Provider Rates (per 1M Characters)'}
                </Label>
                <div className="grid gap-2">
                  {configuredTtsProviders.map(([pid]) => {
                    const pricing = ttsProviderPricings[pid] || { pricePerMillionChars: 0 };
                    const name = TTS_PROVIDERS[pid as keyof typeof TTS_PROVIDERS]?.name || pid;
                    return (
                      <div
                        key={pid}
                        className="flex items-center gap-3 rounded-lg bg-muted/20 px-3 py-2 border border-border/40"
                      >
                        <span className="text-xs font-medium w-36 truncate">{name}</span>
                        <div className="flex items-center gap-1.5 flex-1">
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {isZh ? '单价:' : 'Rate:'}
                          </span>
                          <Input
                            type="number"
                            step="1"
                            min="0"
                            value={pricing.pricePerMillionChars}
                            onChange={(e) =>
                              setTtsProviderPricing(pid, {
                                pricePerMillionChars: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="h-7 text-xs font-mono rounded-lg"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Reset All Settings */}
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-4 w-4" />
            <h4 className="text-sm font-semibold">
              {isZh ? '重置本地配置' : 'Reset Local Configuration'}
            </h4>
          </div>
          <p className="text-xs text-muted-foreground">
            {isZh
              ? '清空浏览器本地缓存中的所有自定义密钥与模型设置，恢复初始状态。'
              : 'Clear all locally stored API keys and custom models in localStorage.'}
          </p>
        </div>
        {confirmReset ? (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleReset}
              className="rounded-xl h-8 text-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              {isZh ? '确认重置' : 'Confirm'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmReset(false)}
              className="rounded-xl h-8 text-xs"
            >
              {isZh ? '取消' : 'Cancel'}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmReset(true)}
            className="rounded-xl h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            {isZh ? '重置所有配置' : 'Reset All'}
          </Button>
        )}
      </div>
    </div>
  );
}
