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
