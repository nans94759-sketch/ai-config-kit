import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['ws', 'microsoft-cognitiveservices-speech-sdk', 'undici'],
};

export default nextConfig;
