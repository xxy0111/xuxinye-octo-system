/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 知识库模型：负责文件与切分片段的持久化（MySQL）
 */
const { Cheney_pool } = require('../config/Cheney_db');

const Cheney_CREATE_FILE_TABLE =
  'CREATE TABLE IF NOT EXISTS Cheney_kb_file (' +
  '  Cheney_id INT AUTO_INCREMENT PRIMARY KEY,' +
  '  Cheney_file_name VARCHAR(255) NOT NULL,' +
  '  Cheney_file_ext VARCHAR(16) NOT NULL,' +
  '  Cheney_stored_name VARCHAR(255) NULL,' +
  '  Cheney_file_size INT NOT NULL DEFAULT 0,' +
  '  Cheney_chunk_count INT NOT NULL DEFAULT 0,' +
  '  Cheney_status VARCHAR(16) NOT NULL DEFAULT "ready",' +
  '  Cheney_error_msg VARCHAR(500) NULL,' +
  '  Cheney_delete_flag TINYINT NOT NULL DEFAULT 0,' +
  '  Cheney_create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';

const Cheney_CREATE_CHUNK_TABLE =
  'CREATE TABLE IF NOT EXISTS Cheney_kb_chunk (' +
  '  Cheney_id INT AUTO_INCREMENT PRIMARY KEY,' +
  '  Cheney_file_id INT NOT NULL,' +
  '  Cheney_chunk_index INT NOT NULL,' +
  '  Cheney_content TEXT NOT NULL,' +
  '  Cheney_char_count INT NOT NULL DEFAULT 0,' +
  '  KEY Cheney_idx_file (Cheney_file_id)' +
  ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';

// 服务启动时确保知识库表存在，不依赖手工建表
async function Cheney_ensureKbTables() {
  await Cheney_pool.query(Cheney_CREATE_FILE_TABLE);
  await Cheney_pool.query(Cheney_CREATE_CHUNK_TABLE);
}

// 新建文件记录，返回自增主键
async function Cheney_createFile(Cheney_file) {
  const [Cheney_result] = await Cheney_pool.query(
    'INSERT INTO Cheney_kb_file (Cheney_file_name, Cheney_file_ext, Cheney_stored_name, Cheney_file_size, Cheney_status, Cheney_error_msg) ' +
      'VALUES (?, ?, ?, ?, ?, ?)',
    [
      Cheney_file.Cheney_file_name,
      Cheney_file.Cheney_file_ext,
      Cheney_file.Cheney_stored_name || null,
      Cheney_file.Cheney_file_size,
      Cheney_file.Cheney_status,
      Cheney_file.Cheney_error_msg || null
    ]
  );
  return Cheney_result.insertId;
}

// 回写解析结果（片段数、状态、错误信息）
async function Cheney_updateFileResult(Cheney_id, Cheney_chunkCount, Cheney_status, Cheney_errorMsg) {
  await Cheney_pool.query(
    'UPDATE Cheney_kb_file SET Cheney_chunk_count = ?, Cheney_status = ?, Cheney_error_msg = ? WHERE Cheney_id = ?',
    [Cheney_chunkCount, Cheney_status, Cheney_errorMsg || null, Cheney_id]
  );
}

// 批量写入片段
async function Cheney_insertChunks(Cheney_fileId, Cheney_chunks) {
  if (!Cheney_chunks.length) {
    return;
  }
  const Cheney_values = Cheney_chunks.map(function (Cheney_content, Cheney_index) {
    return [Cheney_fileId, Cheney_index, Cheney_content, Cheney_content.length];
  });
  await Cheney_pool.query(
    'INSERT INTO Cheney_kb_chunk (Cheney_file_id, Cheney_chunk_index, Cheney_content, Cheney_char_count) VALUES ?',
    [Cheney_values]
  );
}

// 文件列表（含片段数、状态、错误信息）
async function Cheney_listFiles() {
  const [Cheney_rows] = await Cheney_pool.query(
    'SELECT Cheney_id, Cheney_file_name, Cheney_file_ext, Cheney_file_size, Cheney_chunk_count, ' +
      'Cheney_status, Cheney_error_msg, Cheney_create_time ' +
      'FROM Cheney_kb_file WHERE Cheney_delete_flag = 0 ORDER BY Cheney_create_time DESC, Cheney_id DESC'
  );
  return Cheney_rows;
}

async function Cheney_getFile(Cheney_id) {
  const [Cheney_rows] = await Cheney_pool.query(
    'SELECT * FROM Cheney_kb_file WHERE Cheney_id = ? AND Cheney_delete_flag = 0',
    [Cheney_id]
  );
  return Cheney_rows[0] || null;
}

async function Cheney_getChunksByFile(Cheney_fileId) {
  const [Cheney_rows] = await Cheney_pool.query(
    'SELECT Cheney_id, Cheney_chunk_index, Cheney_content, Cheney_char_count ' +
      'FROM Cheney_kb_chunk WHERE Cheney_file_id = ? ORDER BY Cheney_chunk_index ASC',
    [Cheney_fileId]
  );
  return Cheney_rows;
}

// 取出全部片段，供 BM25 检索使用
async function Cheney_getAllChunks() {
  const [Cheney_rows] = await Cheney_pool.query(
    'SELECT c.Cheney_id, c.Cheney_file_id, c.Cheney_chunk_index, c.Cheney_content, f.Cheney_file_name ' +
      'FROM Cheney_kb_chunk c JOIN Cheney_kb_file f ON f.Cheney_id = c.Cheney_file_id ' +
      'WHERE f.Cheney_delete_flag = 0 AND f.Cheney_status = "ready" ORDER BY c.Cheney_id ASC'
  );
  return Cheney_rows;
}

// 删除文件：先删片段，再标记文件删除（保留物理文件由调用方处理）
async function Cheney_deleteFile(Cheney_id) {
  await Cheney_pool.query('DELETE FROM Cheney_kb_chunk WHERE Cheney_file_id = ?', [Cheney_id]);
  await Cheney_pool.query('UPDATE Cheney_kb_file SET Cheney_delete_flag = 1 WHERE Cheney_id = ?', [Cheney_id]);
}

module.exports = {
  Cheney_ensureKbTables,
  Cheney_createFile,
  Cheney_updateFileResult,
  Cheney_insertChunks,
  Cheney_listFiles,
  Cheney_getFile,
  Cheney_getChunksByFile,
  Cheney_getAllChunks,
  Cheney_deleteFile
};
