/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * AI 对话模型：转发兼容 OpenAI 协议的对话接口，密钥只从 backend/.env 读取
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// 优先读取实验指导书约定的 LLM_* 变量，同时兼容旧版 AI_* 变量
const xuxinye_API_BASE_URL = (
  process.env.LLM_BASE_URL ||
  process.env.AI_API_BASE_URL ||
  'https://api.qnaigc.com/v1'
).replace(/\/+$/, '');
const xuxinye_API_URL = xuxinye_API_BASE_URL + '/chat/completions';
const xuxinye_MODEL = process.env.LLM_MODEL || process.env.AI_MODEL || 'qiniu/conatus-free';

// 系统提示词：限定助手身份，避免无关回答
const xuxinye_SYSTEM_PROMPT =
  '你是“科技资讯图文展示平台”的 AI 助手，负责解答科技资讯、前端开发与数据库相关问题。' +
  '回答要准确、简洁，使用中文，必要时分点说明。';

// 构造带状态码的错误，便于控制器区分失败类型
function xuxinye_createError(xuxinye_message, xuxinye_status) {
  const xuxinye_error = new Error(xuxinye_message);
  xuxinye_error.xuxinye_status = xuxinye_status;
  return xuxinye_error;
}

// 调用对话接口，返回 { xuxinye_reply, xuxinye_model, xuxinye_usage }
// xuxinye_systemPrompt 可选：RAG 问答会传入专用的知识库提示词
// xuxinye_options.signal 可选：前端中断请求时用于取消上游调用
async function xuxinye_createChatCompletion(xuxinye_messages, xuxinye_systemPrompt, xuxinye_options) {
  const xuxinye_apiKey = process.env.LLM_API_KEY || process.env.AI_API_KEY;
  if (!xuxinye_apiKey) {
    throw xuxinye_createError('后端未配置 LLM_API_KEY，请检查 backend/.env', 500);
  }

  const xuxinye_requestBody = {
    model: xuxinye_MODEL,
    messages: [{ role: 'system', content: xuxinye_systemPrompt || xuxinye_SYSTEM_PROMPT }].concat(xuxinye_messages),
    temperature: 0.7,
    max_tokens: 1024,
    stream: false
  };

  // 服务端调试日志：只打印请求数据与模型返回，Authorization 不输出
  console.log('[xuxinye] AI 请求地址：' + xuxinye_API_URL);
  console.log('[xuxinye] AI 请求数据：' + JSON.stringify(xuxinye_requestBody, null, 2));

  let xuxinye_response;
  try {
    const xuxinye_timeoutSignal = AbortSignal.timeout(60000);
    const xuxinye_signal =
      xuxinye_options && xuxinye_options.signal
        ? AbortSignal.any([xuxinye_timeoutSignal, xuxinye_options.signal])
        : xuxinye_timeoutSignal;

    xuxinye_response = await fetch(xuxinye_API_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + xuxinye_apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(xuxinye_requestBody),
      signal: xuxinye_signal
    });
  } catch (xuxinye_error) {
    if (xuxinye_options && xuxinye_options.signal && xuxinye_options.signal.aborted) {
      console.log('[xuxinye] 前端已中断本次请求，停止等待上游返回');
      throw xuxinye_createError('已停止生成', 499);
    }
    console.error('[xuxinye] 对话接口请求失败：' + xuxinye_error.message);
    throw xuxinye_createError(
      xuxinye_error.name === 'TimeoutError' ? 'AI 接口响应超时，请稍后重试' : '无法连接 AI 接口：' + xuxinye_error.message,
      502
    );
  }

  const xuxinye_result = await xuxinye_response.json().catch(function () {
    return null;
  });

  if (!xuxinye_response.ok || !xuxinye_result) {
    const xuxinye_upstreamMsg =
      (xuxinye_result && xuxinye_result.message) ||
      (xuxinye_result && xuxinye_result.error && xuxinye_result.error.message) ||
      'HTTP ' + xuxinye_response.status;
    console.error('[xuxinye] AI 返回数据（异常）：' + JSON.stringify(xuxinye_result));
    console.error('[xuxinye] 对话接口返回异常：' + xuxinye_upstreamMsg);
    if (xuxinye_response.status === 429) {
      throw xuxinye_createError('AI 接口当前请求过多（HTTP 429 限流），请稍后重试', 429);
    }
    throw xuxinye_createError('AI 接口调用失败：' + xuxinye_upstreamMsg, 502);
  }

  console.log('[xuxinye] AI 返回数据：' + JSON.stringify(xuxinye_result, null, 2));

  const xuxinye_content =
    xuxinye_result.choices && xuxinye_result.choices[0] && xuxinye_result.choices[0].message
      ? xuxinye_result.choices[0].message.content
      : '';

  if (!xuxinye_content) {
    throw xuxinye_createError('AI 接口未返回有效内容', 502);
  }

  return {
    xuxinye_reply: xuxinye_content,
    xuxinye_model: xuxinye_result.model || xuxinye_MODEL,
    xuxinye_usage: xuxinye_result.usage || null
  };
}

module.exports = { xuxinye_createChatCompletion, xuxinye_MODEL };
