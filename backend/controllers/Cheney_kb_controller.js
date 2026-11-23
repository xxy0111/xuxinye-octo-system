/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 知识库控制器：上传解析入库、列表/详情、删除、BM25 检索问答
 */
const fs = require('fs');
const path = require('path');
const Cheney_kbModel = require('../models/Cheney_kb_model');
const Cheney_kbParser = require('../models/Cheney_kb_parser');
const Cheney_kbRetrieval = require('../models/Cheney_kb_retrieval');
const { Cheney_createChatCompletion } = require('../models/Cheney_chat_model');

const Cheney_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// 修正部分浏览器上传中文文件名时的乱码
function Cheney_decodeFileName(Cheney_name) {
  if (!Cheney_name) {
    return '未命名文件';
  }
  if (/[\u4e00-\u9fa5]/.test(Cheney_name)) {
    return Cheney_name;
  }
  try {
    return Buffer.from(Cheney_name, 'latin1').toString('utf8');
  } catch (Cheney_error) {
    return Cheney_name;
  }
}

// 上传并解析入库
async function Cheney_uploadFile(Cheney_req, Cheney_res) {
  if (!Cheney_req.file) {
    Cheney_res.Cheney_fail('未接收到文件，请选择 doc/docx/ppt/pptx/pdf/txt 文件后重试', 400);
    return;
  }

  const Cheney_originalName = Cheney_decodeFileName(Cheney_req.file.originalname);
  const Cheney_ext = path.extname(Cheney_originalName).toLowerCase();
  const Cheney_fileSize = Cheney_req.file.size;
  let Cheney_fileId = null;

  try {
    Cheney_fileId = await Cheney_kbModel.Cheney_createFile({
      Cheney_file_name: Cheney_originalName,
      Cheney_file_ext: Cheney_ext,
      Cheney_stored_name: Cheney_req.file.filename,
      Cheney_file_size: Cheney_fileSize,
      Cheney_status: 'parsing'
    });

    const Cheney_extract = await Cheney_kbParser.Cheney_extractText(Cheney_req.file.path, Cheney_ext);
    const Cheney_chunks = Cheney_kbParser.Cheney_chunkText(Cheney_extract.Cheney_text);

    if (!Cheney_chunks.length) {
      throw new Error('未能解析出文本（可能是扫描版或纯图片文件）');
    }

    await Cheney_kbModel.Cheney_insertChunks(Cheney_fileId, Cheney_chunks);
    await Cheney_kbModel.Cheney_updateFileResult(Cheney_fileId, Cheney_chunks.length, 'ready', Cheney_extract.Cheney_warning);

    console.log('[Cheney] 知识库入库成功：' + Cheney_originalName + '，片段数 ' + Cheney_chunks.length);
    Cheney_res.Cheney_success(
      {
        Cheney_id: Cheney_fileId,
        Cheney_file_name: Cheney_originalName,
        Cheney_chunk_count: Cheney_chunks.length,
        Cheney_status: 'ready',
        Cheney_warning: Cheney_extract.Cheney_warning || null
      },
      '文件已解析并入库'
    );
  } catch (Cheney_error) {
    console.error('[Cheney] 知识库解析失败：' + Cheney_originalName + '，' + Cheney_error.message);
    if (Cheney_fileId) {
      await Cheney_kbModel.Cheney_updateFileResult(Cheney_fileId, 0, 'failed', Cheney_error.message).catch(function () {});
    }
    Cheney_res.Cheney_fail(
      '文件解析失败：' + Cheney_error.message,
      500,
      Cheney_fileId ? { Cheney_id: Cheney_fileId } : null
    );
  }
}

// 文件列表
async function Cheney_listFiles(Cheney_req, Cheney_res) {
  try {
    const Cheney_list = await Cheney_kbModel.Cheney_listFiles();
    Cheney_res.Cheney_success({ Cheney_total: Cheney_list.length, Cheney_list }, '查询成功');
  } catch (Cheney_error) {
    console.error('[Cheney] 知识库列表查询失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail('知识库列表查询失败：' + Cheney_error.message, 500);
  }
}

// 查看单个文件的片段（用于确认解析状态）
async function Cheney_getFileChunks(Cheney_req, Cheney_res) {
  const Cheney_fileId = Number(Cheney_req.params.Cheney_id);
  if (!Number.isInteger(Cheney_fileId) || Cheney_fileId <= 0) {
    Cheney_res.Cheney_fail('文件 ID 不合法', 400);
    return;
  }
  try {
    const Cheney_file = await Cheney_kbModel.Cheney_getFile(Cheney_fileId);
    if (!Cheney_file) {
      Cheney_res.Cheney_fail('文件不存在或已删除', 404);
      return;
    }
    const Cheney_chunks = await Cheney_kbModel.Cheney_getChunksByFile(Cheney_fileId);
    Cheney_res.Cheney_success(
      {
        Cheney_file: {
          Cheney_id: Cheney_file.Cheney_id,
          Cheney_file_name: Cheney_file.Cheney_file_name,
          Cheney_file_ext: Cheney_file.Cheney_file_ext,
          Cheney_status: Cheney_file.Cheney_status,
          Cheney_chunk_count: Cheney_file.Cheney_chunk_count,
          Cheney_error_msg: Cheney_file.Cheney_error_msg
        },
        Cheney_total: Cheney_chunks.length,
        Cheney_list: Cheney_chunks
      },
      '查询成功'
    );
  } catch (Cheney_error) {
    console.error('[Cheney] 知识库片段查询失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail('知识库片段查询失败：' + Cheney_error.message, 500);
  }
}

// 删除文件（数据库记录 + 物理文件）
async function Cheney_deleteFile(Cheney_req, Cheney_res) {
  const Cheney_fileId = Number(Cheney_req.params.Cheney_id);
  if (!Number.isInteger(Cheney_fileId) || Cheney_fileId <= 0) {
    Cheney_res.Cheney_fail('文件 ID 不合法', 400);
    return;
  }
  try {
    const Cheney_file = await Cheney_kbModel.Cheney_getFile(Cheney_fileId);
    if (!Cheney_file) {
      Cheney_res.Cheney_fail('文件不存在或已删除', 404);
      return;
    }
    await Cheney_kbModel.Cheney_deleteFile(Cheney_fileId);
    if (Cheney_file.Cheney_stored_name) {
      const Cheney_filePath = path.join(Cheney_UPLOAD_DIR, Cheney_file.Cheney_stored_name);
      fs.promises.unlink(Cheney_filePath).catch(function () {});
    }
    console.log('[Cheney] 知识库文件已删除：' + Cheney_file.Cheney_file_name);
    Cheney_res.Cheney_success({ Cheney_id: Cheney_fileId }, '文件已删除');
  } catch (Cheney_error) {
    console.error('[Cheney] 知识库文件删除失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail('知识库文件删除失败：' + Cheney_error.message, 500);
  }
}

// 检索问答：BM25 命中片段 -> 拼接提示词 -> 调用大模型
async function Cheney_ask(Cheney_req, Cheney_res) {
  const Cheney_question = String((Cheney_req.body && Cheney_req.body.Cheney_question) || '').trim();

  if (!Cheney_question) {
    Cheney_res.Cheney_fail('请输入问题后再检索', 400);
    return;
  }
  if (Cheney_question.length > 500) {
    Cheney_res.Cheney_fail('问题过长，请控制在 500 字以内', 400);
    return;
  }

  try {
    const Cheney_chunks = await Cheney_kbModel.Cheney_getAllChunks();

    if (!Cheney_chunks.length) {
      Cheney_res.Cheney_success(
        {
          Cheney_answer: '知识库中还没有已入库的文件，请先上传资料后再提问。',
          Cheney_hit: false,
          Cheney_sources: []
        },
        '知识库为空'
      );
      return;
    }

    const Cheney_hits = Cheney_kbRetrieval.Cheney_bm25Search(Cheney_chunks, Cheney_question, 4);
    const Cheney_sources = Cheney_hits.map(function (Cheney_hit) {
      return {
        Cheney_file_id: Cheney_hit.Cheney_file_id,
        Cheney_file_name: Cheney_hit.Cheney_file_name,
        Cheney_chunk_index: Cheney_hit.Cheney_chunk_index,
        Cheney_score: Cheney_hit.Cheney_score,
        Cheney_snippet: Cheney_hit.Cheney_snippet
      };
    });

    if (!Cheney_hits.length) {
      console.log('[Cheney] 知识库检索未命中：' + Cheney_question);
      Cheney_res.Cheney_success(
        {
          Cheney_answer: '知识库中没有找到与该问题相关的内容，可以换一种说法，或上传包含该主题的资料。',
          Cheney_hit: false,
          Cheney_sources: []
        },
        '未检索到相关内容'
      );
      return;
    }

    console.log('[Cheney] 知识库检索命中 ' + Cheney_hits.length + ' 条片段，开始调用大模型');

    let Cheney_completion;
    try {
      Cheney_completion = await Cheney_createChatCompletion(
        [{ role: 'user', content: Cheney_kbRetrieval.Cheney_buildRagQuestion(Cheney_question, Cheney_hits) }],
        Cheney_kbRetrieval.Cheney_RAG_SYSTEM_PROMPT
      );
    } catch (Cheney_aiError) {
      if (Cheney_aiError.Cheney_status === 429) {
        Cheney_res.Cheney_fail(
          '知识库检索已完成，但 AI 接口当前限流（HTTP 429），请稍后重试',
          429,
          { Cheney_hit: true, Cheney_sources }
        );
        return;
      }
      Cheney_res.Cheney_fail(
        '检索已完成，但 AI 回答失败：' + Cheney_aiError.message,
        Cheney_aiError.Cheney_status || 500,
        { Cheney_hit: true, Cheney_sources }
      );
      return;
    }

    Cheney_res.Cheney_success(
      {
        Cheney_answer: Cheney_completion.Cheney_reply,
        Cheney_hit: true,
        Cheney_sources,
        Cheney_model: Cheney_completion.Cheney_model,
        Cheney_usage: Cheney_completion.Cheney_usage
      },
      '回答完成'
    );
  } catch (Cheney_error) {
    console.error('[Cheney] 知识库问答失败：' + Cheney_error.message);
    Cheney_res.Cheney_fail('知识库问答失败：' + Cheney_error.message, 500);
  }
}

module.exports = {
  Cheney_uploadFile,
  Cheney_listFiles,
  Cheney_getFileChunks,
  Cheney_deleteFile,
  Cheney_ask
};
