<!--
姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
-->

# 科技资讯图文展示平台

- **姓名**：徐欣烨
- **学号**：22001010111
- **项目类别**：自选（原创）
- **技术栈**：原生 HTML / CSS / JavaScript + Node.js + Express + MySQL

## 功能页面

| 页面 | 文件 | 说明 |
| --- | --- | --- |
| 首页 | `frontend/index.html` | 项目信息、页面导航、Canvas 粒子背景动画 |
| 科技新闻列表 | `frontend/news.html` | 读取 `Cheney_news` 表，展示接口地址、原始 JSON 与新闻内容 |
| 科技图文列表 | `frontend/gallery.html` | 读取 `Cheney_gallery` 表，展示接口地址、原始 JSON 与图文卡片 |
| AI 对话 | `frontend/chat.html` | 会话持久化（列表/新建/重命名/删除/历史）、Markdown 代码块渲染、可中断请求；后端 `POST /api/ai/chat` 转发，密钥仅保存在 `backend/.env` |
| RAG 知识库 | `frontend/kb.html` | 上传 doc/docx/ppt/pptx/pdf/txt，服务端解析切分入库；BM25 检索后生成带来源的回答 |
| 数据库连接测试 | `frontend/database.html` | 输入用户名密码测试 MySQL 连接，成功与失败均有提示 |

## 目录结构

```
徐欣烨/
├── AGENTS.md                 # 开发约定
├── Cheney_prompt.md          # 提示词记录
├── readme.md                 # 项目说明
├── run.bat                   # 启动后端服务
├── .gitignore
├── frontend/
│   ├── index.html
│   ├── news.html
│   ├── gallery.html
│   ├── chat.html
│   ├── kb.html
│   ├── database.html
│   ├── css/Cheney_common.css
│   ├── js/
│   │   ├── Cheney_common.js
│   │   ├── Cheney_index.js
│   │   ├── Cheney_news.js
│   │   ├── Cheney_gallery.js
│   │   ├── Cheney_chat.js
│   │   ├── Cheney_kb.js
│   │   └── Cheney_database.js
│   ├── fonts/
│   └── images/
└── backend/
    ├── app.js
    ├── config/Cheney_db.js
    ├── models/
    ├── controllers/
    ├── routes/Cheney_api.js
    ├── routes/Cheney_ai_routes.js     # 对话与会话管理路由
    ├── routes/Cheney_kb_routes.js
    ├── controllers/Cheney_chat_controller.js
    ├── controllers/Cheney_conversation_controller.js
    ├── controllers/Cheney_kb_controller.js
    ├── models/Cheney_conversation_model.js # 会话表/消息表读写与 Token 预算裁剪
    ├── models/Cheney_kb_model.js      # 知识库表读写
    ├── models/Cheney_kb_parser.js     # 文件解析与切分
    ├── models/Cheney_kb_retrieval.js  # BM25 检索与提示词组装
    ├── sample/                        # 示例知识库文件
    ├── scripts/Cheney_seed_kb.js      # 示例导入脚本
    ├── .env                  # 数据库凭据（不提交）
    ├── Cheney_interface.md   # 接口记录
    └── Cheney_database.md    # 数据库记录
```

## 运行方式

1. 确认 MySQL 已启动，且 `backend/.env` 中的账号密码可用。
2. AI 对话所需配置同样位于 `backend/.env`：`LLM_API_KEY`、`LLM_BASE_URL`（https://api.qnaigc.com/v1）、`LLM_MODEL`（qiniu/conatus-free）；代码同时兼容旧变量名 `AI_API_KEY` / `AI_API_BASE_URL` / `AI_MODEL`。
3. 双击根目录 `run.bat`，脚本会自动进入 `backend/`、按需安装依赖并启动服务。
4. 浏览器访问 `http://localhost:8111/`。
5. 首次运行如需示例知识库数据，在 `backend/` 下执行 `npm run seed:kb`，会导入 `backend/sample/` 中的 8 个示例文件（重复执行会自动跳过已入库文件）。

> 知识库检索说明：当前对话接口没有 embedding 模型，检索引擎采用 BM25 关键词打分（中文按字符二元组、英文按单词），无需额外模型额度；免费对话模型存在全局 429 限流，页面与接口都会给出可见提示。

手动启动：

```powershell
cd backend
npm install
npm start
```

## 接口一览

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 服务与数据库健康检查 |
| GET | `/api/news` | 科技新闻列表 |
| GET | `/api/gallery` | 科技图文列表 |
| POST | `/api/ai/chat` | AI 对话（带会话持久化，请求体 `{ "Cheney_conversation_id": 1, "Cheney_message": "..." }`） |
| POST | `/api/chat` | 旧版对话路径，保留兼容；也支持无状态 `Cheney_messages` 数组 |
| GET | `/api/ai/conversations` | 会话列表（含消息数、更新时间） |
| POST | `/api/ai/conversations` | 新建会话 |
| PUT | `/api/ai/conversations/:id` | 重命名会话 |
| DELETE | `/api/ai/conversations/:id` | 删除会话及其消息 |
| GET | `/api/ai/conversations/:id/messages` | 加载会话历史消息 |
| POST | `/api/kb/upload` | 知识库文件上传（multipart 字段 `Cheney_file`，≤25MB） |
| GET | `/api/kb/files` | 知识库文件列表与状态 |
| GET | `/api/kb/files/:id/chunks` | 查看文件解析出的片段 |
| DELETE | `/api/kb/files/:id` | 删除文件及片段 |
| POST | `/api/kb/ask` | 知识库检索问答（请求体 `{ "Cheney_question": "..." }`） |
| POST | `/api/db/test` | 使用传入的账号密码测试数据库连接 |

统一响应格式：

```json
{ "code": 0, "msg": "提示信息", "data": {} }
```

## 数据库

- 数据库名：`Cheney_web`（字符集 utf8mb4）
- 数据表：`Cheney_news`、`Cheney_gallery`，各含 8 条测试数据；`Cheney_kb_file` 8 条、`Cheney_kb_chunk` 14 条；`Cheney_conversation`、`Cheney_chat_message` 保存会话与消息
- 完整建表与测试数据 SQL 见 `backend/Cheney_database.md`

## 当前进度（2026-11-23）

已完成并验证：

- 会话持久化：新建会话 → 发送消息 → 服务端落库 → 刷新页面历史仍在；会话重命名、删除、历史加载均已实测通过。
- 规范对齐：新增 `POST /api/ai/chat`，保留旧 `/api/chat`；`.env` 已迁移为 `LLM_*`，代码兼容旧变量名。
- Token 预算：30 条长消息输入经裁剪保留 8 条（约 2480 tokens），首条为 user。
- Markdown 渲染：浏览器实测 AI 回复中的代码块渲染为独立等宽代码区，列表渲染为项目符号列表。
- 停止按钮：浏览器实测点击“停止”后状态栏显示“已停止生成，本次内容未保存。”，输入区恢复可用，刷新后该轮消息未落库。
- 上传进度：知识库页上传时进度条可见，完成后为 100%，状态显示解析完成与片段数；因测试文件很小，百分比过程一闪而过。
- RAG 检索问答：8 个文件、14 个片段下实测命中 4 条来源并生成带【来源N】的回答。
- 页面与接口回归：`/`、`/chat.html`、`/kb.html`、`/news.html`、`/gallery.html`、`/database.html` 及健康检查、新闻、图文、知识库、会话接口全部 200。

尚未完成或需注意：

- 旧版 `.doc` / `.ppt` 与真实 PDF 尚未用真实文件做端到端解析验证（PDF 解析分支已实现，之前手工构造的测试 PDF 因文件本身 xref 无效而失败）。
- 免费模型存在全局 429 限流，偶发失败需稍后重试；接口与页面均有可见提示。
- 上传进度条仅验证了最终 100% 状态，未在大文件慢网络下观察百分比递增过程。
- 聊天回复暂未实现 SSE 流式输出（当前为一次性返回）。
