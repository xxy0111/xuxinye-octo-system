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
│   ├── database.html
│   ├── css/Cheney_common.css
│   ├── js/
│   │   ├── Cheney_common.js
│   │   ├── Cheney_index.js
│   │   ├── Cheney_news.js
│   │   ├── Cheney_gallery.js
│   │   └── Cheney_database.js
│   ├── fonts/
│   └── images/
└── backend/
    ├── app.js
    ├── config/Cheney_db.js
    ├── models/
    ├── controllers/
    ├── routes/Cheney_api.js
    ├── .env                  # 数据库凭据（不提交）
    ├── Cheney_interface.md   # 接口记录
    └── Cheney_database.md    # 数据库记录
```

## 运行方式

1. 确认 MySQL 已启动，且 `backend/.env` 中的账号密码可用。
2. 双击根目录 `run.bat`，脚本会自动进入 `backend/`、按需安装依赖并启动服务。
3. 浏览器访问 `http://localhost:8111/`。

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
| POST | `/api/db/test` | 使用传入的账号密码测试数据库连接 |

统一响应格式：

```json
{ "code": 0, "msg": "提示信息", "data": {} }
```

## 数据库

- 数据库名：`Cheney_web`（字符集 utf8mb4）
- 数据表：`Cheney_news`、`Cheney_gallery`，各含 8 条测试数据
- 完整建表与测试数据 SQL 见 `backend/Cheney_database.md`
