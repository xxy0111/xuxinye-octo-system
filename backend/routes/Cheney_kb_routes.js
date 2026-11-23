/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 知识库路由：文件上传（multipart）、列表、详情、删除、检索问答
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Cheney_kbController = require('../controllers/Cheney_kb_controller');

const Cheney_kbRouter = express.Router();
const Cheney_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const Cheney_ALLOWED_EXT = ['.doc', '.docx', '.ppt', '.pptx', '.pdf', '.txt'];

fs.mkdirSync(Cheney_UPLOAD_DIR, { recursive: true });

const Cheney_storage = multer.diskStorage({
  destination: function (Cheney_req, Cheney_file, Cheney_cb) {
    Cheney_cb(null, Cheney_UPLOAD_DIR);
  },
  filename: function (Cheney_req, Cheney_file, Cheney_cb) {
    const Cheney_ext = path.extname(Cheney_file.originalname).toLowerCase();
    Cheney_cb(null, Date.now() + '-' + Math.round(Math.random() * 100000) + Cheney_ext);
  }
});

const Cheney_upload = multer({
  storage: Cheney_storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: function (Cheney_req, Cheney_file, Cheney_cb) {
    const Cheney_ext = path.extname(Cheney_file.originalname).toLowerCase();
    if (Cheney_ALLOWED_EXT.indexOf(Cheney_ext) === -1) {
      Cheney_cb(new Error('仅支持 doc、docx、ppt、pptx、pdf、txt 文件'));
      return;
    }
    Cheney_cb(null, true);
  }
});

// 上传
Cheney_kbRouter.post(
  '/upload',
  function (Cheney_req, Cheney_res, Cheney_next) {
    Cheney_upload.single('Cheney_file')(Cheney_req, Cheney_res, function (Cheney_error) {
      if (Cheney_error) {
        const Cheney_msg =
          Cheney_error.code === 'LIMIT_FILE_SIZE'
            ? '文件超过 25MB 限制'
            : Cheney_error.message;
        Cheney_res.Cheney_fail('文件上传失败：' + Cheney_msg, 400);
        return;
      }
      Cheney_next();
    });
  },
  Cheney_kbController.Cheney_uploadFile
);

// 文件列表
Cheney_kbRouter.get('/files', Cheney_kbController.Cheney_listFiles);

// 文件片段详情
Cheney_kbRouter.get('/files/:Cheney_id/chunks', Cheney_kbController.Cheney_getFileChunks);

// 删除文件
Cheney_kbRouter.delete('/files/:Cheney_id', Cheney_kbController.Cheney_deleteFile);

// 检索问答
Cheney_kbRouter.post('/ask', Cheney_kbController.Cheney_ask);

module.exports = Cheney_kbRouter;
