<!--
姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
-->

# 开发提示词记录

本文件只追加、不覆盖。每条记录的格式：`时间 | 提示词全文 | 大模型名称`。

---

## 2026-11-19 13:43 | DeepSeek-V4.1-Flash

提示词全文：

```text
在当前项目根目录创建 AGENTS.md，写入以下规则。

## 项目结构与技术栈
- 前端：frontend/ 目录
  - 原生 HTML、CSS、JavaScript，禁止使用任何第三方库、框架、CDN 链接
  - 目录结构：frontend/ 下建 css/、js/、fonts/、images/ 子目录；
    fonts/ 存放 iconfont 图标文件（如果有）
- 后端：backend/ 目录，Node.js + Express，RESTful+MVC 风格，
  所有接口以 /api/ 为前缀，端口固定为 8111，
  并以 express.static 托管 frontend/ 目录
  后端支持所有跨域访问。
- 后端依赖安装：优先 cnpm i 包名；失败或超时则使用 npm i 包名
- 数据库：MySQL （用户名 root、密码：1234567890xxy）：
- 数据库凭据写入 backend/.env（变量名：DB_USER、DB_PASSWORD、
  DB_HOST、DB_NAME），不得出现在代码或 AGENTS.md 中；
  .env 同时加入 .gitignore
- 根据后端的要求自行建立和修改数据库表，每张表建立后，插入至少 8 条有真实业务意义的测试数据

## 命名与注释
- CSS 类名、JS 变量名、JS 函数名、数据库表名（及字段相关命名）
  一律以 Cheney_ 开头
- 每个文件头部包含注释块：
  姓名：徐欣烨 | 学号：22001010111 | 时间：yyyy-mm-dd | 大模型：{本次使用的大模型名称}

## 记录文件（一律追加写入，禁止覆盖已有内容）
- Cheney_prompt.md（项目根目录）：每次向 AI 发出开发指令后，
  追加记录：时间 | 提示词全文 | 大模型名称
- backend/Cheney_interface.md：每次创建或修改接口后，追加：
  接口路径 | HTTP 方法 | 请求参数（含示例）|
  响应格式（含 JSON 示例）| 修改时间
- backend/Cheney_database.md：每次建表、改表或插入数据后，
  按执行顺序追加对应 SQL 语句（含测试数据的 INSERT），
  要求仅凭此文件即可在新机器上完整重建数据库
- 统一 JSON 响应格式：{ "code": 0, "msg": "提示信息", "data": {...} }，
  code=0 表示成功，非 0 表示失败

## 前端约定
- 服务器返回的数据和错误信息输出到浏览器控制台（console.log / console.error）；
- 新建 HTML 页面后，在 frontend/index.html 中追加超链接入口；
  文件名包含 detail 的页面除外
```

## 2026-11-19 13:46 | DeepSeek-V4.1-Flash

提示词全文：

```text
把这些都放入徐欣烨 这个文件夹 并开始下一步
```

## 2026-11-19 13:49 | DeepSeek-V4.1-Flash

提示词全文：

```text
`D:\高级网页设计案例\徐欣烨`是这个文件夹
```

## 2026-11-19 13:53 | DeepSeek-V4.1-Flash

提示词全文：

```text
请初始化本项目：
1、 git init + .gitignore（排除 node_modules、.env）+ 首次提交
2、按 AGENTS.md 规则创建前后端目录骨架、安装依赖、
3、创建前端首页index.html，包括姓名徐欣烨、学号22001010111、项目名称、项目类别（自选、模仿），所有完成的html页面的超链接。有canvas背景动画。主体是页面链接导航。页面美观。
4、创建readme.md，在根目录下，包括学号、姓名。 
（三）运行和查看项目。
创建运行后台的bat文件，在根目录下。
（四）测试数据库链接（mysql数据库需要，sqllite不需要）。
创建database.html页面，输入用户名，密码，链接数据库，数据库使用mysql，成功和错误都有提示，默认用户名root，密码root。
（五）完成科技新闻列表页面，新闻的数据存在数据库表里。网页显示后端接口链接和数据内容。
（六）完成图文列表，图片可以使用网络图片或创建图片，创建一个新的表，网页显示后端接口链接和数据内容。。
```

## 2026-11-19 14:26 | DeepSeek-V4.1-Flash

提示词全文：

```text
1
准备工作
watt 加速 → 登录 GitHub → 准备 git 公钥

下载 watt，网络加速（只选 github），一键加速
登录 GitHub 官网
Trae 打开文件夹，进入用户根目录
获得 git 公钥，
没有则先创建一个
2
设置公钥与私人令牌
把公钥交给 GitHub · 申请私人令牌备用

进入 GitHub 设置界面，添加 SSH 公钥
再完成私人令牌（Personal Access Token）的设置
```

补充记录（用户上传截图后执行）：已在 `C:\Users\ZhuanZ1\.ssh` 生成 ed25519 密钥，`ssh -T git@github.com` 认证通过（账号 `xxy0111`）；仓库 `https://github.com/xxy0111/xuxinye-octo-system` 已关联为 origin，首次提交已推送。

## 2026-11-19 14:27 | DeepSeek-V4.1-Flash

提示词全文：

```text
创建技能 skill：提交到 GitHub，将本项目提交 commit 并 push 到 `https://github.com/xxy0111/xuxinye-octo-system.git`，使用已设置公钥。
```

执行结果：创建项目技能 `.trae/skills/commit-to-github/SKILL.md`，并按该流程完成提交与推送（commit `87cb523`）。

## 2026-11-23 13:40 | DeepSeek-V4.1-Flash

提示词全文：

```text
在「徐欣烨」项目中开发一个 AI 对话模块，复用你已掌握的该项目的结构、端口和运行方式。

要求：
1. 先用真实请求验证硅基流动的 key 是否可用（API key：sk-ckqlhuemvuyvfpzprxnhmiritxfwrksvtwymfvajodygywtm，接口 https://api.siliconflow.cn/v1/chat/completions，示例模型 deepseek-ai/DeepSeek-V4-Flash）。若该模型不存在或不可用，查明可用的对话模型并在实现中使用，并把结论告诉我。
2. 后端新增接口转发对话请求，key 只放在 backend 的环境变量文件里，不写死进代码、不暴露给前端。
3. 前端新增对话页面（与现有站点风格一致），能发送消息、展示回复，并对加载中、失败等情况给出可见反馈。
4. 不破坏现有页面与接口，改完保证项目仍能正常运行。

补充要求：对话功能必须跑在 http://localhost:8111/ 这个站点里——由现有 Express 服务托管（静态页与新接口都挂到 8111 上），从首页能进入并完整可用，而不是另开端口或本地文件直开。改完后确认重启后的 8111 上该功能可实际对话。
```

执行结果：
- key 与模型 `deepseek-ai/DeepSeek-V4-Flash` 首次实测可用（返回“可用”）；随后该账号所有模型请求均返回 HTTP 402（余额不足），已向用户回报并等待充值或更换 key。
- 新增 `backend/models/Cheney_chat_model.js`、`backend/controllers/Cheney_chat_controller.js`、`POST /api/chat`，密钥写入 `backend/.env`（`SILICONFLOW_API_KEY` / `SILICONFLOW_API_URL` / `SILICONFLOW_MODEL`）。
- 新增 `frontend/chat.html`、`frontend/js/Cheney_chat.js`，样式追加到 `frontend/css/Cheney_common.css`；首页导航、导航卡片及其余页面顶部导航均加入入口。

## 2026-11-23 13:58 | DeepSeek-V4.1-Flash

提示词全文：

```text
换用新的兼容 OpenAI 协议接口并复测实际对话：

- BaseURL：https://api.qnaigc.com/v1
- Model ID：qiniu/conatus-free
- Api-key：sk-25214478b5600524ca20d633ec5233629ad89435964d2cb5703ca480c0768188

该 key 已由用户写入 backend/.env。请确认 .env 配置正确（base URL、模型、key 指向这套参数），把默认模型切到 qiniu/conatus-free，重启 8111 服务后实测一次真实对话确认能正常返回。

另外在服务端控制台输出发送给大模型的请求数据和模型返回的数据，方便排查（key 不要明文打印）。
```

执行结果：
- 实际 `.env` 仍为旧硅基流动配置，已改为 `AI_API_KEY` / `AI_API_BASE_URL=https://api.qnaigc.com/v1` / `AI_MODEL=qiniu/conatus-free`。
- `backend/models/Cheney_chat_model.js` 改为按 `baseUrl + /chat/completions` 拼接，默认模型切换为 `qiniu/conatus-free`，并增加服务端请求/响应日志（不打印 key）。
- 重启 8111 后实测 `/api/chat` 返回 `code:0`，回复「大模型是一种基于海量数据训练、具有强大理解和生成能力的人工智能模型。」；免费模型偶发上游 429 全局限流，稍后重试可成功。

## 2026-11-23 14:05 | DeepSeek-V4.1-Flash

提示词全文：

```text
在「徐欣烨」项目中继续开发 RAG 知识库模块，全部挂到现有的 8111 站点，界面风格与现有页面保持一致，不破坏已有页面和接口。

需要实现：
1. 知识库文件上传与管理：支持上传 doc、docx、ppt/pptx、pdf、txt，服务端解析出文本、切分存储并持久化；能列出已入库文件、查看状态、删除文件。
2. 检索问答：提问时先检索知识库相关片段，再连同问题一起发给大模型，回答里能看出依据（来源文件）；没有命中时如实说明。
3. 准备 2 个示例知识库文件（内容自行拟定，比如一份公司介绍/客服 FAQ 和一份产品说明），导入后可直接用于问答演示。
4. 服务端控制台输出每次发给大模型的数据和从大模型收到的数据（key 脱敏）。
5. 首页加知识库入口。

约束：当前只有那把七牛云 key 和 qiniu/conatus-free 免费对话模型，且有全局 429 限流。如果该接口没有可用的 embedding 模型，就用不依赖向量化的检索方案（如关键词/BM25 打分），并在说明里讲清楚；检索失败或限流要有可见提示。
```

执行结果：
- 实测该接口无 embedding 模型（`/v1/models` 无 embedding 条目，`/v1/embeddings` 404），因此采用 BM25 关键词检索（中文二元组 + 英文单词）。
- 新增表 `Cheney_kb_file` / `Cheney_kb_chunk`，服务启动自动建表；新增 `backend/models/Cheney_kb_model.js`、`Cheney_kb_parser.js`、`Cheney_kb_retrieval.js`、`backend/controllers/Cheney_kb_controller.js`、`backend/routes/Cheney_kb_routes.js`（multer 上传，限 25MB）。
- 新增接口：`POST /api/kb/upload`、`GET /api/kb/files`、`GET /api/kb/files/:id/chunks`、`DELETE /api/kb/files/:id`、`POST /api/kb/ask`。
- 新增页面 `frontend/kb.html`、`frontend/js/Cheney_kb.js`，样式追加到 `Cheney_common.css`；首页与各页导航加入「RAG 知识库」入口。
- 示例文件 `backend/sample/公司介绍与客服FAQ.txt`、`backend/sample/产品说明.docx`，通过 `npm run seed:kb` 导入（2 文件 5 片段）。
- 实测问答命中并返回来源卡片；无命中如实说明；429 时返回检索来源与限流提示；控制台输出请求/响应且不含 key。

## 2026-11-23 14:52 | DeepSeek-V4.1-Flash

提示词全文：

```text
按实验指导书继续推进剩余缺口，用户已确认范围。已定的口径：端口保持 8111；记录文件名保持 Cheney_ 前缀不改；RAG 继续用 BM25，并在文档里说明无 embedding 模型的原因。

要做的（按优先级）：
1. 会话持久化：新增会话表与消息表，聊天页支持会话列表、新建、重命名、删除、历史加载；对话请求按 Token 预算裁剪历史；刷新后历史仍在。
2. 规范对齐：新增 /api/ai/chat 路由并保留 /api/chat 兼容；环境变量改为 LLM_API_KEY / LLM_BASE_URL / LLM_MODEL（旧变量名兼容或一并迁移，注意不把密钥写进代码）。
3. 聊天体验：回复支持 Markdown 与代码块渲染；发送中可中断（停止按钮）。
4. 知识库：上传显示进度；把示例数据补到 Cheney_kb_file 与 Cheney_kb_chunk 每表至少 8 条，保证问答演示仍正常。
5. 同步更新接口文档、数据库文档、提示词文档与 readme。

验证要求：改完重启服务，确认新旧页面与接口全部正常，会话刷新保留、Markdown 渲染、中断、上传进度、检索问答各实测一次。

全部完成并验证通过后，把改动提交到本地 git（清晰的提交信息，不要提交 .env 与密钥），不要推送。
```

执行结果：
- 会话持久化：新增 `Cheney_conversation`、`Cheney_chat_message` 表与 `Cheney_conversation_model.js`、`Cheney_conversation_controller.js`、`Cheney_ai_routes.js`；聊天页改为左侧会话列表 + 右侧对话区，支持新建、重命名、删除、历史加载；刷新后历史保留。
- Token 预算：约 3000 tokens、最多 20 条，从最新向前保留并保证首条为 user；单测 30 条长消息裁剪为 8 条（约 2480 tokens）。
- 规范对齐：`POST /api/ai/chat` 上线并保留 `/api/chat`；`.env` 中变量已改为 `LLM_API_KEY` / `LLM_BASE_URL` / `LLM_MODEL`，代码兼容旧名。
- 聊天体验：自实现 Markdown 渲染（代码块、行内代码、标题、列表、引用、链接，全部先转义再解析）；新增“停止”按钮，前端 AbortController + 后端连接关闭取消上游，本轮消息不落库。
- 知识库：上传改用 XHR 并展示进度条与百分比，解析阶段有状态提示；示例文件扩充到 8 个（`Cheney_kb_file` 8 条、`Cheney_kb_chunk` 14 条），RAG 问答仍正常。
- 文档：接口、数据库、提示词与 readme 已同步。
- 验证：浏览器实测 Markdown 渲染、刷新后历史保留、停止按钮均通过；上传进度条在完成后显示 100%；6 个页面与全部旧接口 200。
- 遗留：`.doc`/`.ppt`/真实 PDF 未做端到端解析验证；上传进度仅验证最终 100% 状态；未实现 SSE 流式输出；免费模型偶发 429。
