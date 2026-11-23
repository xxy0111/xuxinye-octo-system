/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 知识库检索：BM25 关键词打分（中文二元组 + 英文单词），不依赖向量化
 */

const Cheney_TOP_K = 4;

// 分词：英文/数字按单词，中文按字符二元组（单字序列保留单字）
function Cheney_tokenize(Cheney_text) {
  const Cheney_source = String(Cheney_text || '').toLowerCase();
  const Cheney_tokens = [];

  const Cheney_latin = Cheney_source.match(/[a-z0-9]{2,}/g) || [];
  Cheney_latin.forEach(function (Cheney_word) {
    Cheney_tokens.push(Cheney_word);
  });

  const Cheney_cjkRuns = Cheney_source.match(/[\u4e00-\u9fa5]+/g) || [];
  Cheney_cjkRuns.forEach(function (Cheney_run) {
    if (Cheney_run.length === 1) {
      Cheney_tokens.push(Cheney_run);
      return;
    }
    for (let Cheney_i = 0; Cheney_i < Cheney_run.length - 1; Cheney_i++) {
      Cheney_tokens.push(Cheney_run.slice(Cheney_i, Cheney_i + 2));
    }
  });

  return Cheney_tokens;
}

// 统计词频
function Cheney_countTerms(Cheney_tokens) {
  const Cheney_counter = Object.create(null);
  Cheney_tokens.forEach(function (Cheney_token) {
    Cheney_counter[Cheney_token] = (Cheney_counter[Cheney_token] || 0) + 1;
  });
  return Cheney_counter;
}

// BM25 检索，返回按得分降序的命中片段
function Cheney_bm25Search(Cheney_chunks, Cheney_question, Cheney_topK) {
  const Cheney_k1 = 1.5;
  const Cheney_b = 0.75;
  const Cheney_queryTokens = Array.from(new Set(Cheney_tokenize(Cheney_question)));
  if (!Cheney_queryTokens.length || !Cheney_chunks.length) {
    return [];
  }

  const Cheney_docTerms = Cheney_chunks.map(function (Cheney_chunk) {
    const Cheney_tokens = Cheney_tokenize(Cheney_chunk.Cheney_content);
    return { Cheney_tf: Cheney_countTerms(Cheney_tokens), Cheney_length: Cheney_tokens.length };
  });

  const Cheney_totalDocs = Cheney_docTerms.length;
  const Cheney_avgLength =
    Cheney_docTerms.reduce(function (Cheney_sum, Cheney_doc) {
      return Cheney_sum + Cheney_doc.Cheney_length;
    }, 0) / Cheney_totalDocs || 1;

  // 文档频率
  const Cheney_docFreq = Object.create(null);
  Cheney_queryTokens.forEach(function (Cheney_term) {
    Cheney_docFreq[Cheney_term] = Cheney_docTerms.filter(function (Cheney_doc) {
      return Cheney_doc.Cheney_tf[Cheney_term];
    }).length;
  });

  const Cheney_scored = Cheney_chunks.map(function (Cheney_chunk, Cheney_index) {
    const Cheney_doc = Cheney_docTerms[Cheney_index];
    let Cheney_score = 0;
    Cheney_queryTokens.forEach(function (Cheney_term) {
      const Cheney_tf = Cheney_doc.Cheney_tf[Cheney_term] || 0;
      if (!Cheney_tf) {
        return;
      }
      const Cheney_df = Cheney_docFreq[Cheney_term] || 0;
      const Cheney_idf = Math.log(1 + (Cheney_totalDocs - Cheney_df + 0.5) / (Cheney_df + 0.5));
      Cheney_score +=
        (Cheney_idf * (Cheney_tf * (Cheney_k1 + 1))) /
        (Cheney_tf + Cheney_k1 * (1 - Cheney_b + (Cheney_b * Cheney_doc.Cheney_length) / Cheney_avgLength));
    });
    return { Cheney_chunk, Cheney_score };
  });

  return Cheney_scored
    .filter(function (Cheney_item) {
      return Cheney_item.Cheney_score > 0;
    })
    .sort(function (Cheney_a, Cheney_b) {
      return Cheney_b.Cheney_score - Cheney_a.Cheney_score;
    })
    .slice(0, Cheney_topK || Cheney_TOP_K)
    .map(function (Cheney_item) {
      const Cheney_content = Cheney_item.Cheney_chunk.Cheney_content;
      return {
        Cheney_file_id: Cheney_item.Cheney_chunk.Cheney_file_id,
        Cheney_file_name: Cheney_item.Cheney_chunk.Cheney_file_name,
        Cheney_chunk_index: Cheney_item.Cheney_chunk.Cheney_chunk_index,
        Cheney_score: Math.round(Cheney_item.Cheney_score * 100) / 100,
        Cheney_snippet: Cheney_content.length > 180 ? Cheney_content.slice(0, 180) + '…' : Cheney_content,
        Cheney_content: Cheney_content
      };
    });
}

// RAG 专用系统提示词
const Cheney_RAG_SYSTEM_PROMPT =
  '你是企业知识库问答助手。必须严格依据用户提供的“参考资料”回答，不得编造。' +
  '回答时用【来源1】【来源2】标注依据的片段编号。' +
  '如果参考资料不足以回答，要明确说明“知识库中没有足够信息”，并说明缺少什么。';

// 组装带检索片段的用户消息
function Cheney_buildRagQuestion(Cheney_question, Cheney_hits) {
  const Cheney_blocks = Cheney_hits.map(function (Cheney_hit, Cheney_index) {
    return (
      '【来源' +
      (Cheney_index + 1) +
      '】文件《' +
      Cheney_hit.Cheney_file_name +
      '》片段' +
      (Cheney_hit.Cheney_chunk_index + 1) +
      '：\n' +
      Cheney_hit.Cheney_content
    );
  });
  return (
    '参考资料：\n' +
    Cheney_blocks.join('\n\n') +
    '\n\n问题：' +
    Cheney_question +
    '\n\n请依据上述资料回答，并标注【来源N】；资料不足时请直接说明。'
  );
}

module.exports = {
  Cheney_tokenize,
  Cheney_bm25Search,
  Cheney_buildRagQuestion,
  Cheney_RAG_SYSTEM_PROMPT
};
