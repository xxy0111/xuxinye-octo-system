/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * AI 对话控制器：会话持久化、Token 预算裁剪、转发 AI 接口，并在前端中断时取消上游请求
 */
const { Cheney_createChatCompletion } = require('../models/Cheney_chat_model');
const Cheney_conversationModel = require('../models/Cheney_conversation_model');

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

// 调用模型并处理会话读写；Cheney_useConversation 为 false 时走无状态兼容模式
async function Cheney_handleChat(Cheney_req, Cheney_res, Cheney_useConversation, Cheney_conversationId, Cheney_text, Cheney_legacyMessages) {
  let Cheney_conversation = null;
  let Cheney_requestMessages = Cheney_legacyMessages;
  let Cheney_historyCount = 0;

  if (Cheney_useConversation) {
    Cheney_conversation = await Cheney_conversationModel.Cheney_getConversation(Cheney_conversationId);
    if (!Cheney_conversation) {
      Cheney_res.Cheney_fail('会话不存在或已删除', 404);
      return;
    }

    const Cheney_history = await Cheney_conversationModel.Cheney_listMessages(Cheney_conversationId);
    Cheney_historyCount = Cheney_history.length;
    Cheney_requestMessages = Cheney_conversationModel.Cheney_trimMessages(
      Cheney_history
        .map(function (Cheney_item) {
          return { role: Cheney_item.Cheney_role, content: Cheney_item.Cheney_content };
        })
        .concat([{ role: 'user', content: Cheney_text }])
    );

    if (!Cheney_requestMessages.length || Cheney_requestMessages[Cheney_requestMessages.length - 1].role !== 'user') {
      Cheney_res.Cheney_fail('请求参数错误：最后一条消息必须是用户消息', 400);
      return;
    }
  }

  // 前端点击“停止”会关闭连接，这里取消对上游模型的等待
  const Cheney_aborter = new AbortController();
  const Cheney_onClose = function () {
    if (!Cheney_res.writableEnded) {
      Cheney_aborter.abort();
    }
  };
  Cheney_res.on('close', Cheney_onClose);

  try {
    const Cheney_data = await Cheney_createChatCompletion(Cheney_requestMessages, null, {
      signal: Cheney_aborter.signal
    });

    let Cheney_title = null;
    if (Cheney_useConversation) {
      await Cheney_conversationModel.Cheney_addMessage(Cheney_conversationId, 'user', Cheney_text);
      await Cheney_conversationModel.Cheney_addMessage(Cheney_conversationId, 'assistant', Cheney_data.Cheney_reply);
      Cheney_title = await Cheney_conversationModel.Cheney_touchConversation(Cheney_conversationId, Cheney_text);
    }

    if (Cheney_res.writableEnded) {
      return;
    }

    Cheney_res.Cheney_success(
      {
        Cheney_conversation_id: Cheney_useConversation ? Cheney_conversationId : null,
        Cheney_conversation_title: Cheney_title,
        Cheney_reply: Cheney_data.Cheney_reply,
        Cheney_model: Cheney_data.Cheney_model,
        Cheney_usage: Cheney_data.Cheney_usage,
        Cheney_history_trimmed: Cheney_useConversation ? Math.max(0, Cheney_historyCount + 1 - Cheney_requestMessages.length) : 0
      },
      '对话成功'
    );
  } catch (Cheney_error) {
    if (Cheney_error.Cheney_status === 499 || Cheney_res.writableEnded) {
      return;
    }
    console.error('[Cheney] AI 对话失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail(Cheney_error.message, Cheney_error.Cheney_status || 500);
  } finally {
    Cheney_res.off('close', Cheney_onClose);
  }
}

async function Cheney_sendMessage(Cheney_req, Cheney_res) {
  const Cheney_body = Cheney_req.body || {};
  const Cheney_rawId = Cheney_body.Cheney_conversation_id;
  const Cheney_useConversation = Cheney_rawId !== undefined && Cheney_rawId !== null && Cheney_rawId !== '';

  try {
    if (Cheney_useConversation) {
      const Cheney_conversationId = Number(Cheney_rawId);
      if (!Number.isInteger(Cheney_conversationId) || Cheney_conversationId <= 0) {
        Cheney_res.Cheney_fail('会话 ID 不合法', 400);
        return;
      }

      const Cheney_text = String(Cheney_body.Cheney_message || '').trim();
      if (!Cheney_text) {
        Cheney_res.Cheney_fail('请求参数错误：Cheney_message 不能为空', 400);
        return;
      }
      if (Cheney_text.length > Cheney_MAX_CONTENT_LENGTH) {
        Cheney_res.Cheney_fail('消息过长，请控制在 ' + Cheney_MAX_CONTENT_LENGTH + ' 字以内', 400);
        return;
      }

      await Cheney_handleChat(Cheney_req, Cheney_res, true, Cheney_conversationId, Cheney_text, null);
      return;
    }

    // 兼容旧版无会话接口：直接接收完整 messages 数组，不落库
    const Cheney_messages = Cheney_normalizeMessages(Cheney_body.Cheney_messages);
    if (!Cheney_messages || Cheney_messages[Cheney_messages.length - 1].role !== 'user') {
      Cheney_res.Cheney_fail('请求参数错误：请传入 Cheney_conversation_id + Cheney_message，或是以 user 消息结尾的 Cheney_messages 数组', 400);
      return;
    }

    await Cheney_handleChat(Cheney_req, Cheney_res, false, null, null, Cheney_messages);
  } catch (Cheney_error) {
    console.error('[Cheney] AI 对话处理失败：' + Cheney_error.message);
    if (!Cheney_res.writableEnded) {
      Cheney_res.Cheney_fail('AI 对话处理失败：' + Cheney_error.message, 500);
    }
  }
}

module.exports = { Cheney_sendMessage };
