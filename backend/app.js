/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 应用入口：跨域、统一响应、/api 路由、frontend 静态托管、错误处理
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
const Cheney_apiRouter = require('./routes/Cheney_api');
const { Cheney_testConnection } = require('./config/Cheney_db');
const { Cheney_ensureKbTables } = require('./models/Cheney_kb_model');
const { Cheney_ensureChatTables } = require('./models/Cheney_conversation_model');

const Cheney_app = express();
const Cheney_PORT = 8111;

// 支持所有跨域访问
Cheney_app.use(cors());
Cheney_app.use(express.json());
Cheney_app.use(express.urlencoded({ extended: true }));

// 统一 JSON 响应格式：{ code, msg, data }
Cheney_app.use((Cheney_req, Cheney_res, Cheney_next) => {
  Cheney_res.Cheney_success = (Cheney_data = null, Cheney_msg = '操作成功') => {
    Cheney_res.json({ code: 0, msg: Cheney_msg, data: Cheney_data });
  };
  Cheney_res.Cheney_fail = (Cheney_msg = '操作失败', Cheney_code = 1, Cheney_data = null) => {
    Cheney_res.json({ code: Cheney_code, msg: Cheney_msg, data: Cheney_data });
  };
  Cheney_next();
});

// 接口路由
Cheney_app.use('/api', Cheney_apiRouter);

// /api 下未匹配到的接口统一返回 404 结构
Cheney_app.use('/api', (Cheney_req, Cheney_res) => {
  Cheney_res.Cheney_fail('接口不存在：' + Cheney_req.method + ' ' + Cheney_req.originalUrl, 404);
});

// 托管前端页面
Cheney_app.use(express.static(path.join(__dirname, '..', 'frontend')));

// 兜底错误处理
Cheney_app.use((Cheney_error, Cheney_req, Cheney_res, Cheney_next) => {
  console.error('[Cheney] 服务异常：' + Cheney_error.message);
  Cheney_res.Cheney_fail('服务异常：' + Cheney_error.message, 500);
});

Cheney_app.listen(Cheney_PORT, () => {
  console.log('[Cheney] 服务已启动：http://localhost:' + Cheney_PORT);
  Cheney_testConnection();
  Cheney_ensureKbTables()
    .then(function () {
      console.log('[Cheney] 知识库数据表已就绪');
      return Cheney_ensureChatTables();
    })
    .then(function () {
      console.log('[Cheney] 会话数据表已就绪');
    })
    .catch(function (Cheney_error) {
      console.error('[Cheney] 数据表初始化失败：' + Cheney_error.message);
    });
});
