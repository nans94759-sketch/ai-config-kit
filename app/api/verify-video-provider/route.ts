/**
 * Verify Video Provider API
 *
 * Supports both headers (`x-video-provider`, `x-video-model`, `x-api-key`, `x-base-url`)
 * and JSON body (`{ providerId, model, apiKey, baseUrl }`).
 */

import { NextRequest } from 'next/server';
import { testVideoConnectivity } from '@/lib/media/video-providers';
import { resolveVideoApiKey, resolveVideoBaseUrl } from '@/lib/server/provider-config';
import type { VideoProviderId } from '@/lib/media/types';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createLogger } from '@/lib/logger';
import { validateUrlForSSRF } from '@/lib/server/ssrf-guard';

const log = createLogger('VerifyVideoProvider');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const providerId = (request.headers.get('x-video-provider') ||
      body.providerId ||
      'seedance') as VideoProviderId;
    const model = request.headers.get('x-video-model') || body.model || undefined;
    const clientApiKey = request.headers.get('x-api-key') || body.apiKey || undefined;
    const clientBaseUrl = request.headers.get('x-base-url') || body.baseUrl || undefined;

    if (clientBaseUrl && process.env.NODE_ENV === 'production') {
      const ssrfError = validateUrlForSSRF(clientBaseUrl);
      if (ssrfError) {
        return apiError('INVALID_URL', 403, ssrfError);
      }
    }

    const apiKey = clientBaseUrl
      ? clientApiKey || ''
      : resolveVideoApiKey(providerId, clientApiKey);
    const baseUrl = clientBaseUrl
      ? clientBaseUrl
      : resolveVideoBaseUrl(providerId, clientBaseUrl);

    if (!apiKey) {
      return apiError('MISSING_API_KEY', 400, 'No API key configured');
    }

    const result = await testVideoConnectivity({
      providerId,
      apiKey,
      baseUrl,
      model,
    });

    if (!result.success) {
      return apiError('UPSTREAM_ERROR', 500, result.message);
    }

    return apiSuccess({ message: result.message });
  } catch (err) {
    log.error('Connectivity test error:', err);
    return apiError('INTERNAL_ERROR', 500, `Connectivity test error: ${err}`);
  }
}
