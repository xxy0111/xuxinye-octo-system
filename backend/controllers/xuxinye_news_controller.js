/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 科技新闻控制器
 */
const { xuxinye_findAllNews } = require('../models/xuxinye_news_model');

async function xuxinye_getNewsList(xuxinye_req, xuxinye_res) {
  try {
    const xuxinye_list = await xuxinye_findAllNews();
    xuxinye_res.xuxinye_success({ xuxinye_total: xuxinye_list.length, xuxinye_list }, '查询成功');
  } catch (xuxinye_error) {
    console.error('[xuxinye] 新闻查询失败：' + xuxinye_error.message);
    xuxinye_res.xuxinye_fail('新闻查询失败：' + xuxinye_error.message, 500);
  }
}

module.exports = { xuxinye_getNewsList };
