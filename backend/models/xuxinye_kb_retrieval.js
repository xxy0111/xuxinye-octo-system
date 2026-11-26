/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 知识库检索：BM25 关键词打分（中文二元组 + 英文单词），不依赖向量化
 */

const xuxinye_TOP_K = 4;

// 分词：英文/数字按单词，中文按字符二元组（单字序列保留单字）
function xuxinye_tokenize(xuxinye_text) {
  const xuxinye_source = String(xuxinye_text || '').toLowerCase();
  const xuxinye_tokens = [];

  const xuxinye_latin = xuxinye_source.match(/[a-z0-9]{2,}/g) || [];
  xuxinye_latin.forEach(function (xuxinye_word) {
    xuxinye_tokens.push(xuxinye_word);
  });

  const xuxinye_cjkRuns = xuxinye_source.match(/[\u4e00-\u9fa5]+/g) || [];
  xuxinye_cjkRuns.forEach(function (xuxinye_run) {
    if (xuxinye_run.length === 1) {
      xuxinye_tokens.push(xuxinye_run);
      return;
    }
    for (let xuxinye_i = 0; xuxinye_i < xuxinye_run.length - 1; xuxinye_i++) {
      xuxinye_tokens.push(xuxinye_run.slice(xuxinye_i, xuxinye_i + 2));
    }
  });

  return xuxinye_tokens;
}

// 统计词频
function xuxinye_countTerms(xuxinye_tokens) {
  const xuxinye_counter = Object.create(null);
  xuxinye_tokens.forEach(function (xuxinye_token) {
    xuxinye_counter[xuxinye_token] = (xuxinye_counter[xuxinye_token] || 0) + 1;
  });
  return xuxinye_counter;
}

// BM25 检索，返回按得分降序的命中片段
function xuxinye_bm25Search(xuxinye_chunks, xuxinye_question, xuxinye_topK) {
  const xuxinye_k1 = 1.5;
  const xuxinye_b = 0.75;
  const xuxinye_queryTokens = Array.from(new Set(xuxinye_tokenize(xuxinye_question)));
  if (!xuxinye_queryTokens.length || !xuxinye_chunks.length) {
    return [];
  }

  const xuxinye_docTerms = xuxinye_chunks.map(function (xuxinye_chunk) {
    const xuxinye_tokens = xuxinye_tokenize(xuxinye_chunk.xuxinye_content);
    return { xuxinye_tf: xuxinye_countTerms(xuxinye_tokens), xuxinye_length: xuxinye_tokens.length };
  });

  const xuxinye_totalDocs = xuxinye_docTerms.length;
  const xuxinye_avgLength =
    xuxinye_docTerms.reduce(function (xuxinye_sum, xuxinye_doc) {
      return xuxinye_sum + xuxinye_doc.xuxinye_length;
    }, 0) / xuxinye_totalDocs || 1;

  // 文档频率
  const xuxinye_docFreq = Object.create(null);
  xuxinye_queryTokens.forEach(function (xuxinye_term) {
    xuxinye_docFreq[xuxinye_term] = xuxinye_docTerms.filter(function (xuxinye_doc) {
      return xuxinye_doc.xuxinye_tf[xuxinye_term];
    }).length;
  });

  const xuxinye_scored = xuxinye_chunks.map(function (xuxinye_chunk, xuxinye_index) {
    const xuxinye_doc = xuxinye_docTerms[xuxinye_index];
    let xuxinye_score = 0;
    xuxinye_queryTokens.forEach(function (xuxinye_term) {
      const xuxinye_tf = xuxinye_doc.xuxinye_tf[xuxinye_term] || 0;
      if (!xuxinye_tf) {
        return;
      }
      const xuxinye_df = xuxinye_docFreq[xuxinye_term] || 0;
      const xuxinye_idf = Math.log(1 + (xuxinye_totalDocs - xuxinye_df + 0.5) / (xuxinye_df + 0.5));
      xuxinye_score +=
        (xuxinye_idf * (xuxinye_tf * (xuxinye_k1 + 1))) /
        (xuxinye_tf + xuxinye_k1 * (1 - xuxinye_b + (xuxinye_b * xuxinye_doc.xuxinye_length) / xuxinye_avgLength));
    });
    return { xuxinye_chunk, xuxinye_score };
  });

  return xuxinye_scored
    .filter(function (xuxinye_item) {
      return xuxinye_item.xuxinye_score > 0;
    })
    .sort(function (xuxinye_a, xuxinye_b) {
      return xuxinye_b.xuxinye_score - xuxinye_a.xuxinye_score;
    })
    .slice(0, xuxinye_topK || xuxinye_TOP_K)
    .map(function (xuxinye_item) {
      const xuxinye_content = xuxinye_item.xuxinye_chunk.xuxinye_content;
      return {
        xuxinye_file_id: xuxinye_item.xuxinye_chunk.xuxinye_file_id,
        xuxinye_file_name: xuxinye_item.xuxinye_chunk.xuxinye_file_name,
        xuxinye_chunk_index: xuxinye_item.xuxinye_chunk.xuxinye_chunk_index,
        xuxinye_score: Math.round(xuxinye_item.xuxinye_score * 100) / 100,
        xuxinye_snippet: xuxinye_content.length > 180 ? xuxinye_content.slice(0, 180) + '…' : xuxinye_content,
        xuxinye_content: xuxinye_content
      };
    });
}

// RAG 专用系统提示词
const xuxinye_RAG_SYSTEM_PROMPT =
  '你是企业知识库问答助手。必须严格依据用户提供的“参考资料”回答，不得编造。' +
  '回答时用【来源1】【来源2】标注依据的片段编号。' +
  '如果参考资料不足以回答，要明确说明“知识库中没有足够信息”，并说明缺少什么。';

// 组装带检索片段的用户消息
function xuxinye_buildRagQuestion(xuxinye_question, xuxinye_hits) {
  const xuxinye_blocks = xuxinye_hits.map(function (xuxinye_hit, xuxinye_index) {
    return (
      '【来源' +
      (xuxinye_index + 1) +
      '】文件《' +
      xuxinye_hit.xuxinye_file_name +
      '》片段' +
      (xuxinye_hit.xuxinye_chunk_index + 1) +
      '：\n' +
      xuxinye_hit.xuxinye_content
    );
  });
  return (
    '参考资料：\n' +
    xuxinye_blocks.join('\n\n') +
    '\n\n问题：' +
    xuxinye_question +
    '\n\n请依据上述资料回答，并标注【来源N】；资料不足时请直接说明。'
  );
}

module.exports = {
  xuxinye_tokenize,
  xuxinye_bm25Search,
  xuxinye_buildRagQuestion,
  xuxinye_RAG_SYSTEM_PROMPT
};
