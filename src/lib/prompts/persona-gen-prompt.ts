export function buildPersonaGenPrompt(chatHistory: string, name?: string): string {
  return `## 任务：从聊天记录生成沟通人格卡片

请分析以下聊天记录，提炼出${name ? `"${name}"` : "对话中主要对方"}的沟通人格特征。

## 聊天记录
"""
${chatHistory}
"""

## 输出要求

### 1. 基本信息
- **name**: ${name ? `"${name}"` : "从聊天记录中推断的名称或代号"}
- **emoji**: 一个最能代表此人沟通风格的 emoji

### 2. 沟通风格标签 (styleLabels)
3-5 个关键词标签，如："结果导向"、"数字敏感"、"讨厌铺垫"、"细节控"

### 3. 偏好模式 (preferencePatterns)
3-5 条沟通偏好，如："喜欢短消息"、"先看结论再听过程"、"讨厌语音消息"

### 4. 雷区 (triggerPoints)
2-4 个容易触发负面反应的点，如："被质疑专业能力时会炸"、"对'应该'这个词敏感"

### 5. 最佳沟通窗口 (communicationWindow)
基于聊天记录推断的最佳沟通时机或方式，如"下午回复更详细更友好"、"微信比邮件回复更快"

### 6. 人格摘要 (summary)
2-3 句话概括此人的沟通人格

### 7. Prompt 片段 (promptFragment)
生成一段可直接用于 AI 提示词的人格描述文本（第二人称"你"，描述此人的沟通特点和思维方式），用于后续从此人视角分析消息。格式类似：
"你是[名称]。你的特点：\\n- 特点1\\n- 特点2\\n..."

请严格按照以下 JSON schema 输出，直接输出 JSON 对象，不要用 markdown 代码块包裹，不要在 JSON 前后添加任何文字：
{
  "name": "张总",
  "emoji": "👨‍💼",
  "styleLabels": ["结果导向", "数据驱动", "不耐烦"],
  "preferencePatterns": ["喜欢短消息", "先看结论"],
  "triggerPoints": ["被质疑时会炸", "讨厌没有数据支撑的建议"],
  "communicationWindow": "上午精力好，回复更快更友好",
  "summary": "典型的结果导向型管理者...",
  "promptFragment": "你是张总。你的特点：\\n- ..."
}

重要提醒：所有字符串值中如果要引用原文，请使用单引号'而不是双引号"，以避免 JSON 格式错误。字符串中的换行必须写成 \\n。`;
}
