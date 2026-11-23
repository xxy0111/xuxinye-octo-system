/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 会话管理控制器：会话列表、新建、重命名、删除与历史消息加载
 */
const Cheney_conversationModel = require('../models/Cheney_conversation_model');

function Cheney_parseId(Cheney_value) {
  const Cheney_id = Number(Cheney_value);
  return Number.isInteger(Cheney_id) && Cheney_id > 0 ? Cheney_id : null;
}

// 会话列表
async function Cheney_listConversations(Cheney_req, Cheney_res) {
  try {
    const Cheney_list = await Cheney_conversationModel.Cheney_listConversations();
    Cheney_res.Cheney_success({ Cheney_total: Cheney_list.length, Cheney_list }, '查询成功');
  } catch (Cheney_error) {
    console.error('[Cheney] 会话列表查询失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail('会话列表查询失败：' + Cheney_error.message, 500);
  }
}

// 新建会话
async function Cheney_createConversation(Cheney_req, Cheney_res) {
  const Cheney_title = String((Cheney_req.body && Cheney_req.body.Cheney_title) || '').trim();
  if (Cheney_title.length > 100) {
    Cheney_res.Cheney_fail('会话标题不能超过 100 字', 400);
    return;
  }
  try {
    const Cheney_conversation = await Cheney_conversationModel.Cheney_createConversation(Cheney_title || '新对话');
    Cheney_res.Cheney_success(Cheney_conversation, '会话已创建');
  } catch (Cheney_error) {
    console.error('[Cheney] 会话创建失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail('会话创建失败：' + Cheney_error.message, 500);
  }
}

// 重命名会话
async function Cheney_renameConversation(Cheney_req, Cheney_res) {
  const Cheney_id = Cheney_parseId(Cheney_req.params.Cheney_id);
  const Cheney_title = String((Cheney_req.body && Cheney_req.body.Cheney_title) || '').trim();

  if (!Cheney_id) {
    Cheney_res.Cheney_fail('会话 ID 不合法', 400);
    return;
  }
  if (!Cheney_title) {
    Cheney_res.Cheney_fail('请输入新的会话名称', 400);
    return;
  }
  if (Cheney_title.length > 100) {
    Cheney_res.Cheney_fail('会话标题不能超过 100 字', 400);
    return;
  }

  try {
    const Cheney_conversation = await Cheney_conversationModel.Cheney_getConversation(Cheney_id);
    if (!Cheney_conversation) {
      Cheney_res.Cheney_fail('会话不存在或已删除', 404);
      return;
    }
    const Cheney_updated = await Cheney_conversationModel.Cheney_renameConversation(Cheney_id, Cheney_title);
    Cheney_res.Cheney_success(Cheney_updated, '会话已重命名');
  } catch (Cheney_error) {
    console.error('[Cheney] 会话重命名失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail('会话重命名失败：' + Cheney_error.message, 500);
  }
}

// 删除会话及其全部消息
async function Cheney_deleteConversation(Cheney_req, Cheney_res) {
  const Cheney_id = Cheney_parseId(Cheney_req.params.Cheney_id);
  if (!Cheney_id) {
    Cheney_res.Cheney_fail('会话 ID 不合法', 400);
    return;
  }
  try {
    const Cheney_conversation = await Cheney_conversationModel.Cheney_getConversation(Cheney_id);
    if (!Cheney_conversation) {
      Cheney_res.Cheney_fail('会话不存在或已删除', 404);
      return;
    }
    await Cheney_conversationModel.Cheney_deleteConversation(Cheney_id);
    console.log('[Cheney] 会话已删除：#' + Cheney_id + ' ' + Cheney_conversation.Cheney_title);
    Cheney_res.Cheney_success({ Cheney_id }, '会话已删除');
  } catch (Cheney_error) {
    console.error('[Cheney] 会话删除失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail('会话删除失败：' + Cheney_error.message, 500);
  }
}

// 会话历史消息
async function Cheney_listMessages(Cheney_req, Cheney_res) {
  const Cheney_id = Cheney_parseId(Cheney_req.params.Cheney_id);
  if (!Cheney_id) {
    Cheney_res.Cheney_fail('会话 ID 不合法', 400);
    return;
  }
  try {
    const Cheney_conversation = await Cheney_conversationModel.Cheney_getConversation(Cheney_id);
    if (!Cheney_conversation) {
      Cheney_res.Cheney_fail('会话不存在或已删除', 404);
      return;
    }
    const Cheney_list = await Cheney_conversationModel.Cheney_listMessages(Cheney_id);
    Cheney_res.Cheney_success(
      {
        Cheney_conversation,
        Cheney_total: Cheney_list.length,
        Cheney_list
      },
      '查询成功'
    );
  } catch (Cheney_error) {
    console.error('[Cheney] 会话消息查询失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail('会话消息查询失败：' + Cheney_error.message, 500);
  }
}

module.exports = {
  Cheney_listConversations,
  Cheney_createConversation,
  Cheney_renameConversation,
  Cheney_deleteConversation,
  Cheney_listMessages
};
