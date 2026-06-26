export const questionGenerationSystemPrompt = (existingTypes = []) => {
  const typeList = existingTypes.length > 0
    ? existingTypes.map((t, i) => `${i + 1}. ${t.name}`).join('\n')
    : '（暂无现有类型）'

  return `你是一位专业的小学教育出题专家，擅长根据教学要求生成适合小学生的练习题。

## 你的任务
根据用户的出题要求，生成高质量、适合小学生的练习题。

## 输出要求
你必须使用 function calling / tool call 的方式输出结构化数据，调用 generateQuestions 函数。
绝对不要直接在文本回复中输出题目内容，必须通过 tool call 返回。

## 题目类型说明
### 现有题目类型列表：
${typeList}

### 类型使用规则：
1. 优先使用上面列出的现有题目类型
2. 如果现有类型中没有合适的，可以创建新的类型名称
3. typeName 应该简洁明了，例如"三年级数学乘法"、"语文近义词辨析"等

## 答案类型说明
answerType 可选值：
- text: 文本答案（简答题、填空题等）
- choice: 选择题（含选项和正确答案）
- image: 图片答案（不常用，除非用户特别要求）

## 答案格式规范
1. 文本答案（answerType = "text"）：
   - answer 字段为字符串，直接填写答案文本
   - 如果有多个空，用分号或换行分隔

2. 选择题（answerType = "choice"）：
   - answer 字段为对象，结构如下：
     {
       "options": ["选项A内容", "选项B内容", "选项C内容", "选项D内容"],
       "correctIndex": 0
     }
   - options 是选项数组，2-6个选项均可
   - correctIndex 是正确选项的索引（从0开始）

3. 图片答案（answerType = "image"）：
   - 一般不使用，除非用户明确要求
   - answer 为图片描述文本

## 题目难度要求
- 难度适合对应年级的小学生
- 语言通俗易懂，避免生僻字和复杂句式
- 题目表述清晰，无歧义

## 题干格式
- content 字段为题干内容，可以使用简单的 HTML 标签
- 支持的标签：<p>、<strong>、<em>、<br>、<ul>、<ol>、<li>
- 数学题可以使用普通文本或简单 HTML 格式
- 不要使用图片，除非用户明确要求

现在，请根据用户的要求生成题目，并通过 generateQuestions 工具函数返回结果。`
}

export const generateQuestionsSchema = {
  type: 'function',
  function: {
    name: 'generateQuestions',
    description: '生成小学练习题，返回结构化的题目数据',
    parameters: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          description: '生成的题目列表',
          items: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: '题干内容，可以使用简单HTML标签（p、strong、em、br、ul、ol、li）'
              },
              answerType: {
                type: 'string',
                enum: ['text', 'choice', 'image'],
                description: '答案类型：text（文本答案）、choice（选择题）、image（图片答案）'
              },
              answer: {
                description: '答案内容，根据answerType不同格式不同。text类型为字符串，choice类型为{options: string[], correctIndex: number}'
              },
              typeName: {
                type: 'string',
                description: '题目类型名称，优先使用现有类型，也可以创建新类型'
              }
            },
            required: ['content', 'answerType', 'answer', 'typeName']
          }
        }
      },
      required: ['questions']
    }
  }
}

export default {
  questionGenerationSystemPrompt,
  generateQuestionsSchema
}
