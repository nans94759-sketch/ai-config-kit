# AI Config Kit (`ai-config-kit`)

> **开箱即用的全模态 AI 接口配置中心模块** —— Extracted & decoupled from OpenMAIC, designed as both a **standalone runnable Next.js Showcase App** and a **drop-in modular kit** for any React / Next.js AI product.

---

## ✨ 核心特性 (Features)

1. **全模态 7 大 AI 能力域一站式管理**：
   - 🤖 **LLM 大语言模型 (`providers`)**：内置 OpenAI、Claude (Anthropic)、Gemini (Google)、DeepSeek、Kimi、通义千问 (Qwen)、智谱 (GLM)、MiniMax、硅基流动 (SiliconFlow)、豆包 (Doubao)、Grok (xAI) 11 大主流厂商，并支持**新增任意自定义 OpenAI / Anthropic / Google 兼容中转站**与自定义模型能力标签（Vision 视觉 / Thinking 深度思考 / Tools 工具调用 / 上下文窗口）。
   - 🎨 **Image 图像生成 (`image`)**：内置豆包 Seedream、千问百炼 (Qwen-Image)、Nano Banana (Gemini Image)、Grok Image，支持模型开关管理、自定义模型追加及宽高比探测。
   - 🎬 **Video 视频生成 (`video`)**：内置豆包 Seedance、可灵 (Kling)、Google Veo、OpenAI Sora、Grok Video，支持文生视频/图生视频能力管理与自定义模型追加。
   - 🔊 **TTS 语音合成 (`tts`)**：内置浏览器原生 Web Speech、OpenAI TTS、Azure TTS、智谱 GLM-TTS、千问 Qwen-TTS、火山引擎豆包语音 (Volcengine)、ElevenLabs，支持音色切换、语速调节与**实时试听预览**。
   - 🎙️ **ASR 语音识别 (`asr`)**：内置浏览器原生语音识别、OpenAI Whisper、千问 Qwen-ASR，支持多语种切换与**实时麦克风录音转写测试**。
   - 📄 **PDF 文档解析 (`pdf`)**：内置本地解析 UNPDF 与高精度 MinerU API 配置。
   - 🌐 **Web Search 联网搜索 (`webSearch`)**：内置 Tavily 搜索 API 配置与连通性检测。

2. **两种 UI 形态 + 两大快捷切换器**：
   - `<SettingsDialog />`：毛玻璃弹窗模式（Modal Dialog），随时从导航栏或设置按钮唤起。
   - `<SettingsPanel />`：三栏嵌入式面板（Embedded 3-Column Panel），可直接嵌入独立设置页。
   - `<ModelSelector />`：顶部/输入框旁的大语言模型下拉快切胶囊（带服务商分组、能力 Badge、未配置呼吸灯提醒）。
   - `<MediaPopover />`：多模态能力（Image / Video / TTS / ASR）聚合快捷开关与音色试听浮层。

3. **真实后端连通性检测与双层配置体系**：
   - **一键「测试连通性」**：每个能力面板均配备真实后端探测路由（`/api/verify-*`、`/api/generate/tts`、`/api/transcription`），内置生产环境 SSRF 防护。
   - **客户端 + 服务端双层存储**：
     - 客户端配置自动持久化至浏览器 `localStorage`（`ai-config-kit-storage`），并支持**一键导入/导出 JSON 配置文件（可选脱敏 API Key）**。
     - 服务端支持通过 `.env` 或 `server-providers.yml` 预置企业/团队公共 Key（密钥永不下发前端，前端自动渲染「服务端已配置」徽章）。

---

## 🚀 方式一：作为独立项目直接运行 (Standalone Usage)

```bash
cd ai-config-kit
npm install
npm run dev
```

浏览器打开 `http://localhost:3000` 即可体验包含完整三栏配置面板、弹窗模式、快捷模型选择器与接入代码预览的交互式 Playground。

如需配置服务端预设 Key（可选）：
```bash
cp .env.example .env.local
# 或使用 YAML 配置：
cp server-providers.example.yml server-providers.yml
```

---

## 🧩 方式二：3 步复制到你自己的 Next.js 项目 (Drop-in Integration)

如果你已经有自己的 Next.js (App Router + Tailwind CSS v4) 项目，只需直接复制以下目录即可完整移植：

### 第 1 步：复制核心模块目录

将本仓库中的以下文件夹复制到你的项目根目录：

```text
├── public/logos/                # 各大 AI 厂商高清 SVG/PNG 图标
├── components/settings/         # 全套配置中心 UI 组件 + ModelSelector + MediaPopover
├── components/ui/               # 基础 shadcn/ui 原语组件（如已有可按需合并）
├── lib/
│   ├── ai/                      # LLM 厂商注册表、Vercel AI SDK 适配器与默认参数
│   ├── media/                   # Image & Video 厂商注册表与连通性适配器
│   ├── audio/                   # TTS & ASR 厂商注册表、WebSocket/REST 合成与试听 Hook
│   ├── pdf/                     # PDF 解析服务定义
│   ├── web-search/              # Tavily 联网搜索客户端
│   ├── server/                  # 服务端 Key 解析 (provider-config)、resolveModel 与 SSRF 防护
│   ├── store/settings.ts        # Zustand 全模态配置状态管理（含 JSON 导入导出）
│   ├── hooks/{use-i18n,use-theme}.tsx # 内置零配置 Fallback 的中英双语与主题 Hook
│   ├── i18n/                    # 中英双语词典
│   └── types/                   # TypeScript 类型定义
└── app/api/
    ├── server-providers/        # 下发服务端已配置厂商状态（不含密钥明文）
    ├── verify-model/            # LLM 模型连通性测试接口
    ├── verify-image-provider/   # 图像生成连通性测试接口
    ├── verify-video-provider/   # 视频生成连通性测试接口
    ├── verify-pdf-provider/     # MinerU PDF 连通性测试接口
    ├── verify-web-search/       # Tavily 联网搜索连通性测试接口
    ├── generate/tts/            # TTS 在线试听与语音合成接口
    └── transcription/           # ASR 录音转写测试接口
```

### 第 2 步：在页面中挂载组件

> 💡 `useI18n` 与 `useTheme` 内置了安全默认值（Fallback），即使不包裹 `<I18nProvider>` 也能直接渲染，不会报错。

```tsx
'use client';

import { useState } from 'react';
import {
  SettingsDialog,
  SettingsPanel,
  ModelSelector,
  MediaPopover,
} from '@/components/settings';

export default function MyAIWorkspace() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="p-4 flex items-center gap-3">
      {/* 1. 顶部/对话栏模型快切器 */}
      <ModelSelector />

      {/* 2. 多模态能力（生图/视频/TTS/ASR）快捷开关浮层 */}
      <MediaPopover onSettingsOpen={() => setSettingsOpen(true)} />

      {/* 3. 唤起配置中心弹窗 */}
      <button onClick={() => setSettingsOpen(true)}>打开 AI 接口设置</button>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
```

### 第 3 步：在你的业务代码中读取配置与调用模型

#### 前端读取当前激活配置：
```ts
import { useSettingsStore } from '@/lib/store/settings';

// 在 React 组件外或请求拦截器中直接读取：
const { providerId, modelId, providersConfig } = useSettingsStore.getState();
const currentProvider = providersConfig[providerId];

const response = await fetch('/api/my-chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-model': `${providerId}:${modelId}`,
    'x-api-key': currentProvider?.apiKey || '',
    'x-base-url': currentProvider?.baseUrl || '',
    'x-provider-type': currentProvider?.type || 'openai',
  },
  body: JSON.stringify({ prompt: 'Hello!' }),
});
```

#### 后端路由一键解析为 Vercel AI SDK `LanguageModel` 实例：
```ts
import { NextRequest } from 'next/server';
import { streamText } from 'ai';
import { resolveModelFromHeaders } from '@/lib/server/resolve-model';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  // 自动合并前端传入 Key 与服务端 server-providers.yml / .env Key
  const { model } = await resolveModelFromHeaders(req);

  const result = streamText({
    model,
    prompt,
  });

  return result.toTextStreamResponse();
}
```

---

## 📄 License

MIT
