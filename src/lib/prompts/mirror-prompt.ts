interface PersonaInfo {
  id: string;
  name: string;
  promptFragment: string;
}

export function buildMirrorPrompt(message: string, personas: PersonaInfo[], conversationHistory?: string): string {
  const personaDescriptions = personas
    .map(
      (p, i) => `### 人格 ${i + 1}: ${p.name} (ID: ${p.id})
${p.promptFragment}`
    )
    .join("\n\n");

  const contextSection = conversationHistory
    ? `\n## 对话上下文（之前的聊天记录）
"""
${conversationHistory}
"""
`
    : "";

  return `## 任务：消息误读分析

请从以下人格视角分析这段消息，生成每个人格的内心独白和风险标注。${contextSection ? "\n注意：请结合对话上下文来理解这条回复的语气和含义。" : ""}
${contextSection}
## 待分析的消息（用户准备回复的内容）
"""
${message}
"""

## 人格视角
${personaDescriptions}

## 输出要求

### 1. 内心独白 (monologue)
- 用第一人称写，用该人格的口吻和思维方式
- 不是分析报告，是这个人看到消息后的真实内心反应
- 包含对具体词句的解读，用引号引用原文
- 长度 100-200 字
- 示例："看到这段话我第一反应是他在推脱。'内部讨论后觉得还需要打磨'——这不就是委婉拒绝吗？而且他说'我们'不说'我'，把责任推给团队。我现在很烦，但又不好直接说。"

### 2. 风险标注 (annotations)
对消息中的每一句话进行标注：
- **red (🔴)**: 高概率被误解，可能引发负面反应
- **yellow (🟡)**: 语气不当或有隐患，建议调整
- **green (🟢)**: 安全，不太会被误读

每个标注需要：
- sentence: 原句
- sentenceIndex: 句子序号（从0开始）
- risk: red/yellow/green
- reason: 为什么有风险（具体、可理解）
- rewrite: 改写建议（保持原意，改善表达）

请严格按照以下 JSON schema 输出，直接输出 JSON 对象，不要用 markdown 代码块包裹，不要在 JSON 前后添加任何文字：
{
  "personas": [
    {
      "personaId": "人格ID",
      "monologue": "第一人称内心独白（字符串中的换行用\\n，双引号用\\\"）",
      "overallReaction": "positive|neutral|confused|negative|hostile",
      "annotations": [
        {
          "sentence": "原句",
          "sentenceIndex": 0,
          "risk": "red|yellow|green",
          "reason": "风险原因",
          "rewrite": "改写建议"
        }
      ]
    }
  ]
}

重要提醒：monologue 和 reason 中如果要引用原文，请使用单引号'而不是双引号"，以避免 JSON 格式错误。`;
}
