/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 科技图文模型：只负责数据库读写
 */
const { Cheney_pool } = require('../config/Cheney_db');

// 查询全部图文，按创建时间倒序
async function Cheney_findAllGallery() {
  const [Cheney_rows] = await Cheney_pool.query(
    'SELECT Cheney_id, Cheney_title, Cheney_description, Cheney_image_url, ' +
      'Cheney_category, Cheney_create_time FROM Cheney_gallery ORDER BY Cheney_id ASC'
  );
  return Cheney_rows;
}

module.exports = { Cheney_findAllGallery };
