/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 会话管理控制器：会话列表、新建、重命名、删除与历史消息加载
 */
const xuxinye_conversationModel = require('../models/xuxinye_conversation_model');

function xuxinye_parseId(xuxinye_value) {
  const xuxinye_id = Number(xuxinye_value);
  return Number.isInteger(xuxinye_id) && xuxinye_id > 0 ? xuxinye_id : null;
}

// 会话列表
async function xuxinye_listConversations(xuxinye_req, xuxinye_res) {
  try {
    const xuxinye_list = await xuxinye_conversationModel.xuxinye_listConversations();
    xuxinye_res.xuxinye_success({ xuxinye_total: xuxinye_list.length, xuxinye_list }, '查询成功');
  } catch (xuxinye_error) {
    console.error('[xuxinye] 会话列表查询失败：' + xuxinye_error.message);
    xuxinye_res.xuxinye_fail('会话列表查询失败：' + xuxinye_error.message, 500);
  }
}

// 新建会话
async function xuxinye_createConversation(xuxinye_req, xuxinye_res) {
  const xuxinye_title = String((xuxinye_req.body && xuxinye_req.body.xuxinye_title) || '').trim();
  if (xuxinye_title.length > 100) {
    xuxinye_res.xuxinye_fail('会话标题不能超过 100 字', 400);
    return;
  }
  try {
    const xuxinye_conversation = await xuxinye_conversationModel.xuxinye_createConversation(xuxinye_title || '新对话');
    xuxinye_res.xuxinye_success(xuxinye_conversation, '会话已创建');
  } catch (xuxinye_error) {
    console.error('[xuxinye] 会话创建失败：' + xuxinye_error.message);
    xuxinye_res.xuxinye_fail('会话创建失败：' + xuxinye_error.message, 500);
  }
}

// 重命名会话
async function xuxinye_renameConversation(xuxinye_req, xuxinye_res) {
  const xuxinye_id = xuxinye_parseId(xuxinye_req.params.xuxinye_id);
  const xuxinye_title = String((xuxinye_req.body && xuxinye_req.body.xuxinye_title) || '').trim();

  if (!xuxinye_id) {
    xuxinye_res.xuxinye_fail('会话 ID 不合法', 400);
    return;
  }
  if (!xuxinye_title) {
    xuxinye_res.xuxinye_fail('请输入新的会话名称', 400);
    return;
  }
  if (xuxinye_title.length > 100) {
    xuxinye_res.xuxinye_fail('会话标题不能超过 100 字', 400);
    return;
  }

  try {
    const xuxinye_conversation = await xuxinye_conversationModel.xuxinye_getConversation(xuxinye_id);
    if (!xuxinye_conversation) {
      xuxinye_res.xuxinye_fail('会话不存在或已删除', 404);
      return;
    }
    const xuxinye_updated = await xuxinye_conversationModel.xuxinye_renameConversation(xuxinye_id, xuxinye_title);
    xuxinye_res.xuxinye_success(xuxinye_updated, '会话已重命名');
  } catch (xuxinye_error) {
    console.error('[xuxinye] 会话重命名失败：' + xuxinye_error.message);
    xuxinye_res.xuxinye_fail('会话重命名失败：' + xuxinye_error.message, 500);
  }
}

// 删除会话及其全部消息
async function xuxinye_deleteConversation(xuxinye_req, xuxinye_res) {
  const xuxinye_id = xuxinye_parseId(xuxinye_req.params.xuxinye_id);
  if (!xuxinye_id) {
    xuxinye_res.xuxinye_fail('会话 ID 不合法', 400);
    return;
  }
  try {
    const xuxinye_conversation = await xuxinye_conversationModel.xuxinye_getConversation(xuxinye_id);
    if (!xuxinye_conversation) {
      xuxinye_res.xuxinye_fail('会话不存在或已删除', 404);
      return;
    }
    await xuxinye_conversationModel.xuxinye_deleteConversation(xuxinye_id);
    console.log('[xuxinye] 会话已删除：#' + xuxinye_id + ' ' + xuxinye_conversation.xuxinye_title);
    xuxinye_res.xuxinye_success({ xuxinye_id }, '会话已删除');
  } catch (xuxinye_error) {
    console.error('[xuxinye] 会话删除失败：' + xuxinye_error.message);
    xuxinye_res.xuxinye_fail('会话删除失败：' + xuxinye_error.message, 500);
  }
}

// 会话历史消息
async function xuxinye_listMessages(xuxinye_req, xuxinye_res) {
  const xuxinye_id = xuxinye_parseId(xuxinye_req.params.xuxinye_id);
  if (!xuxinye_id) {
    xuxinye_res.xuxinye_fail('会话 ID 不合法', 400);
    return;
  }
  try {
    const xuxinye_conversation = await xuxinye_conversationModel.xuxinye_getConversation(xuxinye_id);
    if (!xuxinye_conversation) {
      xuxinye_res.xuxinye_fail('会话不存在或已删除', 404);
      return;
    }
    const xuxinye_list = await xuxinye_conversationModel.xuxinye_listMessages(xuxinye_id);
    xuxinye_res.xuxinye_success(
      {
        xuxinye_conversation,
        xuxinye_total: xuxinye_list.length,
        xuxinye_list
      },
      '查询成功'
    );
  } catch (xuxinye_error) {
    console.error('[xuxinye] 会话消息查询失败：' + xuxinye_error.message);
    xuxinye_res.xuxinye_fail('会话消息查询失败：' + xuxinye_error.message, 500);
  }
}

module.exports = {
  xuxinye_listConversations,
  xuxinye_createConversation,
  xuxinye_renameConversation,
  xuxinye_deleteConversation,
  xuxinye_listMessages
};
