/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-26 | 大模型：DeepSeek-V4.1-Flash
 * 一次性迁移脚本：把本地 MySQL 的 6 张表结构与数据导入 Supabase Postgres。
 * 幂等：重复执行只会跳过已存在的记录；旧 MySQL 不做任何修改，保留作回滚副本。
 * 凭据来自 backend/.env：DB_*（MySQL）与 SUPABASE_DB_URL（Postgres）。
 */
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const { Pool } = require('pg');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const xuxinye_TABLES = [
  {
    xuxinye_name: 'xuxinye_news',
    xuxinye_columns: [
      'xuxinye_id',
      'xuxinye_title',
      'xuxinye_summary',
      'xuxinye_content',
      'xuxinye_author',
      'xuxinye_source',
      'xuxinye_publish_time',
      'xuxinye_cover_url',
      'xuxinye_view_count',
      'xuxinye_created_at'
    ]
  },
  {
    xuxinye_name: 'xuxinye_gallery',
    xuxinye_columns: [
      'xuxinye_id',
      'xuxinye_title',
      'xuxinye_description',
      'xuxinye_image_url',
      'xuxinye_category',
      'xuxinye_create_time'
    ]
  },
  {
    xuxinye_name: 'xuxinye_kb_file',
    xuxinye_columns: [
      'xuxinye_id',
      'xuxinye_file_name',
      'xuxinye_file_ext',
      'xuxinye_stored_name',
      'xuxinye_file_size',
      'xuxinye_chunk_count',
      'xuxinye_status',
      'xuxinye_error_msg',
      'xuxinye_delete_flag',
      'xuxinye_create_time'
    ]
  },
  {
    xuxinye_name: 'xuxinye_kb_chunk',
    xuxinye_columns: [
      'xuxinye_id',
      'xuxinye_file_id',
      'xuxinye_chunk_index',
      'xuxinye_content',
      'xuxinye_char_count'
    ]
  },
  {
    xuxinye_name: 'xuxinye_conversation',
    xuxinye_columns: ['xuxinye_id', 'xuxinye_title', 'xuxinye_create_time', 'xuxinye_update_time']
  },
  {
    xuxinye_name: 'xuxinye_chat_message',
    xuxinye_columns: ['xuxinye_id', 'xuxinye_conversation_id', 'xuxinye_role', 'xuxinye_content', 'xuxinye_create_time']
  }
];

const xuxinye_DDL = [
  `CREATE TABLE IF NOT EXISTS xuxinye_news (
    xuxinye_id SERIAL PRIMARY KEY,
    xuxinye_title VARCHAR(120) NOT NULL,
    xuxinye_summary VARCHAR(255) NOT NULL,
    xuxinye_content TEXT NOT NULL,
    xuxinye_author VARCHAR(50) NOT NULL,
    xuxinye_source VARCHAR(80) NOT NULL,
    xuxinye_publish_time TIMESTAMP NOT NULL,
    xuxinye_cover_url VARCHAR(500),
    xuxinye_view_count INTEGER NOT NULL DEFAULT 0,
    xuxinye_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  'CREATE INDEX IF NOT EXISTS xuxinye_idx_publish_time ON xuxinye_news (xuxinye_publish_time)',
  `CREATE TABLE IF NOT EXISTS xuxinye_gallery (
    xuxinye_id SERIAL PRIMARY KEY,
    xuxinye_title VARCHAR(120) NOT NULL,
    xuxinye_description VARCHAR(255) NOT NULL,
    xuxinye_image_url VARCHAR(500) NOT NULL,
    xuxinye_category VARCHAR(50) NOT NULL,
    xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  'CREATE INDEX IF NOT EXISTS xuxinye_idx_category ON xuxinye_gallery (xuxinye_category)',
  `CREATE TABLE IF NOT EXISTS xuxinye_kb_file (
    xuxinye_id SERIAL PRIMARY KEY,
    xuxinye_file_name VARCHAR(255) NOT NULL,
    xuxinye_file_ext VARCHAR(16) NOT NULL,
    xuxinye_stored_name VARCHAR(255),
    xuxinye_file_size INTEGER NOT NULL DEFAULT 0,
    xuxinye_chunk_count INTEGER NOT NULL DEFAULT 0,
    xuxinye_status VARCHAR(16) NOT NULL DEFAULT 'ready',
    xuxinye_error_msg VARCHAR(500),
    xuxinye_delete_flag INTEGER NOT NULL DEFAULT 0,
    xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS xuxinye_kb_chunk (
    xuxinye_id SERIAL PRIMARY KEY,
    xuxinye_file_id INTEGER NOT NULL,
    xuxinye_chunk_index INTEGER NOT NULL,
    xuxinye_content TEXT NOT NULL,
    xuxinye_char_count INTEGER NOT NULL DEFAULT 0
  )`,
  'CREATE INDEX IF NOT EXISTS xuxinye_idx_file ON xuxinye_kb_chunk (xuxinye_file_id)',
  `CREATE TABLE IF NOT EXISTS xuxinye_conversation (
    xuxinye_id SERIAL PRIMARY KEY,
    xuxinye_title VARCHAR(100) NOT NULL DEFAULT '新对话',
    xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    xuxinye_update_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS xuxinye_chat_message (
    xuxinye_id SERIAL PRIMARY KEY,
    xuxinye_conversation_id INTEGER NOT NULL,
    xuxinye_role VARCHAR(16) NOT NULL,
    xuxinye_content TEXT NOT NULL,
    xuxinye_create_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  'CREATE INDEX IF NOT EXISTS xuxinye_idx_conversation ON xuxinye_chat_message (xuxinye_conversation_id)'
];

async function xuxinye_migrateTable(xuxinye_mysql, xuxinye_pg, xuxinye_table) {
  const [xuxinye_rows] = await xuxinye_mysql.query(
    'SELECT * FROM `' + xuxinye_table.xuxinye_name + '` ORDER BY xuxinye_id ASC'
  );

  const xuxinye_batchSize = 100;
  let xuxinye_inserted = 0;

  for (let xuxinye_start = 0; xuxinye_start < xuxinye_rows.length; xuxinye_start += xuxinye_batchSize) {
    const xuxinye_batch = xuxinye_rows.slice(xuxinye_start, xuxinye_start + xuxinye_batchSize);
    const xuxinye_valueGroups = [];
    const xuxinye_values = [];

    xuxinye_batch.forEach(function (xuxinye_row) {
      const xuxinye_marks = xuxinye_table.xuxinye_columns.map(function (xuxinye_column) {
        xuxinye_values.push(xuxinye_row[xuxinye_column]);
        return '$' + xuxinye_values.length;
      });
      xuxinye_valueGroups.push('(' + xuxinye_marks.join(', ') + ')');
    });

    const xuxinye_sql =
      'INSERT INTO ' +
      xuxinye_table.xuxinye_name +
      ' (' +
      xuxinye_table.xuxinye_columns.join(', ') +
      ') VALUES ' +
      xuxinye_valueGroups.join(', ') +
      ' ON CONFLICT (xuxinye_id) DO NOTHING';

    const xuxinye_result = await xuxinye_pg.query(xuxinye_sql, xuxinye_values);
    xuxinye_inserted += xuxinye_result.rowCount;
  }

  await xuxinye_pg.query(
    'SELECT setval(pg_get_serial_sequence($1, $2), COALESCE((SELECT MAX(xuxinye_id) FROM ' +
      xuxinye_table.xuxinye_name +
      '), 1), true)',
    [xuxinye_table.xuxinye_name, 'xuxinye_id']
  );

  const xuxinye_pgResult = await xuxinye_pg.query(
    'SELECT COUNT(*)::int AS count FROM ' + xuxinye_table.xuxinye_name
  );
  const xuxinye_pgCount = xuxinye_pgResult.rows[0].count;
  const [xuxinye_mysqlRows] = await xuxinye_mysql.query(
    'SELECT COUNT(*) AS count FROM `' + xuxinye_table.xuxinye_name + '`'
  );
  const xuxinye_mysqlCount = xuxinye_mysqlRows[0].count;

  console.log(
    '[xuxinye] ' +
      xuxinye_table.xuxinye_name +
      '：MySQL ' +
      xuxinye_mysqlCount +
      ' 条，Postgres ' +
      xuxinye_pgCount +
      ' 条，本次新增 ' +
      xuxinye_inserted +
      ' 条'
  );

  return {
    xuxinye_table: xuxinye_table.xuxinye_name,
    xuxinye_mysql: xuxinye_mysqlCount,
    xuxinye_pg: xuxinye_pgCount
  };
}

(async function () {
  const xuxinye_mysql = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
  });

  const xuxinye_pg = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000
  });

  try {
    console.log('[xuxinye] 开始创建 Postgres 表结构……');
    for (const xuxinye_sql of xuxinye_DDL) {
      await xuxinye_pg.query(xuxinye_sql);
    }
    console.log('[xuxinye] 表结构创建完成，共 6 张表。');

    const xuxinye_report = [];
    for (const xuxinye_table of xuxinye_TABLES) {
      xuxinye_report.push(await xuxinye_migrateTable(xuxinye_mysql, xuxinye_pg, xuxinye_table));
    }

    const xuxinye_mismatch = xuxinye_report.filter(function (xuxinye_item) {
      return Number(xuxinye_item.xuxinye_mysql) !== Number(xuxinye_item.xuxinye_pg);
    });

    console.log('[xuxinye] 行数核对：' + (xuxinye_mismatch.length ? '存在不一致' : '全部一致'));

    if (xuxinye_mismatch.length) {
      console.error('[xuxinye] 不一致明细：', xuxinye_mismatch);
      process.exitCode = 1;
    }
  } catch (xuxinye_error) {
    console.error('[xuxinye] 迁移失败：' + xuxinye_error.message);
    process.exitCode = 1;
  } finally {
    await xuxinye_mysql.end();
    await xuxinye_pg.end();
  }
})();
