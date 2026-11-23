<!--
姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
-->

# 数据库结构记录

本文件只追加、不覆盖，按执行顺序记录 SQL，仅凭本文件即可在新机器上重建数据库。

---

## 2026-11-19 13:47 创建数据库

```sql
CREATE DATABASE IF NOT EXISTS Cheney_web
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
```

> 说明：业务表尚未建立，待接口需求确定后按顺序补充建表 SQL 与测试数据。

---

## 2026-11-19 13:53 创建科技新闻表 Cheney_news 并插入 8 条测试数据

```sql
USE Cheney_web;

DROP TABLE IF EXISTS Cheney_news;

CREATE TABLE Cheney_news (
  Cheney_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻编号',
  Cheney_title VARCHAR(120) NOT NULL COMMENT '标题',
  Cheney_summary VARCHAR(255) NOT NULL COMMENT '摘要',
  Cheney_content TEXT NOT NULL COMMENT '正文',
  Cheney_author VARCHAR(50) NOT NULL COMMENT '作者',
  Cheney_source VARCHAR(80) NOT NULL COMMENT '来源',
  Cheney_publish_time DATETIME NOT NULL COMMENT '发布时间',
  Cheney_cover_url VARCHAR(500) DEFAULT NULL COMMENT '封面图地址',
  Cheney_view_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
  Cheney_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (Cheney_id),
  KEY Cheney_idx_publish_time (Cheney_publish_time)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '科技新闻表';

INSERT INTO Cheney_news
  (Cheney_title, Cheney_summary, Cheney_content, Cheney_author, Cheney_source, Cheney_publish_time, Cheney_view_count)
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

## 2026-11-19 13:53 创建科技图文表 Cheney_gallery 并插入 8 条测试数据

```sql
USE Cheney_web;

DROP TABLE IF EXISTS Cheney_gallery;

CREATE TABLE Cheney_gallery (
  Cheney_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图文编号',
  Cheney_title VARCHAR(120) NOT NULL COMMENT '标题',
  Cheney_description VARCHAR(255) NOT NULL COMMENT '描述',
  Cheney_image_url VARCHAR(500) NOT NULL COMMENT '图片地址',
  Cheney_category VARCHAR(50) NOT NULL COMMENT '分类',
  Cheney_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (Cheney_id),
  KEY Cheney_idx_category (Cheney_category)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '科技图文表';

INSERT INTO Cheney_gallery
  (Cheney_title, Cheney_description, Cheney_image_url, Cheney_category)
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

## 2026-11-23 14:05 创建 RAG 知识库表 Cheney_kb_file、Cheney_kb_chunk

```sql
USE Cheney_web;

CREATE TABLE IF NOT EXISTS Cheney_kb_file (
  Cheney_id INT AUTO_INCREMENT PRIMARY KEY,
  Cheney_file_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  Cheney_file_ext VARCHAR(16) NOT NULL COMMENT '扩展名',
  Cheney_stored_name VARCHAR(255) NULL COMMENT '服务端存储文件名',
  Cheney_file_size INT NOT NULL DEFAULT 0 COMMENT '文件大小（字节）',
  Cheney_chunk_count INT NOT NULL DEFAULT 0 COMMENT '切分片段数',
  Cheney_status VARCHAR(16) NOT NULL DEFAULT 'ready' COMMENT 'ready/failed/parsing',
  Cheney_error_msg VARCHAR(500) NULL COMMENT '解析错误或备注',
  Cheney_delete_flag TINYINT NOT NULL DEFAULT 0 COMMENT '软删除标记',
  Cheney_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS Cheney_kb_chunk (
  Cheney_id INT AUTO_INCREMENT PRIMARY KEY,
  Cheney_file_id INT NOT NULL COMMENT '所属文件 ID',
  Cheney_chunk_index INT NOT NULL COMMENT '片段序号（从 0 开始）',
  Cheney_content TEXT NOT NULL COMMENT '片段文本',
  Cheney_char_count INT NOT NULL DEFAULT 0 COMMENT '字符数',
  KEY Cheney_idx_file (Cheney_file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

> 说明：两张表由服务启动时自动执行 `CREATE TABLE IF NOT EXISTS` 创建；示例数据由 `backend/scripts/Cheney_seed_kb.js`（`npm run seed:kb`）从 `backend/sample/` 解析导入，当前共 2 个文件、5 个片段。
> 完整重建方式：先执行建库语句与以上三段 SQL，再运行 `cd backend && npm run seed:kb` 导入示例文件。
