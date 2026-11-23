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
| AI 对话 | `frontend/chat.html` | 与 AI 助手对话，后端 `POST /api/chat` 转发兼容 OpenAI 协议的接口，密钥仅保存在 `backend/.env` |
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
    ├── routes/Cheney_kb_routes.js
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
2. AI 对话所需配置同样位于 `backend/.env`：`AI_API_KEY`、`AI_API_BASE_URL`（https://api.qnaigc.com/v1）、`AI_MODEL`（qiniu/conatus-free）。
3. 双击根目录 `run.bat`，脚本会自动进入 `backend/`、按需安装依赖并启动服务。
4. 浏览器访问 `http://localhost:8111/`。
5. 首次运行如需示例知识库数据，在 `backend/` 下执行 `npm run seed:kb`，会导入 `backend/sample/` 中的公司介绍 FAQ 与产品说明（重复执行会自动跳过已入库文件）。

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
| POST | `/api/chat` | AI 对话转发（请求体 `{ "Cheney_messages": [{ "role": "user", "content": "..." }] }`） |
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
- 数据表：`Cheney_news`、`Cheney_gallery`，各含 8 条测试数据
- 完整建表与测试数据 SQL 见 `backend/Cheney_database.md`
