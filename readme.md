<!--
姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
-->

# 科技资讯图文展示平台

- **姓名**：徐欣烨
- **学号**：22001010111
- **项目类别**：自选（原创）
- **技术栈**：原生 HTML / CSS / JavaScript + Node.js + Express + MySQL / Supabase Postgres（通过 `DB_DRIVER` 切换）

## 功能页面

| 页面 | 文件 | 说明 |
| --- | --- | --- |
| 首页 | `frontend/index.html` | 项目信息、页面导航、Canvas 粒子背景动画 |
| 科技新闻列表 | `frontend/news.html` | 读取 `xuxinye_news` 表，展示接口地址、原始 JSON 与新闻内容 |
| 科技图文列表 | `frontend/gallery.html` | 读取 `xuxinye_gallery` 表，展示接口地址、原始 JSON 与图文卡片 |
| AI 对话 | `frontend/chat.html` | 会话持久化（列表/新建/重命名/删除/历史）、Markdown 代码块渲染、可中断请求；后端 `POST /api/ai/chat` 转发，密钥仅保存在 `backend/.env` |
| RAG 知识库 | `frontend/kb.html` | 上传 doc/docx/ppt/pptx/pdf/txt，服务端解析切分入库；BM25 检索后生成带来源的回答 |
| 数据库连接测试 | `frontend/database.html` | 输入用户名密码测试 MySQL 连接，成功与失败均有提示 |

## 目录结构

```
徐欣烨/
├── AGENTS.md                 # 开发约定
├── xuxinye_prompt.md          # 提示词记录
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
│   ├── css/xuxinye_common.css
│   ├── js/
│   │   ├── xuxinye_common.js
│   │   ├── xuxinye_index.js
│   │   ├── xuxinye_news.js
│   │   ├── xuxinye_gallery.js
│   │   ├── xuxinye_chat.js
│   │   ├── xuxinye_kb.js
│   │   └── xuxinye_database.js
│   ├── fonts/
│   └── images/
└── backend/
    ├── app.js
    ├── config/xuxinye_db.js
    ├── models/
    ├── controllers/
    ├── routes/xuxinye_api.js
    ├── routes/xuxinye_ai_routes.js     # 对话与会话管理路由
    ├── routes/xuxinye_kb_routes.js
    ├── controllers/xuxinye_chat_controller.js
    ├── controllers/xuxinye_conversation_controller.js
    ├── controllers/xuxinye_kb_controller.js
    ├── models/xuxinye_conversation_model.js # 会话表/消息表读写与 Token 预算裁剪
    ├── models/xuxinye_kb_model.js      # 知识库表读写
    ├── models/xuxinye_kb_parser.js     # 文件解析与切分
    ├── models/xuxinye_kb_retrieval.js  # BM25 检索与提示词组装
    ├── sample/                        # 示例知识库文件
    ├── scripts/xuxinye_seed_kb.js      # 示例导入脚本
    ├── scripts/xuxinye_migrate_supabase.js # MySQL → Supabase 迁移脚本（幂等）
    ├── .env                  # 数据库与 AI 凭据（不提交）
    ├── xuxinye_interface.md   # 接口记录
    └── xuxinye_database.md    # 数据库记录
```

## 运行方式

1. `backend/.env` 中保留两套数据库配置：
   - MySQL（回滚用）：`DB_HOST`、`DB_USER`、`DB_PASSWORD`、`DB_NAME`；
   - Supabase Postgres：`SUPABASE_DB_URL`（完整连接串，含密码，禁止提交）。
2. 通过 `DB_DRIVER` 选择数据源：`supabase` 使用 Postgres（当前默认），`mysql` 切回本地 MySQL；两种模式共用同一套接口与前端。
3. AI 对话所需配置同样位于 `backend/.env`：`LLM_API_KEY`、`LLM_BASE_URL`（https://api.qnaigc.com/v1）、`LLM_MODEL`（qiniu/conatus-free）；代码同时兼容旧变量名 `AI_API_KEY` / `AI_API_BASE_URL` / `AI_MODEL`。
4. 双击根目录 `run.bat`，脚本会自动进入 `backend/`、按需安装依赖并启动服务。
5. 浏览器访问 `http://localhost:8111/`。
6. 首次运行如需示例知识库数据，在 `backend/` 下执行 `npm run seed:kb`，会导入 `backend/sample/` 中的 8 个示例文件（重复执行会自动跳过已入库文件）。
7. 如需重新迁移数据到 Supabase，在 `backend/` 下执行 `node scripts/xuxinye_migrate_supabase.js`；脚本幂等，重复执行只跳过已存在记录，不改动 MySQL。

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
| POST | `/api/ai/chat` | AI 对话（带会话持久化，请求体 `{ "xuxinye_conversation_id": 1, "xuxinye_message": "..." }`） |
| POST | `/api/chat` | 旧版对话路径，保留兼容；也支持无状态 `xuxinye_messages` 数组 |
| GET | `/api/ai/conversations` | 会话列表（含消息数、更新时间） |
| POST | `/api/ai/conversations` | 新建会话 |
| PUT | `/api/ai/conversations/:id` | 重命名会话 |
| DELETE | `/api/ai/conversations/:id` | 删除会话及其消息 |
| GET | `/api/ai/conversations/:id/messages` | 加载会话历史消息 |
| POST | `/api/kb/upload` | 知识库文件上传（multipart 字段 `xuxinye_file`，≤25MB） |
| GET | `/api/kb/files` | 知识库文件列表与状态 |
| GET | `/api/kb/files/:id/chunks` | 查看文件解析出的片段 |
| DELETE | `/api/kb/files/:id` | 删除文件及片段 |
| POST | `/api/kb/ask` | 知识库检索问答（请求体 `{ "xuxinye_question": "..." }`） |
| POST | `/api/db/test` | 使用传入的账号密码测试数据库连接 |

统一响应格式：

```json
{ "code": 0, "msg": "提示信息", "data": {} }
```

## 数据库

- 当前数据源：**Supabase Postgres**（`DB_DRIVER=supabase`），项目 ref `lxedtoxdathhjhrluiwv`，区域 Tokyo，服务端通过 IPv6 直连。
- 回滚数据源：本地 MySQL `xuxinye_web`（`DB_DRIVER=mysql`），数据保持原样未改动。
- 两套库均为 6 张表：`xuxinye_news` 8 条、`xuxinye_gallery` 8 条、`xuxinye_kb_file` 12 条（其中 4 条为已软删除的测试记录，列表接口只返回 8 条）、`xuxinye_kb_chunk` 14 条、`xuxinye_conversation` 1 条、`xuxinye_chat_message` 4 条。
- 完整建表与测试数据 SQL 见 `backend/xuxinye_database.md`；Supabase 迁移 DDL 与执行记录见该文件末尾。

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

## 当前进度（2026-11-26）：迁移到 Supabase

已完成并验证：

- 用 `backend/scripts/xuxinye_migrate_supabase.js` 在 Supabase 建好 6 张表并全量导入；逐表行数与 MySQL 一致：`xuxinye_news` 8、`xuxinye_gallery` 8、`xuxinye_kb_file` 12、`xuxinye_kb_chunk` 14、`xuxinye_conversation` 1、`xuxinye_chat_message` 4。
- 后端通过 `DB_DRIVER=supabase` 切换数据源，`xuxinye_db.js` 增加 Postgres 兼容层（占位符、双引号字面量、批量 INSERT、INSERT RETURNING、字段名大小写归一）。
- 回滚路径可用：临时设置 `DB_DRIVER=mysql` 后仍能正常读取本地 MySQL（实测 news 8 条）。
- 回归通过：6 个页面全部 200；新闻/图文/知识库列表返回正常；会话新建、重命名、删除成功；知识库上传（含片段批量写入）成功并可删除；RAG 检索命中 4 条来源。
- 测试产生的会话与上传文件已从 Supabase 清理，未改动原有 MySQL 数据。

当前阻塞：

- 对话模型账户状态异常，`/api/ai/chat`、`/api/chat`、知识库回答生成均返回 `502 Account is suspended due to billing status`；数据库读写与检索本身正常。需充值/恢复七牛云账户或更换可用模型后，才能完成“带 AI 回答”的端到端复测。

## 2026-11-26 16:05：命名统一为 xuxinye

- 项目内所有 `Cheney` / `cheney` 已统一为 `xuxinye`：文件名、代码标识符、CSS 类名、接口字段、数据库表/列/索引/约束/序列、文档与日志前缀；残留检查为 0。
- MySQL 6 张表已通过 `RENAME TABLE` 迁到 `xuxinye_web`，列与索引使用 `RENAME COLUMN` / `RENAME INDEX` 原地重命名，行数保持 8/8/12/14/1/4。
- Supabase 6 张表通过 `ALTER TABLE ... RENAME` 原地重命名，数据未重建，行数一致。
- 8111 回归通过：6 个页面 200、静态资源 0 失效；新闻/图文/知识库/会话接口正常；知识库 8 个文件/14 片段；检索命中 4 条来源；会话与上传增删正常；`DB_DRIVER=mysql` 回滚模式可读。

## Supabase MCP 配置（步骤 5、6）

- 已按手册生成项目级配置：[.vscode/mcp.json](file:///d:/高级网页设计案例/徐欣烨/.vscode/mcp.json)
- 使用的 MCP URL：

```text
https://mcp.supabase.com/mcp?project_ref=lxedtoxdathhjhrluiwv&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cfeedback%2Cnotebooks
```

- 仍需用户在 Trae 内完成：插件市场 → MCP → 添加/粘贴上述配置 → 点击 `Authorize` 完成 Supabase OAuth，之后在 MCP 列表确认 `supabase` 已连接。
