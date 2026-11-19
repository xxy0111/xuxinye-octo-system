/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 数据库连接池配置：凭据全部来自 backend/.env
 */
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Cheney_pool = mysql.createPool({
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

// 启动时探测一次连接，仅用于日志提示，不阻断服务
async function Cheney_testConnection() {
  try {
    const Cheney_connection = await Cheney_pool.getConnection();
    await Cheney_connection.query('SELECT 1');
    Cheney_connection.release();
    console.log('[Cheney] 数据库连接成功：' + process.env.DB_NAME);
  } catch (Cheney_error) {
    console.error('[Cheney] 数据库连接失败：' + Cheney_error.message);
  }
}

module.exports = { Cheney_pool, Cheney_testConnection };
