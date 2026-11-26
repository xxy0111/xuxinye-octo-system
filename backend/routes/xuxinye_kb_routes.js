/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 知识库路由：文件上传（multipart）、列表、详情、删除、检索问答
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const xuxinye_kbController = require('../controllers/xuxinye_kb_controller');

const xuxinye_kbRouter = express.Router();
const xuxinye_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const xuxinye_ALLOWED_EXT = ['.doc', '.docx', '.ppt', '.pptx', '.pdf', '.txt'];

fs.mkdirSync(xuxinye_UPLOAD_DIR, { recursive: true });

const xuxinye_storage = multer.diskStorage({
  destination: function (xuxinye_req, xuxinye_file, xuxinye_cb) {
    xuxinye_cb(null, xuxinye_UPLOAD_DIR);
  },
  filename: function (xuxinye_req, xuxinye_file, xuxinye_cb) {
    const xuxinye_ext = path.extname(xuxinye_file.originalname).toLowerCase();
    xuxinye_cb(null, Date.now() + '-' + Math.round(Math.random() * 100000) + xuxinye_ext);
  }
});

const xuxinye_upload = multer({
  storage: xuxinye_storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: function (xuxinye_req, xuxinye_file, xuxinye_cb) {
    const xuxinye_ext = path.extname(xuxinye_file.originalname).toLowerCase();
    if (xuxinye_ALLOWED_EXT.indexOf(xuxinye_ext) === -1) {
      xuxinye_cb(new Error('仅支持 doc、docx、ppt、pptx、pdf、txt 文件'));
      return;
    }
    xuxinye_cb(null, true);
  }
});

// 上传
xuxinye_kbRouter.post(
  '/upload',
  function (xuxinye_req, xuxinye_res, xuxinye_next) {
    xuxinye_upload.single('xuxinye_file')(xuxinye_req, xuxinye_res, function (xuxinye_error) {
      if (xuxinye_error) {
        const xuxinye_msg =
          xuxinye_error.code === 'LIMIT_FILE_SIZE'
            ? '文件超过 25MB 限制'
            : xuxinye_error.message;
        xuxinye_res.xuxinye_fail('文件上传失败：' + xuxinye_msg, 400);
        return;
      }
      xuxinye_next();
    });
  },
  xuxinye_kbController.xuxinye_uploadFile
);

// 文件列表
xuxinye_kbRouter.get('/files', xuxinye_kbController.xuxinye_listFiles);

// 文件片段详情
xuxinye_kbRouter.get('/files/:xuxinye_id/chunks', xuxinye_kbController.xuxinye_getFileChunks);

// 删除文件
xuxinye_kbRouter.delete('/files/:xuxinye_id', xuxinye_kbController.xuxinye_deleteFile);

// 检索问答
xuxinye_kbRouter.post('/ask', xuxinye_kbController.xuxinye_ask);

module.exports = xuxinye_kbRouter;
