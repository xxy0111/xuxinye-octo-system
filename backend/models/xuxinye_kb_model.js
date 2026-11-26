/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 知识库模型：负责文件与切分片段的持久化（MySQL）
 */
const { xuxinye_pool, xuxinye_isPostgres } = require('../config/xuxinye_db');

const xuxinye_CREATE_FILE_TABLE =
  'CREATE TABLE IF NOT EXISTS xuxinye_kb_file (' +
  '  xuxinye_id INT AUTO_INCREMENT PRIMARY KEY,' +
  '  xuxinye_file_name VARCHAR(255) NOT NULL,' +
  '  xuxinye_file_ext VARCHAR(16) NOT NULL,' +
  '  xuxinye_stored_name VARCHAR(255) NULL,' +
  '  xuxinye_file_size INT NOT NULL DEFAULT 0,' +
  '  xuxinye_chunk_count INT NOT NULL DEFAULT 0,' +
  '  xuxinye_status VARCHAR(16) NOT NULL DEFAULT "ready",' +
  '  xuxinye_error_msg VARCHAR(500) NULL,' +
  '  xuxinye_delete_flag TINYINT NOT NULL DEFAULT 0,' +
  '  xuxinye_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';

const xuxinye_CREATE_CHUNK_TABLE =
  'CREATE TABLE IF NOT EXISTS xuxinye_kb_chunk (' +
  '  xuxinye_id INT AUTO_INCREMENT PRIMARY KEY,' +
  '  xuxinye_file_id INT NOT NULL,' +
  '  xuxinye_chunk_index INT NOT NULL,' +
  '  xuxinye_content TEXT NOT NULL,' +
  '  xuxinye_char_count INT NOT NULL DEFAULT 0,' +
  '  KEY xuxinye_idx_file (xuxinye_file_id)' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';

const xuxinye_CREATE_FILE_TABLE_PG =
  'CREATE TABLE IF NOT EXISTS xuxinye_kb_file (' +
  '  xuxinye_id SERIAL PRIMARY KEY,' +
  '  xuxinye_file_name VARCHAR(255) NOT NULL,' +
  '  xuxinye_file_ext VARCHAR(16) NOT NULL,' +
  '  xuxinye_stored_name VARCHAR(255) NULL,' +
  '  xuxinye_file_size INTEGER NOT NULL DEFAULT 0,' +
  '  xuxinye_chunk_count INTEGER NOT NULL DEFAULT 0,' +
  "  xuxinye_status VARCHAR(16) NOT NULL DEFAULT 'ready'," +
  '  xuxinye_error_msg VARCHAR(500) NULL,' +
  '  xuxinye_delete_flag INTEGER NOT NULL DEFAULT 0,' +
  '  xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' +
  ')';

const xuxinye_CREATE_CHUNK_TABLE_PG =
  'CREATE TABLE IF NOT EXISTS xuxinye_kb_chunk (' +
  '  xuxinye_id SERIAL PRIMARY KEY,' +
  '  xuxinye_file_id INTEGER NOT NULL,' +
  '  xuxinye_chunk_index INTEGER NOT NULL,' +
  '  xuxinye_content TEXT NOT NULL,' +
  '  xuxinye_char_count INTEGER NOT NULL DEFAULT 0' +
  ')';

const xuxinye_CREATE_CHUNK_INDEX_PG =
  'CREATE INDEX IF NOT EXISTS xuxinye_idx_file ON xuxinye_kb_chunk (xuxinye_file_id)';

// 服务启动时确保知识库表存在，不依赖手工建表
async function xuxinye_ensureKbTables() {
  if (xuxinye_isPostgres) {
    await xuxinye_pool.query(xuxinye_CREATE_FILE_TABLE_PG);
    await xuxinye_pool.query(xuxinye_CREATE_CHUNK_TABLE_PG);
    await xuxinye_pool.query(xuxinye_CREATE_CHUNK_INDEX_PG);
    return;
  }
  await xuxinye_pool.query(xuxinye_CREATE_FILE_TABLE);
  await xuxinye_pool.query(xuxinye_CREATE_CHUNK_TABLE);
}

// 新建文件记录，返回自增主键
async function xuxinye_createFile(xuxinye_file) {
  const [xuxinye_result] = await xuxinye_pool.query(
    'INSERT INTO xuxinye_kb_file (xuxinye_file_name, xuxinye_file_ext, xuxinye_stored_name, xuxinye_file_size, xuxinye_status, xuxinye_error_msg) ' +
      'VALUES (?, ?, ?, ?, ?, ?)',
    [
      xuxinye_file.xuxinye_file_name,
      xuxinye_file.xuxinye_file_ext,
      xuxinye_file.xuxinye_stored_name || null,
      xuxinye_file.xuxinye_file_size,
      xuxinye_file.xuxinye_status,
      xuxinye_file.xuxinye_error_msg || null
    ]
  );
  return xuxinye_result.insertId;
}

// 回写解析结果（片段数、状态、错误信息）
async function xuxinye_updateFileResult(xuxinye_id, xuxinye_chunkCount, xuxinye_status, xuxinye_errorMsg) {
  await xuxinye_pool.query(
    'UPDATE xuxinye_kb_file SET xuxinye_chunk_count = ?, xuxinye_status = ?, xuxinye_error_msg = ? WHERE xuxinye_id = ?',
    [xuxinye_chunkCount, xuxinye_status, xuxinye_errorMsg || null, xuxinye_id]
  );
}

// 批量写入片段
async function xuxinye_insertChunks(xuxinye_fileId, xuxinye_chunks) {
  if (!xuxinye_chunks.length) {
    return;
  }
  const xuxinye_values = xuxinye_chunks.map(function (xuxinye_content, xuxinye_index) {
    return [xuxinye_fileId, xuxinye_index, xuxinye_content, xuxinye_content.length];
  });
  await xuxinye_pool.query(
    'INSERT INTO xuxinye_kb_chunk (xuxinye_file_id, xuxinye_chunk_index, xuxinye_content, xuxinye_char_count) VALUES ?',
    [xuxinye_values]
  );
}

// 文件列表（含片段数、状态、错误信息）
async function xuxinye_listFiles() {
  const [xuxinye_rows] = await xuxinye_pool.query(
    'SELECT xuxinye_id, xuxinye_file_name, xuxinye_file_ext, xuxinye_file_size, xuxinye_chunk_count, ' +
      'xuxinye_status, xuxinye_error_msg, xuxinye_create_time ' +
      'FROM xuxinye_kb_file WHERE xuxinye_delete_flag = 0 ORDER BY xuxinye_create_time DESC, xuxinye_id DESC'
  );
  return xuxinye_rows;
}

async function xuxinye_getFile(xuxinye_id) {
  const [xuxinye_rows] = await xuxinye_pool.query(
    'SELECT * FROM xuxinye_kb_file WHERE xuxinye_id = ? AND xuxinye_delete_flag = 0',
    [xuxinye_id]
  );
  return xuxinye_rows[0] || null;
}

async function xuxinye_getChunksByFile(xuxinye_fileId) {
  const [xuxinye_rows] = await xuxinye_pool.query(
    'SELECT xuxinye_id, xuxinye_chunk_index, xuxinye_content, xuxinye_char_count ' +
      'FROM xuxinye_kb_chunk WHERE xuxinye_file_id = ? ORDER BY xuxinye_chunk_index ASC',
    [xuxinye_fileId]
  );
  return xuxinye_rows;
}

// 取出全部片段，供 BM25 检索使用
async function xuxinye_getAllChunks() {
  const [xuxinye_rows] = await xuxinye_pool.query(
    'SELECT c.xuxinye_id, c.xuxinye_file_id, c.xuxinye_chunk_index, c.xuxinye_content, f.xuxinye_file_name ' +
      'FROM xuxinye_kb_chunk c JOIN xuxinye_kb_file f ON f.xuxinye_id = c.xuxinye_file_id ' +
      'WHERE f.xuxinye_delete_flag = 0 AND f.xuxinye_status = "ready" ORDER BY c.xuxinye_id ASC'
  );
  return xuxinye_rows;
}

// 删除文件：先删片段，再标记文件删除（保留物理文件由调用方处理）
async function xuxinye_deleteFile(xuxinye_id) {
  await xuxinye_pool.query('DELETE FROM xuxinye_kb_chunk WHERE xuxinye_file_id = ?', [xuxinye_id]);
  await xuxinye_pool.query('UPDATE xuxinye_kb_file SET xuxinye_delete_flag = 1 WHERE xuxinye_id = ?', [xuxinye_id]);
}

module.exports = {
  xuxinye_ensureKbTables,
  xuxinye_createFile,
  xuxinye_updateFileResult,
  xuxinye_insertChunks,
  xuxinye_listFiles,
  xuxinye_getFile,
  xuxinye_getChunksByFile,
  xuxinye_getAllChunks,
  xuxinye_deleteFile
};
