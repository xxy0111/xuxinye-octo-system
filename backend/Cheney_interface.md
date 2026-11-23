<!--
姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
-->

# 接口文档

本文件只追加、不覆盖。所有接口以 `/api` 为前缀，服务端口 `8111`，统一响应结构：

```json
{ "code": 0, "msg": "提示信息", "data": {} }
```

---

## GET /api/health

- **接口路径**：`/api/health`
- **HTTP 方法**：GET
- **请求参数**：无
- **响应格式**：

```json
{
  "code": 0,
  "msg": "服务正常",
  "data": {
    "Cheney_server": "ok",
    "Cheney_database": "ok",
    "Cheney_time": "2026-11-19T05:50:00.000Z"
  }
}
```

数据库不可用时：

```json
{ "code": 500, "msg": "数据库连接失败：xxx", "data": null }
```

- **修改时间**：2026-11-19 13:48

---

## GET /api/news

- **接口路径**：`/api/news`
- **HTTP 方法**：GET
- **请求参数**：无
- **响应格式**：

```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "Cheney_total": 8,
    "Cheney_list": [
      {
        "Cheney_id": 1,
        "Cheney_title": "国产大模型开源生态加速，多模态能力成竞争焦点",
        "Cheney_summary": "多家厂商在同一周开源新一代多模态模型……",
        "Cheney_content": "本周国内三家厂商相继开源多模态大模型……",
        "Cheney_author": "陈默",
        "Cheney_source": "科技前沿观察",
        "Cheney_publish_time": "2026-11-18T01:20:00.000Z",
        "Cheney_cover_url": null,
        "Cheney_view_count": 1286
      }
    ]
  }
}
```

- **修改时间**：2026-11-19 13:53

---

## GET /api/gallery

- **接口路径**：`/api/gallery`
- **HTTP 方法**：GET
- **请求参数**：无
- **响应格式**：

```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "Cheney_total": 8,
    "Cheney_list": [
      {
        "Cheney_id": 1,
        "Cheney_title": "神经网络算力集群",
        "Cheney_description": "万卡级训练集群通过高速互联实现并行训练……",
        "Cheney_image_url": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=...",
        "Cheney_category": "人工智能",
        "Cheney_create_time": "2026-11-19T05:50:00.000Z"
      }
    ]
  }
}
```

- **修改时间**：2026-11-19 13:53

---

## POST /api/chat

- **接口路径**：`/api/chat`
- **HTTP 方法**：POST
- **说明**：转发硅基流动对话接口，密钥仅保存在 `backend/.env`，前端不接触密钥。
- **请求参数**（JSON 请求体，`Cheney_messages` 为对话历史，最多 20 条，单条最多 2000 字，最后一条必须为 `user`）：

```json
{
  "Cheney_messages": [
    { "role": "user", "content": "用一句话介绍什么是大模型？" }
  ]
}
```

- **响应格式（成功）**：

```json
{
  "code": 0,
  "msg": "对话成功",
  "data": {
    "Cheney_reply": "大模型是在海量数据上训练、具备通用语言理解与生成能力的神经网络模型。",
    "Cheney_model": "deepseek-ai/DeepSeek-V4-Flash",
    "Cheney_usage": {
      "prompt_tokens": 58,
      "completion_tokens": 28,
      "total_tokens": 86
    }
  }
}
```

- **响应格式（参数错误 / 上游失败）**：

```json
{ "code": 400, "msg": "请求参数错误：Cheney_messages 必须是以 user 消息结尾的非空数组", "data": null }
{ "code": 502, "msg": "AI 接口调用失败：Sorry, your account balance is insufficient", "data": null }
```

- **修改时间**：2026-11-23 13:40

---

## POST /api/db/test

- **接口路径**：`/api/db/test`
- **HTTP 方法**：POST
- **请求参数**（JSON 请求体）：

```json
{ "Cheney_user": "root", "Cheney_password": "root" }
```

- **响应格式（成功）**：

```json
{
  "code": 0,
  "msg": "数据库连接成功",
  "data": {
    "Cheney_version": "8.0.30",
    "Cheney_database": "Cheney_web",
    "Cheney_account": "root@localhost"
  }
}
```

- **响应格式（失败）**：

```json
{ "code": 1, "msg": "数据库连接失败：Access denied for user 'root'@'localhost'", "data": null }
```

- **修改时间**：2026-11-19 13:53

---

## POST /api/chat（上游接口切换记录）

- **接口路径**：`/api/chat`（请求与响应结构不变）
- **HTTP 方法**：POST
- **上游配置**（只存在于 `backend/.env`）：
  - `AI_API_KEY`：兼容 OpenAI 协议的接口密钥（不打印、不下发前端）
  - `AI_API_BASE_URL`：`https://api.qnaigc.com/v1`
  - `AI_MODEL`：`qiniu/conatus-free`
- **实际请求**：`POST https://api.qnaigc.com/v1/chat/completions`，`Authorization: Bearer <AI_API_KEY>`
- **响应格式（成功）**：

```json
{
  "code": 0,
  "msg": "对话成功",
  "data": {
    "Cheney_reply": "大模型是一种基于海量数据训练、具有强大理解和生成能力的人工智能模型。",
    "Cheney_model": "qiniu/conatus-free",
    "Cheney_usage": { "prompt_tokens": 48, "completion_tokens": 39, "total_tokens": 87 }
  }
}
```

- **响应格式（上游限流）**：免费模型存在全局并发限制，可能返回
  `{ "code": 502, "msg": "AI 接口调用失败：HTTP 429", "data": null }`，稍后重试即可。
- **服务端日志**：控制台输出「AI 请求地址 / AI 请求数据 / AI 返回数据」，不含密钥。
- **修改时间**：2026-11-23 13:58

---

## RAG 知识库接口（2026-11-23）

统一前缀 `/api/kb`，检索采用 BM25 关键词打分（中文二元组 + 英文单词），不依赖 embedding。

### POST /api/kb/upload

- **请求**：`multipart/form-data`，文件字段名 `Cheney_file`，支持 `.doc/.docx/.ppt/.pptx/.pdf/.txt`，单文件 ≤ 25MB
- **响应（成功）**：

```json
{
  "code": 0,
  "msg": "文件已解析并入库",
  "data": {
    "Cheney_id": 3,
    "Cheney_file_name": "产品说明.docx",
    "Cheney_chunk_count": 2,
    "Cheney_status": "ready",
    "Cheney_warning": null
  }
}
```

- **响应（失败）**：`{ "code": 500, "msg": "文件解析失败：未能解析出文本（可能是扫描版或纯图片文件）", "data": { "Cheney_id": 3 } }`

### GET /api/kb/files

- **请求参数**：无
- **响应**：

```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "Cheney_total": 2,
    "Cheney_list": [
      {
        "Cheney_id": 2,
        "Cheney_file_name": "产品说明.docx",
        "Cheney_file_ext": ".docx",
        "Cheney_file_size": 4792,
        "Cheney_chunk_count": 2,
        "Cheney_status": "ready",
        "Cheney_error_msg": null,
        "Cheney_create_time": "2026-11-23T06:02:18.000Z"
      }
    ]
  }
}
```

### GET /api/kb/files/:Cheney_id/chunks

- **请求参数**：路径参数 `Cheney_id`
- **响应**：`{ code: 0, msg: "查询成功", data: { Cheney_file: {...}, Cheney_total: 3, Cheney_list: [{ Cheney_id, Cheney_chunk_index, Cheney_content, Cheney_char_count }] } }`
- **未找到**：`{ "code": 404, "msg": "文件不存在或已删除", "data": null }`

### DELETE /api/kb/files/:Cheney_id

- **请求参数**：路径参数 `Cheney_id`
- **响应**：`{ "code": 0, "msg": "文件已删除", "data": { "Cheney_id": 3 } }`

### POST /api/kb/ask

- **请求参数**：

```json
{ "Cheney_question": "客服的工作时间和联系方式是什么？" }
```

- **响应（命中并回答）**：

```json
{
  "code": 0,
  "msg": "回答完成",
  "data": {
    "Cheney_answer": "人工客服工作时间为工作日 9:00 至 18:00（北京时间）……【来源1】【来源2】",
    "Cheney_hit": true,
    "Cheney_sources": [
      {
        "Cheney_file_id": 1,
        "Cheney_file_name": "公司介绍与客服FAQ.txt",
        "Cheney_chunk_index": 0,
        "Cheney_score": 10.01,
        "Cheney_snippet": "星澜科技公司介绍与客服 FAQ……"
      }
    ],
    "Cheney_model": "qiniu/conatus-free",
    "Cheney_usage": { "prompt_tokens": 1349, "completion_tokens": 135, "total_tokens": 1484 }
  }
}
```

- **响应（未命中）**：`{ "code": 0, "msg": "未检索到相关内容", "data": { "Cheney_answer": "知识库中没有找到与该问题相关的内容……", "Cheney_hit": false, "Cheney_sources": [] } }`
- **响应（限流）**：`{ "code": 429, "msg": "知识库检索已完成，但 AI 接口当前限流（HTTP 429），请稍后重试", "data": { "Cheney_hit": true, "Cheney_sources": [...] } }`
- **服务端日志**：输出完整「参考资料 + 问题」请求体与模型返回数据，不打印密钥
- **修改时间**：2026-11-23 14:05

---

## AI 会话持久化接口（2026-11-23）

- **规范对话路径**：`POST /api/ai/chat`；旧路径 `POST /api/chat` 保留兼容，行为一致。
- **环境变量**：`LLM_API_KEY`、`LLM_BASE_URL`（https://api.qnaigc.com/v1）、`LLM_MODEL`（qiniu/conatus-free），代码同时兼容旧名 `AI_API_KEY` / `AI_API_BASE_URL` / `AI_MODEL`；密钥仅存在于 `backend/.env`。
- **Token 预算**：历史消息按约 3000 tokens、最多 20 条从最新向前保留，保证首条为 user；实际裁剪条数通过 `Cheney_history_trimmed` 返回。
- **中断机制**：前端点击“停止”会中止 fetch，服务端检测到连接关闭后通过 `AbortController` 取消上游请求，本轮消息不落库。

### POST /api/ai/chat

- **请求体（推荐，带会话）**：

```json
{ "Cheney_conversation_id": 2, "Cheney_message": "用 Markdown 给出一个 JavaScript 代码块示例" }
```

- **请求体（兼容旧版，无状态）**：`{ "Cheney_messages": [{ "role": "user", "content": "..." }] }`
- **响应（成功）**：

```json
{
  "code": 0,
  "msg": "对话成功",
  "data": {
    "Cheney_conversation_id": 2,
    "Cheney_conversation_title": "Markdown 渲染测试",
    "Cheney_reply": "```javascript\nconsole.log(\"你好\");\n```\n\n- 代码块用途……",
    "Cheney_model": "qiniu/conatus-free",
    "Cheney_usage": { "prompt_tokens": 102, "completion_tokens": 79, "total_tokens": 181 },
    "Cheney_history_trimmed": 0
  }
}
```

- **响应（参数错误）**：`code: 400`，缺少会话 ID/消息，或消息超过 2000 字。
- **响应（会话不存在）**：`code: 404`。
- **响应（限流）**：`code: 429`，提示稍后重试。

### GET /api/ai/conversations

- **响应**：`{ code: 0, msg: "查询成功", data: { Cheney_total: 1, Cheney_list: [{ Cheney_id, Cheney_title, Cheney_create_time, Cheney_update_time, Cheney_message_count }] } }`

### POST /api/ai/conversations

- **请求体**：`{ "Cheney_title": "可选标题" }`，缺省为“新对话”；响应返回新建会话对象。

### PUT /api/ai/conversations/:Cheney_id

- **请求体**：`{ "Cheney_title": "新名称" }`，名称 1-100 字；响应返回更新后的会话。

### DELETE /api/ai/conversations/:Cheney_id

- **响应**：`{ "code": 0, "msg": "会话已删除", "data": { "Cheney_id": 2 } }`，同时删除该会话全部消息。

### GET /api/ai/conversations/:Cheney_id/messages

- **响应**：

```json
{
  "code": 0,
  "msg": "查询成功",
  "data": {
    "Cheney_conversation": { "Cheney_id": 2, "Cheney_title": "Markdown 渲染测试", "Cheney_create_time": "...", "Cheney_update_time": "..." },
    "Cheney_total": 2,
    "Cheney_list": [
      { "Cheney_id": 1, "Cheney_role": "user", "Cheney_content": "…", "Cheney_create_time": "..." },
      { "Cheney_id": 2, "Cheney_role": "assistant", "Cheney_content": "…", "Cheney_create_time": "..." }
    ]
  }
}
```

- **修改时间**：2026-11-23 15:05
