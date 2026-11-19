/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 科技新闻模型：只负责数据库读写
 */
const { Cheney_pool } = require('../config/Cheney_db');

// 查询全部新闻，按发布时间倒序
async function Cheney_findAllNews() {
  const [Cheney_rows] = await Cheney_pool.query(
    'SELECT Cheney_id, Cheney_title, Cheney_summary, Cheney_content, Cheney_author, ' +
      'Cheney_source, Cheney_publish_time, Cheney_cover_url, Cheney_view_count ' +
      'FROM Cheney_news ORDER BY Cheney_publish_time DESC'
  );
  return Cheney_rows;
}

module.exports = { Cheney_findAllNews };
