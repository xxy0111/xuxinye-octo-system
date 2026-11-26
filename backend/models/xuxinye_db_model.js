/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 数据库连接测试模型：使用页面传入的账号密码建立一次性连接
 */
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function xuxinye_testLogin(xuxinye_user, xuxinye_password) {
  const xuxinye_connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3306,
    user: xuxinye_user,
    password: xuxinye_password,
    database: process.env.DB_NAME,
    connectTimeout: 5000
  });

  try {
    const [xuxinye_rows] = await xuxinye_connection.query(
      'SELECT VERSION() AS xuxinye_version, DATABASE() AS xuxinye_database, USER() AS xuxinye_account'
    );
    return xuxinye_rows[0];
  } finally {
    await xuxinye_connection.end();
  }
}

module.exports = { xuxinye_testLogin };
