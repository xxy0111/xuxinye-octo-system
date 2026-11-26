/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 知识库文件解析：支持 txt / doc / docx / ppt / pptx / pdf，输出纯文本并切分片段
 */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const mammoth = require('mammoth');
const WordExtractor = require('word-extractor');

const xuxinye_CHUNK_SIZE = 600;
const xuxinye_CHUNK_OVERLAP = 80;

// 清理文本：统一换行、去掉多余空白
function xuxinye_normalizeText(xuxinye_text) {
  return String(xuxinye_text || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// txt 编码识别：优先 utf8，出现乱码时尝试 gbk
function xuxinye_decodeTxt(xuxinye_buffer) {
  const xuxinye_utf8 = xuxinye_buffer.toString('utf8');
  const xuxinye_badCount = (xuxinye_utf8.match(/\ufffd/g) || []).length;
  if (xuxinye_badCount === 0) {
    return xuxinye_utf8;
  }
  try {
    return new TextDecoder('gbk').decode(xuxinye_buffer);
  } catch (xuxinye_error) {
    return xuxinye_utf8;
  }
}

// docx：mammoth 提取纯文本
async function xuxinye_parseDocx(xuxinye_filePath) {
  const xuxinye_result = await mammoth.extractRawText({ path: xuxinye_filePath });
  return xuxinye_result.value;
}

// doc：word-extractor 提取正文
async function xuxinye_parseDoc(xuxinye_filePath) {
  const xuxinye_extractor = new WordExtractor();
  const xuxinye_doc = await xuxinye_extractor.extract(xuxinye_filePath);
  return xuxinye_doc.getBody();
}

// pdf：pdf-parse 提取文本
async function xuxinye_parsePdf(xuxinye_filePath) {
  const xuxinye_pdfParse = require('pdf-parse');
  const xuxinye_buffer = fs.readFileSync(xuxinye_filePath);
  const xuxinye_result = await xuxinye_pdfParse(xuxinye_buffer);
  return xuxinye_result.text;
}

// pptx：解压后逐个读取幻灯片 XML 中的 <a:t> 文本节点
async function xuxinye_parsePptx(xuxinye_filePath) {
  const xuxinye_zip = await JSZip.loadAsync(fs.readFileSync(xuxinye_filePath));
  const xuxinye_slideNames = Object.keys(xuxinye_zip.files)
    .filter(function (xuxinye_name) {
      return /^ppt\/slides\/slide\d+\.xml$/.test(xuxinye_name);
    })
    .sort(function (xuxinye_a, xuxinye_b) {
      return parseInt(xuxinye_a.match(/slide(\d+)\.xml/)[1], 10) - parseInt(xuxinye_b.match(/slide(\d+)\.xml/)[1], 10);
    });

  const xuxinye_parts = [];
  for (let xuxinye_slideNo = 0; xuxinye_slideNo < xuxinye_slideNames.length; xuxinye_slideNo++) {
    const xuxinye_name = xuxinye_slideNames[xuxinye_slideNo];
    const xuxinye_xml = await xuxinye_zip.files[xuxinye_name].async('string');
    const xuxinye_matches = xuxinye_xml.match(/<a:t>([^<]*)<\/a:t>/g) || [];
    const xuxinye_texts = xuxinye_matches.map(function (xuxinye_node) {
      return xuxinye_node
        .replace(/^<a:t>/, '')
        .replace(/<\/a:t>$/, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'");
    });
    if (xuxinye_texts.length) {
      xuxinye_parts.push('【幻灯片 ' + (xuxinye_slideNo + 1) + '】\n' + xuxinye_texts.join(' '));
    }
  }
  return xuxinye_parts.join('\n\n');
}

// ppt：旧版二进制格式没有纯 JS 解析库，做 UTF-16LE / ASCII 文本兜底提取
function xuxinye_parseLegacyPpt(xuxinye_filePath) {
  const xuxinye_buffer = fs.readFileSync(xuxinye_filePath);
  const xuxinye_utf16 = xuxinye_buffer.toString('utf16le');
  const xuxinye_utf16Runs = xuxinye_utf16.match(/[\u4e00-\u9fa5A-Za-z0-9，。、；：！？“”‘’（）《》\-_.!?,:;'"\s]{4,}/g) || [];
  const xuxinye_asciiRuns = xuxinye_buffer.toString('latin1').match(/[\x20-\x7e]{6,}/g) || [];

  const xuxinye_seen = {};
  const xuxinye_lines = [];
  xuxinye_utf16Runs.concat(xuxinye_asciiRuns).forEach(function (xuxinye_run) {
    const xuxinye_clean = xuxinye_run.replace(/\s+/g, ' ').trim();
    if (xuxinye_clean.length >= 4 && !xuxinye_seen[xuxinye_clean]) {
      xuxinye_seen[xuxinye_clean] = true;
      xuxinye_lines.push(xuxinye_clean);
    }
  });
  return xuxinye_lines.join('\n');
}

// 按扩展名分发解析，返回 { xuxinye_text, xuxinye_warning }
async function xuxinye_extractText(xuxinye_filePath, xuxinye_ext) {
  let xuxinye_text = '';
  let xuxinye_warning = '';
  switch (xuxinye_ext) {
    case '.txt':
      xuxinye_text = xuxinye_decodeTxt(fs.readFileSync(xuxinye_filePath));
      break;
    case '.docx':
      xuxinye_text = await xuxinye_parseDocx(xuxinye_filePath);
      break;
    case '.doc':
      xuxinye_text = await xuxinye_parseDoc(xuxinye_filePath);
      break;
    case '.pdf':
      xuxinye_text = await xuxinye_parsePdf(xuxinye_filePath);
      break;
    case '.pptx':
      xuxinye_text = await xuxinye_parsePptx(xuxinye_filePath);
      break;
    case '.ppt':
      xuxinye_text = xuxinye_parseLegacyPpt(xuxinye_filePath);
      xuxinye_warning = '旧版 .ppt 使用二进制兜底解析，文本可能不完整';
      break;
    default:
      throw new Error('不支持的文件类型：' + xuxinye_ext);
  }
  return { xuxinye_text: xuxinye_normalizeText(xuxinye_text), xuxinye_warning: xuxinye_warning };
}

// 文本切分：按段落聚合成不超过 600 字的片段，片段间保留 80 字重叠
function xuxinye_chunkText(xuxinye_text) {
  const xuxinye_source = xuxinye_normalizeText(xuxinye_text);
  if (!xuxinye_source) {
    return [];
  }
  if (xuxinye_source.length <= xuxinye_CHUNK_SIZE) {
    return [xuxinye_source];
  }

  const xuxinye_chunks = [];
  let xuxinye_start = 0;
  while (xuxinye_start < xuxinye_source.length) {
    let xuxinye_end = Math.min(xuxinye_start + xuxinye_CHUNK_SIZE, xuxinye_source.length);
    if (xuxinye_end < xuxinye_source.length) {
      // 尽量在句末或换行处断开，避免把一句话切成两半
      const xuxinye_window = xuxinye_source.slice(xuxinye_end - 120, xuxinye_end);
      const xuxinye_breakIndex = Math.max(
        xuxinye_window.lastIndexOf('。'),
        xuxinye_window.lastIndexOf('\n'),
        xuxinye_window.lastIndexOf('；'),
        xuxinye_window.lastIndexOf('！'),
        xuxinye_window.lastIndexOf('？')
      );
      if (xuxinye_breakIndex > 20) {
        xuxinye_end = xuxinye_end - 120 + xuxinye_breakIndex + 1;
      }
    }
    const xuxinye_piece = xuxinye_source.slice(xuxinye_start, xuxinye_end).trim();
    if (xuxinye_piece) {
      xuxinye_chunks.push(xuxinye_piece);
    }
    if (xuxinye_end >= xuxinye_source.length) {
      break;
    }
    xuxinye_start = Math.max(xuxinye_end - xuxinye_CHUNK_OVERLAP, xuxinye_start + 1);
  }
  return xuxinye_chunks;
}

// 读取文件基本信息
function xuxinye_getFileExt(xuxinye_fileName) {
  return path.extname(xuxinye_fileName).toLowerCase();
}

module.exports = { xuxinye_extractText, xuxinye_chunkText, xuxinye_getFileExt, xuxinye_normalizeText };
