/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 会话持久化模型：会话表与消息表的建表、增删改查、Token 预算裁剪
 */
const { xuxinye_pool, xuxinye_isPostgres } = require('../config/xuxinye_db');

// Token 预算：按字符估算（中文约 1 字 1 token，英文按 1.6 字符 1 token 粗略折算）
const xuxinye_TOKEN_BUDGET = 3000;
const xuxinye_MAX_HISTORY_MESSAGES = 20;

const xuxinye_CREATE_CONVERSATION_TABLE =
  'CREATE TABLE IF NOT EXISTS xuxinye_conversation (' +
  '  xuxinye_id INT AUTO_INCREMENT PRIMARY KEY,' +
  '  xuxinye_title VARCHAR(100) NOT NULL DEFAULT "新对话",' +
  '  xuxinye_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
  '  xuxinye_update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';

const xuxinye_CREATE_MESSAGE_TABLE =
  'CREATE TABLE IF NOT EXISTS xuxinye_chat_message (' +
  '  xuxinye_id INT AUTO_INCREMENT PRIMARY KEY,' +
  '  xuxinye_conversation_id INT NOT NULL,' +
  '  xuxinye_role VARCHAR(16) NOT NULL,' +
  '  xuxinye_content TEXT NOT NULL,' +
  '  xuxinye_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
  '  KEY xuxinye_idx_conversation (xuxinye_conversation_id)' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';

const xuxinye_CREATE_CONVERSATION_TABLE_PG =
  'CREATE TABLE IF NOT EXISTS xuxinye_conversation (' +
  '  xuxinye_id SERIAL PRIMARY KEY,' +
  "  xuxinye_title VARCHAR(100) NOT NULL DEFAULT '新对话'," +
  '  xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
  '  xuxinye_update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' +
  ')';

const xuxinye_CREATE_MESSAGE_TABLE_PG =
  'CREATE TABLE IF NOT EXISTS xuxinye_chat_message (' +
  '  xuxinye_id SERIAL PRIMARY KEY,' +
  '  xuxinye_conversation_id INTEGER NOT NULL,' +
  '  xuxinye_role VARCHAR(16) NOT NULL,' +
  '  xuxinye_content TEXT NOT NULL,' +
  '  xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' +
  ')';

const xuxinye_CREATE_MESSAGE_INDEX_PG =
  'CREATE INDEX IF NOT EXISTS xuxinye_idx_conversation ON xuxinye_chat_message (xuxinye_conversation_id)';

// 服务启动时确保会话相关表存在
async function xuxinye_ensureChatTables() {
  if (xuxinye_isPostgres) {
    await xuxinye_pool.query(xuxinye_CREATE_CONVERSATION_TABLE_PG);
    await xuxinye_pool.query(xuxinye_CREATE_MESSAGE_TABLE_PG);
    await xuxinye_pool.query(xuxinye_CREATE_MESSAGE_INDEX_PG);
    return;
  }
  await xuxinye_pool.query(xuxinye_CREATE_CONVERSATION_TABLE);
  await xuxinye_pool.query(xuxinye_CREATE_MESSAGE_TABLE);
}

// 估算单条消息 token 数
function xuxinye_estimateTokens(xuxinye_content) {
  const xuxinye_text = String(xuxinye_content || '');
  const xuxinye_chineseCount = (xuxinye_text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const xuxinye_otherCount = xuxinye_text.length - xuxinye_chineseCount;
  return xuxinye_chineseCount + Math.ceil(xuxinye_otherCount / 1.6) + 4;
}

// 按 Token 预算从最新消息向前保留，并保证第一条为 user
function xuxinye_trimMessages(xuxinye_messages, xuxinye_budget) {
  const xuxinye_limit = xuxinye_budget || xuxinye_TOKEN_BUDGET;
  const xuxinye_kept = [];
  let xuxinye_used = 0;

  for (let xuxinye_index = xuxinye_messages.length - 1; xuxinye_index >= 0; xuxinye_index--) {
    const xuxinye_item = xuxinye_messages[xuxinye_index];
    const xuxinye_cost = xuxinye_estimateTokens(xuxinye_item.content);
    if (xuxinye_kept.length >= xuxinye_MAX_HISTORY_MESSAGES) {
      break;
    }
    if (xuxinye_used + xuxinye_cost > xuxinye_limit && xuxinye_kept.length > 0) {
      break;
    }
    xuxinye_kept.unshift(xuxinye_item);
    xuxinye_used += xuxinye_cost;
  }

  while (xuxinye_kept.length && xuxinye_kept[0].role !== 'user') {
    xuxinye_kept.shift();
  }
  return xuxinye_kept;
}

async function xuxinye_listConversations() {
  const [xuxinye_rows] = await xuxinye_pool.query(
    'SELECT c.xuxinye_id, c.xuxinye_title, c.xuxinye_create_time, c.xuxinye_update_time, ' +
      '(SELECT COUNT(*) FROM xuxinye_chat_message m WHERE m.xuxinye_conversation_id = c.xuxinye_id) AS xuxinye_message_count ' +
      'FROM xuxinye_conversation c ORDER BY c.xuxinye_update_time DESC, c.xuxinye_id DESC'
  );
  return xuxinye_rows;
}

async function xuxinye_getConversation(xuxinye_id) {
  const [xuxinye_rows] = await xuxinye_pool.query(
    'SELECT xuxinye_id, xuxinye_title, xuxinye_create_time, xuxinye_update_time FROM xuxinye_conversation WHERE xuxinye_id = ?',
    [xuxinye_id]
  );
  return xuxinye_rows[0] || null;
}

async function xuxinye_createConversation(xuxinye_title) {
  const [xuxinye_result] = await xuxinye_pool.query(
    'INSERT INTO xuxinye_conversation (xuxinye_title) VALUES (?)',
    [xuxinye_title || '新对话']
  );
  return xuxinye_getConversation(xuxinye_result.insertId);
}

async function xuxinye_renameConversation(xuxinye_id, xuxinye_title) {
  await xuxinye_pool.query(
    'UPDATE xuxinye_conversation SET xuxinye_title = ?, xuxinye_update_time = NOW() WHERE xuxinye_id = ?',
    [xuxinye_title, xuxinye_id]
  );
  return xuxinye_getConversation(xuxinye_id);
}

async function xuxinye_deleteConversation(xuxinye_id) {
  await xuxinye_pool.query('DELETE FROM xuxinye_chat_message WHERE xuxinye_conversation_id = ?', [xuxinye_id]);
  await xuxinye_pool.query('DELETE FROM xuxinye_conversation WHERE xuxinye_id = ?', [xuxinye_id]);
}

async function xuxinye_listMessages(xuxinye_conversationId) {
  const [xuxinye_rows] = await xuxinye_pool.query(
    'SELECT xuxinye_id, xuxinye_role, xuxinye_content, xuxinye_create_time ' +
      'FROM xuxinye_chat_message WHERE xuxinye_conversation_id = ? ORDER BY xuxinye_id ASC',
    [xuxinye_conversationId]
  );
  return xuxinye_rows;
}

async function xuxinye_addMessage(xuxinye_conversationId, xuxinye_role, xuxinye_content) {
  const [xuxinye_result] = await xuxinye_pool.query(
    'INSERT INTO xuxinye_chat_message (xuxinye_conversation_id, xuxinye_role, xuxinye_content) VALUES (?, ?, ?)',
    [xuxinye_conversationId, xuxinye_role, xuxinye_content]
  );
  return xuxinye_result.insertId;
}

// 更新会话修改时间；标题仍为默认值时，用首条用户消息自动命名
async function xuxinye_touchConversation(xuxinye_conversationId, xuxinye_autoTitle) {
  const xuxinye_conversation = await xuxinye_getConversation(xuxinye_conversationId);
  if (!xuxinye_conversation) {
    return null;
  }
  let xuxinye_title = xuxinye_conversation.xuxinye_title;
  if (xuxinye_autoTitle && (xuxinye_title === '新对话' || !xuxinye_title)) {
    xuxinye_title = xuxinye_autoTitle.slice(0, 24);
  }
  await xuxinye_pool.query(
    'UPDATE xuxinye_conversation SET xuxinye_title = ?, xuxinye_update_time = NOW() WHERE xuxinye_id = ?',
    [xuxinye_title, xuxinye_conversationId]
  );
  return xuxinye_title;
}

module.exports = {
  xuxinye_ensureChatTables,
  xuxinye_estimateTokens,
  xuxinye_trimMessages,
  xuxinye_listConversations,
  xuxinye_getConversation,
  xuxinye_createConversation,
  xuxinye_renameConversation,
  xuxinye_deleteConversation,
  xuxinye_listMessages,
  xuxinye_addMessage,
  xuxinye_touchConversation
};
