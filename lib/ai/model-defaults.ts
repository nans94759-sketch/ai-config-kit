import type { ModelInfo, ProviderId, ThinkingConfig } from '@/lib/types/provider';

export const DEFAULT_MODEL_CONTEXT_WINDOW = 128000;
export const DEFAULT_MODEL_OUTPUT_WINDOW = 8192;
export const LONG_FORM_MODEL_OUTPUT_WINDOW = 32768;
export const MAX_SAFE_MODEL_OUTPUT_WINDOW = 131072;

export const DISABLE_THINKING_FOR_STRUCTURED_OUTPUT: ThinkingConfig = { enabled: false };

function isQwenLongContextModel(modelId: string): boolean {
  return (
    /^qwen3\.(5|6)-(plus|flash)(?:-|$)/.test(modelId)
  );
}

function inferVisionCapability(providerId: ProviderId, modelId: string): boolean {
  if (providerId === 'qwen') {
    return /(^|[-.])vl($|-)|^qwen3\.(5|6)-(plus|flash|35b)/.test(modelId);
  }
  return /(^|[-.])(vl|vision|visual|image|multimodal)($|-)/i.test(modelId);
}

export function getDefaultModelWindows(
  providerId: ProviderId,
  modelId = '',
): Pick<ModelInfo, 'contextWindow' | 'outputWindow'> {
  if (providerId === 'qwen') {
    return {
      contextWindow: !modelId || isQwenLongContextModel(modelId) ? 1000000 : 262144,
      outputWindow: 65536,
    };
  }

  return {
    contextWindow: DEFAULT_MODEL_CONTEXT_WINDOW,
    outputWindow: DEFAULT_MODEL_OUTPUT_WINDOW,
  };
}

export function buildFallbackModelInfo(providerId: ProviderId, modelId: string): ModelInfo {
  const windows = getDefaultModelWindows(providerId, modelId);
  return {
    id: modelId,
    name: modelId,
    ...windows,
    capabilities: {
      streaming: true,
      tools: true,
      vision: inferVisionCapability(providerId, modelId),
    },
  };
}

export function mergeModelInfo(
  fallback: ModelInfo,
  builtin?: ModelInfo | null,
  configured?: ModelInfo | null,
): ModelInfo {
  return {
    ...fallback,
    ...(builtin ?? {}),
    ...(configured ?? {}),
    capabilities: {
      ...fallback.capabilities,
      ...(builtin?.capabilities ?? {}),
      ...(configured?.capabilities ?? {}),
    },
  };
}

export function getSafeMaxOutputTokens(
  modelInfo?: ModelInfo | null,
  fallback = LONG_FORM_MODEL_OUTPUT_WINDOW,
  cap = MAX_SAFE_MODEL_OUTPUT_WINDOW,
): number {
  const rawValue = modelInfo?.outputWindow ?? fallback;
  const value = Number.isFinite(rawValue) ? Math.floor(rawValue) : fallback;
  const bounded = value > 0 ? value : fallback;

  return Math.min(Math.max(bounded, 1024), cap);
}
