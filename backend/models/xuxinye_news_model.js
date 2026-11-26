/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 科技新闻模型：只负责数据库读写
 */
const { xuxinye_pool } = require('../config/xuxinye_db');

// 查询全部新闻，按发布时间倒序
async function xuxinye_findAllNews() {
  const [xuxinye_rows] = await xuxinye_pool.query(
    'SELECT xuxinye_id, xuxinye_title, xuxinye_summary, xuxinye_content, xuxinye_author, ' +
      'xuxinye_source, xuxinye_publish_time, xuxinye_cover_url, xuxinye_view_count ' +
      'FROM xuxinye_news ORDER BY xuxinye_publish_time DESC'
  );
  return xuxinye_rows;
}

module.exports = { xuxinye_findAllNews };
