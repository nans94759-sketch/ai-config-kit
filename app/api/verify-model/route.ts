import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { resolveModel, getSafeMaxOutputTokens } from '@/lib/server/resolve-model';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';

const log = createLogger('VerifyModel');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, baseUrl, model, providerId, modelId, providerType, requiresApiKey } = body;

    const modelString = model || (providerId && modelId ? `${providerId}:${modelId}` : '');
    if (!modelString) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Model or Provider ID + Model ID is required');
    }

    const resolved = await resolveModel({
      modelString,
      apiKey,
      baseUrl,
      providerType,
      requiresApiKey,
    });

    log.info(`Testing model: ${modelString}`);
    const response = await generateText({
      model: resolved.model,
      prompt: 'Say "OK" if you can read this.',
      maxOutputTokens: getSafeMaxOutputTokens(resolved.modelInfo, 10),
    });

    log.info(`Model ${modelString} verified successfully. Response: ${response.text}`);

    return apiSuccess({
      message: 'Model verified successfully',
      response: response.text,
    });
  } catch (error) {
    log.error('Model verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return apiError('GENERATION_FAILED', 500, errorMessage, String(error));
  }
}
