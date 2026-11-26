/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * AI 对话控制器：会话持久化、Token 预算裁剪、转发 AI 接口，并在前端中断时取消上游请求
 */
const { xuxinye_createChatCompletion } = require('../models/xuxinye_chat_model');
const xuxinye_conversationModel = require('../models/xuxinye_conversation_model');

const xuxinye_MAX_MESSAGE_COUNT = 20;
const xuxinye_MAX_CONTENT_LENGTH = 2000;

// 校验并裁剪消息数组，只保留 user / assistant 的历史对话
function xuxinye_normalizeMessages(xuxinye_messages) {
  if (!Array.isArray(xuxinye_messages) || xuxinye_messages.length === 0) {
    return null;
  }

  const xuxinye_validList = xuxinye_messages.filter(function (xuxinye_item) {
    return (
      xuxinye_item &&
      (xuxinye_item.role === 'user' || xuxinye_item.role === 'assistant') &&
      typeof xuxinye_item.content === 'string' &&
      xuxinye_item.content.trim() !== ''
    );
  });

  if (xuxinye_validList.length === 0) {
    return null;
  }

  return xuxinye_validList.slice(-xuxinye_MAX_MESSAGE_COUNT).map(function (xuxinye_item) {
    return {
      role: xuxinye_item.role,
      content: xuxinye_item.content.trim().slice(0, xuxinye_MAX_CONTENT_LENGTH)
    };
  });
}

// 调用模型并处理会话读写；xuxinye_useConversation 为 false 时走无状态兼容模式
async function xuxinye_handleChat(xuxinye_req, xuxinye_res, xuxinye_useConversation, xuxinye_conversationId, xuxinye_text, xuxinye_legacyMessages) {
  let xuxinye_conversation = null;
  let xuxinye_requestMessages = xuxinye_legacyMessages;
  let xuxinye_historyCount = 0;

  if (xuxinye_useConversation) {
    xuxinye_conversation = await xuxinye_conversationModel.xuxinye_getConversation(xuxinye_conversationId);
    if (!xuxinye_conversation) {
      xuxinye_res.xuxinye_fail('会话不存在或已删除', 404);
      return;
    }

    const xuxinye_history = await xuxinye_conversationModel.xuxinye_listMessages(xuxinye_conversationId);
    xuxinye_historyCount = xuxinye_history.length;
    xuxinye_requestMessages = xuxinye_conversationModel.xuxinye_trimMessages(
      xuxinye_history
        .map(function (xuxinye_item) {
          return { role: xuxinye_item.xuxinye_role, content: xuxinye_item.xuxinye_content };
        })
        .concat([{ role: 'user', content: xuxinye_text }])
    );

    if (!xuxinye_requestMessages.length || xuxinye_requestMessages[xuxinye_requestMessages.length - 1].role !== 'user') {
      xuxinye_res.xuxinye_fail('请求参数错误：最后一条消息必须是用户消息', 400);
      return;
    }
  }

  // 前端点击“停止”会关闭连接，这里取消对上游模型的等待
  const xuxinye_aborter = new AbortController();
  const xuxinye_onClose = function () {
    if (!xuxinye_res.writableEnded) {
      xuxinye_aborter.abort();
    }
  };
  xuxinye_res.on('close', xuxinye_onClose);

  try {
    const xuxinye_data = await xuxinye_createChatCompletion(xuxinye_requestMessages, null, {
      signal: xuxinye_aborter.signal
    });

    let xuxinye_title = null;
    if (xuxinye_useConversation) {
      await xuxinye_conversationModel.xuxinye_addMessage(xuxinye_conversationId, 'user', xuxinye_text);
      await xuxinye_conversationModel.xuxinye_addMessage(xuxinye_conversationId, 'assistant', xuxinye_data.xuxinye_reply);
      xuxinye_title = await xuxinye_conversationModel.xuxinye_touchConversation(xuxinye_conversationId, xuxinye_text);
    }

    if (xuxinye_res.writableEnded) {
      return;
    }

    xuxinye_res.xuxinye_success(
      {
        xuxinye_conversation_id: xuxinye_useConversation ? xuxinye_conversationId : null,
        xuxinye_conversation_title: xuxinye_title,
        xuxinye_reply: xuxinye_data.xuxinye_reply,
        xuxinye_model: xuxinye_data.xuxinye_model,
        xuxinye_usage: xuxinye_data.xuxinye_usage,
        xuxinye_history_trimmed: xuxinye_useConversation ? Math.max(0, xuxinye_historyCount + 1 - xuxinye_requestMessages.length) : 0
      },
      '对话成功'
    );
  } catch (xuxinye_error) {
    if (xuxinye_error.xuxinye_status === 499 || xuxinye_res.writableEnded) {
      return;
    }
    console.error('[xuxinye] AI 对话失败：' + xuxinye_error.message);
    xuxinye_res.xuxinye_fail(xuxinye_error.message, xuxinye_error.xuxinye_status || 500);
  } finally {
    xuxinye_res.off('close', xuxinye_onClose);
  }
}

async function xuxinye_sendMessage(xuxinye_req, xuxinye_res) {
  const xuxinye_body = xuxinye_req.body || {};
  const xuxinye_rawId = xuxinye_body.xuxinye_conversation_id;
  const xuxinye_useConversation = xuxinye_rawId !== undefined && xuxinye_rawId !== null && xuxinye_rawId !== '';

  try {
    if (xuxinye_useConversation) {
      const xuxinye_conversationId = Number(xuxinye_rawId);
      if (!Number.isInteger(xuxinye_conversationId) || xuxinye_conversationId <= 0) {
        xuxinye_res.xuxinye_fail('会话 ID 不合法', 400);
        return;
      }

      const xuxinye_text = String(xuxinye_body.xuxinye_message || '').trim();
      if (!xuxinye_text) {
        xuxinye_res.xuxinye_fail('请求参数错误：xuxinye_message 不能为空', 400);
        return;
      }
      if (xuxinye_text.length > xuxinye_MAX_CONTENT_LENGTH) {
        xuxinye_res.xuxinye_fail('消息过长，请控制在 ' + xuxinye_MAX_CONTENT_LENGTH + ' 字以内', 400);
        return;
      }

      await xuxinye_handleChat(xuxinye_req, xuxinye_res, true, xuxinye_conversationId, xuxinye_text, null);
      return;
    }

    // 兼容旧版无会话接口：直接接收完整 messages 数组，不落库
    const xuxinye_messages = xuxinye_normalizeMessages(xuxinye_body.xuxinye_messages);
    if (!xuxinye_messages || xuxinye_messages[xuxinye_messages.length - 1].role !== 'user') {
      xuxinye_res.xuxinye_fail('请求参数错误：请传入 xuxinye_conversation_id + xuxinye_message，或是以 user 消息结尾的 xuxinye_messages 数组', 400);
      return;
    }

    await xuxinye_handleChat(xuxinye_req, xuxinye_res, false, null, null, xuxinye_messages);
  } catch (xuxinye_error) {
    console.error('[xuxinye] AI 对话处理失败：' + xuxinye_error.message);
    if (!xuxinye_res.writableEnded) {
      xuxinye_res.xuxinye_fail('AI 对话处理失败：' + xuxinye_error.message, 500);
    }
  }
}

module.exports = { xuxinye_sendMessage };
