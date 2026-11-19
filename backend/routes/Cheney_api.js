/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 接口路由汇总：所有接口统一以 /api 为前缀
 */
const express = require('express');
const Cheney_healthController = require('../controllers/Cheney_health_controller');
const Cheney_newsController = require('../controllers/Cheney_news_controller');
const Cheney_galleryController = require('../controllers/Cheney_gallery_controller');
const Cheney_dbController = require('../controllers/Cheney_db_controller');

const Cheney_apiRouter = express.Router();

// 健康检查
Cheney_apiRouter.get('/health', Cheney_healthController.Cheney_checkHealth);

// 科技新闻
Cheney_apiRouter.get('/news', Cheney_newsController.Cheney_getNewsList);

// 科技图文
Cheney_apiRouter.get('/gallery', Cheney_galleryController.Cheney_getGalleryList);

// 数据库连接测试
Cheney_apiRouter.post('/db/test', Cheney_dbController.Cheney_testDatabase);

module.exports = Cheney_apiRouter;
