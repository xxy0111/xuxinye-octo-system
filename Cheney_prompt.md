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
