import { NextRequest } from 'next/server';
import { WEB_SEARCH_PROVIDERS } from '@/lib/web-search/constants';
import { searchWithTavily } from '@/lib/web-search/tavily';
import { resolveWebSearchApiKey, resolveWebSearchBaseUrl } from '@/lib/server/provider-config';
import type { WebSearchProviderId } from '@/lib/web-search/types';
import { createLogger } from '@/lib/logger';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { validateUrlForSSRF } from '@/lib/server/ssrf-guard';

const log = createLogger('VerifyWebSearch');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { providerId = 'tavily', apiKey: clientApiKey, baseUrl: clientBaseUrl } = body;

    const provider = WEB_SEARCH_PROVIDERS[providerId as WebSearchProviderId];
    if (!provider) {
      return apiError('INVALID_REQUEST', 400, `Unknown web search provider: ${providerId}`);
    }

    if (clientBaseUrl && process.env.NODE_ENV === 'production') {
      const ssrfError = validateUrlForSSRF(clientBaseUrl);
      if (ssrfError) {
        return apiError('INVALID_URL', 400, ssrfError);
      }
    }

    const apiKey = clientBaseUrl
      ? clientApiKey || ''
      : resolveWebSearchApiKey(clientApiKey);
    const baseUrl = clientBaseUrl
      ? clientBaseUrl
      : resolveWebSearchBaseUrl(providerId, clientBaseUrl) || provider.defaultBaseUrl;

    if (provider.requiresApiKey && !apiKey) {
      return apiError('MISSING_API_KEY', 400, `API key is required for ${provider.name}`);
    }

    log.info(`Testing web search provider connectivity: ${providerId}`);

    if (providerId === 'tavily') {
      await searchWithTavily({
        query: 'OpenAI',
        apiKey,
        maxResults: 1,
      });
    }

    log.info(`Web search provider ${providerId} connectivity verified.`);
    return apiSuccess({
      message: `${provider.name} connected successfully`,
    });
  } catch (error) {
    log.error('Web search provider verification error:', error);
    return apiError(
      'GENERATION_FAILED',
      500,
      error instanceof Error ? error.message : 'Unknown error',
      String(error),
    );
  }
}
