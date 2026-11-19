/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 科技图文控制器
 */
const { Cheney_findAllGallery } = require('../models/Cheney_gallery_model');

async function Cheney_getGalleryList(Cheney_req, Cheney_res) {
  try {
    const Cheney_list = await Cheney_findAllGallery();
    Cheney_res.Cheney_success({ Cheney_total: Cheney_list.length, Cheney_list }, '查询成功');
  } catch (Cheney_error) {
    console.error('[Cheney] 图文查询失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail('图文查询失败：' + Cheney_error.message, 500);
  }
}

module.exports = { Cheney_getGalleryList };
