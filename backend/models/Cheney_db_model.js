/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 数据库连接测试模型：使用页面传入的账号密码建立一次性连接
 */
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function Cheney_testLogin(Cheney_user, Cheney_password) {
  const Cheney_connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3306,
    user: Cheney_user,
    password: Cheney_password,
    database: process.env.DB_NAME,
    connectTimeout: 5000
  });

  try {
    const [Cheney_rows] = await Cheney_connection.query(
      'SELECT VERSION() AS Cheney_version, DATABASE() AS Cheney_database, USER() AS Cheney_account'
    );
    return Cheney_rows[0];
  } finally {
    await Cheney_connection.end();
  }
}

module.exports = { Cheney_testLogin };
