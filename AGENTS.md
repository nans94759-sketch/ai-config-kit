# AGENTS.md — AI Agent Integration Guide for `ai-config-kit`

This file provides instructions for AI coding agents (**Cursor**, **Claude Code**, **Antigravity**, **Windsurf**, **Cline**, **GitHub Copilot**) when integrating `ai-config-kit` into a target Next.js project or modifying this repository.

## 1. Repository Overview

`ai-config-kit` is a self-contained, zero-auth-coupled **Multi-Modal AI Provider Configuration Center** for Next.js (App Router).
It provides both UI components (`<SettingsDialog />`, `<SettingsPanel />`, `<ModelSelector />`, `<MediaPopover />`) and backend model/key resolution (`resolveModel`, `resolveModelFromHeaders`, `provider-config.ts`).

## 2. How to Copy `ai-config-kit` into Another Next.js Project

When a user asks you to integrate `ai-config-kit` into their existing Next.js project:

1. **Copy Static Icons**:
   - Copy `public/logos/*` into the target project's `public/logos/`.
2. **Copy Library Modules**:
   - Copy `lib/ai`, `lib/media`, `lib/audio`, `lib/pdf`, `lib/web-search`, `lib/server`, `lib/store/settings.ts`, `lib/hooks/use-i18n.tsx`, `lib/hooks/use-theme.tsx`, `lib/i18n`, `lib/types`, and `lib/logger.ts` into the target project's `lib/`.
3. **Copy UI & Settings Components**:
   - Copy `components/settings/` into `components/settings/`.
   - Copy any missing shadcn/ui primitives from `components/ui/` into `components/ui/`.
4. **Copy Backend Verification API Routes**:
   - Copy `app/api/server-providers`, `app/api/verify-model`, `app/api/verify-image-provider`, `app/api/verify-video-provider`, `app/api/verify-pdf-provider`, `app/api/verify-web-search`, `app/api/generate/tts`, and `app/api/transcription` into the target project's `app/api/`.
5. **Install Required Dependencies**:
   - Ensure the target `package.json` includes:
     `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `zustand`, `lucide-react`, `radix-ui`, `sonner`, `js-yaml`, `clsx`, `tailwind-merge`, `class-variance-authority`.
   - If server-side TTS (Azure/ElevenLabs/Volcengine) is used, include `ws`, `microsoft-cognitiveservices-speech-sdk`, `@elevenlabs/elevenlabs-js`, `openai`, and `undici`, and add `serverExternalPackages: ['ws', 'microsoft-cognitiveservices-speech-sdk', 'undici']` to `next.config.ts`.
6. **Mount Components**:
   - Render `<SettingsDialog open={open} onOpenChange={setOpen} />` or `<SettingsPanel />` in the target UI.
   - Note: `useI18n()` and `useTheme()` have built-in safe fallbacks, so wrapping the root layout in `<I18nProvider>` / `<ThemeProvider>` is optional.
