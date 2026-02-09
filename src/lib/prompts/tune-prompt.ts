import type { TuneConfig } from "@/types/tune";

const DIMENSION_LABELS: Record<string, { low: string; high: string; name: string }> = {
  formality: { low: "朋友闲聊", high: "董事会邮件", name: "正式度" },
  power: { low: "对下级/平级", high: "对上级/客户", name: "权力关系" },
  emotion: { low: "需要冷静理性", high: "需要共情温暖", name: "情感温度" },
  cognition: { low: "专业人士", high: "普通用户/小朋友", name: "认知水平" },
};

export function buildTunePrompt(message: string, config: TuneConfig, conversationHistory?: string): string {
  const dimensionContext = Object.entries(config)
    .map(([key, value]) => {
      const label = DIMENSION_LABELS[key];
      return `- **${label.name}**: ${value}/100（${label.low} ← → ${label.high}）`;
    })
    .join("\n");

  const contextSection = conversationHistory
    ? `\n## 对话上下文（之前的聊天记录）
"""
${conversationHistory}
"""
`
    : "";

  return `## 任务：语域匹配分析

请分析这段消息的语域（register）是否匹配目标沟通场景。${contextSection ? "\n注意：请结合对话上下文来判断语域是否匹配。" : ""}
${contextSection}
## 待分析的消息（用户准备回复的内容）
"""
${message}
"""

## 目标沟通场景（用户设定的期望值）
${dimensionContext}

## ⚠️ 核心原则：期望值就是目标，严格按方向匹配

上面每个维度的期望值是用户**主动设定的目标**，代表用户**希望消息呈现的风格**。你的任务是判断消息的实际表现是否接近这些目标值。

**方向性判断规则**：
- "跑调" = 实际值偏离期望值。偏离方向是关键。
- 期望值低（如情感温度 0）意味着用户**就是要冷静理性**，消息冷淡是**符合目标的**，不应建议增加温暖。
- 期望值高（如情感温度 100）意味着用户**需要共情温暖**，消息冷淡才是"跑调"。
- 当 score ≈ expected（差距 ≤15），该维度视为匹配，不应标注跑调词。

**举例**：
- 情感温度 expected=10，消息语气冷淡 → score≈15，匹配 ✓，不标注
- 情感温度 expected=10，消息出现"辛苦了""理解你的感受" → score≈60，偏暖，标注这些词为跑调
- 情感温度 expected=90，消息语气冷淡 → score≈20，偏冷，标注冷淡用语为跑调
- 正式度 expected=20，消息使用"您""贵司" → score≈80，偏正式，标注这些词为跑调

## 输出要求

### 1. 总体匹配分数 (registerScore)
0-100 分，衡量消息整体语域与目标场景的匹配程度。score ≈ expected 时分数高。

### 2. 四维评分 (dimensions)
对每个维度：
- **score**: 消息实际表现出的值（0-100）
- **expected**: 用户设定的期望值（就是上面给出的值）
- **gap**: 描述偏离方向和程度。如果 score ≈ expected，写"匹配"。如果偏离，写明**偏离方向**，如"偏正式，期望更口语化"或"偏冷淡，期望更温暖"。注意：方向是 score 相对于 expected 的偏移。

### 3. 跑调词标注 (offtuneWords)
**只标注导致 score 偏离 expected 的词**。如果某维度 score ≈ expected（差距 ≤15），该维度不应产生跑调词。

每个跑调词：
- **word**: 跑调的词/短语
- **position**: 在原文中的字符位置（从0开始）
- **issue**: 为什么跑调——必须说明该词把消息推向了哪个方向，而期望值要求的是相反方向
- **suggestion**: 改进建议（供用户阅读的说明），方向必须朝期望值靠拢
- **replacement**: 可直接替换原词的修正文本（长度和原词相近，可直接放入原文），方向必须朝期望值靠拢
- **dimension**: 属于哪个维度的问题

请严格按照以下 JSON schema 输出，直接输出 JSON 对象，不要用 markdown 代码块包裹，不要在 JSON 前后添加任何文字：
{
  "registerScore": 85,
  "dimensions": {
    "formality": { "score": 45, "expected": 80, "gap": "偏口语化，期望更正式" },
    "power": { "score": 65, "expected": 70, "gap": "匹配" },
    "emotion": { "score": 15, "expected": 10, "gap": "匹配" },
    "cognition": { "score": 50, "expected": 50, "gap": "匹配" }
  },
  "offtuneWords": [
    {
      "word": "搞定",
      "position": 8,
      "issue": "'搞定'偏口语化，而期望正式度为80（接近董事会邮件风格）",
      "suggestion": "正式场合建议用更书面的表达",
      "replacement": "完成",
      "dimension": "formality"
    }
  ]
}

重要提醒：所有字符串值中如果要引用原文，请使用单引号'而不是双引号"，以避免 JSON 格式错误。`;
}
