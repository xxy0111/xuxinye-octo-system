/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 健康检查控制器：验证服务与数据库是否可用
 */
const { xuxinye_pool } = require('../config/xuxinye_db');

async function xuxinye_checkHealth(xuxinye_req, xuxinye_res) {
  try {
    await xuxinye_pool.query('SELECT 1');
    xuxinye_res.xuxinye_success(
      {
        xuxinye_server: 'ok',
        xuxinye_database: 'ok',
        xuxinye_time: new Date().toISOString()
      },
      '服务正常'
    );
  } catch (xuxinye_error) {
    console.error('[xuxinye] 健康检查失败：' + xuxinye_error.message);
    xuxinye_res.xuxinye_fail('数据库连接失败：' + xuxinye_error.message, 500);
  }
}

module.exports = { xuxinye_checkHealth };
