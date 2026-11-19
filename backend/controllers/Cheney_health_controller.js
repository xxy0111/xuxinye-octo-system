/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 健康检查控制器：验证服务与数据库是否可用
 */
const { Cheney_pool } = require('../config/Cheney_db');

async function Cheney_checkHealth(Cheney_req, Cheney_res) {
  try {
    await Cheney_pool.query('SELECT 1');
    Cheney_res.Cheney_success(
      {
        Cheney_server: 'ok',
        Cheney_database: 'ok',
        Cheney_time: new Date().toISOString()
      },
      '服务正常'
    );
  } catch (Cheney_error) {
    console.error('[Cheney] 健康检查失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail('数据库连接失败：' + Cheney_error.message, 500);
  }
}

module.exports = { Cheney_checkHealth };
