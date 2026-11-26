/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 导入示例知识库文件（8 个文件，重复执行会跳过已入库文件）
 */
const fs = require('fs');
const path = require('path');

const xuxinye_kbModel = require('../models/xuxinye_kb_model');
const xuxinye_kbParser = require('../models/xuxinye_kb_parser');
const { xuxinye_generateSampleDocx } = require('./xuxinye_make_sample_docx');
const { xuxinye_pool } = require('../config/xuxinye_db');

const xuxinye_SAMPLE_DIR = path.join(__dirname, '..', 'sample');
const xuxinye_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const xuxinye_SAMPLES = [
  { xuxinye_fileName: '公司介绍与客服FAQ.txt' },
  { xuxinye_fileName: '产品说明.docx' },
  { xuxinye_fileName: '售后服务与退换货政策.txt' },
  { xuxinye_fileName: '技术架构与安全合规.txt' },
  { xuxinye_fileName: '渠道合作与联系方式.txt' },
  { xuxinye_fileName: '常见故障排查手册.txt' },
  { xuxinye_fileName: '实施交付与培训流程.txt' },
  { xuxinye_fileName: '价格与授权说明.txt' }
];

async function xuxinye_seedOne(xuxinye_sample) {
  const xuxinye_sourcePath = path.join(xuxinye_SAMPLE_DIR, xuxinye_sample.xuxinye_fileName);
  if (!fs.existsSync(xuxinye_sourcePath)) {
    throw new Error('示例文件不存在：' + xuxinye_sourcePath);
  }

  const xuxinye_existing = await xuxinye_kbModel.xuxinye_listFiles();
  const xuxinye_duplicated = xuxinye_existing.some(function (xuxinye_item) {
    return xuxinye_item.xuxinye_file_name === xuxinye_sample.xuxinye_fileName && xuxinye_item.xuxinye_status === 'ready';
  });
  if (xuxinye_duplicated) {
    console.log('[xuxinye] 已存在同名文件，跳过：' + xuxinye_sample.xuxinye_fileName);
    return;
  }

  const xuxinye_ext = path.extname(xuxinye_sample.xuxinye_fileName).toLowerCase();
  const xuxinye_storedName = 'sample-' + Date.now() + '-' + Math.round(Math.random() * 100000) + xuxinye_ext;
  const xuxinye_targetPath = path.join(xuxinye_UPLOAD_DIR, xuxinye_storedName);
  fs.copyFileSync(xuxinye_sourcePath, xuxinye_targetPath);

  const xuxinye_fileId = await xuxinye_kbModel.xuxinye_createFile({
    xuxinye_file_name: xuxinye_sample.xuxinye_fileName,
    xuxinye_file_ext: xuxinye_ext,
    xuxinye_stored_name: xuxinye_storedName,
    xuxinye_file_size: fs.statSync(xuxinye_sourcePath).size,
    xuxinye_status: 'parsing'
  });

  const xuxinye_extract = await xuxinye_kbParser.xuxinye_extractText(xuxinye_targetPath, xuxinye_ext);
  const xuxinye_chunks = xuxinye_kbParser.xuxinye_chunkText(xuxinye_extract.xuxinye_text);
  if (!xuxinye_chunks.length) {
    throw new Error('示例文件未解析出文本：' + xuxinye_sample.xuxinye_fileName);
  }

  await xuxinye_kbModel.xuxinye_insertChunks(xuxinye_fileId, xuxinye_chunks);
  await xuxinye_kbModel.xuxinye_updateFileResult(xuxinye_fileId, xuxinye_chunks.length, 'ready', xuxinye_extract.xuxinye_warning);
  console.log('[xuxinye] 示例已导入：' + xuxinye_sample.xuxinye_fileName + '，片段数 ' + xuxinye_chunks.length);
}

async function xuxinye_seed() {
  fs.mkdirSync(xuxinye_UPLOAD_DIR, { recursive: true });
  await xuxinye_kbModel.xuxinye_ensureKbTables();

  if (!fs.existsSync(path.join(xuxinye_SAMPLE_DIR, '产品说明.docx'))) {
    await xuxinye_generateSampleDocx();
  }

  for (const xuxinye_sample of xuxinye_SAMPLES) {
    await xuxinye_seedOne(xuxinye_sample);
  }

  const xuxinye_list = await xuxinye_kbModel.xuxinye_listFiles();
  console.log('[xuxinye] 当前知识库文件数：' + xuxinye_list.length);
  await xuxinye_pool.end();
}

xuxinye_seed().catch(async function (xuxinye_error) {
  console.error('[xuxinye] 示例导入失败：' + xuxinye_error.message);
  try {
    await xuxinye_pool.end();
  } catch (xuxinye_endError) {
    // 忽略关闭连接池异常
  }
  process.exit(1);
});
