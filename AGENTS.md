<!--
姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
-->

# AGENTS.md

本文件是本项目的开发约定，所有参与者（包括 AI 助手）在编写、修改代码时必须遵守。

## 项目结构与技术栈

### 前端

- 代码位于 `frontend/` 目录。
- 使用原生 HTML、CSS、JavaScript。**禁止**引入任何第三方库、框架、CDN 链接（包括 jQuery、Vue、React、Bootstrap、Tailwind、axios、图标 CDN 等）。
- 目录结构固定：
  - `frontend/css/`：样式文件
  - `frontend/js/`：脚本文件
  - `frontend/fonts/`：iconfont 图标文件（如有）
  - `frontend/images/`：图片资源

### 后端

- 代码位于 `backend/` 目录，技术栈为 Node.js + Express。
- 采用 RESTful + MVC 风格组织代码。
- 所有接口统一以 `/api/` 为前缀。
- 服务端口固定为 `8111`。
- 使用 `express.static` 托管 `frontend/` 目录。
- 后端需支持所有跨域访问（CORS 全开）。
- 依赖安装顺序：优先 `cnpm i 包名`；失败或超时后再改用 `npm i 包名`。

### 数据库

- 使用 MySQL。
- 数据库凭据只能写入 `backend/.env`，变量名：
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_HOST`
  - `DB_NAME`
- 凭据**不得**出现在任何代码文件中，也**不得**写入本文件（AGENTS.md）。
- `.env` 必须加入 `.gitignore`。
- 根据后端接口的需要自行创建、修改数据库表；每张表建好后，插入**至少 8 条**具有真实业务意义的测试数据。

## 命名与注释

- CSS 类名、JS 变量名、JS 函数名、数据库表名及相关字段命名，一律以 `Cheney_` 开头。
- 每个文件头部必须包含注释块：

  ```
  姓名：徐欣烨 | 学号：22001010111 | 时间：yyyy-mm-dd | 大模型：{本次使用的大模型名称}
  ```

  按文件类型使用对应注释语法（HTML 用 `<!-- -->`，CSS 用 `/* */`，JS 用 `//` 或 `/* */`，SQL 用 `--`，Markdown 用 `<!-- -->`）。

## 记录文件（一律追加写入，禁止覆盖已有内容）

- `Cheney_prompt.md`（项目根目录）：每次向 AI 发出开发指令后，追加记录：
  `时间 | 提示词全文 | 大模型名称`
- `backend/Cheney_interface.md`：每次创建或修改接口后，追加：
  `接口路径 | HTTP 方法 | 请求参数（含示例） | 响应格式（含 JSON 示例） | 修改时间`
- `backend/Cheney_database.md`：每次建表、改表或插入数据后，按执行顺序追加对应 SQL 语句（含测试数据的 INSERT）。要求仅凭此文件即可在新机器上完整重建数据库。

### 统一响应格式

所有接口返回统一 JSON 结构：

```json
{ "code": 0, "msg": "提示信息", "data": {} }
```

- `code = 0` 表示成功，非 `0` 表示失败。

## 前端约定

- 服务器返回的数据与错误信息必须输出到浏览器控制台（`console.log` / `console.error`）。
- 新建 HTML 页面后，需在 `frontend/index.html` 中追加超链接入口；文件名包含 `detail` 的页面除外。
