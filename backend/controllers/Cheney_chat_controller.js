/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * AI 对话控制器：校验前端传入的消息并转发到 AI 接口
 */
const { Cheney_createChatCompletion } = require('../models/Cheney_chat_model');

const Cheney_MAX_MESSAGE_COUNT = 20;
const Cheney_MAX_CONTENT_LENGTH = 2000;

// 校验并裁剪消息数组，只保留 user / assistant 的历史对话
function Cheney_normalizeMessages(Cheney_messages) {
  if (!Array.isArray(Cheney_messages) || Cheney_messages.length === 0) {
    return null;
  }

  const Cheney_validList = Cheney_messages.filter(function (Cheney_item) {
    return (
      Cheney_item &&
      (Cheney_item.role === 'user' || Cheney_item.role === 'assistant') &&
      typeof Cheney_item.content === 'string' &&
      Cheney_item.content.trim() !== ''
    );
  });

  if (Cheney_validList.length === 0) {
    return null;
  }

  return Cheney_validList.slice(-Cheney_MAX_MESSAGE_COUNT).map(function (Cheney_item) {
    return {
      role: Cheney_item.role,
      content: Cheney_item.content.trim().slice(0, Cheney_MAX_CONTENT_LENGTH)
    };
  });
}

async function Cheney_sendMessage(Cheney_req, Cheney_res) {
  const Cheney_messages = Cheney_normalizeMessages(Cheney_req.body && Cheney_req.body.Cheney_messages);

  if (!Cheney_messages || Cheney_messages[Cheney_messages.length - 1].role !== 'user') {
    Cheney_res.Cheney_fail('请求参数错误：Cheney_messages 必须是以 user 消息结尾的非空数组', 400);
    return;
  }

  try {
    const Cheney_data = await Cheney_createChatCompletion(Cheney_messages);
    Cheney_res.Cheney_success(Cheney_data, '对话成功');
  } catch (Cheney_error) {
    console.error('[Cheney] AI 对话失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail(Cheney_error.message, Cheney_error.Cheney_status || 500);
  }
}

module.exports = { Cheney_sendMessage };
