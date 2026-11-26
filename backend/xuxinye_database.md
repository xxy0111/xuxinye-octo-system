<!--
姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
-->

# 数据库结构记录

本文件只追加、不覆盖，按执行顺序记录 SQL，仅凭本文件即可在新机器上重建数据库。

---

## 2026-11-19 13:47 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS xuxinye_web
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
```

> 说明：业务表尚未建立，待接口需求确定后按顺序补充建表 SQL 与测试数据。

---

## 2026-11-19 13:53 创建科技新闻表 xuxinye_news 并插入 8 条测试数据

```sql
USE xuxinye_web;

DROP TABLE IF EXISTS xuxinye_news;

CREATE TABLE xuxinye_news (
  xuxinye_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻编号',
  xuxinye_title VARCHAR(120) NOT NULL COMMENT '标题',
  xuxinye_summary VARCHAR(255) NOT NULL COMMENT '摘要',
  xuxinye_content TEXT NOT NULL COMMENT '正文',
  xuxinye_author VARCHAR(50) NOT NULL COMMENT '作者',
  xuxinye_source VARCHAR(80) NOT NULL COMMENT '来源',
  xuxinye_publish_time DATETIME NOT NULL COMMENT '发布时间',
  xuxinye_cover_url VARCHAR(500) DEFAULT NULL COMMENT '封面图地址',
  xuxinye_view_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
  xuxinye_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (xuxinye_id),
  KEY xuxinye_idx_publish_time (xuxinye_publish_time)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '科技新闻表';

INSERT INTO xuxinye_news
  (xuxinye_title, xuxinye_summary, xuxinye_content, xuxinye_author, xuxinye_source, xuxinye_publish_time, xuxinye_view_count)
VALUES
  ('国产大模型开源生态加速，多模态能力成竞争焦点',
   '多家厂商在同一周开源新一代多模态模型，参数规模与推理成本同步优化。',
   '本周国内三家厂商相继开源多模态大模型，均支持图文理解与长上下文推理。业内认为，开源权重显著降低了中小团队的接入门槛，推理成本较上一代下降约四成，竞争重点正从参数规模转向工程化落地能力。',
   '陈默', '科技前沿观察', '2026-11-18 09:20:00', 1286),
  ('3纳米工艺进入量产爬坡期，先进封装成为算力新战场',
   '晶圆厂扩产节奏加快，2.5D 与 3D 封装订单排期已延至明年二季度。',
   '随着 3 纳米工艺良率提升，头部晶圆厂进入量产爬坡阶段。与此同时，高带宽内存与先进封装产能成为限制算力供给的关键环节，多家封测厂宣布追加资本开支，用于扩建 2.5D 与 3D 封装产线。',
   '刘一鸣', '半导体产业周刊', '2026-11-17 14:05:00', 964),
  ('量子计算原型机完成千比特纠错实验，实用化再进一步',
   '研究团队在超导体系上实现千比特级表面码纠错，逻辑错误率下降一个量级。',
   '研究团队在超导量子处理器上完成了千比特规模的表面码纠错实验，逻辑量子比特错误率相比物理比特下降约一个数量级。该结果意味着容错量子计算的门槛进一步降低，但距离可商用的大规模量子优势仍有距离。',
   '周清源', '量子实验室通讯', '2026-11-16 10:40:00', 738),
  ('人形机器人进入汽车总装线，重复定位精度达 0.05 毫米',
   '首批十余台人形机器人在总装车间承担搬运与质检任务，连续运行超过两千小时。',
   '某汽车工厂宣布人形机器人正式进入总装线批量作业，主要承担零部件搬运、螺栓预紧与外观质检等工作，重复定位精度达到 0.05 毫米。工厂方面表示，机器人已连续运行超过两千小时，下一步将扩展到焊装环节。',
   '高远', '智能制造日报', '2026-11-15 16:30:00', 1522),
  ('低轨卫星互联网完成组网测试，偏远地区时延降至 40 毫秒',
   '一期星座完成在轨测试，山区与海上场景的下载速率稳定在百兆级别。',
   '一期低轨星座完成组网测试，在山区、海岛与远洋等场景下实测下载速率稳定在百兆级别，端到端时延降至 40 毫秒左右。运营方表示，下一阶段将重点解决高密度用户接入与星间链路切换的稳定性问题。',
   '许知远', '空天信息参考', '2026-11-14 08:55:00', 611),
  ('数据中心液冷改造提速，单机柜功率密度突破 100 千瓦',
   '冷板式液冷方案占比持续提升，改造后 PUE 普遍降至 1.15 以下。',
   '面向高密度算力需求，多地数据中心启动液冷改造。冷板式方案因改造成本可控成为主流选择，改造后单机柜功率密度突破 100 千瓦，全年 PUE 普遍降至 1.15 以下，较传统风冷方案节能约三成。',
   '沈立', '绿色算力观察', '2026-11-13 11:10:00', 845),
  ('端侧 AI 芯片出货量翻倍，手机本地推理成为标配',
   '新一代移动芯片普遍集成独立 NPU，本地大模型推理时延控制在 300 毫秒内。',
   '统计显示，支持本地大模型推理的移动芯片出货量同比增长超过一倍。新一代芯片普遍集成独立 NPU 与大容量缓存，7B 级模型在手机端的首字时延控制在 300 毫秒以内，离线翻译、通话摘要等场景开始规模化落地。',
   '李桐', '消费电子研究', '2026-11-12 19:25:00', 1037),
  ('开源社区发布新一代前端渲染引擎，首屏性能提升 35%',
   '新引擎引入增量渲染与流式水合，复杂页面首屏时间明显缩短。',
   '开源社区发布新一代前端渲染引擎，通过增量渲染与流式水合机制减少主线程阻塞，在电商与后台管理类复杂页面的基准测试中，首屏可交互时间平均缩短 35%，内存占用下降约两成。',
   '王砚', '开源技术周刊', '2026-11-11 09:00:00', 1493);
```

## 2026-11-19 13:53 创建科技图文表 xuxinye_gallery 并插入 8 条测试数据

```sql
USE xuxinye_web;

DROP TABLE IF EXISTS xuxinye_gallery;

CREATE TABLE xuxinye_gallery (
  xuxinye_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图文编号',
  xuxinye_title VARCHAR(120) NOT NULL COMMENT '标题',
  xuxinye_description VARCHAR(255) NOT NULL COMMENT '描述',
  xuxinye_image_url VARCHAR(500) NOT NULL COMMENT '图片地址',
  xuxinye_category VARCHAR(50) NOT NULL COMMENT '分类',
  xuxinye_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (xuxinye_id),
  KEY xuxinye_idx_category (xuxinye_category)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '科技图文表';

INSERT INTO xuxinye_gallery
  (xuxinye_title, xuxinye_description, xuxinye_image_url, xuxinye_category)
VALUES
  ('神经网络算力集群',
   '万卡级训练集群通过高速互联实现并行训练，算力调度成为核心能力。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=artificial%20intelligence%20neural%20network%20chip%20glowing%20data%20center&image_size=landscape_4_3',
   '人工智能'),
  ('量子计算实验平台',
   '超导量子处理器在接近绝对零度的环境中运行，纠错是实用化的关键。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quantum%20computer%20lab%20blue%20light&image_size=landscape_4_3',
   '量子科技'),
  ('人形机器人产线',
   '人形机器人进入总装车间，承担搬运、质检等高重复度工作。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=humanoid%20robot%20in%20modern%20factory&image_size=landscape_4_3',
   '机器人'),
  ('火箭发射现场',
   '商业航天发射频次持续提升，可回收技术降低单位载荷入轨成本。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rocket%20launching%20into%20space%20at%20dusk&image_size=landscape_4_3',
   '航天探索'),
  ('超充站夜景',
   '高压快充网络加速铺开，补能效率成为新能源车竞争要点。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=electric%20vehicle%20charging%20station%20futuristic&image_size=landscape_4_3',
   '新能源'),
  ('智慧城市数据流',
   '城市感知设备与数据中台联动，交通与能耗调度更加精细。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20city%20skyline%20at%20night%20with%20data%20streams&image_size=landscape_4_3',
   '智慧城市'),
  ('医疗影像全息平台',
   '全息影像与人工智能辅助诊断结合，提升病灶识别效率。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medical%20technology%20lab%20with%20holographic%20display&image_size=landscape_4_3',
   '医疗科技'),
  ('虚拟现实沉浸体验',
   '轻量化头显与空间计算结合，虚拟现实进入内容生态竞争阶段。',
   'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=virtual%20reality%20headset%20user%20in%20neon%20light&image_size=landscape_4_3',
   '虚拟现实');
```

> 重建方式：先执行本文件顶部的建库语句，再按时间顺序执行以上两段 SQL，即可得到与当前完全一致的数据库。

---

## 2026-11-23 14:05 创建 RAG 知识库表 xuxinye_kb_file、xuxinye_kb_chunk

```sql
USE xuxinye_web;

CREATE TABLE IF NOT EXISTS xuxinye_kb_file (
  xuxinye_id INT AUTO_INCREMENT PRIMARY KEY,
  xuxinye_file_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  xuxinye_file_ext VARCHAR(16) NOT NULL COMMENT '扩展名',
  xuxinye_stored_name VARCHAR(255) NULL COMMENT '服务端存储文件名',
  xuxinye_file_size INT NOT NULL DEFAULT 0 COMMENT '文件大小（字节）',
  xuxinye_chunk_count INT NOT NULL DEFAULT 0 COMMENT '切分片段数',
  xuxinye_status VARCHAR(16) NOT NULL DEFAULT 'ready' COMMENT 'ready/failed/parsing',
  xuxinye_error_msg VARCHAR(500) NULL COMMENT '解析错误或备注',
  xuxinye_delete_flag TINYINT NOT NULL DEFAULT 0 COMMENT '软删除标记',
  xuxinye_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS xuxinye_kb_chunk (
  xuxinye_id INT AUTO_INCREMENT PRIMARY KEY,
  xuxinye_file_id INT NOT NULL COMMENT '所属文件 ID',
  xuxinye_chunk_index INT NOT NULL COMMENT '片段序号（从 0 开始）',
  xuxinye_content TEXT NOT NULL COMMENT '片段文本',
  xuxinye_char_count INT NOT NULL DEFAULT 0 COMMENT '字符数',
  KEY xuxinye_idx_file (xuxinye_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

> 说明：两张表由服务启动时自动执行 `CREATE TABLE IF NOT EXISTS` 创建；示例数据由 `backend/scripts/xuxinye_seed_kb.js`（`npm run seed:kb`）从 `backend/sample/` 解析导入，当前共 2 个文件、5 个片段。
> 完整重建方式：先执行建库语句与以上三段 SQL，再运行 `cd backend && npm run seed:kb` 导入示例文件。

---

## 2026-11-23 14:52 创建 AI 会话表 xuxinye_conversation、xuxinye_chat_message

```sql
USE xuxinye_web;

CREATE TABLE IF NOT EXISTS xuxinye_conversation (
  xuxinye_id INT AUTO_INCREMENT PRIMARY KEY,
  xuxinye_title VARCHAR(100) NOT NULL DEFAULT '新对话' COMMENT '会话标题',
  xuxinye_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  xuxinye_update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '最后更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS xuxinye_chat_message (
  xuxinye_id INT AUTO_INCREMENT PRIMARY KEY,
  xuxinye_conversation_id INT NOT NULL COMMENT '所属会话 ID',
  xuxinye_role VARCHAR(16) NOT NULL COMMENT 'user / assistant',
  xuxinye_content TEXT NOT NULL COMMENT '消息内容',
  xuxinye_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  KEY xuxinye_idx_conversation (xuxinye_conversation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

> 说明：两张表由 `backend/app.js` 启动时自动创建；标题在首轮对话后自动取用户消息前 24 字，也可通过接口重命名；删除会话会同步删除其全部消息。
> 当前数据：`xuxinye_conversation` 1 条（“Markdown 渲染测试”，4 条消息）、`xuxinye_chat_message` 4 条，用于浏览器验证会话持久化与 Markdown 渲染。

## 2026-11-23 14:52 知识库示例数据扩充至 8 个文件、14 个片段

新增示例文件（`backend/sample/`）：

- 售后服务与退换货政策.txt（1 片段）
- 技术架构与安全合规.txt（2 片段）
- 渠道合作与联系方式.txt（2 片段）
- 常见故障排查手册.txt（2 片段）
- 实施交付与培训流程.txt（1 片段）
- 价格与授权说明.txt（1 片段）

连同原有的公司介绍与客服FAQ.txt（3 片段）、产品说明.docx（2 片段），`xuxinye_kb_file` 共 8 条、`xuxinye_kb_chunk` 共 14 条，满足每表不少于 8 条测试数据的要求。

---

## 2026-11-26 15:20 迁移到 Supabase Postgres

切换方式：`backend/.env` 增加 `DB_DRIVER=supabase` 与 `SUPABASE_DB_URL`（完整连接串，含密码，禁止提交）；改回 `DB_DRIVER=mysql` 即回滚到本地 MySQL。迁移脚本：`backend/scripts/xuxinye_migrate_supabase.js`（幂等）。

```sql
CREATE TABLE IF NOT EXISTS xuxinye_news (
  xuxinye_id SERIAL PRIMARY KEY,
  xuxinye_title VARCHAR(120) NOT NULL,
  xuxinye_summary VARCHAR(255) NOT NULL,
  xuxinye_content TEXT NOT NULL,
  xuxinye_author VARCHAR(50) NOT NULL,
  xuxinye_source VARCHAR(80) NOT NULL,
  xuxinye_publish_time TIMESTAMP NOT NULL,
  xuxinye_cover_url VARCHAR(500),
  xuxinye_view_count INTEGER NOT NULL DEFAULT 0,
  xuxinye_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS xuxinye_idx_publish_time ON xuxinye_news (xuxinye_publish_time);

CREATE TABLE IF NOT EXISTS xuxinye_gallery (
  xuxinye_id SERIAL PRIMARY KEY,
  xuxinye_title VARCHAR(120) NOT NULL,
  xuxinye_description VARCHAR(255) NOT NULL,
  xuxinye_image_url VARCHAR(500) NOT NULL,
  xuxinye_category VARCHAR(50) NOT NULL,
  xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS xuxinye_idx_category ON xuxinye_gallery (xuxinye_category);

CREATE TABLE IF NOT EXISTS xuxinye_kb_file (
  xuxinye_id SERIAL PRIMARY KEY,
  xuxinye_file_name VARCHAR(255) NOT NULL,
  xuxinye_file_ext VARCHAR(16) NOT NULL,
  xuxinye_stored_name VARCHAR(255),
  xuxinye_file_size INTEGER NOT NULL DEFAULT 0,
  xuxinye_chunk_count INTEGER NOT NULL DEFAULT 0,
  xuxinye_status VARCHAR(16) NOT NULL DEFAULT 'ready',
  xuxinye_error_msg VARCHAR(500),
  xuxinye_delete_flag INTEGER NOT NULL DEFAULT 0,
  xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS xuxinye_kb_chunk (
  xuxinye_id SERIAL PRIMARY KEY,
  xuxinye_file_id INTEGER NOT NULL,
  xuxinye_chunk_index INTEGER NOT NULL,
  xuxinye_content TEXT NOT NULL,
  xuxinye_char_count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS xuxinye_idx_file ON xuxinye_kb_chunk (xuxinye_file_id);

CREATE TABLE IF NOT EXISTS xuxinye_conversation (
  xuxinye_id SERIAL PRIMARY KEY,
  xuxinye_title VARCHAR(100) NOT NULL DEFAULT '新对话',
  xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  xuxinye_update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS xuxinye_chat_message (
  xuxinye_id SERIAL PRIMARY KEY,
  xuxinye_conversation_id INTEGER NOT NULL,
  xuxinye_role VARCHAR(16) NOT NULL,
  xuxinye_content TEXT NOT NULL,
  xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS xuxinye_idx_conversation ON xuxinye_chat_message (xuxinye_conversation_id);
```

迁移结果（脚本输出，逐表核对一致）：

| 表 | MySQL | Supabase |
| --- | --- | --- |
| xuxinye_news | 8 | 8 |
| xuxinye_gallery | 8 | 8 |
| xuxinye_kb_file | 12 | 12 |
| xuxinye_kb_chunk | 14 | 14 |
| xuxinye_conversation | 1 | 1 |
| xuxinye_chat_message | 4 | 4 |

说明：`xuxinye_kb_file` 的 12 条中有 4 条为历史测试留下的软删除记录（`xuxinye_delete_flag=1`），列表接口只返回 8 条。

## 2026-11-26 16:05 命名统一为 xuxinye

- 范围：项目内所有 `Cheney` / `cheney` 命名统一为 `xuxinye`，包含文件名、代码标识符、CSS 类名、表名、列名、索引/约束/序列名与文档。
- MySQL：使用 `RENAME TABLE` 将 6 张表从 `Cheney_web` 迁到 `xuxinye_web`；使用 `ALTER TABLE ... RENAME COLUMN` 重命名全部列；使用 `RENAME INDEX` 重命名索引，数据未重建。
- Supabase：使用 `ALTER TABLE ... RENAME TO`、`RENAME COLUMN`、`RENAME CONSTRAINT`、`ALTER INDEX ... RENAME`、`ALTER SEQUENCE ... RENAME`，数据未重建。
- 行数核对保持：`xuxinye_news` 8、`xuxinye_gallery` 8、`xuxinye_kb_file` 12、`xuxinye_kb_chunk` 14、`xuxinye_conversation` 1、`xuxinye_chat_message` 4。
- 回滚：`DB_DRIVER=mysql` 可切回本地 MySQL 的 `xuxinye_web`；旧库名 `Cheney_web` 已为空但保留，可手动将表迁回。

## 2026-11-26 14:17 Supabase 只读核对（MCP 未加载，改用直连）

核对方式说明：

- 本会话未加载任何 supabase MCP 工具：对 `list_tables`、`execute_sql`、`generate_typescript_types`、`list_projects` 等名称的工具检索均返回 0 条，未反复重试。
- 经用户同意改用 `backend/.env` 中的 `SUPABASE_DB_URL` 只读直连（仅 `SELECT` 系统目录与 `count(*)`），未执行任何 DDL/DML，未改表结构、未改数据。

配置核对：

- 项目 `.vscode/mcp.json` 与 Trae 全局 `C:\Users\ZhuanZ1\AppData\Roaming\Trae CN\User\mcp.json` 的 `supabase` 条目一致，URL 均为 `https://mcp.supabase.com/mcp?project_ref=lxedtoxdathhjhrluiwv&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cfeedback%2Cnotebooks`，`project_ref=lxedtoxdathhjhrluiwv` 与目标项目一致。
- 全局文件另有一条空对象 `"supabase-mcp": {}`（无 `url`），属于无效占位，建议后续清理；它不影响 `supabase` 条目。

链路可用性（直连）：

| 项 | 值 |
| --- | --- |
| 连接建立耗时 | 2179 ms（TCP + TLS 成功） |
| 服务端版本 | PostgreSQL 17.12 on aarch64-unknown-linux-gnu（64-bit） |
| 数据库 / 用户 | postgres / postgres |
| 凭据 | 取自 `SUPABASE_DB_URL`，记录中不落明文 |

public schema 表清单（共 6 张，无多余表）：

```text
xuxinye_chat_message
xuxinye_conversation
xuxinye_gallery
xuxinye_kb_chunk
xuxinye_kb_file
xuxinye_news
```

行数核对（`SELECT count(*)::int`，预期值取自任务要求）：

| 表 | 预期 | 实测 | 结果 |
| --- | --- | --- | --- |
| xuxinye_news | 8 | 8 | 一致 |
| xuxinye_gallery | 8 | 8 | 一致 |
| xuxinye_kb_file | 12 | 12 | 一致 |
| xuxinye_kb_chunk | 14 | 14 | 一致 |
| xuxinye_conversation | 1 | 1 | 一致 |
| xuxinye_chat_message | 4 | 4 | 一致 |

附：`xuxinye_kb_file` 的 12 条中含 4 条 `xuxinye_delete_flag=1` 的软删除记录，列表接口只返回 8 条，属于既有设计。

RLS 与索引核对：

- RLS：6 张表 `pg_class.relrowsecurity` 均为 `false`（未启用行级安全），与当前后端经连接串直连的访问方式一致。
- 索引：`xuxinye_news_pkey`、`xuxinye_idx_publish_time`、`xuxinye_gallery_pkey`、`xuxinye_idx_category`、`xuxinye_kb_file_pkey`、`xuxinye_kb_chunk_pkey`、`xuxinye_idx_file`、`xuxinye_conversation_pkey`、`xuxinye_chat_message_pkey`、`xuxinye_idx_conversation`。

类型生成（等价于 MCP `generate_typescript_types` 的 `information_schema` 内省结果，共 6 表 40 字段）：

| 表 | 字段（Postgres 类型 → TS 类型） |
| --- | --- |
| xuxinye_news | xuxinye_id serial→number、xuxinye_title varchar→string、xuxinye_summary varchar→string、xuxinye_content text→string、xuxinye_author varchar→string、xuxinye_source varchar→string、xuxinye_publish_time timestamp→string、xuxinye_cover_url varchar/null→string \| null、xuxinye_view_count int→number、xuxinye_created_at timestamp→string |
| xuxinye_gallery | xuxinye_id serial→number、xuxinye_title varchar→string、xuxinye_description varchar→string、xuxinye_image_url varchar→string、xuxinye_category varchar→string、xuxinye_create_time timestamp→string |
| xuxinye_kb_file | xuxinye_id serial→number、xuxinye_file_name varchar→string、xuxinye_file_ext varchar→string、xuxinye_stored_name varchar/null→string \| null、xuxinye_file_size int→number、xuxinye_chunk_count int→number、xuxinye_status varchar→string、xuxinye_error_msg varchar/null→string \| null、xuxinye_delete_flag int→number、xuxinye_create_time timestamp→string |
| xuxinye_kb_chunk | xuxinye_id serial→number、xuxinye_file_id int→number、xuxinye_chunk_index int→number、xuxinye_content text→string、xuxinye_char_count int→number |
| xuxinye_conversation | xuxinye_id serial→number、xuxinye_title varchar→string、xuxinye_create_time timestamp→string、xuxinye_update_time timestamp→string |
| xuxinye_chat_message | xuxinye_id serial→number、xuxinye_conversation_id int→number、xuxinye_role varchar→string、xuxinye_content text→string、xuxinye_create_time timestamp→string |

说明：后端为纯 JavaScript（无 TypeScript 工具链），本次只生成并记录类型映射，未落地 `.ts` 文件，避免引入无用文件。

结论与待办：

- 数据库侧核对通过：6 张表齐全、行数与预期完全一致、索引与主键完整，链路可用。
- MCP 侧仍不可用：工具未注入本会话。建议完全退出 Trae（托盘也退出）后重新打开，再在新会话执行一次 `list_tables` 与行数查询，完成手册第 6 步的 MCP 链路验证；在此之前以直连结果为准。

## 2026-11-26 14:29 Supabase MCP 链路验证通过（只读）

MCP 服务器状态（截图判读：Trae → 设置 → MCP → 本地）：

- `supabase` 条目显示绿色对勾，开关为开启，无任何报错或错误文案；`deployment`、`trae-capabilities` 同样为对勾 + 开启。
- 与上一轮“插件市场浏览页”截图不同，本次看到的是 MCP Servers 管理列表，说明配置已生效。

本会话 MCP 工具可用性（均为实际调用成功，非直连）：

| 工具 | 结果 |
| --- | --- |
| `list_tables` | 成功，public schema 返回 6 张表 |
| `execute_sql` | 成功，一次 `UNION ALL` 查询返回 6 表行数 |
| `generate_typescript_types` | 成功，生成 6 表 40 字段类型定义 |
| `get_advisors` | 成功，security 返回 1 条 ERROR 级 lint |
| `list_migrations` | 成功，返回空数组 |
| `get_project_url` | 成功，`https://lxedtoxdathhjhrluiwv.supabase.co` |
| `list_extensions` | 成功，返回可安装扩展清单 |

public schema 表清单（`list_tables`，与直连结果一致，无多余表）：

```text
xuxinye_chat_message  (rls_enabled=false, rows=4)
xuxinye_conversation  (rls_enabled=false, rows=1)
xuxinye_gallery       (rls_enabled=false, rows=8)
xuxinye_kb_chunk      (rls_enabled=false, rows=14)
xuxinye_kb_file       (rls_enabled=false, rows=12)
xuxinye_news          (rls_enabled=false, rows=8)
```

行数核对（MCP `execute_sql`：`select count(*) from public.<表>`）：

| 表 | 预期 | MCP 实测 | 结果 |
| --- | --- | --- | --- |
| xuxinye_news | 8 | 8 | 一致 |
| xuxinye_gallery | 8 | 8 | 一致 |
| xuxinye_kb_file | 12 | 12 | 一致 |
| xuxinye_kb_chunk | 14 | 14 | 一致 |
| xuxinye_conversation | 1 | 1 | 一致 |
| xuxinye_chat_message | 4 | 4 | 一致 |

类型生成（`generate_typescript_types` 实际返回值，`PostgrestVersion: "17.1"`）：

- 结构与上一节按 `information_schema` 手工内省的结果完全一致，6 表 40 字段。
- 可空字段映射为 `string | null`：`xuxinye_cover_url`、`xuxinye_stored_name`、`xuxinye_error_msg`；其余均为必填。
- 自增主键在 `Insert`/`Update` 中为可选（`xuxinye_id`）；`xuxinye_created_at`、`xuxinye_create_time`、`xuxinye_update_time` 因有默认值同样可选。
- 6 张表均无外键，`Relationships: []`；`Views`/`Functions`/`Enums` 均为空。
- 后端为纯 JavaScript（无 TypeScript 工具链），本次只验证生成能力，未落地 `.ts` 文件。

安全提示（`get_advisors` type=security）：

- 命中 1 条 lint：`rls_disabled_in_public`，level=ERROR，count=6，即上述 6 张表均未启用 RLS。
- 影响面：经 Supabase 客户端库（anon / authenticated key）访问 PostgREST 时，任何人可读写全部行。
- 当前后端使用 `SUPABASE_DB_URL` 以 `postgres` 角色直连 Postgres，不经过 PostgREST，因此不受该 lint 直接影响。
- 未执行任何修复：任务限定只读。若后续要给前端开放 PostgREST，需先按业务建读写策略再启用 RLS（仅启用 RLS 不建策略会导致全部访问被拒）。

迁移记录（`list_migrations`）：

- 返回 `{"migrations":[]}`。原因是此前 6 张表由直连脚本 `backend/scripts/xuxinye_migrate_supabase.js` 执行 `CREATE TABLE IF NOT EXISTS` 建立，未走 MCP `apply_migration`，因此未记入 `supabase_migrations` 体系。后续若改用 MCP 管理 DDL，需重新登记基线。

本会话已加载但未执行的其他能力（供手册后半部分参考）：`apply_migration`（DDL）、`create_branch` / `list_branches` / `merge_branch`（分支）、`deploy_edge_function` / `list_edge_functions`（边缘函数）、`create_notebook` / `run_notebook`、`search_docs`、`get_publishable_keys`。

结论：

- 手册 MCP 相关步骤（配置生效、链路可用、`list_tables`、`execute_sql`、类型生成、advisors、迁移查看）已完成，全部经 MCP 工具实测，不再需要直连替代。
- 全程只读：未执行 DDL/DML，未改表结构、未改数据、未改 `mcp.json`。
- 遗留建议：6 表 RLS 未启用属于已知项；如需对外开放 PostgREST，再单独评估策略。

## 2026-11-26 14:35 通过 MCP 补记迁移基线并启用 RLS（手册第六、七、九节）

对应手册条目：第六节“之后怎么用：说需求就行”（要求开启 RLS、匿名只读、写入仅 service_role）、第七节验收清单（REST 能取到数据）、第八节常见坑（开了 RLS 却没策略 → 前端取不到数据）。

执行方式：全部用 supabase MCP `apply_migration`，不再用直连脚本。用户已确认执行以下两项。

### 迁移 1：xuxinye_baseline_schema（version 20261126063247）

目的：此前 6 张表由直连脚本建立，`supabase_migrations` 为空，导致后续迁移没有起点。本迁移把既有表结构以 `IF NOT EXISTS` 幂等方式登记，不创建新表、不改列、不动数据。

```sql
CREATE TABLE IF NOT EXISTS xuxinye_news (
  xuxinye_id SERIAL PRIMARY KEY,
  xuxinye_title VARCHAR(120) NOT NULL,
  xuxinye_summary VARCHAR(255) NOT NULL,
  xuxinye_content TEXT NOT NULL,
  xuxinye_author VARCHAR(50) NOT NULL,
  xuxinye_source VARCHAR(80) NOT NULL,
  xuxinye_publish_time TIMESTAMP NOT NULL,
  xuxinye_cover_url VARCHAR(500),
  xuxinye_view_count INTEGER NOT NULL DEFAULT 0,
  xuxinye_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS xuxinye_idx_publish_time ON xuxinye_news (xuxinye_publish_time);

CREATE TABLE IF NOT EXISTS xuxinye_gallery (
  xuxinye_id SERIAL PRIMARY KEY,
  xuxinye_title VARCHAR(120) NOT NULL,
  xuxinye_description VARCHAR(255) NOT NULL,
  xuxinye_image_url VARCHAR(500) NOT NULL,
  xuxinye_category VARCHAR(50) NOT NULL,
  xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS xuxinye_idx_category ON xuxinye_gallery (xuxinye_category);

CREATE TABLE IF NOT EXISTS xuxinye_kb_file (
  xuxinye_id SERIAL PRIMARY KEY,
  xuxinye_file_name VARCHAR(255) NOT NULL,
  xuxinye_file_ext VARCHAR(16) NOT NULL,
  xuxinye_stored_name VARCHAR(255),
  xuxinye_file_size INTEGER NOT NULL DEFAULT 0,
  xuxinye_chunk_count INTEGER NOT NULL DEFAULT 0,
  xuxinye_status VARCHAR(16) NOT NULL DEFAULT 'ready',
  xuxinye_error_msg VARCHAR(500),
  xuxinye_delete_flag INTEGER NOT NULL DEFAULT 0,
  xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS xuxinye_kb_chunk (
  xuxinye_id SERIAL PRIMARY KEY,
  xuxinye_file_id INTEGER NOT NULL,
  xuxinye_chunk_index INTEGER NOT NULL,
  xuxinye_content TEXT NOT NULL,
  xuxinye_char_count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS xuxinye_idx_file ON xuxinye_kb_chunk (xuxinye_file_id);

CREATE TABLE IF NOT EXISTS xuxinye_conversation (
  xuxinye_id SERIAL PRIMARY KEY,
  xuxinye_title VARCHAR(100) NOT NULL DEFAULT '新对话',
  xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  xuxinye_update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS xuxinye_chat_message (
  xuxinye_id SERIAL PRIMARY KEY,
  xuxinye_conversation_id INTEGER NOT NULL,
  xuxinye_role VARCHAR(16) NOT NULL,
  xuxinye_content TEXT NOT NULL,
  xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS xuxinye_idx_conversation ON xuxinye_chat_message (xuxinye_conversation_id);
```

### 迁移 2：xuxinye_enable_rls（version 20261126063255）

策略设计（改哪些表、怎么设）：

| 表 | RLS | 策略 | anon/authenticated 可做的事 |
| --- | --- | --- | --- |
| xuxinye_news | 开启 | `xuxinye_public_read_news`：SELECT，`USING (true)` | 只读全部新闻 |
| xuxinye_gallery | 开启 | `xuxinye_public_read_gallery`：SELECT，`USING (true)` | 只读全部图文 |
| xuxinye_kb_file | 开启 | 无策略 | 无（查询返回空数组） |
| xuxinye_kb_chunk | 开启 | 无策略 | 无（查询返回空数组） |
| xuxinye_conversation | 开启 | 无策略 | 无（查询返回空数组） |
| xuxinye_chat_message | 开启 | 无策略 | 无（查询返回空数组） |

写入：6 张表均未给 anon/authenticated 建任何 INSERT/UPDATE/DELETE 策略，因此 PostgREST 侧一律拒绝；服务端由 `SUPABASE_DB_URL` 以表 owner `postgres` 直连，RLS 对 owner 不生效，读写不受影响。
额外加固：RLS 管不住 `TRUNCATE`，而 Supabase 默认给 anon/authenticated 授了全部 DML + TRUNCATE，因此撤销这两类角色的 `TRUNCATE`、`REFERENCES`、`TRIGGER`。

```sql
ALTER TABLE public.xuxinye_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xuxinye_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xuxinye_kb_file ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xuxinye_kb_chunk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xuxinye_conversation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xuxinye_chat_message ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS xuxinye_public_read_news ON public.xuxinye_news;
CREATE POLICY xuxinye_public_read_news ON public.xuxinye_news
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS xuxinye_public_read_gallery ON public.xuxinye_gallery;
CREATE POLICY xuxinye_public_read_gallery ON public.xuxinye_gallery
  FOR SELECT TO anon, authenticated USING (true);

REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.xuxinye_news FROM anon, authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.xuxinye_gallery FROM anon, authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.xuxinye_kb_file FROM anon, authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.xuxinye_kb_chunk FROM anon, authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.xuxinye_conversation FROM anon, authenticated;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.xuxinye_chat_message FROM anon, authenticated;
```

回滚用 SQL（如需恢复手册默认的“全部关闭”）：

```sql
ALTER TABLE public.xuxinye_news DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.xuxinye_gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.xuxinye_kb_file DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.xuxinye_kb_chunk DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.xuxinye_conversation DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.xuxinye_chat_message DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS xuxinye_public_read_news ON public.xuxinye_news;
DROP POLICY IF EXISTS xuxinye_public_read_gallery ON public.xuxinye_gallery;
```

### 执行后核对

迁移记录（`list_migrations`）：

```text
20261126063247  xuxinye_baseline_schema
20261126063255  xuxinye_enable_rls
```

RLS 与策略（`pg_class` + `pg_policy`）：

| 表 | rls_enabled | 策略数 | 策略 |
| --- | --- | --- | --- |
| xuxinye_news | true | 1 | xuxinye_public_read_news（SELECT） |
| xuxinye_gallery | true | 1 | xuxinye_public_read_gallery（SELECT） |
| xuxinye_kb_file | true | 0 | — |
| xuxinye_kb_chunk | true | 0 | — |
| xuxinye_conversation | true | 0 | — |
| xuxinye_chat_message | true | 0 | — |

advisors 复查（`get_advisors`）：

- security：原 `rls_disabled_in_public`（ERROR ×6）已清零；现存 1 条 `rls_enabled_no_policy`（INFO ×4），指向 kb_file/kb_chunk/conversation/chat_message —— 这是有意为之（内部表不对外开放），非错误。
- performance：仅 2 条 `unused_index`（INFO），指向 `xuxinye_idx_publish_time`、`xuxinye_idx_category`；当前数据量小、查询未走索引，属预期，保留不删。

REST 实测（仅用 `get_publishable_keys` 返回的 anon key，客户端侧验证，不经后端）：

| 请求 | 结果 |
| --- | --- |
| `GET /rest/v1/xuxinye_news?select=*&limit=2` | 200，返回 2 条真实新闻 |
| `GET /rest/v1/xuxinye_gallery?select=*&limit=2` | 200，返回 2 条真实图文 |
| `GET /rest/v1/xuxinye_kb_file` | 200，`[]` |
| `GET /rest/v1/xuxinye_kb_chunk` | 200，`[]` |
| `GET /rest/v1/xuxinye_conversation` | 200，`[]` |
| `GET /rest/v1/xuxinye_chat_message` | 200，`[]` |
| `POST /rest/v1/xuxinye_news`（匿名写入） | 401，`42501 new row violates row-level security policy` |
| `HEAD` 带 `Prefer: count=exact` 查 news 总数 | `Content-Range: 0-0/8`（写入未生效，行数未变） |

8111 回归（后端 `DB_DRIVER=supabase`，服务由本次会话以 `node app.js` 后台重启）：

| 检查项 | 结果 |
| --- | --- |
| `/`、`/news.html`、`/gallery.html`、`/database.html`、`/chat.html`、`/kb.html` | 全部 200 |
| `/api/health` | 200，`database: ok` |
| `/api/news` | 200，`total=8` |
| `/api/gallery` | 200，`total=8` |
| `/api/kb/files` | 200，`total=8`（12 条中 4 条为软删除） |
| `/api/ai/conversations` | 200，`total=1` |
| `GET /api/ai/conversations/2/messages` | 200，历史消息正常 |
| `POST /api/ai/conversations` + `DELETE`（写入回归，已清理） | 均 200，创建 id=10 后删除 |

行数复核（`execute_sql`，全部回到预期）：news 8、gallery 8、kb_file 12、kb_chunk 14、conversation 1、chat_message 4。

说明：本次验证中创建并删除了 1 条测试会话（id=10），删除后行数回到 1；未产生其他数据变更。

### 残留问题

- 4 张内部表为 `rls_enabled_no_policy`（INFO）。若将来后端改为经 PostgREST + service_role key 访问，需要显式建策略或确认 service_role 绕过 RLS 的行为。
- `list_migrations` 现有 2 条，基线之后的 DDL 应继续用 `apply_migration`，避免再次脱节。
- 免费版 7 天不活跃自动暂停、项目状态 Healthy 需在 Supabase Dashboard 人工确认（MCP 无对应工具）。
