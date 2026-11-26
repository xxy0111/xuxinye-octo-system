/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 接口路由汇总：所有接口统一以 /api 为前缀
 */
const express = require('express');
const xuxinye_healthController = require('../controllers/xuxinye_health_controller');
const xuxinye_newsController = require('../controllers/xuxinye_news_controller');
const xuxinye_galleryController = require('../controllers/xuxinye_gallery_controller');
const xuxinye_dbController = require('../controllers/xuxinye_db_controller');
const xuxinye_chatController = require('../controllers/xuxinye_chat_controller');
const xuxinye_aiRouter = require('./xuxinye_ai_routes');
const xuxinye_kbRouter = require('./xuxinye_kb_routes');

const xuxinye_apiRouter = express.Router();

// 健康检查
xuxinye_apiRouter.get('/health', xuxinye_healthController.xuxinye_checkHealth);

// 科技新闻
xuxinye_apiRouter.get('/news', xuxinye_newsController.xuxinye_getNewsList);

// 科技图文
xuxinye_apiRouter.get('/gallery', xuxinye_galleryController.xuxinye_getGalleryList);

// 数据库连接测试
xuxinye_apiRouter.post('/db/test', xuxinye_dbController.xuxinye_testDatabase);

// AI 对话与会话管理（/api/ai/chat 为规范路径）
xuxinye_apiRouter.use('/ai', xuxinye_aiRouter);

// 兼容旧路径：保留 /api/chat
xuxinye_apiRouter.post('/chat', xuxinye_chatController.xuxinye_sendMessage);

// 知识库（上传、列表、详情、删除、检索问答）
xuxinye_apiRouter.use('/kb', xuxinye_kbRouter);

module.exports = xuxinye_apiRouter;
