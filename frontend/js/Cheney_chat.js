/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * AI 对话页：维护对话上下文，调用 /api/chat 并渲染回复、加载与失败状态
 */
(function () {
  const Cheney_listEl = document.getElementById('Cheney_chatList');
  const Cheney_emptyEl = document.getElementById('Cheney_chatEmpty');
  const Cheney_inputEl = document.getElementById('Cheney_chatInput');
  const Cheney_sendEl = document.getElementById('Cheney_chatSend');
  const Cheney_clearEl = document.getElementById('Cheney_chatClear');
  const Cheney_statusEl = document.getElementById('Cheney_chatStatus');
  const Cheney_apiDataEl = document.getElementById('Cheney_apiData');

  // 对话上下文，仅保留 user / assistant 消息
  const Cheney_history = [];
  let Cheney_pending = false;

  // 创建一条消息气泡
  function Cheney_createMsg(Cheney_role, Cheney_content, Cheney_isError) {
    const Cheney_wrap = document.createElement('div');
    Cheney_wrap.className =
      'Cheney_chatMsg Cheney_chatMsg--' +
      (Cheney_role === 'user' ? 'user' : 'assistant') +
      (Cheney_isError ? ' Cheney_chatMsg--error' : '');

    const Cheney_roleEl = document.createElement('span');
    Cheney_roleEl.className = 'Cheney_chatMsg__role';
    Cheney_roleEl.textContent = Cheney_role === 'user' ? '我' : 'AI 助手';

    const Cheney_bubble = document.createElement('div');
    Cheney_bubble.className = 'Cheney_chatMsg__bubble';
    Cheney_bubble.textContent = Cheney_content;

    Cheney_wrap.append(Cheney_roleEl, Cheney_bubble);
    return Cheney_wrap;
  }

  // 追加消息并滚动到底部
  function Cheney_appendMsg(Cheney_role, Cheney_content, Cheney_isError) {
    if (Cheney_emptyEl && Cheney_emptyEl.parentNode) {
      Cheney_emptyEl.remove();
    }
    const Cheney_node = Cheney_createMsg(Cheney_role, Cheney_content, Cheney_isError);
    Cheney_listEl.appendChild(Cheney_node);
    Cheney_listEl.scrollTop = Cheney_listEl.scrollHeight;
    return Cheney_node;
  }

  // 等待回复的动画气泡
  function Cheney_appendTyping() {
    const Cheney_wrap = document.createElement('div');
    Cheney_wrap.className = 'Cheney_chatMsg Cheney_chatMsg--assistant';

    const Cheney_roleEl = document.createElement('span');
    Cheney_roleEl.className = 'Cheney_chatMsg__role';
    Cheney_roleEl.textContent = 'AI 助手';

    const Cheney_bubble = document.createElement('div');
    Cheney_bubble.className = 'Cheney_chatMsg__bubble';
    Cheney_bubble.innerHTML = '<span class="Cheney_typing"><i></i><i></i><i></i></span>';

    Cheney_wrap.append(Cheney_roleEl, Cheney_bubble);
    Cheney_listEl.appendChild(Cheney_wrap);
    Cheney_listEl.scrollTop = Cheney_listEl.scrollHeight;
    return Cheney_wrap;
  }

  function Cheney_setStatus(Cheney_text, Cheney_isError) {
    Cheney_statusEl.textContent = Cheney_text || '';
    Cheney_statusEl.className = 'Cheney_chatStatus' + (Cheney_isError ? ' Cheney_chatStatus--error' : '');
  }

  function Cheney_setPending(Cheney_flag) {
    Cheney_pending = Cheney_flag;
    Cheney_sendEl.disabled = Cheney_flag;
    Cheney_clearEl.disabled = Cheney_flag;
    Cheney_sendEl.textContent = Cheney_flag ? '回复中…' : '发送';
  }

  // 输入框高度自适应
  function Cheney_resizeInput() {
    Cheney_inputEl.style.height = 'auto';
    Cheney_inputEl.style.height = Math.min(Cheney_inputEl.scrollHeight, 140) + 'px';
  }

  async function Cheney_send() {
    if (Cheney_pending) {
      return;
    }

    const Cheney_text = Cheney_inputEl.value.trim();
    if (!Cheney_text) {
      Cheney_setStatus('请输入内容后再发送。', true);
      Cheney_inputEl.focus();
      return;
    }

    Cheney_history.push({ role: 'user', content: Cheney_text });
    Cheney_appendMsg('user', Cheney_text);
    Cheney_inputEl.value = '';
    Cheney_resizeInput();
    Cheney_setPending(true);
    Cheney_setStatus('AI 正在思考，请稍候……', false);
    const Cheney_typingEl = Cheney_appendTyping();

    try {
      const Cheney_result = await Cheney_api.Cheney_post('/api/chat', {
        Cheney_messages: Cheney_history
      });
      Cheney_api.Cheney_showJson(Cheney_apiDataEl, Cheney_result);
      Cheney_typingEl.remove();

      if (Cheney_result.code !== 0) {
        console.error('[Cheney] AI 对话失败：' + Cheney_result.msg);
        Cheney_appendMsg('assistant', '回复失败：' + Cheney_result.msg, true);
        Cheney_setStatus('本次回复失败，可稍后重试。', true);
        return;
      }

      const Cheney_data = Cheney_result.data || {};
      Cheney_history.push({ role: 'assistant', content: Cheney_data.Cheney_reply });
      Cheney_appendMsg('assistant', Cheney_data.Cheney_reply);

      const Cheney_usage = Cheney_data.Cheney_usage || {};
      Cheney_setStatus(
        '回复完成 · 模型 ' +
          (Cheney_data.Cheney_model || '未知') +
          ' · tokens ' +
          (Cheney_usage.total_tokens || '-'),
        false
      );
      Cheney_inputEl.focus();
    } catch (Cheney_error) {
      console.error('[Cheney] AI 对话请求异常：', Cheney_error);
      Cheney_typingEl.remove();
      Cheney_appendMsg('assistant', '无法连接后端服务，请确认 http://localhost:8111 已启动。', true);
      Cheney_setStatus('请求异常：' + Cheney_error.message, true);
    } finally {
      Cheney_setPending(false);
    }
  }

  function Cheney_clear() {
    if (Cheney_pending) {
      return;
    }
    Cheney_history.length = 0;
    Cheney_listEl.innerHTML = '';
    const Cheney_empty = document.createElement('p');
    Cheney_empty.className = 'Cheney_chatEmpty';
    Cheney_empty.innerHTML =
      '<strong>开始和 AI 助手对话</strong>可以询问科技资讯、前端开发或数据库相关问题。输入内容后按 Enter 发送，Shift + Enter 换行。';
    Cheney_listEl.appendChild(Cheney_empty);
    Cheney_apiDataEl.textContent = '尚未发起对话。';
    Cheney_setStatus('对话已清空。', false);
    Cheney_inputEl.focus();
  }

  Cheney_sendEl.addEventListener('click', Cheney_send);
  Cheney_clearEl.addEventListener('click', Cheney_clear);

  Cheney_inputEl.addEventListener('input', Cheney_resizeInput);
  Cheney_inputEl.addEventListener('keydown', function (Cheney_event) {
    if (Cheney_event.key === 'Enter' && !Cheney_event.shiftKey) {
      Cheney_event.preventDefault();
      Cheney_send();
    }
  });
})();
