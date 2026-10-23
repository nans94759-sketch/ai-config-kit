/**
 * AI Config Kit - Unified Multi-Modal AI Settings Store
 * Synchronized with localStorage ('ai-config-kit-storage') + optional Server Provider YAML/ENV
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProviderId } from '@/lib/ai/providers';
import type { ProvidersConfig, ProviderPricing, TTSProviderPricing } from '@/lib/types/settings';
import { PROVIDERS } from '@/lib/ai/providers';
import type { TTSProviderId, ASRProviderId } from '@/lib/audio/types';
import { ASR_PROVIDERS, DEFAULT_TTS_VOICES, TTS_PROVIDERS } from '@/lib/audio/constants';
import { PDF_PROVIDERS } from '@/lib/pdf/constants';
import type { PDFProviderId } from '@/lib/pdf/types';
import type { ImageProviderId, VideoProviderId } from '@/lib/media/types';
import { IMAGE_PROVIDERS } from '@/lib/media/image-providers';
import { VIDEO_PROVIDERS } from '@/lib/media/video-providers';
import { WEB_SEARCH_PROVIDERS } from '@/lib/web-search/constants';
import type { WebSearchProviderId } from '@/lib/web-search/types';
import { createLogger } from '@/lib/logger';

const log = createLogger('SettingsStore');

export interface SettingsState {
  // Primary LLM Model selection
  providerId: ProviderId;
  modelId: string;

  // LLM Provider configurations
  providersConfig: ProvidersConfig;

  // Audio (TTS & ASR) settings
  ttsProviderId: TTSProviderId;
  ttsVoice: string;
  ttsSpeed: number;
  asrProviderId: ASRProviderId;
  asrLanguage: string;

  ttsProvidersConfig: Record<
    TTSProviderId,
    {
      apiKey: string;
      appId?: string;
      baseUrl: string;
      enabled: boolean;
      isServerConfigured?: boolean;
      serverBaseUrl?: string;
    }
  >;

  asrProvidersConfig: Record<
    ASRProviderId,
    {
      apiKey: string;
      baseUrl: string;
      enabled: boolean;
      isServerConfigured?: boolean;
      serverBaseUrl?: string;
    }
  >;

  // PDF settings
  pdfProviderId: PDFProviderId;
  pdfProvidersConfig: Record<
    PDFProviderId,
    {
      apiKey: string;
      baseUrl: string;
      enabled: boolean;
      isServerConfigured?: boolean;
      serverBaseUrl?: string;
    }
  >;

  // Image Generation settings
  imageProviderId: ImageProviderId;
  imageModelId: string;
  imageProvidersConfig: Record<
    ImageProviderId,
    {
      apiKey: string;
      baseUrl: string;
      enabled: boolean;
      isServerConfigured?: boolean;
      serverBaseUrl?: string;
      serverModels?: string[];
      serverDisabledModels?: string[];
      customModels?: Array<{ id: string; name: string }>;
      disabledModels?: string[];
    }
  >;

  // Video Generation settings
  videoProviderId: VideoProviderId;
  videoModelId: string;
  videoProvidersConfig: Record<
    VideoProviderId,
    {
      apiKey: string;
      baseUrl: string;
      enabled: boolean;
      isServerConfigured?: boolean;
      serverBaseUrl?: string;
      serverModels?: string[];
      serverDisabledModels?: string[];
      customModels?: Array<{ id: string; name: string }>;
      disabledModels?: string[];
    }
  >;

  // Feature toggles
  imageGenerationEnabled: boolean;
  videoGenerationEnabled: boolean;
  mediaConcurrencyEnabled: boolean;
  ttsEnabled: boolean;
  asrEnabled: boolean;

  // Web Search settings
  webSearchProviderId: WebSearchProviderId;
  webSearchProvidersConfig: Record<
    WebSearchProviderId,
    {
      apiKey: string;
      baseUrl: string;
      enabled: boolean;
      isServerConfigured?: boolean;
      serverBaseUrl?: string;
    }
  >;

  // Pricing & Cost Estimation
  costEstimationEnabled: boolean;
  providerPricings: Record<string, ProviderPricing>;
  ttsProviderPricings: Record<string, TTSProviderPricing>;

  // Auto-config lifecycle flag
  autoConfigApplied: boolean;

  // Playback controls
  ttsMuted: boolean;
  ttsVolume: number;

  // Actions
  setModel: (providerId: ProviderId, modelId: string) => void;
  setProviderConfig: (providerId: ProviderId, config: Partial<ProvidersConfig[ProviderId]>) => void;
  setProvidersConfig: (config: ProvidersConfig) => void;
  setTTSMuted: (muted: boolean) => void;
  setTTSVolume: (volume: number) => void;

  // Audio actions
  setTTSProvider: (providerId: TTSProviderId) => void;
  setTTSVoice: (voice: string) => void;
  setTTSSpeed: (speed: number) => void;
  setASRProvider: (providerId: ASRProviderId) => void;
  setASRLanguage: (language: string) => void;
  setTTSProviderConfig: (
    providerId: TTSProviderId,
    config: Partial<{ apiKey: string; appId?: string; baseUrl: string; enabled: boolean }>,
  ) => void;
  setASRProviderConfig: (
    providerId: ASRProviderId,
    config: Partial<{ apiKey: string; baseUrl: string; enabled: boolean }>,
  ) => void;
  setTTSEnabled: (enabled: boolean) => void;
  setASREnabled: (enabled: boolean) => void;

  // PDF actions
  setPDFProvider: (providerId: PDFProviderId) => void;
  setPDFProviderConfig: (
    providerId: PDFProviderId,
    config: Partial<{ apiKey: string; baseUrl: string; enabled: boolean }>,
  ) => void;

  // Image Generation actions
  setImageProvider: (providerId: ImageProviderId) => void;
  setImageModelId: (modelId: string) => void;
  setImageProviderConfig: (
    providerId: ImageProviderId,
    config: Partial<{
      apiKey: string;
      baseUrl: string;
      enabled: boolean;
      customModels: Array<{ id: string; name: string }>;
      disabledModels: string[];
    }>,
  ) => void;

  // Video Generation actions
  setVideoProvider: (providerId: VideoProviderId) => void;
  setVideoModelId: (modelId: string) => void;
  setVideoProviderConfig: (
    providerId: VideoProviderId,
    config: Partial<{
      apiKey: string;
      baseUrl: string;
      enabled: boolean;
      customModels: Array<{ id: string; name: string }>;
      disabledModels: string[];
    }>,
  ) => void;

  // Media generation toggle actions
  setImageGenerationEnabled: (enabled: boolean) => void;
  setVideoGenerationEnabled: (enabled: boolean) => void;
  setMediaConcurrencyEnabled: (enabled: boolean) => void;

  // Web Search actions
  setWebSearchProvider: (providerId: WebSearchProviderId) => void;
  setWebSearchProviderConfig: (
    providerId: WebSearchProviderId,
    config: Partial<{ apiKey: string; baseUrl: string; enabled: boolean }>,
  ) => void;

  // Pricing actions
  setCostEstimationEnabled: (enabled: boolean) => void;
  setProviderPricing: (providerId: string, pricing: Partial<ProviderPricing>) => void;
  setTtsProviderPricing: (providerId: string, pricing: Partial<TTSProviderPricing>) => void;

  // Server provider sync
  fetchServerProviders: () => Promise<void>;

  // Import / Export / Reset actions
  exportConfigJson: (includeApiKeys?: boolean) => string;
  importConfigJson: (jsonString: string) => { success: boolean; error?: string };
  resetAllSettings: () => void;
}

export const getDefaultProvidersConfig = (): ProvidersConfig => {
  const config: ProvidersConfig = {} as ProvidersConfig;
  Object.keys(PROVIDERS).forEach((pid) => {
    const provider = PROVIDERS[pid as ProviderId];
    config[pid as ProviderId] = {
      apiKey: '',
      baseUrl: '',
      models: provider.models,
      name: provider.name,
      type: provider.type,
      defaultBaseUrl: provider.defaultBaseUrl,
      icon: provider.icon,
      requiresApiKey: provider.requiresApiKey,
      isBuiltIn: true,
    };
  });
  return config;
};

export const getDefaultAudioConfig = () => ({
  ttsProviderId: 'browser-native-tts' as TTSProviderId,
  ttsVoice: 'default',
  ttsSpeed: 1.0,
  asrProviderId: 'browser-native' as ASRProviderId,
  asrLanguage: 'zh',
  ttsProvidersConfig: {
    'openai-tts': { apiKey: '', baseUrl: '', enabled: true },
    'azure-tts': { apiKey: '', baseUrl: '', enabled: false },
    'glm-tts': { apiKey: '', baseUrl: '', enabled: false },
    'qwen-tts': { apiKey: '', baseUrl: '', enabled: false },
    'elevenlabs-tts': { apiKey: '', baseUrl: '', enabled: false },
    'volcengine-tts': { apiKey: '', appId: '', baseUrl: '', enabled: false },
    'browser-native-tts': { apiKey: '', baseUrl: '', enabled: true },
  } as Record<TTSProviderId, { apiKey: string; appId?: string; baseUrl: string; enabled: boolean }>,
  asrProvidersConfig: {
    'openai-whisper': { apiKey: '', baseUrl: '', enabled: true },
    'browser-native': { apiKey: '', baseUrl: '', enabled: true },
    'qwen-asr': { apiKey: '', baseUrl: '', enabled: false },
  } as Record<ASRProviderId, { apiKey: string; baseUrl: string; enabled: boolean }>,
});

export const getDefaultPDFConfig = () => ({
  pdfProviderId: 'unpdf' as PDFProviderId,
  pdfProvidersConfig: {
    unpdf: { apiKey: '', baseUrl: '', enabled: true },
    mineru: { apiKey: '', baseUrl: '', enabled: false },
  } as Record<PDFProviderId, { apiKey: string; baseUrl: string; enabled: boolean }>,
});

export const getDefaultImageConfig = () => ({
  imageProviderId: 'seedream' as ImageProviderId,
  imageModelId: 'doubao-seedream-5-0-260128',
  imageProvidersConfig: {
    seedream: { apiKey: '', baseUrl: '', enabled: false },
    'qwen-image': { apiKey: '', baseUrl: '', enabled: false },
    'nano-banana': { apiKey: '', baseUrl: '', enabled: false },
    'grok-image': { apiKey: '', baseUrl: '', enabled: false },
  } as Record<ImageProviderId, { apiKey: string; baseUrl: string; enabled: boolean }>,
});

export const getDefaultVideoConfig = () => ({
  videoProviderId: 'seedance' as VideoProviderId,
  videoModelId: 'doubao-seedance-1-5-pro-251215',
  videoProvidersConfig: {
    seedance: { apiKey: '', baseUrl: '', enabled: false },
    kling: { apiKey: '', baseUrl: '', enabled: false },
    veo: { apiKey: '', baseUrl: '', enabled: false },
    sora: { apiKey: '', baseUrl: '', enabled: false },
    'grok-video': { apiKey: '', baseUrl: '', enabled: false },
  } as Record<VideoProviderId, { apiKey: string; baseUrl: string; enabled: boolean }>,
});

export const getDefaultWebSearchConfig = () => ({
  webSearchProviderId: 'tavily' as WebSearchProviderId,
  webSearchProvidersConfig: {
    tavily: { apiKey: '', baseUrl: '', enabled: true },
  } as Record<WebSearchProviderId, { apiKey: string; baseUrl: string; enabled: boolean }>,
});

function hasProviderId(providerMap: Record<string, unknown>, providerId?: string): boolean {
  return typeof providerId === 'string' && providerId in providerMap;
}

function ensureValidProviderSelections(state: Partial<SettingsState>): void {
  const defaultAudioConfig = getDefaultAudioConfig();
  const defaultPdfConfig = getDefaultPDFConfig();
  const defaultImageConfig = getDefaultImageConfig();
  const defaultVideoConfig = getDefaultVideoConfig();
  const defaultWebSearchConfig = getDefaultWebSearchConfig();

  if (!hasProviderId(PDF_PROVIDERS, state.pdfProviderId)) {
    state.pdfProviderId = defaultPdfConfig.pdfProviderId;
  }
  if (!hasProviderId(WEB_SEARCH_PROVIDERS, state.webSearchProviderId)) {
    state.webSearchProviderId = defaultWebSearchConfig.webSearchProviderId;
  }
  if (!hasProviderId(IMAGE_PROVIDERS, state.imageProviderId)) {
    state.imageProviderId = defaultImageConfig.imageProviderId;
  }
  if (!hasProviderId(VIDEO_PROVIDERS, state.videoProviderId)) {
    state.videoProviderId = defaultVideoConfig.videoProviderId;
  }
  if (!hasProviderId(TTS_PROVIDERS, state.ttsProviderId)) {
    state.ttsProviderId = defaultAudioConfig.ttsProviderId;
  }
  if (!hasProviderId(ASR_PROVIDERS, state.asrProviderId)) {
    state.asrProviderId = defaultAudioConfig.asrProviderId;
  }
}

function ensureBuiltInProviders(state: Partial<SettingsState>): void {
  if (!state.providersConfig) return;
  const defaultConfig = getDefaultProvidersConfig();
  Object.keys(PROVIDERS).forEach((pid) => {
    const providerId = pid as ProviderId;
    if (!state.providersConfig![providerId]) {
      state.providersConfig![providerId] = defaultConfig[providerId];
    } else {
      const provider = PROVIDERS[providerId];
      const existing = state.providersConfig![providerId];
      const existingModelIds = new Set(existing.models?.map((m) => m.id) || []);
      const newModels = provider.models.filter((m) => !existingModelIds.has(m.id));
      const mergedModels =
        newModels.length > 0 ? [...newModels, ...(existing.models || [])] : existing.models;

      state.providersConfig![providerId] = {
        ...existing,
        models: mergedModels,
        name: existing.name || provider.name,
        type: existing.type || provider.type,
        defaultBaseUrl: existing.defaultBaseUrl || provider.defaultBaseUrl,
        icon: provider.icon || existing.icon,
        requiresApiKey: existing.requiresApiKey ?? provider.requiresApiKey,
        isBuiltIn: existing.isBuiltIn ?? true,
      };
    }
  });
}

function ensureBuiltInImageProviders(state: Partial<SettingsState>): void {
  if (!state.imageProvidersConfig) return;
  const defaultConfig = getDefaultImageConfig().imageProvidersConfig;
  Object.keys(IMAGE_PROVIDERS).forEach((pid) => {
    const providerId = pid as ImageProviderId;
    if (!state.imageProvidersConfig![providerId]) {
      state.imageProvidersConfig![providerId] = defaultConfig[providerId];
    }
  });
}

function ensureBuiltInVideoProviders(state: Partial<SettingsState>): void {
  if (!state.videoProvidersConfig) return;
  const defaultConfig = getDefaultVideoConfig().videoProvidersConfig;
  Object.keys(VIDEO_PROVIDERS).forEach((pid) => {
    const providerId = pid as VideoProviderId;
    if (!state.videoProvidersConfig![providerId]) {
      state.videoProvidersConfig![providerId] = defaultConfig[providerId];
    }
  });
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => {
      const defaultAudioConfig = getDefaultAudioConfig();
      const defaultPDFConfig = getDefaultPDFConfig();
      const defaultImageConfig = getDefaultImageConfig();
      const defaultVideoConfig = getDefaultVideoConfig();
      const defaultWebSearchConfig = getDefaultWebSearchConfig();

      return {
        providerId: 'openai',
        modelId: '',
        providersConfig: getDefaultProvidersConfig(),

        ttsMuted: false,
        ttsVolume: 1,

        ...defaultAudioConfig,
        ...defaultPDFConfig,
        ...defaultImageConfig,
        ...defaultVideoConfig,

        imageGenerationEnabled: false,
        videoGenerationEnabled: false,
        mediaConcurrencyEnabled: true,
        ttsEnabled: true,
        asrEnabled: true,

        autoConfigApplied: false,
        costEstimationEnabled: false,
        providerPricings: {},
        ttsProviderPricings: {},

        ...defaultWebSearchConfig,

        // Actions
        setModel: (providerId, modelId) => set({ providerId, modelId }),

        setProviderConfig: (providerId, config) =>
          set((state) => ({
            providersConfig: {
              ...state.providersConfig,
              [providerId]: {
                ...state.providersConfig[providerId],
                ...config,
              },
            },
          })),

        setProvidersConfig: (config) => set({ providersConfig: config }),

        setTTSMuted: (muted) => set({ ttsMuted: muted }),
        setTTSVolume: (volume) => set({ ttsVolume: Math.max(0, Math.min(1, volume)) }),

        setCostEstimationEnabled: (enabled) => set({ costEstimationEnabled: enabled }),
        setProviderPricing: (providerId, pricing) =>
          set((state) => ({
            providerPricings: {
              ...state.providerPricings,
              [providerId]: {
                inputPricePerMillionTokens:
                  pricing.inputPricePerMillionTokens ??
                  state.providerPricings[providerId]?.inputPricePerMillionTokens ??
                  0,
                outputPricePerMillionTokens:
                  pricing.outputPricePerMillionTokens ??
                  state.providerPricings[providerId]?.outputPricePerMillionTokens ??
                  0,
              },
            },
          })),
        setTtsProviderPricing: (providerId, pricing) =>
          set((state) => ({
            ttsProviderPricings: {
              ...state.ttsProviderPricings,
              [providerId]: {
                pricePerMillionChars:
                  pricing.pricePerMillionChars ??
                  state.ttsProviderPricings[providerId]?.pricePerMillionChars ??
                  0,
              },
            },
          })),

        // Audio actions
        setTTSProvider: (providerId) =>
          set((state) => {
            const shouldUpdateVoice = state.ttsProviderId !== providerId;
            return {
              ttsProviderId: providerId,
              ...(shouldUpdateVoice && { ttsVoice: DEFAULT_TTS_VOICES[providerId] }),
            };
          }),

        setTTSVoice: (voice) => set({ ttsVoice: voice }),
        setTTSSpeed: (speed) => set({ ttsSpeed: speed }),

        setASRProvider: (providerId) =>
          set((state) => {
            const supportedLanguages = ASR_PROVIDERS[providerId]?.supportedLanguages || [];
            const isLanguageValid = supportedLanguages.includes(state.asrLanguage);
            return {
              asrProviderId: providerId,
              ...(isLanguageValid ? {} : { asrLanguage: supportedLanguages[0] || 'auto' }),
            };
          }),

        setASRLanguage: (language) => set({ asrLanguage: language }),

        setTTSProviderConfig: (providerId, config) =>
          set((state) => ({
            ttsProvidersConfig: {
              ...state.ttsProvidersConfig,
              [providerId]: {
                ...state.ttsProvidersConfig[providerId],
                ...config,
              },
            },
          })),

        setASRProviderConfig: (providerId, config) =>
          set((state) => ({
            asrProvidersConfig: {
              ...state.asrProvidersConfig,
              [providerId]: {
                ...state.asrProvidersConfig[providerId],
                ...config,
              },
            },
          })),

        // PDF actions
        setPDFProvider: (providerId) => set({ pdfProviderId: providerId }),
        setPDFProviderConfig: (providerId, config) =>
          set((state) => ({
            pdfProvidersConfig: {
              ...state.pdfProvidersConfig,
              [providerId]: {
                ...state.pdfProvidersConfig[providerId],
                ...config,
              },
            },
          })),

        // Image Generation actions
        setImageProvider: (providerId) => set({ imageProviderId: providerId }),
        setImageModelId: (modelId) => set({ imageModelId: modelId }),
        setImageProviderConfig: (providerId, config) =>
          set((state) => ({
            imageProvidersConfig: {
              ...state.imageProvidersConfig,
              [providerId]: {
                ...state.imageProvidersConfig[providerId],
                ...config,
              },
            },
          })),

        // Video Generation actions
        setVideoProvider: (providerId) => set({ videoProviderId: providerId }),
        setVideoModelId: (modelId) => set({ videoModelId: modelId }),
        setVideoProviderConfig: (providerId, config) =>
          set((state) => ({
            videoProvidersConfig: {
              ...state.videoProvidersConfig,
              [providerId]: {
                ...state.videoProvidersConfig[providerId],
                ...config,
              },
            },
          })),

        // Media generation toggle actions
        setImageGenerationEnabled: (enabled) => set({ imageGenerationEnabled: enabled }),
        setVideoGenerationEnabled: (enabled) => set({ videoGenerationEnabled: enabled }),
        setMediaConcurrencyEnabled: (enabled) => set({ mediaConcurrencyEnabled: enabled }),
        setTTSEnabled: (enabled) => set({ ttsEnabled: enabled }),
        setASREnabled: (enabled) => set({ asrEnabled: enabled }),

        // Web Search actions
        setWebSearchProvider: (providerId) => set({ webSearchProviderId: providerId }),
        setWebSearchProviderConfig: (providerId, config) =>
          set((state) => ({
            webSearchProvidersConfig: {
              ...state.webSearchProvidersConfig,
              [providerId]: {
                ...state.webSearchProvidersConfig[providerId],
                ...config,
              },
            },
          })),

        // Fetch server-configured providers from /api/server-providers
        fetchServerProviders: async () => {
          try {
            const serverRes = await fetch('/api/server-providers');
            if (!serverRes.ok) return;
            const data = (await serverRes.json()) as {
              providers: Record<string, { models?: Array<{ id: string; name: string }>; baseUrl?: string }>;
              tts: Record<string, { baseUrl?: string }>;
              asr: Record<string, { baseUrl?: string }>;
              pdf: Record<string, { baseUrl?: string }>;
              image: Record<
                string,
                { models?: Array<{ id: string; name: string }>; disabledModels?: string[]; baseUrl?: string }
              >;
              video: Record<
                string,
                { models?: Array<{ id: string; name: string }>; disabledModels?: string[]; baseUrl?: string }
              >;
              webSearch: Record<string, { baseUrl?: string }>;
            };

            set((state) => {
              // Merge LLM providers
              const newProvidersConfig = { ...state.providersConfig };
              for (const pid of Object.keys(newProvidersConfig)) {
                const key = pid as ProviderId;
                if (newProvidersConfig[key]) {
                  newProvidersConfig[key] = {
                    ...newProvidersConfig[key],
                    isServerConfigured: false,
                    serverModels: undefined,
                    serverBaseUrl: undefined,
                  };
                }
              }
              for (const [pid, info] of Object.entries(data.providers || {})) {
                const key = pid as ProviderId;
                if (newProvidersConfig[key]) {
                  const currentModels = newProvidersConfig[key].models;
                  const filteredModels = info.models?.length
                    ? info.models.map((m) => {
                        const existing = currentModels.find((cm) => cm.id === m.id);
                        return existing ? { ...existing, name: m.name || existing.name } : m;
                      })
                    : currentModels;
                  newProvidersConfig[key] = {
                    ...newProvidersConfig[key],
                    isServerConfigured: true,
                    serverModels: info.models?.map((m) => m.id),
                    serverBaseUrl: info.baseUrl,
                    models: filteredModels,
                  };
                } else {
                  newProvidersConfig[key] = {
                    apiKey: '',
                    baseUrl: info.baseUrl || '',
                    models: info.models || [],
                    name: pid,
                    type: 'openai',
                    defaultBaseUrl: info.baseUrl || '',
                    icon: '',
                    requiresApiKey: true,
                    isBuiltIn: false,
                    isServerConfigured: true,
                    serverModels: info.models?.map((m) => m.id),
                    serverBaseUrl: info.baseUrl,
                  };
                }
              }

              // Merge TTS providers
              const newTTSConfig = { ...state.ttsProvidersConfig };
              for (const pid of Object.keys(newTTSConfig)) {
                const key = pid as TTSProviderId;
                if (newTTSConfig[key]) {
                  newTTSConfig[key] = {
                    ...newTTSConfig[key],
                    isServerConfigured: false,
                    serverBaseUrl: undefined,
                  };
                }
              }
              for (const [pid, info] of Object.entries(data.tts || {})) {
                const key = pid as TTSProviderId;
                if (newTTSConfig[key]) {
                  newTTSConfig[key] = {
                    ...newTTSConfig[key],
                    isServerConfigured: true,
                    serverBaseUrl: info.baseUrl,
                  };
                }
              }

              // Merge ASR providers
              const newASRConfig = { ...state.asrProvidersConfig };
              for (const pid of Object.keys(newASRConfig)) {
                const key = pid as ASRProviderId;
                if (newASRConfig[key]) {
                  newASRConfig[key] = {
                    ...newASRConfig[key],
                    isServerConfigured: false,
                    serverBaseUrl: undefined,
                  };
                }
              }
              for (const [pid, info] of Object.entries(data.asr || {})) {
                const key = pid as ASRProviderId;
                if (newASRConfig[key]) {
                  newASRConfig[key] = {
                    ...newASRConfig[key],
                    isServerConfigured: true,
                    serverBaseUrl: info.baseUrl,
                  };
                }
              }

              // Merge PDF providers
              const newPDFConfig = { ...state.pdfProvidersConfig };
              for (const pid of Object.keys(newPDFConfig)) {
                const key = pid as PDFProviderId;
                if (newPDFConfig[key]) {
                  newPDFConfig[key] = {
                    ...newPDFConfig[key],
                    isServerConfigured: false,
                    serverBaseUrl: undefined,
                  };
                }
              }
              for (const [pid, info] of Object.entries(data.pdf || {})) {
                const key = pid as PDFProviderId;
                if (newPDFConfig[key]) {
                  newPDFConfig[key] = {
                    ...newPDFConfig[key],
                    isServerConfigured: true,
                    serverBaseUrl: info.baseUrl,
                  };
                }
              }

              // Merge Image providers
              const newImageConfig = { ...state.imageProvidersConfig };
              for (const pid of Object.keys(newImageConfig)) {
                const key = pid as ImageProviderId;
                if (newImageConfig[key]) {
                  newImageConfig[key] = {
                    ...newImageConfig[key],
                    isServerConfigured: false,
                    serverBaseUrl: undefined,
                  };
                }
              }
              for (const [pid, info] of Object.entries(data.image || {})) {
                const key = pid as ImageProviderId;
                if (newImageConfig[key]) {
                  if (info.models?.length) {
                    const defaultIds = new Set(IMAGE_PROVIDERS[key]?.models.map((m) => m.id) || []);
                    newImageConfig[key].customModels = info.models.filter((m) => !defaultIds.has(m.id));
                  }
                  newImageConfig[key] = {
                    ...newImageConfig[key],
                    isServerConfigured: true,
                    serverBaseUrl: info.baseUrl,
                    serverModels: info.models?.map((m) => m.id),
                    serverDisabledModels: info.disabledModels,
                  };
                }
              }

              // Merge Video providers
              const newVideoConfig = { ...state.videoProvidersConfig };
              for (const pid of Object.keys(newVideoConfig)) {
                const key = pid as VideoProviderId;
                if (newVideoConfig[key]) {
                  newVideoConfig[key] = {
                    ...newVideoConfig[key],
                    isServerConfigured: false,
                    serverBaseUrl: undefined,
                  };
                }
              }
              for (const [pid, info] of Object.entries(data.video || {})) {
                const key = pid as VideoProviderId;
                if (newVideoConfig[key]) {
                  if (info.models?.length) {
                    const defaultIds = new Set(VIDEO_PROVIDERS[key]?.models.map((m) => m.id) || []);
                    newVideoConfig[key].customModels = info.models.filter((m) => !defaultIds.has(m.id));
                  }
                  newVideoConfig[key] = {
                    ...newVideoConfig[key],
                    isServerConfigured: true,
                    serverBaseUrl: info.baseUrl,
                    serverModels: info.models?.map((m) => m.id),
                    serverDisabledModels: info.disabledModels,
                  };
                }
              }

              // Merge Web Search config
              const newWebSearchConfig = { ...state.webSearchProvidersConfig };
              for (const key of Object.keys(newWebSearchConfig) as WebSearchProviderId[]) {
                newWebSearchConfig[key] = {
                  ...newWebSearchConfig[key],
                  isServerConfigured: false,
                  serverBaseUrl: undefined,
                };
              }
              for (const [pid, info] of Object.entries(data.webSearch || {})) {
                const key = pid as WebSearchProviderId;
                if (newWebSearchConfig[key]) {
                  newWebSearchConfig[key] = {
                    ...newWebSearchConfig[key],
                    isServerConfigured: true,
                    serverBaseUrl: info.baseUrl,
                  };
                }
              }

              // Auto-select server-configured providers on first run
              let autoTtsProvider: TTSProviderId | undefined;
              let autoTtsVoice: string | undefined;
              let autoAsrProvider: ASRProviderId | undefined;
              let autoPdfProvider: PDFProviderId | undefined;
              let autoImageProvider: ImageProviderId | undefined;
              let autoImageModel: string | undefined;
              let autoVideoProvider: VideoProviderId | undefined;
              let autoVideoModel: string | undefined;
              let autoImageEnabled: boolean | undefined;
              let autoVideoEnabled: boolean | undefined;

              if (!state.autoConfigApplied) {
                if (newPDFConfig.mineru?.isServerConfigured && state.pdfProviderId === 'unpdf') {
                  autoPdfProvider = 'mineru';
                }
                const serverTtsIds = Object.keys(data.tts || {}) as TTSProviderId[];
                if (
                  serverTtsIds.length > 0 &&
                  !newTTSConfig[state.ttsProviderId]?.isServerConfigured
                ) {
                  autoTtsProvider = serverTtsIds[0];
                  autoTtsVoice = DEFAULT_TTS_VOICES[autoTtsProvider] || 'default';
                }
                const serverAsrIds = Object.keys(data.asr || {}) as ASRProviderId[];
                if (
                  serverAsrIds.length > 0 &&
                  !newASRConfig[state.asrProviderId]?.isServerConfigured
                ) {
                  autoAsrProvider = serverAsrIds[0];
                }
                const serverImageIds = Object.keys(data.image || {}) as ImageProviderId[];
                if (
                  serverImageIds.length > 0 &&
                  !newImageConfig[state.imageProviderId]?.isServerConfigured
                ) {
                  autoImageProvider = serverImageIds[0];
                  const models = IMAGE_PROVIDERS[autoImageProvider]?.models;
                  if (models?.length) autoImageModel = models[0].id;
                }
                if (serverImageIds.length > 0 && !state.imageGenerationEnabled) {
                  autoImageEnabled = true;
                }
                const serverVideoIds = Object.keys(data.video || {}) as VideoProviderId[];
                if (
                  serverVideoIds.length > 0 &&
                  !newVideoConfig[state.videoProviderId]?.isServerConfigured
                ) {
                  autoVideoProvider = serverVideoIds[0];
                  const models = VIDEO_PROVIDERS[autoVideoProvider]?.models;
                  if (models?.length) autoVideoModel = models[0].id;
                }
                if (serverVideoIds.length > 0 && !state.videoGenerationEnabled) {
                  autoVideoEnabled = true;
                }
              }

              let autoProviderId: ProviderId | undefined;
              let autoModelId: string | undefined;
              if (!state.modelId) {
                for (const [pid, cfg] of Object.entries(newProvidersConfig)) {
                  if (cfg.isServerConfigured) {
                    const serverModels = cfg.serverModels;
                    const modelId = serverModels?.length
                      ? serverModels[0]
                      : PROVIDERS[pid as ProviderId]?.models[0]?.id;
                    if (modelId) {
                      autoProviderId = pid as ProviderId;
                      autoModelId = modelId;
                      break;
                    }
                  }
                }
              }

              return {
                providersConfig: newProvidersConfig,
                ttsProvidersConfig: newTTSConfig,
                asrProvidersConfig: newASRConfig,
                pdfProvidersConfig: newPDFConfig,
                imageProvidersConfig: newImageConfig,
                videoProvidersConfig: newVideoConfig,
                webSearchProvidersConfig: newWebSearchConfig,
                autoConfigApplied: true,
                ...(autoPdfProvider && { pdfProviderId: autoPdfProvider }),
                ...(autoTtsProvider && {
                  ttsProviderId: autoTtsProvider,
                  ttsVoice: autoTtsVoice,
                }),
                ...(autoAsrProvider && { asrProviderId: autoAsrProvider }),
                ...(autoImageProvider && { imageProviderId: autoImageProvider }),
                ...(autoImageModel && { imageModelId: autoImageModel }),
                ...(autoVideoProvider && { videoProviderId: autoVideoProvider }),
                ...(autoVideoModel && { videoModelId: autoVideoModel }),
                ...(autoImageEnabled !== undefined && { imageGenerationEnabled: autoImageEnabled }),
                ...(autoVideoEnabled !== undefined && { videoGenerationEnabled: autoVideoEnabled }),
                ...(autoProviderId && { providerId: autoProviderId }),
                ...(autoModelId && { modelId: autoModelId }),
              };
            });
          } catch (e) {
            log.warn('Failed to fetch server providers:', e);
          }
        },

        exportConfigJson: (includeApiKeys = true) => {
          const s = get();
          const sanitizeMap = <T extends Record<string, { apiKey?: string }>>(map: T): T => {
            if (includeApiKeys) return map;
            const copy: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(map)) {
              copy[k] = { ...v, apiKey: '' };
            }
            return copy as T;
          };

          const payload = {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            providerId: s.providerId,
            modelId: s.modelId,
            providersConfig: sanitizeMap(s.providersConfig),
            imageGenerationEnabled: s.imageGenerationEnabled,
            imageProviderId: s.imageProviderId,
            imageModelId: s.imageModelId,
            imageProvidersConfig: sanitizeMap(s.imageProvidersConfig),
            videoGenerationEnabled: s.videoGenerationEnabled,
            videoProviderId: s.videoProviderId,
            videoModelId: s.videoModelId,
            videoProvidersConfig: sanitizeMap(s.videoProvidersConfig),
            mediaConcurrencyEnabled: s.mediaConcurrencyEnabled,
            ttsEnabled: s.ttsEnabled,
            ttsProviderId: s.ttsProviderId,
            ttsVoice: s.ttsVoice,
            ttsSpeed: s.ttsSpeed,
            ttsProvidersConfig: sanitizeMap(s.ttsProvidersConfig),
            asrEnabled: s.asrEnabled,
            asrProviderId: s.asrProviderId,
            asrLanguage: s.asrLanguage,
            asrProvidersConfig: sanitizeMap(s.asrProvidersConfig),
            pdfProviderId: s.pdfProviderId,
            pdfProvidersConfig: sanitizeMap(s.pdfProvidersConfig),
            webSearchProviderId: s.webSearchProviderId,
            webSearchProvidersConfig: sanitizeMap(s.webSearchProvidersConfig),
            costEstimationEnabled: s.costEstimationEnabled,
            providerPricings: s.providerPricings,
            ttsProviderPricings: s.ttsProviderPricings,
          };

          return JSON.stringify(payload, null, 2);
        },

        importConfigJson: (jsonString: string) => {
          try {
            const parsed = JSON.parse(jsonString);
            if (!parsed || typeof parsed !== 'object') {
              return { success: false, error: 'Invalid JSON object' };
            }
            set((state) => {
              const next: Partial<SettingsState> = {
                providerId: parsed.providerId || state.providerId,
                modelId: parsed.modelId ?? state.modelId,
                providersConfig: parsed.providersConfig
                  ? { ...state.providersConfig, ...parsed.providersConfig }
                  : state.providersConfig,
                imageGenerationEnabled:
                  parsed.imageGenerationEnabled ?? state.imageGenerationEnabled,
                imageProviderId: parsed.imageProviderId || state.imageProviderId,
                imageModelId: parsed.imageModelId || state.imageModelId,
                imageProvidersConfig: parsed.imageProvidersConfig
                  ? { ...state.imageProvidersConfig, ...parsed.imageProvidersConfig }
                  : state.imageProvidersConfig,
                videoGenerationEnabled:
                  parsed.videoGenerationEnabled ?? state.videoGenerationEnabled,
                videoProviderId: parsed.videoProviderId || state.videoProviderId,
                videoModelId: parsed.videoModelId || state.videoModelId,
                videoProvidersConfig: parsed.videoProvidersConfig
                  ? { ...state.videoProvidersConfig, ...parsed.videoProvidersConfig }
                  : state.videoProvidersConfig,
                mediaConcurrencyEnabled:
                  parsed.mediaConcurrencyEnabled ?? state.mediaConcurrencyEnabled,
                ttsEnabled: parsed.ttsEnabled ?? state.ttsEnabled,
                ttsProviderId: parsed.ttsProviderId || state.ttsProviderId,
                ttsVoice: parsed.ttsVoice || state.ttsVoice,
                ttsSpeed: parsed.ttsSpeed ?? state.ttsSpeed,
                ttsProvidersConfig: parsed.ttsProvidersConfig
                  ? { ...state.ttsProvidersConfig, ...parsed.ttsProvidersConfig }
                  : state.ttsProvidersConfig,
                asrEnabled: parsed.asrEnabled ?? state.asrEnabled,
                asrProviderId: parsed.asrProviderId || state.asrProviderId,
                asrLanguage: parsed.asrLanguage || state.asrLanguage,
                asrProvidersConfig: parsed.asrProvidersConfig
                  ? { ...state.asrProvidersConfig, ...parsed.asrProvidersConfig }
                  : state.asrProvidersConfig,
                pdfProviderId: parsed.pdfProviderId || state.pdfProviderId,
                pdfProvidersConfig: parsed.pdfProvidersConfig
                  ? { ...state.pdfProvidersConfig, ...parsed.pdfProvidersConfig }
                  : state.pdfProvidersConfig,
                webSearchProviderId: parsed.webSearchProviderId || state.webSearchProviderId,
                webSearchProvidersConfig: parsed.webSearchProvidersConfig
                  ? { ...state.webSearchProvidersConfig, ...parsed.webSearchProvidersConfig }
                  : state.webSearchProvidersConfig,
                costEstimationEnabled:
                  parsed.costEstimationEnabled ?? state.costEstimationEnabled,
                providerPricings: parsed.providerPricings || state.providerPricings,
                ttsProviderPricings: parsed.ttsProviderPricings || state.ttsProviderPricings,
              };
              ensureBuiltInProviders(next);
              ensureBuiltInImageProviders(next);
              ensureBuiltInVideoProviders(next);
              ensureValidProviderSelections(next);
              return next;
            });
            return { success: true };
          } catch (err) {
            return {
              success: false,
              error: err instanceof Error ? err.message : 'Failed to parse JSON',
            };
          }
        },

        resetAllSettings: () => {
          set({
            providerId: 'openai',
            modelId: '',
            providersConfig: getDefaultProvidersConfig(),
            ...getDefaultAudioConfig(),
            ...getDefaultPDFConfig(),
            ...getDefaultImageConfig(),
            ...getDefaultVideoConfig(),
            ...getDefaultWebSearchConfig(),
            imageGenerationEnabled: false,
            videoGenerationEnabled: false,
            mediaConcurrencyEnabled: true,
            ttsEnabled: true,
            asrEnabled: true,
            costEstimationEnabled: false,
            providerPricings: {},
            ttsProviderPricings: {},
            autoConfigApplied: false,
          });
        },
      };
    },
    {
      name: 'ai-config-kit-storage',
      version: 1,
      merge: (persistedState, currentState) => {
        const merged = { ...currentState, ...(persistedState as object) };
        ensureBuiltInProviders(merged as Partial<SettingsState>);
        ensureBuiltInImageProviders(merged as Partial<SettingsState>);
        ensureBuiltInVideoProviders(merged as Partial<SettingsState>);
        ensureValidProviderSelections(merged as Partial<SettingsState>);
        return merged as SettingsState;
      },
    },
  ),
);
