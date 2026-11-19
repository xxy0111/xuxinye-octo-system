/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 科技新闻控制器
 */
const { Cheney_findAllNews } = require('../models/Cheney_news_model');

async function Cheney_getNewsList(Cheney_req, Cheney_res) {
  try {
    const Cheney_list = await Cheney_findAllNews();
    Cheney_res.Cheney_success({ Cheney_total: Cheney_list.length, Cheney_list }, '查询成功');
  } catch (Cheney_error) {
    console.error('[Cheney] 新闻查询失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail('新闻查询失败：' + Cheney_error.message, 500);
  }
}

module.exports = { Cheney_getNewsList };
