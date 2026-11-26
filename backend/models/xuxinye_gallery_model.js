/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 科技图文模型：只负责数据库读写
 */
const { xuxinye_pool } = require('../config/xuxinye_db');

// 查询全部图文，按创建时间倒序
async function xuxinye_findAllGallery() {
  const [xuxinye_rows] = await xuxinye_pool.query(
    'SELECT xuxinye_id, xuxinye_title, xuxinye_description, xuxinye_image_url, ' +
      'xuxinye_category, xuxinye_create_time FROM xuxinye_gallery ORDER BY xuxinye_id ASC'
  );
  return xuxinye_rows;
}

module.exports = { xuxinye_findAllGallery };
