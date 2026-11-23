/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 知识库文件解析：支持 txt / doc / docx / ppt / pptx / pdf，输出纯文本并切分片段
 */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');

const Cheney_CHUNK_SIZE = 600;
const Cheney_CHUNK_OVERLAP = 80;

// 清理文本：统一换行、去掉多余空白
function Cheney_normalizeText(Cheney_text) {
  return String(Cheney_text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// txt 编码识别：优先 utf8，出现乱码时尝试 gbk
function Cheney_decodeTxt(Cheney_buffer) {
  const Cheney_utf8 = Cheney_buffer.toString('utf8');
  const Cheney_badCount = (Cheney_utf8.match(/\ufffd/g) || []).length;
  if (Cheney_badCount === 0) {
    return Cheney_utf8;
  }
  try {
    return new TextDecoder('gbk').decode(Cheney_buffer);
  } catch (Cheney_error) {
    return Cheney_utf8;
  }
}

// docx：mammoth 提取纯文本
async function Cheney_parseDocx(Cheney_filePath) {
  const Cheney_result = await mammoth.extractRawText({ path: Cheney_filePath });
  return Cheney_result.value;
}

// doc：word-extractor 提取正文
async function Cheney_parseDoc(Cheney_filePath) {
  const Cheney_extractor = new WordExtractor();
  const Cheney_doc = await Cheney_extractor.extract(Cheney_filePath);
  return Cheney_doc.getBody();
}

// pdf：pdf-parse 提取文本
async function Cheney_parsePdf(Cheney_filePath) {
  const Cheney_pdfParse = require('pdf-parse');
  const Cheney_buffer = fs.readFileSync(Cheney_filePath);
  const Cheney_result = await Cheney_pdfParse(Cheney_buffer);
  return Cheney_result.text;
}

// pptx：解压后逐个读取幻灯片 XML 中的 <a:t> 文本节点
async function Cheney_parsePptx(Cheney_filePath) {
  const Cheney_zip = await JSZip.loadAsync(fs.readFileSync(Cheney_filePath));
  const Cheney_slideNames = Object.keys(Cheney_zip.files)
    .filter(function (Cheney_name) {
      return /^ppt\/slides\/slide\d+\.xml$/.test(Cheney_name);
    })
    .sort(function (Cheney_a, Cheney_b) {
      return parseInt(Cheney_a.match(/slide(\d+)\.xml/)[1], 10) - parseInt(Cheney_b.match(/slide(\d+)\.xml/)[1], 10);
    });

  const Cheney_parts = [];
  for (let Cheney_slideNo = 0; Cheney_slideNo < Cheney_slideNames.length; Cheney_slideNo++) {
    const Cheney_name = Cheney_slideNames[Cheney_slideNo];
    const Cheney_xml = await Cheney_zip.files[Cheney_name].async('string');
    const Cheney_matches = Cheney_xml.match(/<a:t>([^<]*)<\/a:t>/g) || [];
    const Cheney_texts = Cheney_matches.map(function (Cheney_node) {
      return Cheney_node
        .replace(/^<a:t>/, '')
        .replace(/<\/a:t>$/, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    });
    if (Cheney_texts.length) {
      Cheney_parts.push('【幻灯片 ' + (Cheney_slideNo + 1) + '】\n' + Cheney_texts.join(' '));
    }
  }
  return Cheney_parts.join('\n\n');
}

// ppt：旧版二进制格式没有纯 JS 解析库，做 UTF-16LE / ASCII 文本兜底提取
function Cheney_parseLegacyPpt(Cheney_filePath) {
  const Cheney_buffer = fs.readFileSync(Cheney_filePath);
  const Cheney_utf16 = Cheney_buffer.toString('utf16le');
  const Cheney_utf16Runs = Cheney_utf16.match(/[\u4e00-\u9fa5A-Za-z0-9，。、；：！？“”‘’（）《》\-_.!?,:;'"\s]{4,}/g) || [];
  const Cheney_asciiRuns = Cheney_buffer.toString('latin1').match(/[\x20-\x7e]{6,}/g) || [];

  const Cheney_seen = {};
  const Cheney_lines = [];
  Cheney_utf16Runs.concat(Cheney_asciiRuns).forEach(function (Cheney_run) {
    const Cheney_clean = Cheney_run.replace(/\s+/g, ' ').trim();
    if (Cheney_clean.length >= 4 && !Cheney_seen[Cheney_clean]) {
      Cheney_seen[Cheney_clean] = true;
      Cheney_lines.push(Cheney_clean);
    }
  });
  return Cheney_lines.join('\n');
}

// 按扩展名分发解析，返回 { Cheney_text, Cheney_warning }
async function Cheney_extractText(Cheney_filePath, Cheney_ext) {
  let Cheney_text = '';
  let Cheney_warning = '';
  switch (Cheney_ext) {
    case '.txt':
      Cheney_text = Cheney_decodeTxt(fs.readFileSync(Cheney_filePath));
      break;
    case '.docx':
      Cheney_text = await Cheney_parseDocx(Cheney_filePath);
      break;
    case '.doc':
      Cheney_text = await Cheney_parseDoc(Cheney_filePath);
      break;
    case '.pdf':
      Cheney_text = await Cheney_parsePdf(Cheney_filePath);
      break;
    case '.pptx':
      Cheney_text = await Cheney_parsePptx(Cheney_filePath);
      break;
    case '.ppt':
      Cheney_text = Cheney_parseLegacyPpt(Cheney_filePath);
      Cheney_warning = '旧版 .ppt 使用二进制兜底解析，文本可能不完整';
      break;
    default:
      throw new Error('不支持的文件类型：' + Cheney_ext);
  }
  return { Cheney_text: Cheney_normalizeText(Cheney_text), Cheney_warning: Cheney_warning };
}

// 文本切分：按段落聚合成不超过 600 字的片段，片段间保留 80 字重叠
function Cheney_chunkText(Cheney_text) {
  const Cheney_source = Cheney_normalizeText(Cheney_text);
  if (!Cheney_source) {
    return [];
  }
  if (Cheney_source.length <= Cheney_CHUNK_SIZE) {
    return [Cheney_source];
  }

  const Cheney_chunks = [];
  let Cheney_start = 0;
  while (Cheney_start < Cheney_source.length) {
    let Cheney_end = Math.min(Cheney_start + Cheney_CHUNK_SIZE, Cheney_source.length);
    if (Cheney_end < Cheney_source.length) {
      // 尽量在句末或换行处断开，避免把一句话切成两半
      const Cheney_window = Cheney_source.slice(Cheney_end - 120, Cheney_end);
      const Cheney_breakIndex = Math.max(
        Cheney_window.lastIndexOf('。'),
        Cheney_window.lastIndexOf('\n'),
        Cheney_window.lastIndexOf('；'),
        Cheney_window.lastIndexOf('！'),
        Cheney_window.lastIndexOf('？')
      );
      if (Cheney_breakIndex > 20) {
        Cheney_end = Cheney_end - 120 + Cheney_breakIndex + 1;
      }
    }
    const Cheney_piece = Cheney_source.slice(Cheney_start, Cheney_end).trim();
    if (Cheney_piece) {
      Cheney_chunks.push(Cheney_piece);
    }
    if (Cheney_end >= Cheney_source.length) {
      break;
    }
    Cheney_start = Math.max(Cheney_end - Cheney_CHUNK_OVERLAP, Cheney_start + 1);
  }
  return Cheney_chunks;
}

// 读取文件基本信息
function Cheney_getFileExt(Cheney_fileName) {
  return path.extname(Cheney_fileName).toLowerCase();
}

module.exports = { Cheney_extractText, Cheney_chunkText, Cheney_getFileExt, Cheney_normalizeText };
