/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 知识库控制器：上传解析入库、列表/详情、删除、BM25 检索问答
 */
const fs = require('fs');
const path = require('path');
const xuxinye_kbModel = require('../models/xuxinye_kb_model');
const xuxinye_kbParser = require('../models/xuxinye_kb_parser');
const xuxinye_kbRetrieval = require('../models/xuxinye_kb_retrieval');
const { xuxinye_createChatCompletion } = require('../models/xuxinye_chat_model');

const xuxinye_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// 修正部分浏览器上传中文文件名时的乱码
function xuxinye_decodeFileName(xuxinye_name) {
  if (!xuxinye_name) {
    return '未命名文件';
  }
  if (/[\u4e00-\u9fa5]/.test(xuxinye_name)) {
    return xuxinye_name;
  }
  try {
    return Buffer.from(xuxinye_name, 'latin1').toString('utf8');
  } catch (xuxinye_error) {
    return xuxinye_name;
  }
}

// 上传并解析入库
async function xuxinye_uploadFile(xuxinye_req, xuxinye_res) {
  if (!xuxinye_req.file) {
    xuxinye_res.xuxinye_fail('未接收到文件，请选择 doc/docx/ppt/pptx/pdf/txt 文件后重试', 400);
    return;
  }

  const xuxinye_originalName = xuxinye_decodeFileName(xuxinye_req.file.originalname);
  const xuxinye_ext = path.extname(xuxinye_originalName).toLowerCase();
  const xuxinye_fileSize = xuxinye_req.file.size;
  let xuxinye_fileId = null;

  try {
    xuxinye_fileId = await xuxinye_kbModel.xuxinye_createFile({
      xuxinye_file_name: xuxinye_originalName,
      xuxinye_file_ext: xuxinye_ext,
      xuxinye_stored_name: xuxinye_req.file.filename,
      xuxinye_file_size: xuxinye_fileSize,
      xuxinye_status: 'parsing'
    });

    const xuxinye_extract = await xuxinye_kbParser.xuxinye_extractText(xuxinye_req.file.path, xuxinye_ext);
    const xuxinye_chunks = xuxinye_kbParser.xuxinye_chunkText(xuxinye_extract.xuxinye_text);

    if (!xuxinye_chunks.length) {
      throw new Error('未能解析出文本（可能是扫描版或纯图片文件）');
    }

    await xuxinye_kbModel.xuxinye_insertChunks(xuxinye_fileId, xuxinye_chunks);
    await xuxinye_kbModel.xuxinye_updateFileResult(xuxinye_fileId, xuxinye_chunks.length, 'ready', xuxinye_extract.xuxinye_warning);

    console.log('[xuxinye] 知识库入库成功：' + xuxinye_originalName + '，片段数 ' + xuxinye_chunks.length);
    xuxinye_res.xuxinye_success(
      {
        xuxinye_id: xuxinye_fileId,
        xuxinye_file_name: xuxinye_originalName,
        xuxinye_chunk_count: xuxinye_chunks.length,
        xuxinye_status: 'ready',
        xuxinye_warning: xuxinye_extract.xuxinye_warning || null
      },
      '文件已解析并入库'
    );
  } catch (xuxinye_error) {
    console.error('[xuxinye] 知识库解析失败：' + xuxinye_originalName + '，' + xuxinye_error.message);
    if (xuxinye_fileId) {
      await xuxinye_kbModel.xuxinye_updateFileResult(xuxinye_fileId, 0, 'failed', xuxinye_error.message).catch(function () {});
    }
    xuxinye_res.xuxinye_fail(
      '文件解析失败：' + xuxinye_error.message,
      500,
      xuxinye_fileId ? { xuxinye_id: xuxinye_fileId } : null
    );
  }
}

// 文件列表
async function xuxinye_listFiles(xuxinye_req, xuxinye_res) {
  try {
    const xuxinye_list = await xuxinye_kbModel.xuxinye_listFiles();
    xuxinye_res.xuxinye_success({ xuxinye_total: xuxinye_list.length, xuxinye_list }, '查询成功');
  } catch (xuxinye_error) {
    console.error('[xuxinye] 知识库列表查询失败：' + xuxinye_error.message);
    xuxinye_res.xuxinye_fail('知识库列表查询失败：' + xuxinye_error.message, 500);
  }
}

// 查看单个文件的片段（用于确认解析状态）
async function xuxinye_getFileChunks(xuxinye_req, xuxinye_res) {
  const xuxinye_fileId = Number(xuxinye_req.params.xuxinye_id);
  if (!Number.isInteger(xuxinye_fileId) || xuxinye_fileId <= 0) {
    xuxinye_res.xuxinye_fail('文件 ID 不合法', 400);
    return;
  }
  try {
    const xuxinye_file = await xuxinye_kbModel.xuxinye_getFile(xuxinye_fileId);
    if (!xuxinye_file) {
      xuxinye_res.xuxinye_fail('文件不存在或已删除', 404);
      return;
    }
    const xuxinye_chunks = await xuxinye_kbModel.xuxinye_getChunksByFile(xuxinye_fileId);
    xuxinye_res.xuxinye_success(
      {
        xuxinye_file: {
          xuxinye_id: xuxinye_file.xuxinye_id,
          xuxinye_file_name: xuxinye_file.xuxinye_file_name,
          xuxinye_file_ext: xuxinye_file.xuxinye_file_ext,
          xuxinye_status: xuxinye_file.xuxinye_status,
          xuxinye_chunk_count: xuxinye_file.xuxinye_chunk_count,
          xuxinye_error_msg: xuxinye_file.xuxinye_error_msg
        },
        xuxinye_total: xuxinye_chunks.length,
        xuxinye_list: xuxinye_chunks
      },
      '查询成功'
    );
  } catch (xuxinye_error) {
    console.error('[xuxinye] 知识库片段查询失败：' + xuxinye_error.message);
    xuxinye_res.xuxinye_fail('知识库片段查询失败：' + xuxinye_error.message, 500);
  }
}

// 删除文件（数据库记录 + 物理文件）
async function xuxinye_deleteFile(xuxinye_req, xuxinye_res) {
  const xuxinye_fileId = Number(xuxinye_req.params.xuxinye_id);
  if (!Number.isInteger(xuxinye_fileId) || xuxinye_fileId <= 0) {
    xuxinye_res.xuxinye_fail('文件 ID 不合法', 400);
    return;
  }
  try {
    const xuxinye_file = await xuxinye_kbModel.xuxinye_getFile(xuxinye_fileId);
    if (!xuxinye_file) {
      xuxinye_res.xuxinye_fail('文件不存在或已删除', 404);
      return;
    }
    await xuxinye_kbModel.xuxinye_deleteFile(xuxinye_fileId);
    if (xuxinye_file.xuxinye_stored_name) {
      const xuxinye_filePath = path.join(xuxinye_UPLOAD_DIR, xuxinye_file.xuxinye_stored_name);
      fs.promises.unlink(xuxinye_filePath).catch(function () {});
    }
    console.log('[xuxinye] 知识库文件已删除：' + xuxinye_file.xuxinye_file_name);
    xuxinye_res.xuxinye_success({ xuxinye_id: xuxinye_fileId }, '文件已删除');
  } catch (xuxinye_error) {
    console.error('[xuxinye] 知识库文件删除失败：' + xuxinye_error.message);
    xuxinye_res.xuxinye_fail('知识库文件删除失败：' + xuxinye_error.message, 500);
  }
}

// 检索问答：BM25 命中片段 -> 拼接提示词 -> 调用大模型
async function xuxinye_ask(xuxinye_req, xuxinye_res) {
  const xuxinye_question = String((xuxinye_req.body && xuxinye_req.body.xuxinye_question) || '').trim();

  if (!xuxinye_question) {
    xuxinye_res.xuxinye_fail('请输入问题后再检索', 400);
    return;
  }
  if (xuxinye_question.length > 500) {
    xuxinye_res.xuxinye_fail('问题过长，请控制在 500 字以内', 400);
    return;
  }

  try {
    const xuxinye_chunks = await xuxinye_kbModel.xuxinye_getAllChunks();

    if (!xuxinye_chunks.length) {
      xuxinye_res.xuxinye_success(
        {
          xuxinye_answer: '知识库中还没有已入库的文件，请先上传资料后再提问。',
          xuxinye_hit: false,
          xuxinye_sources: []
        },
        '知识库为空'
      );
      return;
    }

    const xuxinye_hits = xuxinye_kbRetrieval.xuxinye_bm25Search(xuxinye_chunks, xuxinye_question, 4);
    const xuxinye_sources = xuxinye_hits.map(function (xuxinye_hit) {
      return {
        xuxinye_file_id: xuxinye_hit.xuxinye_file_id,
        xuxinye_file_name: xuxinye_hit.xuxinye_file_name,
        xuxinye_chunk_index: xuxinye_hit.xuxinye_chunk_index,
        xuxinye_score: xuxinye_hit.xuxinye_score,
        xuxinye_snippet: xuxinye_hit.xuxinye_snippet
      };
    });

    if (!xuxinye_hits.length) {
      console.log('[xuxinye] 知识库检索未命中：' + xuxinye_question);
      xuxinye_res.xuxinye_success(
        {
          xuxinye_answer: '知识库中没有找到与该问题相关的内容，可以换一种说法，或上传包含该主题的资料。',
          xuxinye_hit: false,
          xuxinye_sources: []
        },
        '未检索到相关内容'
      );
      return;
    }

    console.log('[xuxinye] 知识库检索命中 ' + xuxinye_hits.length + ' 条片段，开始调用大模型');

    let xuxinye_completion;
    try {
      xuxinye_completion = await xuxinye_createChatCompletion(
        [{ role: 'user', content: xuxinye_kbRetrieval.xuxinye_buildRagQuestion(xuxinye_question, xuxinye_hits) }],
        xuxinye_kbRetrieval.xuxinye_RAG_SYSTEM_PROMPT
      );
    } catch (xuxinye_aiError) {
      if (xuxinye_aiError.xuxinye_status === 429) {
        xuxinye_res.xuxinye_fail(
          '知识库检索已完成，但 AI 接口当前限流（HTTP 429），请稍后重试',
          429,
          { xuxinye_hit: true, xuxinye_sources }
        );
        return;
      }
      xuxinye_res.xuxinye_fail(
        '检索已完成，但 AI 回答失败：' + xuxinye_aiError.message,
        xuxinye_aiError.xuxinye_status || 500,
        { xuxinye_hit: true, xuxinye_sources }
      );
      return;
    }

    xuxinye_res.xuxinye_success(
      {
        xuxinye_answer: xuxinye_completion.xuxinye_reply,
        xuxinye_hit: true,
        xuxinye_sources,
        xuxinye_model: xuxinye_completion.xuxinye_model,
        xuxinye_usage: xuxinye_completion.xuxinye_usage
      },
      '回答完成'
    );
  } catch (xuxinye_error) {
    console.error('[xuxinye] 知识库问答失败：' + xuxinye_error.message);
    xuxinye_res.xuxinye_fail('知识库问答失败：' + xuxinye_error.message, 500);
  }
}

module.exports = {
  xuxinye_uploadFile,
  xuxinye_listFiles,
  xuxinye_getFileChunks,
  xuxinye_deleteFile,
  xuxinye_ask
};
