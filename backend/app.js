/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 应用入口：跨域、统一响应、/api 路由、frontend 静态托管、错误处理
 */
const path = require('path');
const express = require('express');
const cors = require('cors');
const xuxinye_apiRouter = require('./routes/xuxinye_api');
const { xuxinye_testConnection } = require('./config/xuxinye_db');
const { xuxinye_ensureKbTables } = require('./models/xuxinye_kb_model');
const { xuxinye_ensureChatTables } = require('./models/xuxinye_conversation_model');

const xuxinye_app = express();
const xuxinye_PORT = 8111;

// 支持所有跨域访问
xuxinye_app.use(cors());
xuxinye_app.use(express.json());
xuxinye_app.use(express.urlencoded({ extended: true }));

// 统一 JSON 响应格式：{ code, msg, data }
xuxinye_app.use((xuxinye_req, xuxinye_res, xuxinye_next) => {
  xuxinye_res.xuxinye_success = (xuxinye_data = null, xuxinye_msg = '操作成功') => {
    xuxinye_res.json({ code: 0, msg: xuxinye_msg, data: xuxinye_data });
  };
  xuxinye_res.xuxinye_fail = (xuxinye_msg = '操作失败', xuxinye_code = 1, xuxinye_data = null) => {
    xuxinye_res.json({ code: xuxinye_code, msg: xuxinye_msg, data: xuxinye_data });
  };
  xuxinye_next();
});

// 接口路由
xuxinye_app.use('/api', xuxinye_apiRouter);

// /api 下未匹配到的接口统一返回 404 结构
xuxinye_app.use('/api', (xuxinye_req, xuxinye_res) => {
  xuxinye_res.xuxinye_fail('接口不存在：' + xuxinye_req.method + ' ' + xuxinye_req.originalUrl, 404);
});

// 托管前端页面
xuxinye_app.use(express.static(path.join(__dirname, '..', 'frontend')));

// 兜底错误处理
xuxinye_app.use((xuxinye_error, xuxinye_req, xuxinye_res, xuxinye_next) => {
  console.error('[xuxinye] 服务异常：' + xuxinye_error.message);
  xuxinye_res.xuxinye_fail('服务异常：' + xuxinye_error.message, 500);
});

xuxinye_app.listen(xuxinye_PORT, () => {
  console.log('[xuxinye] 服务已启动：http://localhost:' + xuxinye_PORT);
  xuxinye_testConnection();
  xuxinye_ensureKbTables()
    .then(function () {
      console.log('[xuxinye] 知识库数据表已就绪');
      return xuxinye_ensureChatTables();
    })
    .then(function () {
      console.log('[xuxinye] 会话数据表已就绪');
    })
    .catch(function (xuxinye_error) {
      console.error('[xuxinye] 数据表初始化失败：' + xuxinye_error.message);
    });
});
