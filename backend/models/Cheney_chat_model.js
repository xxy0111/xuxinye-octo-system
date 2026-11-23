/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * AI 对话模型：转发兼容 OpenAI 协议的对话接口，密钥只从 backend/.env 读取
 */
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Cheney_API_BASE_URL = (process.env.AI_API_BASE_URL || 'https://api.qnaigc.com/v1').replace(/\/+$/, '');
const Cheney_API_URL = Cheney_API_BASE_URL + '/chat/completions';
const Cheney_MODEL = process.env.AI_MODEL || 'qiniu/conatus-free';

// 系统提示词：限定助手身份，避免无关回答
const Cheney_SYSTEM_PROMPT =
  '你是“科技资讯图文展示平台”的 AI 助手，负责解答科技资讯、前端开发与数据库相关问题。' +
  '回答要准确、简洁，使用中文，必要时分点说明。';

// 构造带状态码的错误，便于控制器区分失败类型
function Cheney_createError(Cheney_message, Cheney_status) {
  const Cheney_error = new Error(Cheney_message);
  Cheney_error.Cheney_status = Cheney_status;
  return Cheney_error;
}

// 调用对话接口，返回 { Cheney_reply, Cheney_model, Cheney_usage }
// Cheney_systemPrompt 可选：RAG 问答会传入专用的知识库提示词
async function Cheney_createChatCompletion(Cheney_messages, Cheney_systemPrompt) {
  const Cheney_apiKey = process.env.AI_API_KEY;
  if (!Cheney_apiKey) {
    throw Cheney_createError('后端未配置 AI_API_KEY，请检查 backend/.env', 500);
  }

  const Cheney_requestBody = {
    model: Cheney_MODEL,
    messages: [{ role: 'system', content: Cheney_systemPrompt || Cheney_SYSTEM_PROMPT }].concat(Cheney_messages),
    temperature: 0.7,
    max_tokens: 1024,
    stream: false
  };

  // 服务端调试日志：只打印请求数据与模型返回，Authorization 不输出
  console.log('[Cheney] AI 请求地址：' + Cheney_API_URL);
  console.log('[Cheney] AI 请求数据：' + JSON.stringify(Cheney_requestBody, null, 2));

  let Cheney_response;
  try {
    Cheney_response = await fetch(Cheney_API_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + Cheney_apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Cheney_requestBody),
      signal: AbortSignal.timeout(60000)
    });
  } catch (Cheney_error) {
    console.error('[Cheney] 对话接口请求失败：' + Cheney_error.message);
    throw Cheney_createError(
      Cheney_error.name === 'TimeoutError' ? 'AI 接口响应超时，请稍后重试' : '无法连接 AI 接口：' + Cheney_error.message,
      502
    );
  }

  const Cheney_result = await Cheney_response.json().catch(function () {
    return null;
  });

  if (!Cheney_response.ok || !Cheney_result) {
    const Cheney_upstreamMsg =
      (Cheney_result && Cheney_result.message) ||
      (Cheney_result && Cheney_result.error && Cheney_result.error.message) ||
      'HTTP ' + Cheney_response.status;
    console.error('[Cheney] AI 返回数据（异常）：' + JSON.stringify(Cheney_result));
    console.error('[Cheney] 对话接口返回异常：' + Cheney_upstreamMsg);
    if (Cheney_response.status === 429) {
      throw Cheney_createError('AI 接口当前请求过多（HTTP 429 限流），请稍后重试', 429);
    }
    throw Cheney_createError('AI 接口调用失败：' + Cheney_upstreamMsg, 502);
  }

  console.log('[Cheney] AI 返回数据：' + JSON.stringify(Cheney_result, null, 2));

  const Cheney_content =
    Cheney_result.choices && Cheney_result.choices[0] && Cheney_result.choices[0].message
      ? Cheney_result.choices[0].message.content
      : '';

  if (!Cheney_content) {
    throw Cheney_createError('AI 接口未返回有效内容', 502);
  }

  return {
    Cheney_reply: Cheney_content,
    Cheney_model: Cheney_result.model || Cheney_MODEL,
    Cheney_usage: Cheney_result.usage || null
  };
}

module.exports = { Cheney_createChatCompletion, Cheney_MODEL };
