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

export const wrongQuestionAnalysisSystemPrompt = () => {
  return `你是一位专业的小学教育学习顾问，擅长分析学生的错题并提供有针对性的学习建议。

## 你的任务
分析学生的错题，深入找出错误原因，并给出具体、可操作的改进建议。

## 输出要求
你必须使用 function calling / tool call 的方式输出结构化数据，调用 analyzeWrongQuestions 函数。
绝对不要直接在文本回复中输出分析内容，必须通过 tool call 返回。

## 分析要求
1. **难度评估**：根据题目内容和小学阶段要求，评估题目难度（简单/中等/困难）
2. **知识点识别**：准确识别题目考查的核心知识点
3. **错误原因分析**：
   - 结合学生答案和正确答案的差异
   - 分析可能的错误原因（如概念不清、计算失误、审题不清、知识遗忘等）
   - 分析要具体、有针对性，避免空泛
4. **改进建议**：
   - 给出具体、可操作的改进方法
   - 建议要适合小学生的认知水平
   - 可以包含学习方法、练习方向等
5. **得分评估**：根据学生答案的接近程度，给出0-10分的得分

## 注意事项
- 语言要通俗易懂，适合小学生和家长理解
- 分析要客观、有建设性
- 鼓励为主，避免打击学生积极性
- 每题独立分析，不要互相影响

现在，请分析下面的错题，并通过 analyzeWrongQuestions 工具函数返回结果。`
}

export const analyzeWrongQuestionsSchema = {
  type: 'function',
  function: {
    name: 'analyzeWrongQuestions',
    description: '分析学生的错题，返回结构化的错题分析结果',
    parameters: {
      type: 'object',
      properties: {
        analysis: {
          type: 'array',
          description: '错题分析结果列表',
          items: {
            type: 'object',
            properties: {
              questionId: {
                type: 'number',
                description: '题目ID，与输入的题目ID对应'
              },
              difficulty: {
                type: 'string',
                enum: ['简单', '中等', '困难'],
                description: '题目难度评估'
              },
              knowledgePoint: {
                type: 'string',
                description: '题目考查的核心知识点'
              },
              errorReason: {
                type: 'string',
                description: '错误原因分析，要具体、有针对性'
              },
              suggestion: {
                type: 'string',
                description: '改进建议，要具体、可操作'
              },
              score: {
                type: 'number',
                description: '学生答案得分，0-10分',
                minimum: 0,
                maximum: 10
              }
            },
            required: ['questionId', 'difficulty', 'knowledgePoint', 'errorReason', 'suggestion', 'score']
          }
        }
      },
      required: ['analysis']
    }
  }
}

export default {
  questionGenerationSystemPrompt,
  generateQuestionsSchema,
  wrongQuestionAnalysisSystemPrompt,
  analyzeWrongQuestionsSchema
}
