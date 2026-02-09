# EchoLens — 消息误读模拟器

> 消息发出前，看见对方眼中的你。
>
> *你以为的语气 ≠ 对方感受到的语气*

EchoLens 是一个 AI 驱动的消息分析工具，帮助你在发出消息前，预览不同人格视角下的解读效果。无论是给上司发工作汇报、和朋友聊天还是跟客户沟通，EchoLens 都能让你提前发现潜在的误解风险。

## 功能特性

### 照镜子 (Mirror)
从选定人格的视角生成内心独白，标注句级风险 (🔴🟡🟢)，并提供逐句改写建议。

### 调频道 (Tune)
4 维语域匹配分析（正式度 / 权力距离 / 情感需求 / 认知水平），输出语域匹配分数和词级偏差标注。

### 读心术 (Persona)
从聊天记录自动生成人格画像卡片，保存到本地，供后续分析使用。

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS 4 + shadcn/ui
- **状态管理**: Zustand 5
- **AI**: Claude Sonnet 4.5 (Anthropic SDK)
- **校验**: Zod 4
- **动画**: Framer Motion
- **包管理**: pnpm

## 快速开始

### 前置要求

- Node.js >= 18
- pnpm
- [Anthropic API Key](https://console.anthropic.com/)

### 安装

```bash
# 克隆项目
git clone https://github.com/YEriin/EchoLens.git
cd echolens

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入你的 Anthropic API Key
```

### 运行

```bash
# 开发模式
pnpm dev

# 生产构建
pnpm build
pnpm start
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 项目结构

```
src/
├── app/
│   ├── page.tsx              # 单页应用主入口
│   ├── layout.tsx            # 根布局
│   └── api/
│       ├── analyze/route.ts  # Mirror + Tune 分析接口
│       └── persona/route.ts  # 人格卡片生成接口
├── components/
│   ├── ui/                   # 基础 UI 组件
│   ├── mirror/               # 照镜子模块
│   ├── tune/                 # 调频道模块
│   ├── persona/              # 读心术模块
│   └── results/              # 结果展示组件
├── lib/
│   ├── anthropic.ts          # Claude SDK 客户端
│   ├── rate-limiter.ts       # 速率限制
│   ├── prompts/              # AI 提示词
│   ├── schemas/              # Zod 校验
│   └── utils/                # 工具函数
├── stores/                   # Zustand 状态管理
└── types/                    # TypeScript 类型定义
```

## 架构概览

```
用户输入 → Zustand Store → POST /api/analyze
                             ├─ 并行: Mirror(原文) + Tune(原文)
                             └─ 串行: Mirror 改写 → Tune 再调 → 修正后消息
          → Zod 校验 → Store 更新 → React 渲染
```

## 内置人格

EchoLens 提供 6 个预设人格视角：

| 人格 | 描述 |
|------|------|
| 急躁上司 | 时间紧迫、注重效率的领导 |
| 敏感同事 | 容易过度解读的职场伙伴 |
| 不耐烦客户 | 期待即时解决方案的客户 |
| 严厉家长 | 关心但表达严肃的长辈 |
| 随意朋友 | 轻松随和的社交关系 |
| 职场新人 | 谨慎不安的初入职场者 |

你也可以通过「读心术」功能导入聊天记录，自动生成自定义人格卡片。

## 环境变量

| 变量 | 说明 | 必填 |
|------|------|------|
| `ANTHROPIC_API_KEY` | Anthropic API 密钥 | 是 |

## License

[MIT](LICENSE)
