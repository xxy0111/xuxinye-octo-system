/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-26 | 大模型：DeepSeek-V4.1-Flash
 * 数据库连接池配置：默认 MySQL；DB_DRIVER=supabase 时切换到 Supabase Postgres，
 * 并通过兼容层保持原有 xuxinye_pool.query(sql, params) 调用方式不变。
 * 凭据全部来自 backend/.env，不写入代码。
 */
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const xuxinye_isPostgres = /^(supabase|postgres|pg)$/i.test(String(process.env.DB_DRIVER || '').trim());

// 将 MySQL 风格的双引号字符串字面量改为 Postgres 单引号，并转义单引号
function xuxinye_convertQuotedStrings(xuxinye_sql) {
  return xuxinye_sql.replace(/"([^"]*)"/g, function (xuxinye_match, xuxinye_text) {
    return "'" + xuxinye_text.replace(/'/g, "''") + "'";
  });
}

// 把 ? 占位符替换为 $1、$2（跳过单引号内的内容）
function xuxinye_toPgPlaceholders(xuxinye_sql) {
  let xuxinye_index = 0;
  let xuxinye_result = '';
  let xuxinye_inString = false;

  for (let xuxinye_i = 0; xuxinye_i < xuxinye_sql.length; xuxinye_i++) {
    const xuxinye_char = xuxinye_sql[xuxinye_i];
    if (xuxinye_char === "'") {
      if (xuxinye_inString && xuxinye_sql[xuxinye_i + 1] === "'") {
        xuxinye_result += "''";
        xuxinye_i++;
        continue;
      }
      xuxinye_inString = !xuxinye_inString;
      xuxinye_result += xuxinye_char;
      continue;
    }
    if (xuxinye_char === '?' && !xuxinye_inString) {
      xuxinye_index++;
      xuxinye_result += '$' + xuxinye_index;
      continue;
    }
    xuxinye_result += xuxinye_char;
  }
  return xuxinye_result;
}

// 把批量 INSERT ... VALUES ? 展开为多行占位符
function xuxinye_expandBulkValues(xuxinye_sql, xuxinye_values) {
  if (
    xuxinye_values.length !== 1 ||
    !Array.isArray(xuxinye_values[0]) ||
    !Array.isArray(xuxinye_values[0][0])
  ) {
    return { xuxinye_sql: xuxinye_sql, xuxinye_values: xuxinye_values };
  }

  const xuxinye_rows = xuxinye_values[0];
  if (!xuxinye_rows.length || !xuxinye_rows[0].length) {
    return { xuxinye_sql: xuxinye_sql, xuxinye_values: xuxinye_values };
  }

  const xuxinye_flat = [];
  const xuxinye_groups = xuxinye_rows.map(function (xuxinye_row) {
    const xuxinye_marks = xuxinye_row.map(function (xuxinye_cell) {
      xuxinye_flat.push(xuxinye_cell);
      return '$' + xuxinye_flat.length;
    });
    return '(' + xuxinye_marks.join(', ') + ')';
  });

  return {
    xuxinye_sql: xuxinye_sql.replace(/VALUES\s+\?/i, 'VALUES ' + xuxinye_groups.join(', ')),
    xuxinye_values: xuxinye_flat
  };
}

// Postgres 返回的小写字段名还原为项目约定的 xuxinye_ 前缀
function xuxinye_normalizeRow(xuxinye_row) {
  const xuxinye_result = {};
  Object.keys(xuxinye_row).forEach(function (xuxinye_key) {
    if (xuxinye_key.toLowerCase().startsWith('xuxinye_')) {
      xuxinye_result['xuxinye_' + xuxinye_key.slice(8)] = xuxinye_row[xuxinye_key];
    } else if (xuxinye_key.toLowerCase() === 'insertid') {
      xuxinye_result.insertId = xuxinye_row[xuxinye_key];
    } else {
      xuxinye_result[xuxinye_key] = xuxinye_row[xuxinye_key];
    }
  });
  return xuxinye_result;
}

let xuxinye_pool;

if (xuxinye_isPostgres) {
  const { Pool } = require('pg');
  const xuxinye_pgPool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    connectionTimeoutMillis: 15000
  });

  xuxinye_pool = {
    query: async function (xuxinye_sql, xuxinye_params) {
      const xuxinye_values = xuxinye_params || [];
      const xuxinye_expanded = xuxinye_expandBulkValues(xuxinye_sql, xuxinye_values);
      let xuxinye_text = xuxinye_toPgPlaceholders(xuxinye_convertQuotedStrings(xuxinye_expanded.xuxinye_sql));

      const xuxinye_isInsert = /^\s*INSERT/i.test(xuxinye_text);
      if (xuxinye_isInsert && !/RETURNING/i.test(xuxinye_text)) {
        xuxinye_text += ' RETURNING xuxinye_id AS "insertId"';
      }

      try {
        const xuxinye_result = await xuxinye_pgPool.query(xuxinye_text, xuxinye_expanded.xuxinye_values);
        if (xuxinye_isInsert) {
          const xuxinye_row = xuxinye_result.rows[0] || {};
          return [
            {
              affectedRows: xuxinye_result.rowCount,
              insertId: xuxinye_row.insertId === undefined ? null : xuxinye_row.insertId
            },
            xuxinye_result.fields
          ];
        }
        if (xuxinye_result.command === 'SELECT') {
          return [xuxinye_result.rows.map(xuxinye_normalizeRow), xuxinye_result.fields];
        }
        return [{ affectedRows: xuxinye_result.rowCount, insertId: null }, xuxinye_result.fields];
      } catch (xuxinye_error) {
        // 生产日志只保留错误摘要，避免泄露连接信息
        console.error('[xuxinye] Postgres 查询失败：' + xuxinye_error.message);
        throw xuxinye_error;
      }
    },
    end: function () {
      return xuxinye_pgPool.end();
    }
  };
} else {
  xuxinye_pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  });
}

// 启动时探测一次连接，仅用于日志提示，不阻断服务
async function xuxinye_testConnection() {
  try {
    if (xuxinye_isPostgres) {
      const xuxinye_result = await xuxinye_pool.query(
        'SELECT current_database() AS db, version() AS ver'
      );
      const xuxinye_row = xuxinye_result[0][0];
      console.log(
        '[xuxinye] Supabase 数据库连接成功：' +
          xuxinye_row.db +
          '（' +
          String(xuxinye_row.ver).split(' ')[0] +
          ' ' +
          String(xuxinye_row.ver).split(' ')[1] +
          '）'
      );
      return;
    }
    const xuxinye_connection = await xuxinye_pool.getConnection();
    await xuxinye_connection.query('SELECT 1');
    xuxinye_connection.release();
    console.log('[xuxinye] 数据库连接成功：' + process.env.DB_NAME);
  } catch (xuxinye_error) {
    console.error('[xuxinye] 数据库连接失败：' + xuxinye_error.message);
  }
}

module.exports = { xuxinye_pool, xuxinye_testConnection, xuxinye_isPostgres };
