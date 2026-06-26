# 小学学习激励网页应用 - 实现计划（任务分解与优先级排序）

## [ ] Task 1: 项目初始化与基础架构搭建
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 使用 Vite + Vue 3 初始化项目
  - 配置项目目录结构（components、views、stores、utils、assets等）
  - 安装并配置路由（Vue Router）
  - 配置状态管理（Pinia）
  - 安装UI组件库（Element Plus）
  - 配置CSS预处理（Sass）
  - 配置 ESLint 和 Prettier
  - 配置打包路径为相对路径，确保file://协议可直接运行
- **Acceptance Criteria Addressed**: [AC-9]
- **Test Requirements**:
  - `programmatic` TR-1.1: `npm run dev` 能正常启动开发服务器
  - `programmatic` TR-1.2: `npm run build` 能成功打包
  - `programmatic` TR-1.3: 打包后的 dist/index.html 双击可在浏览器中正常打开，无资源加载错误
  - `human-judgement` TR-1.4: 项目目录结构清晰，符合Vue3最佳实践
- **Notes**: 关键是配置 base: './' 确保file://协议下资源正确加载

## [ ] Task 2: 数据存储层实现
- **Priority**: high
- **Depends On**: [Task 1]
- **Description**: 
  - 封装 IndexedDB 操作库（使用 idb 或自封装）
  - 设计并创建题目数据表（questions）：id、题干、答案、类型、创建时间等
  - 设计并创建题目类型数据表（questionTypes）：id、名称、创建时间等
  - 设计并创建错题/答题记录数据表（answerRecords）：id、题目id、答案、是否正确、时间等
  - 封装 localStorage 工具函数（支持数据加密）
  - 封装 bcrypt 密码加密工具
  - 封装图片存储工具（Base64转存IndexedDB）
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3]
- **Test Requirements**:
  - `programmatic` TR-2.1: IndexedDB 初始化成功，数据表正确创建
  - `programmatic` TR-2.2: 题目CRUD操作正常工作
  - `programmatic` TR-2.3: 类型CRUD操作正常工作
  - `programmatic` TR-2.4: bcrypt加密/验证函数正确
  - `programmatic` TR-2.5: localStorage 封装读写正常
- **Notes**: 使用 idb 库简化IndexedDB操作

## [ ] Task 3: 状态管理与权限系统
- **Priority**: high
- **Depends On**: [Task 2]
- **Description**: 
  - 创建 Pinia store：authStore（家长模式认证状态）
  - 创建 Pinia store：questionStore（题目和类型数据）
  - 创建 Pinia store：answerStore（答题记录与统计）
  - 创建 Pinia store：aiConfigStore（AI配置）
  - 实现家长密码设置功能
  - 实现家长密码验证功能
  - 实现路由守卫，家长模式页面需鉴权
- **Acceptance Criteria Addressed**: [AC-1, AC-8]
- **Test Requirements**:
  - `programmatic` TR-3.1: 首次进入家长模式提示设置密码
  - `programmatic` TR-3.2: 密码验证正确后状态切换为家长模式
  - `programmatic` TR-3.3: 未登录状态访问家长页面自动跳转/弹窗
  - `programmatic` TR-3.4: 密码bcrypt加密存储，明文不可读
- **Notes**: 密码校验使用 bcryptjs 库

## [ ] Task 4: 家长模式布局与导航
- **Priority**: high
- **Depends On**: [Task 3]
- **Description**: 
  - 创建家长模式主布局组件（侧边栏导航 + 主内容区）
  - 创建学生模式主布局组件
  - 实现右上角"进入家长模式"按钮
  - 实现密码输入弹窗组件
  - 实现家长模式下"返回学生模式"按钮
  - 实现页面切换动画
- **Acceptance Criteria Addressed**: [AC-8]
- **Test Requirements**:
  - `programmatic` TR-4.1: 默认进入学生模式界面
  - `programmatic` TR-4.2: 点击家长模式按钮弹出密码输入框
  - `programmatic` TR-4.3: 输入正确密码后切换到家长模式
  - `human-judgement` TR-4.4: 布局美观，导航清晰
- **Notes**: 学生模式界面要色彩鲜明适合儿童

## [ ] Task 5: 题目类型管理模块
- **Priority**: high
- **Depends On**: [Task 4]
- **Description**: 
  - 创建题目类型列表页面（表格展示）
  - 实现类型创建功能（弹窗形式）
  - 实现类型删除功能（带确认提示）
  - 显示每个类型下的题目数量统计
  - 实现搜索和筛选功能
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-5.1: 可以创建新的题目类型
  - `programmatic` TR-5.2: 类型列表正确显示所有类型
  - `programmatic` TR-5.3: 删除类型有确认提示，删除后从列表移除
  - `programmatic` TR-5.4: 每个类型显示关联的题目数量
- **Notes**: 删除类型时需考虑该类型下题目的处理策略

## [ ] Task 6: 题目管理模块（列表与CRUD）
- **Priority**: high
- **Depends On**: [Task 5]
- **Description**: 
  - 创建题目列表页面，支持按类型筛选、搜索、分页
  - 创建题目表单组件（新增/编辑共用）
  - 实现题干富文本编辑器（基础功能：加粗、斜体、图片、换行）
  - 实现答案多种格式支持（文本、图片、选择题选项）
  - 实现题目类型下拉选择 + 新建类型入口
  - 实现图片上传功能（JPG、PNG支持，Base64存储）
  - 实现题目编辑和删除功能
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `programmatic` TR-6.1: 可以创建包含富文本的题目
  - `programmatic` TR-6.2: 题目列表正确显示，支持按类型筛选
  - `programmatic` TR-6.3: 可以上传图片并在题目中显示
  - `programmatic` TR-6.4: 编辑题目后数据正确更新
  - `human-judgement` TR-6.5: 富文本编辑器操作简单直观
- **Notes**: 富文本编辑器可使用 @vueup/vue-quill 或自封装contenteditable

## [ ] Task 7: 学生答题界面
- **Priority**: high
- **Depends On**: [Task 6]
- **Description**: 
  - 创建学生模式首页（选择题目类型开始练习）
  - 创建答题界面组件（单题展示模式）
  - 实现题目随机抽取逻辑
  - 实现答案提交与判分逻辑
  - 实现答题结果即时反馈（正确/错误动画）
  - 支持上一题/下一题导航
  - 实现答题进度显示
  - 设计卡通化、色彩鲜明的UI风格
- **Acceptance Criteria Addressed**: [AC-4, AC-10]
- **Test Requirements**:
  - `programmatic` TR-7.1: 选择类型后能正确加载对应题目
  - `programmatic` TR-7.2: 提交答案后正确判断对错
  - `programmatic` TR-7.3: 答题记录正确保存
  - `human-judgement` TR-7.4: 界面符合小学生审美，色彩鲜明
  - `human-judgement` TR-7.5: 交互有动画反馈，操作简单
- **Notes**: 重点是UI设计，要吸引小学生

## [ ] Task 8: 答题统计与错题本
- **Priority**: medium
- **Depends On**: [Task 7]
- **Description**: 
  - 实现答题记录存储（IndexedDB）
  - 创建设统计数据结构（按类型、按日期维度）
  - 创建正确率统计展示组件
  - 创建错题本页面（可查看所有错题）
  - 支持按类型筛选错题
  - 实现错题重做功能
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `programmatic` TR-8.1: 每次答题后统计数据正确更新
  - `programmatic` TR-8.2: 错题本正确显示所有答错的题目
  - `programmatic` TR-8.3: 按类型筛选功能正常
  - `programmatic` TR-8.4: 错题重做功能正常
- **Notes**: 统计数据存储在localStorage，详细记录存IndexedDB

## [ ] Task 9: AI服务配置模块
- **Priority**: high
- **Depends On**: [Task 4]
- **Description**: 
  - 创建AI配置页面
  - 实现API类型切换（OpenAI兼容 / Anthropic）
  - OpenAI模式配置项：API密钥、Base URL、模型名称
  - Anthropic模式配置项：API密钥、模型名称
  - 配置数据加密存储到localStorage
  - 实现连接测试功能（发送简单测试请求）
  - 设计系统提示词模板管理（可选）
- **Acceptance Criteria Addressed**: [AC-5]
- **Test Requirements**:
  - `programmatic` TR-9.1: 两种API模式切换正常
  - `programmatic` TR-9.2: 配置数据加密存储，不可直接读取明文
  - `programmatic` TR-9.3: 连接测试功能正常，成功/失败有明确提示
  - `programmatic` TR-9.4: 保存配置后下次打开自动加载
- **Notes**: API密钥使用简单加密存储（如AES或Base64+混淆），防止直接查看

## [ ] Task 10: AI智能出题模块
- **Priority**: high
- **Depends On**: [Task 9, Task 6]
- **Description**: 
  - 创建AI出题页面
  - 实现出题要求输入界面
  - 设计系统提示词模板（指导AI按格式输出）
  - 实现 Function Calling / Tool Call 机制
  - 定义题目生成的JSON Schema
  - 解析AI返回的结构化数据
  - 实现生成题目的预览界面
  - 支持编辑后一键保存到题库
  - 支持批量生成多道题目
  - 加载现有类型列表并注入系统提示
- **Acceptance Criteria Addressed**: [AC-6]
- **Test Requirements**:
  - `programmatic` TR-10.1: 输入出题要求后能调用AI生成题目
  - `programmatic` TR-10.2: AI返回数据符合预期结构（题干、答案、类型）
  - `programmatic` TR-10.3: 生成的题目可以预览并保存到题库
  - `programmatic` TR-10.4: 新类型自动创建
  - `human-judgement` TR-10.5: 生成的题目质量合格，符合小学难度
- **Notes**: 使用OpenAI的function calling或Anthropic的tool use机制

## [ ] Task 11: AI错题分析模块
- **Priority**: medium
- **Depends On**: [Task 10, Task 8]
- **Description**: 
  - 创建AI错题分析页面
  - 实现错题集选择功能
  - 设计错题分析系统提示词模板
  - 实现 Function Calling / Tool Call 机制
  - 定义分析结果的JSON Schema（难度、知识点、错误原因、改进建议）
  - 展示AI分析结果
  - 支持保存分析结果
  - 支持单题分析和批量分析
- **Acceptance Criteria Addressed**: [AC-7]
- **Test Requirements**:
  - `programmatic` TR-11.1: 可以选择错题并发送给AI分析
  - `programmatic` TR-11.2: AI返回结构化分析结果
  - `programmatic` TR-11.3: 分析结果包含难度、知识点、错误原因、改进建议
  - `human-judgement` TR-11.4: 分析内容有实际参考价值
- **Notes**: 批量分析注意控制token消耗

## [ ] Task 12: UI/UX优化与响应式设计
- **Priority**: medium
- **Depends On**: [Task 7]
- **Description**: 
  - 优化学生模式界面设计，更符合小学生审美
  - 添加交互动画和过渡效果
  - 实现响应式设计，适配不同屏幕尺寸
  - 优化按钮、输入框等交互元素的尺寸（适合触控）
  - 添加音效反馈（可选）
  - 统一设计语言和色彩体系
  - 优化家长模式操作流程，更直观易用
- **Acceptance Criteria Addressed**: [AC-10]
- **Test Requirements**:
  - `programmatic` TR-12.1: 在不同屏幕尺寸下布局正常
  - `human-judgement` TR-12.2: 学生界面色彩鲜明、卡通风格
  - `human-judgement` TR-12.3: 交互流畅有反馈
  - `human-judgement` TR-12.4: 家长模式操作直观
- **Notes**: 这是一个持续优化的任务，可分阶段进行

## [ ] Task 13: 错误处理与用户提示
- **Priority**: medium
- **Depends On**: [Task 6, Task 10]
- **Description**: 
  - 添加全局错误处理机制
  - 实现统一的消息提示组件（成功、错误、警告、信息）
  - 网络请求错误处理与重试
  - IndexedDB操作异常处理
  - 表单验证与错误提示
  - AI调用失败的友好提示
  - 数据加载状态提示
- **Acceptance Criteria Addressed**: [AC-5, AC-6, AC-7]
- **Test Requirements**:
  - `programmatic` TR-13.1: 表单验证错误有明确提示
  - `programmatic` TR-13.2: AI调用失败有友好的错误提示
  - `programmatic` TR-13.3: 数据加载有loading状态
  - `human-judgement` TR-13.4: 错误提示清晰易懂
- **Notes**: 使用Element Plus的ElMessage或自封装

## [ ] Task 14: 构建配置优化与打包测试
- **Priority**: high
- **Depends On**: [Task 12, Task 13]
- **Description**: 
  - 优化Vite构建配置
  - 确保所有资源使用相对路径
  - 配置路由为hash模式（适配file://协议）
  - 测试打包后在file://协议下的运行情况
  - 修复所有打包后出现的问题
  - 生成最终可交付的dist文件夹
- **Acceptance Criteria Addressed**: [AC-9]
- **Test Requirements**:
  - `programmatic` TR-14.1: `npm run build` 成功无错误
  - `programmatic` TR-14.2: 打包后双击index.html可正常打开
  - `programmatic` TR-14.3: 所有功能在file://协议下正常工作
  - `human-judgement` TR-14.4: 加载速度正常，无明显白屏
- **Notes**: 这是关键任务，必须确保双击可运行
