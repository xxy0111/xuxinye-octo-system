/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 导入示例知识库文件：公司介绍与客服FAQ.txt、产品说明.docx（重复执行会跳过已入库文件）
 */
const fs = require('fs');
const path = require('path');

const Cheney_kbModel = require('../models/Cheney_kb_model');
const Cheney_kbParser = require('../models/Cheney_kb_parser');
const { Cheney_generateSampleDocx } = require('./Cheney_make_sample_docx');
const { Cheney_pool } = require('../config/Cheney_db');

const Cheney_SAMPLE_DIR = path.join(__dirname, '..', 'sample');
const Cheney_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const Cheney_SAMPLES = [
  { Cheney_fileName: '公司介绍与客服FAQ.txt' },
  { Cheney_fileName: '产品说明.docx' }
];

async function Cheney_seedOne(Cheney_sample) {
  const Cheney_sourcePath = path.join(Cheney_SAMPLE_DIR, Cheney_sample.Cheney_fileName);
  if (!fs.existsSync(Cheney_sourcePath)) {
    throw new Error('示例文件不存在：' + Cheney_sourcePath);
  }

  const Cheney_existing = await Cheney_kbModel.Cheney_listFiles();
  const Cheney_duplicated = Cheney_existing.some(function (Cheney_item) {
    return Cheney_item.Cheney_file_name === Cheney_sample.Cheney_fileName && Cheney_item.Cheney_status === 'ready';
  });
  if (Cheney_duplicated) {
    console.log('[Cheney] 已存在同名文件，跳过：' + Cheney_sample.Cheney_fileName);
    return;
  }

  const Cheney_ext = path.extname(Cheney_sample.Cheney_fileName).toLowerCase();
  const Cheney_storedName = 'sample-' + Date.now() + '-' + Math.round(Math.random() * 100000) + Cheney_ext;
  const Cheney_targetPath = path.join(Cheney_UPLOAD_DIR, Cheney_storedName);
  fs.copyFileSync(Cheney_sourcePath, Cheney_targetPath);

  const Cheney_fileId = await Cheney_kbModel.Cheney_createFile({
    Cheney_file_name: Cheney_sample.Cheney_fileName,
    Cheney_file_ext: Cheney_ext,
    Cheney_stored_name: Cheney_storedName,
    Cheney_file_size: fs.statSync(Cheney_sourcePath).size,
    Cheney_status: 'parsing'
  });

  const Cheney_extract = await Cheney_kbParser.Cheney_extractText(Cheney_targetPath, Cheney_ext);
  const Cheney_chunks = Cheney_kbParser.Cheney_chunkText(Cheney_extract.Cheney_text);
  if (!Cheney_chunks.length) {
    throw new Error('示例文件未解析出文本：' + Cheney_sample.Cheney_fileName);
  }

  await Cheney_kbModel.Cheney_insertChunks(Cheney_fileId, Cheney_chunks);
  await Cheney_kbModel.Cheney_updateFileResult(Cheney_fileId, Cheney_chunks.length, 'ready', Cheney_extract.Cheney_warning);
  console.log('[Cheney] 示例已导入：' + Cheney_sample.Cheney_fileName + '，片段数 ' + Cheney_chunks.length);
}

async function Cheney_seed() {
  fs.mkdirSync(Cheney_UPLOAD_DIR, { recursive: true });
  await Cheney_kbModel.Cheney_ensureKbTables();

  if (!fs.existsSync(path.join(Cheney_SAMPLE_DIR, '产品说明.docx'))) {
    await Cheney_generateSampleDocx();
  }

  for (const Cheney_sample of Cheney_SAMPLES) {
    await Cheney_seedOne(Cheney_sample);
  }

  const Cheney_list = await Cheney_kbModel.Cheney_listFiles();
  console.log('[Cheney] 当前知识库文件数：' + Cheney_list.length);
  await Cheney_pool.end();
}

Cheney_seed().catch(async function (Cheney_error) {
  console.error('[Cheney] 示例导入失败：' + Cheney_error.message);
  try {
    await Cheney_pool.end();
  } catch (Cheney_endError) {
    // 忽略关闭连接池异常
  }
  process.exit(1);
});
