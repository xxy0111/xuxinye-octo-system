/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * AI 路由：POST /api/ai/chat 对话转发，以及会话列表、新建、重命名、删除、历史消息
 */
const express = require('express');
const Cheney_chatController = require('../controllers/Cheney_chat_controller');
const Cheney_conversationController = require('../controllers/Cheney_conversation_controller');

const Cheney_aiRouter = express.Router();

// 对话（带会话持久化；也支持旧版 Cheney_messages 无状态调用）
Cheney_aiRouter.post('/chat', Cheney_chatController.Cheney_sendMessage);

// 会话管理
Cheney_aiRouter.get('/conversations', Cheney_conversationController.Cheney_listConversations);
Cheney_aiRouter.post('/conversations', Cheney_conversationController.Cheney_createConversation);
Cheney_aiRouter.put('/conversations/:Cheney_id', Cheney_conversationController.Cheney_renameConversation);
Cheney_aiRouter.delete('/conversations/:Cheney_id', Cheney_conversationController.Cheney_deleteConversation);
Cheney_aiRouter.get('/conversations/:Cheney_id/messages', Cheney_conversationController.Cheney_listMessages);

module.exports = Cheney_aiRouter;
