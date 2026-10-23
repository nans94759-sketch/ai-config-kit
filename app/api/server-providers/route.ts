/**
 * GET /api/server-providers
 *
 * Returns the list of server-configured provider IDs and optional metadata
 * (models, baseUrl). API keys are never exposed to the client.
 */

import { NextResponse } from 'next/server';
import {
  getServerProviders,
  getServerTTSProviders,
  getServerASRProviders,
  getServerPDFProviders,
  getServerImageProviders,
  getServerVideoProviders,
  getServerWebSearchProviders,
} from '@/lib/server/provider-config';

export async function GET() {
  const rawProviders = getServerProviders();
  const formattedProviders: Record<
    string,
    { models?: Array<{ id: string; name: string }>; baseUrl?: string }
  > = {};

  for (const [id, entry] of Object.entries(rawProviders)) {
    formattedProviders[id] = {
      baseUrl: entry.baseUrl,
      models: entry.models?.map((m) => ({ id: m, name: m })),
    };
  }

  return NextResponse.json({
    providers: formattedProviders,
    tts: getServerTTSProviders(),
    asr: getServerASRProviders(),
    pdf: getServerPDFProviders(),
    image: getServerImageProviders(),
    video: getServerVideoProviders(),
    webSearch: getServerWebSearchProviders(),
  });
}
