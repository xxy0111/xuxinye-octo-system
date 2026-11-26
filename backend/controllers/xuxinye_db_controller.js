/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 数据库连接测试控制器
 */
const { xuxinye_testLogin } = require('../models/xuxinye_db_model');

async function xuxinye_testDatabase(xuxinye_req, xuxinye_res) {
  const xuxinye_user = (xuxinye_req.body.xuxinye_user || '').trim();
  const xuxinye_password = xuxinye_req.body.xuxinye_password || '';

  if (!xuxinye_user) {
    xuxinye_res.xuxinye_fail('请输入数据库用户名', 400);
    return;
  }

  try {
    const xuxinye_info = await xuxinye_testLogin(xuxinye_user, xuxinye_password);
    console.log('[xuxinye] 数据库连接成功：' + xuxinye_info.xuxinye_account);
    xuxinye_res.xuxinye_success(xuxinye_info, '数据库连接成功');
  } catch (xuxinye_error) {
    console.error('[xuxinye] 数据库连接失败：' + xuxinye_error.message);
    xuxinye_res.xuxinye_fail('数据库连接失败：' + xuxinye_error.message, 1);
  }
}

module.exports = { xuxinye_testDatabase };
