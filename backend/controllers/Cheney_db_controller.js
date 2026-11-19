/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 数据库连接测试控制器
 */
const { Cheney_testLogin } = require('../models/Cheney_db_model');

async function Cheney_testDatabase(Cheney_req, Cheney_res) {
  const Cheney_user = (Cheney_req.body.Cheney_user || '').trim();
  const Cheney_password = Cheney_req.body.Cheney_password || '';

  if (!Cheney_user) {
    Cheney_res.Cheney_fail('请输入数据库用户名', 400);
    return;
  }

  try {
    const Cheney_info = await Cheney_testLogin(Cheney_user, Cheney_password);
    console.log('[Cheney] 数据库连接成功：' + Cheney_info.Cheney_account);
    Cheney_res.Cheney_success(Cheney_info, '数据库连接成功');
  } catch (Cheney_error) {
    console.error('[Cheney] 数据库连接失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail('数据库连接失败：' + Cheney_error.message, 1);
  }
}

module.exports = { Cheney_testDatabase };
