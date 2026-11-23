/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 会话持久化模型：会话表与消息表的建表、增删改查、Token 预算裁剪
 */
const { Cheney_pool } = require('../config/Cheney_db');

// Token 预算：按字符估算（中文约 1 字 1 token，英文按 1.6 字符 1 token 粗略折算）
const Cheney_TOKEN_BUDGET = 3000;
const Cheney_MAX_HISTORY_MESSAGES = 20;

const Cheney_CREATE_CONVERSATION_TABLE =
  'CREATE TABLE IF NOT EXISTS Cheney_conversation (' +
  '  Cheney_id INT AUTO_INCREMENT PRIMARY KEY,' +
  '  Cheney_title VARCHAR(100) NOT NULL DEFAULT "新对话",' +
  '  Cheney_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
  '  Cheney_update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';

const Cheney_CREATE_MESSAGE_TABLE =
  'CREATE TABLE IF NOT EXISTS Cheney_chat_message (' +
  '  Cheney_id INT AUTO_INCREMENT PRIMARY KEY,' +
  '  Cheney_conversation_id INT NOT NULL,' +
  '  Cheney_role VARCHAR(16) NOT NULL,' +
  '  Cheney_content TEXT NOT NULL,' +
  '  Cheney_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,' +
  '  KEY Cheney_idx_conversation (Cheney_conversation_id)' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';

// 服务启动时确保会话相关表存在
async function Cheney_ensureChatTables() {
  await Cheney_pool.query(Cheney_CREATE_CONVERSATION_TABLE);
  await Cheney_pool.query(Cheney_CREATE_MESSAGE_TABLE);
}

// 估算单条消息 token 数
function Cheney_estimateTokens(Cheney_content) {
  const Cheney_text = String(Cheney_content || '');
  const Cheney_chineseCount = (Cheney_text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const Cheney_otherCount = Cheney_text.length - Cheney_chineseCount;
  return Cheney_chineseCount + Math.ceil(Cheney_otherCount / 1.6) + 4;
}

// 按 Token 预算从最新消息向前保留，并保证第一条为 user
function Cheney_trimMessages(Cheney_messages, Cheney_budget) {
  const Cheney_limit = Cheney_budget || Cheney_TOKEN_BUDGET;
  const Cheney_kept = [];
  let Cheney_used = 0;

  for (let Cheney_index = Cheney_messages.length - 1; Cheney_index >= 0; Cheney_index--) {
    const Cheney_item = Cheney_messages[Cheney_index];
    const Cheney_cost = Cheney_estimateTokens(Cheney_item.content);
    if (Cheney_kept.length >= Cheney_MAX_HISTORY_MESSAGES) {
      break;
    }
    if (Cheney_used + Cheney_cost > Cheney_limit && Cheney_kept.length > 0) {
      break;
    }
    Cheney_kept.unshift(Cheney_item);
    Cheney_used += Cheney_cost;
  }

  while (Cheney_kept.length && Cheney_kept[0].role !== 'user') {
    Cheney_kept.shift();
  }
  return Cheney_kept;
}

async function Cheney_listConversations() {
  const [Cheney_rows] = await Cheney_pool.query(
    'SELECT c.Cheney_id, c.Cheney_title, c.Cheney_create_time, c.Cheney_update_time, ' +
      '(SELECT COUNT(*) FROM Cheney_chat_message m WHERE m.Cheney_conversation_id = c.Cheney_id) AS Cheney_message_count ' +
      'FROM Cheney_conversation c ORDER BY c.Cheney_update_time DESC, c.Cheney_id DESC'
  );
  return Cheney_rows;
}

async function Cheney_getConversation(Cheney_id) {
  const [Cheney_rows] = await Cheney_pool.query(
    'SELECT Cheney_id, Cheney_title, Cheney_create_time, Cheney_update_time FROM Cheney_conversation WHERE Cheney_id = ?',
    [Cheney_id]
  );
  return Cheney_rows[0] || null;
}

async function Cheney_createConversation(Cheney_title) {
  const [Cheney_result] = await Cheney_pool.query(
    'INSERT INTO Cheney_conversation (Cheney_title) VALUES (?)',
    [Cheney_title || '新对话']
  );
  return Cheney_getConversation(Cheney_result.insertId);
}

async function Cheney_renameConversation(Cheney_id, Cheney_title) {
  await Cheney_pool.query(
    'UPDATE Cheney_conversation SET Cheney_title = ?, Cheney_update_time = NOW() WHERE Cheney_id = ?',
    [Cheney_title, Cheney_id]
  );
  return Cheney_getConversation(Cheney_id);
}

async function Cheney_deleteConversation(Cheney_id) {
  await Cheney_pool.query('DELETE FROM Cheney_chat_message WHERE Cheney_conversation_id = ?', [Cheney_id]);
  await Cheney_pool.query('DELETE FROM Cheney_conversation WHERE Cheney_id = ?', [Cheney_id]);
}

async function Cheney_listMessages(Cheney_conversationId) {
  const [Cheney_rows] = await Cheney_pool.query(
    'SELECT Cheney_id, Cheney_role, Cheney_content, Cheney_create_time ' +
      'FROM Cheney_chat_message WHERE Cheney_conversation_id = ? ORDER BY Cheney_id ASC',
    [Cheney_conversationId]
  );
  return Cheney_rows;
}

async function Cheney_addMessage(Cheney_conversationId, Cheney_role, Cheney_content) {
  const [Cheney_result] = await Cheney_pool.query(
    'INSERT INTO Cheney_chat_message (Cheney_conversation_id, Cheney_role, Cheney_content) VALUES (?, ?, ?)',
    [Cheney_conversationId, Cheney_role, Cheney_content]
  );
  return Cheney_result.insertId;
}

// 更新会话修改时间；标题仍为默认值时，用首条用户消息自动命名
async function Cheney_touchConversation(Cheney_conversationId, Cheney_autoTitle) {
  const Cheney_conversation = await Cheney_getConversation(Cheney_conversationId);
  if (!Cheney_conversation) {
    return null;
  }
  let Cheney_title = Cheney_conversation.Cheney_title;
  if (Cheney_autoTitle && (Cheney_title === '新对话' || !Cheney_title)) {
    Cheney_title = Cheney_autoTitle.slice(0, 24);
  }
  await Cheney_pool.query(
    'UPDATE Cheney_conversation SET Cheney_title = ?, Cheney_update_time = NOW() WHERE Cheney_id = ?',
    [Cheney_title, Cheney_conversationId]
  );
  return Cheney_title;
}

module.exports = {
  Cheney_ensureChatTables,
  Cheney_estimateTokens,
  Cheney_trimMessages,
  Cheney_listConversations,
  Cheney_getConversation,
  Cheney_createConversation,
  Cheney_renameConversation,
  Cheney_deleteConversation,
  Cheney_listMessages,
  Cheney_addMessage,
  Cheney_touchConversation
};
