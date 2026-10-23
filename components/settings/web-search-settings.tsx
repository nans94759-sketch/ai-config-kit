'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/hooks/use-i18n';
import { useSettingsStore } from '@/lib/store/settings';
import { WEB_SEARCH_PROVIDERS } from '@/lib/web-search/constants';
import type { WebSearchProviderId } from '@/lib/web-search/types';
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface WebSearchSettingsProps {
  selectedProviderId: WebSearchProviderId;
}

export function WebSearchSettings({ selectedProviderId }: WebSearchSettingsProps) {
  const { t } = useI18n();
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);

  const webSearchProvidersConfig = useSettingsStore((state) => state.webSearchProvidersConfig);
  const setWebSearchProviderConfig = useSettingsStore((state) => state.setWebSearchProviderConfig);

  const provider = WEB_SEARCH_PROVIDERS[selectedProviderId];
  const currentConfig = webSearchProvidersConfig[selectedProviderId];
  const isServerConfigured = !!currentConfig?.isServerConfigured;

  const [prevSelectedProviderId, setPrevSelectedProviderId] = useState(selectedProviderId);
  if (selectedProviderId !== prevSelectedProviderId) {
    setPrevSelectedProviderId(selectedProviderId);
    setShowApiKey(false);
  }

  const handleTestConnectivity = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/verify-web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProviderId,
          apiKey: currentConfig?.apiKey || '',
          baseUrl: currentConfig?.baseUrl || undefined,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(data.message || t('settings.connectionSuccess'));
      } else {
        toast.error(data.error || t('settings.connectionFailed'));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('settings.connectionFailed'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Server-configured notice */}
      {isServerConfigured && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-3 text-sm text-blue-700 dark:text-blue-300">
          {t('settings.serverConfiguredNotice')}
        </div>
      )}

      {/* API Key + Base URL Configuration */}
      {(provider.requiresApiKey || isServerConfigured) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">{t('settings.webSearchApiKey')}</Label>
              <div className="relative">
                <Input
                  name={`web-search-api-key-${selectedProviderId}`}
                  type={showApiKey ? 'text' : 'password'}
                  autoComplete="new-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder={
                    isServerConfigured ? t('settings.optionalOverride') : t('settings.enterApiKey')
                  }
                  value={currentConfig?.apiKey || ''}
                  onChange={(e) =>
                    setWebSearchProviderConfig(selectedProviderId, {
                      apiKey: e.target.value,
                    })
                  }
                  className="font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{t('settings.webSearchApiKeyHint')}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t('settings.webSearchBaseUrl')}</Label>
              <Input
                name={`web-search-base-url-${selectedProviderId}`}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder={provider.defaultBaseUrl || 'https://api.tavily.com'}
                value={currentConfig?.baseUrl || ''}
                onChange={(e) =>
                  setWebSearchProviderConfig(selectedProviderId, {
                    baseUrl: e.target.value,
                  })
                }
                className="text-sm"
              />
            </div>
          </div>

          {/* Request URL Preview & Connectivity Test */}
          <div className="flex items-center justify-between gap-4 pt-1">
            {(() => {
              const effectiveBaseUrl =
                currentConfig?.baseUrl || provider.defaultBaseUrl || '';
              if (!effectiveBaseUrl) return <span />;
              const fullUrl = effectiveBaseUrl.replace(/\/+$/, '') + '/search';
              return (
                <p className="text-xs text-muted-foreground break-all">
                  {t('settings.requestUrl')}: {fullUrl}
                </p>
              );
            })()}

            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnectivity}
              disabled={testing || (!currentConfig?.apiKey && !isServerConfigured)}
              className="shrink-0"
            >
              {testing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  {t('settings.testing')}
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                  {t('settings.testConnectivity')}
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
