/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * AI 路由：POST /api/ai/chat 对话转发，以及会话列表、新建、重命名、删除、历史消息
 */
const express = require('express');
const xuxinye_chatController = require('../controllers/xuxinye_chat_controller');
const xuxinye_conversationController = require('../controllers/xuxinye_conversation_controller');

const xuxinye_aiRouter = express.Router();

// 对话（带会话持久化；也支持旧版 xuxinye_messages 无状态调用）
xuxinye_aiRouter.post('/chat', xuxinye_chatController.xuxinye_sendMessage);

// 会话管理
xuxinye_aiRouter.get('/conversations', xuxinye_conversationController.xuxinye_listConversations);
xuxinye_aiRouter.post('/conversations', xuxinye_conversationController.xuxinye_createConversation);
xuxinye_aiRouter.put('/conversations/:xuxinye_id', xuxinye_conversationController.xuxinye_renameConversation);
xuxinye_aiRouter.delete('/conversations/:xuxinye_id', xuxinye_conversationController.xuxinye_deleteConversation);
xuxinye_aiRouter.get('/conversations/:xuxinye_id/messages', xuxinye_conversationController.xuxinye_listMessages);

module.exports = xuxinye_aiRouter;
