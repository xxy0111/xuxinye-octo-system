/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * AI 对话页：会话持久化（列表/新建/重命名/删除/历史）、Markdown 渲染、可中断请求
 */
(function () {
  const Cheney_STORAGE_KEY = 'Cheney_activeConversation';

  const Cheney_listEl = document.getElementById('Cheney_chatList');
  const Cheney_emptyEl = document.getElementById('Cheney_chatEmpty');
  const Cheney_inputEl = document.getElementById('Cheney_chatInput');
  const Cheney_sendEl = document.getElementById('Cheney_chatSend');
  const Cheney_stopEl = document.getElementById('Cheney_chatStop');
  const Cheney_statusEl = document.getElementById('Cheney_chatStatus');
  const Cheney_apiDataEl = document.getElementById('Cheney_apiData');
  const Cheney_convListEl = document.getElementById('Cheney_conversationList');
  const Cheney_convTitleEl = document.getElementById('Cheney_conversationTitle');
  const Cheney_newEl = document.getElementById('Cheney_newConversation');

  let Cheney_conversations = [];
  let Cheney_currentId = null;
  let Cheney_currentTitle = '';
  let Cheney_pending = false;
  let Cheney_controller = null;

  /* ---------- Markdown 渲染（先转义再解析，避免注入） ---------- */
  function Cheney_escapeHtml(Cheney_text) {
    return String(Cheney_text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function Cheney_renderInline(Cheney_text) {
    return Cheney_text
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      );
  }

  function Cheney_renderTextBlock(Cheney_text) {
    const Cheney_lines = Cheney_text.split('\n');
    let Cheney_html = '';
    let Cheney_para = [];
    let Cheney_listTag = null;

    function Cheney_flushPara() {
      if (Cheney_para.length) {
        Cheney_html += '<p>' + Cheney_para.map(Cheney_renderInline).join('<br>') + '</p>';
        Cheney_para = [];
      }
    }

    function Cheney_closeList() {
      if (Cheney_listTag) {
        Cheney_html += '</' + Cheney_listTag + '>';
        Cheney_listTag = null;
      }
    }

    Cheney_lines.forEach(function (Cheney_line) {
      const Cheney_trimmed = Cheney_line.trim();
      if (!Cheney_trimmed) {
        Cheney_flushPara();
        Cheney_closeList();
        return;
      }

      let Cheney_match = Cheney_trimmed.match(/^(#{1,4})\s+(.*)$/);
      if (Cheney_match) {
        Cheney_flushPara();
        Cheney_closeList();
        const Cheney_level = Cheney_match[1].length;
        Cheney_html +=
          '<h' + Cheney_level + '>' + Cheney_renderInline(Cheney_match[2]) + '</h' + Cheney_level + '>';
        return;
      }

      Cheney_match = Cheney_trimmed.match(/^[-*]\s+(.*)$/);
      if (Cheney_match) {
        Cheney_flushPara();
        if (Cheney_listTag !== 'ul') {
          Cheney_closeList();
          Cheney_html += '<ul>';
          Cheney_listTag = 'ul';
        }
        Cheney_html += '<li>' + Cheney_renderInline(Cheney_match[1]) + '</li>';
        return;
      }

      Cheney_match = Cheney_trimmed.match(/^\d+[.)]\s+(.*)$/);
      if (Cheney_match) {
        Cheney_flushPara();
        if (Cheney_listTag !== 'ol') {
          Cheney_closeList();
          Cheney_html += '<ol>';
          Cheney_listTag = 'ol';
        }
        Cheney_html += '<li>' + Cheney_renderInline(Cheney_match[1]) + '</li>';
        return;
      }

      Cheney_match = Cheney_trimmed.match(/^&gt;\s?(.*)$/);
      if (Cheney_match) {
        Cheney_flushPara();
        Cheney_closeList();
        Cheney_html += '<blockquote>' + Cheney_renderInline(Cheney_match[1]) + '</blockquote>';
        return;
      }

      Cheney_closeList();
      Cheney_para.push(Cheney_trimmed);
    });

    Cheney_flushPara();
    Cheney_closeList();
    return Cheney_html;
  }

  function Cheney_renderMarkdown(Cheney_text) {
    const Cheney_escaped = Cheney_escapeHtml(Cheney_text);
    const Cheney_codePattern = /```([A-Za-z0-9+#.-]*)\n?([\s\S]*?)```/g;
    let Cheney_html = '';
    let Cheney_last = 0;
    let Cheney_match = Cheney_codePattern.exec(Cheney_escaped);

    while (Cheney_match) {
      Cheney_html += Cheney_renderTextBlock(Cheney_escaped.slice(Cheney_last, Cheney_match.index));
      const Cheney_lang = Cheney_match[1] ? ' data-lang="' + Cheney_match[1] + '"' : '';
      Cheney_html +=
        '<pre class="Cheney_mdCode"><code' +
        Cheney_lang +
        '>' +
        Cheney_match[2].replace(/\n$/, '') +
        '</code></pre>';
      Cheney_last = Cheney_codePattern.lastIndex;
      Cheney_match = Cheney_codePattern.exec(Cheney_escaped);
    }

    Cheney_html += Cheney_renderTextBlock(Cheney_escaped.slice(Cheney_last));
    return Cheney_html || '<p>' + Cheney_escaped + '</p>';
  }

  /* ---------- 消息渲染 ---------- */
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
    if (Cheney_role === 'assistant' && !Cheney_isError) {
      Cheney_bubble.classList.add('Cheney_chatMsg__bubble--markdown');
      Cheney_bubble.innerHTML = Cheney_renderMarkdown(Cheney_content);
    } else {
      Cheney_bubble.textContent = Cheney_content;
    }

    Cheney_wrap.append(Cheney_roleEl, Cheney_bubble);
    return Cheney_wrap;
  }

  function Cheney_clearList() {
    Cheney_listEl.innerHTML = '';
  }

  function Cheney_showEmpty(Cheney_html) {
    Cheney_clearList();
    const Cheney_empty = document.createElement('p');
    Cheney_empty.className = 'Cheney_chatEmpty';
    Cheney_empty.id = 'Cheney_chatEmpty';
    Cheney_empty.innerHTML = Cheney_html;
    Cheney_listEl.appendChild(Cheney_empty);
  }

  function Cheney_appendMsg(Cheney_role, Cheney_content, Cheney_isError) {
    const Cheney_emptyNode = document.getElementById('Cheney_chatEmpty');
    if (Cheney_emptyNode) {
      Cheney_emptyNode.remove();
    }
    const Cheney_node = Cheney_createMsg(Cheney_role, Cheney_content, Cheney_isError);
    Cheney_listEl.appendChild(Cheney_node);
    Cheney_listEl.scrollTop = Cheney_listEl.scrollHeight;
    return Cheney_node;
  }

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
    Cheney_sendEl.hidden = Cheney_flag;
    Cheney_stopEl.hidden = !Cheney_flag;
    Cheney_newEl.disabled = Cheney_flag;
    Cheney_sendEl.textContent = '发送';
  }

  function Cheney_resizeInput() {
    Cheney_inputEl.style.height = 'auto';
    Cheney_inputEl.style.height = Math.min(Cheney_inputEl.scrollHeight, 140) + 'px';
  }

  /* ---------- 会话列表 ---------- */
  function Cheney_renderConversations() {
    Cheney_convListEl.innerHTML = '';
    if (!Cheney_conversations.length) {
      const Cheney_empty = document.createElement('p');
      Cheney_empty.className = 'Cheney_chatSide__empty';
      Cheney_empty.textContent = '暂无会话，点击“新建”开始。';
      Cheney_convListEl.appendChild(Cheney_empty);
      return;
    }

    Cheney_conversations.forEach(function (Cheney_item) {
      const Cheney_row = document.createElement('div');
      Cheney_row.className =
        'Cheney_convItem' + (Cheney_item.Cheney_id === Cheney_currentId ? ' Cheney_convItem--active' : '');

      const Cheney_titleBtn = document.createElement('button');
      Cheney_titleBtn.type = 'button';
      Cheney_titleBtn.className = 'Cheney_convItem__title';
      Cheney_titleBtn.textContent = Cheney_item.Cheney_title || '新对话';
      Cheney_titleBtn.title = Cheney_item.Cheney_title || '新对话';
      Cheney_titleBtn.addEventListener('click', function () {
        Cheney_selectConversation(Cheney_item.Cheney_id);
      });

      const Cheney_meta = document.createElement('span');
      Cheney_meta.className = 'Cheney_convItem__meta';
      Cheney_meta.textContent =
        (Cheney_item.Cheney_message_count || 0) +
        ' 条 · ' +
        Cheney_api.Cheney_formatDate(Cheney_item.Cheney_update_time);

      const Cheney_actions = document.createElement('div');
      Cheney_actions.className = 'Cheney_convItem__actions';

      const Cheney_renameBtn = document.createElement('button');
      Cheney_renameBtn.type = 'button';
      Cheney_renameBtn.className = 'Cheney_convItem__action';
      Cheney_renameBtn.textContent = '重命名';
      Cheney_renameBtn.addEventListener('click', function (Cheney_event) {
        Cheney_event.stopPropagation();
        Cheney_renameConversation(Cheney_item);
      });

      const Cheney_deleteBtn = document.createElement('button');
      Cheney_deleteBtn.type = 'button';
      Cheney_deleteBtn.className = 'Cheney_convItem__action Cheney_convItem__action--danger';
      Cheney_deleteBtn.textContent = '删除';
      Cheney_deleteBtn.addEventListener('click', function (Cheney_event) {
        Cheney_event.stopPropagation();
        Cheney_deleteConversation(Cheney_item);
      });

      Cheney_actions.append(Cheney_renameBtn, Cheney_deleteBtn);
      Cheney_row.append(Cheney_titleBtn, Cheney_meta, Cheney_actions);
      Cheney_convListEl.appendChild(Cheney_row);
    });
  }

  async function Cheney_refreshConversationList() {
    try {
      const Cheney_result = await Cheney_api.Cheney_get('/api/ai/conversations');
      if (Cheney_result.code === 0) {
        Cheney_conversations = Cheney_result.data.Cheney_list || [];
        Cheney_renderConversations();
      }
    } catch (Cheney_error) {
      console.error('[Cheney] 会话列表刷新异常：', Cheney_error);
    }
  }

  async function Cheney_loadConversations() {
    try {
      const Cheney_result = await Cheney_api.Cheney_get('/api/ai/conversations');
      if (Cheney_result.code !== 0) {
        Cheney_convListEl.innerHTML = '<p class="Cheney_chatSide__empty">会话加载失败：' + Cheney_result.msg + '</p>';
        return;
      }

      Cheney_conversations = Cheney_result.data.Cheney_list || [];

      const Cheney_exists = function (Cheney_id) {
        return Cheney_conversations.some(function (Cheney_item) {
          return Cheney_item.Cheney_id === Cheney_id;
        });
      };

      let Cheney_targetId = null;
      const Cheney_storedId = Number(localStorage.getItem(Cheney_STORAGE_KEY));
      if (Cheney_currentId && Cheney_exists(Cheney_currentId)) {
        Cheney_targetId = Cheney_currentId;
      } else if (Cheney_storedId && Cheney_exists(Cheney_storedId)) {
        Cheney_targetId = Cheney_storedId;
      } else if (Cheney_conversations.length) {
        Cheney_targetId = Cheney_conversations[0].Cheney_id;
      }

      Cheney_currentId = Cheney_targetId;
      Cheney_renderConversations();

      if (Cheney_currentId) {
        await Cheney_loadMessages(Cheney_currentId);
      } else {
        Cheney_currentTitle = '';
        Cheney_convTitleEl.textContent = '未选择会话';
        Cheney_showEmpty(
          '<strong>开始和 AI 助手对话</strong>先点击左上角“新建”创建会话，或直接输入内容发送，系统会自动创建会话。'
        );
      }
    } catch (Cheney_error) {
      console.error('[Cheney] 会话列表请求异常：', Cheney_error);
      Cheney_convListEl.innerHTML = '<p class="Cheney_chatSide__empty">无法连接后端，请确认 8111 服务已启动。</p>';
    }
  }

  async function Cheney_loadMessages(Cheney_id) {
    try {
      const Cheney_result = await Cheney_api.Cheney_get('/api/ai/conversations/' + Cheney_id + '/messages');
      if (Cheney_result.code !== 0) {
        Cheney_showEmpty('历史消息加载失败：' + Cheney_result.msg);
        return;
      }

      const Cheney_conversation = Cheney_result.data.Cheney_conversation || {};
      Cheney_currentTitle = Cheney_conversation.Cheney_title || '新对话';
      Cheney_convTitleEl.textContent = Cheney_currentTitle;
      localStorage.setItem(Cheney_STORAGE_KEY, String(Cheney_id));

      const Cheney_messages = Cheney_result.data.Cheney_list || [];
      Cheney_clearList();

      if (!Cheney_messages.length) {
        Cheney_showEmpty(
          '<strong>这是一个新会话</strong>输入问题开始对话。历史消息会保存到服务端，刷新页面后可继续查看。'
        );
        Cheney_setStatus('', false);
        return;
      }

      Cheney_messages.forEach(function (Cheney_item) {
        const Cheney_node = Cheney_createMsg(Cheney_item.Cheney_role, Cheney_item.Cheney_content, false);
        Cheney_listEl.appendChild(Cheney_node);
      });
      Cheney_listEl.scrollTop = Cheney_listEl.scrollHeight;
      Cheney_setStatus('已加载 ' + Cheney_messages.length + ' 条历史消息。', false);
    } catch (Cheney_error) {
      console.error('[Cheney] 历史消息请求异常：', Cheney_error);
      Cheney_showEmpty('无法连接后端服务，请确认 http://localhost:8111 已启动。');
    }
  }

  async function Cheney_selectConversation(Cheney_id) {
    if (Cheney_pending || Cheney_id === Cheney_currentId) {
      return;
    }
    Cheney_currentId = Cheney_id;
    Cheney_renderConversations();
    await Cheney_loadMessages(Cheney_id);
  }

  async function Cheney_createConversation() {
    const Cheney_result = await Cheney_api.Cheney_post('/api/ai/conversations', {});
    if (Cheney_result.code !== 0) {
      Cheney_setStatus('新建会话失败：' + Cheney_result.msg, true);
      return null;
    }

    const Cheney_conversation = Cheney_result.data;
    Cheney_currentId = Cheney_conversation.Cheney_id;
    Cheney_currentTitle = Cheney_conversation.Cheney_title;
    Cheney_convTitleEl.textContent = Cheney_currentTitle;
    localStorage.setItem(Cheney_STORAGE_KEY, String(Cheney_currentId));
    Cheney_showEmpty('<strong>这是一个新会话</strong>输入问题开始对话。');
    Cheney_conversations.unshift({
      Cheney_id: Cheney_conversation.Cheney_id,
      Cheney_title: Cheney_conversation.Cheney_title,
      Cheney_message_count: 0,
      Cheney_update_time: Cheney_conversation.Cheney_update_time
    });
    Cheney_renderConversations();
    Cheney_inputEl.focus();
    return Cheney_conversation;
  }

  async function Cheney_renameConversation(Cheney_item) {
    const Cheney_newTitle = window.prompt('请输入新的会话名称：', Cheney_item.Cheney_title || '新对话');
    if (Cheney_newTitle === null) {
      return;
    }
    const Cheney_title = Cheney_newTitle.trim();
    if (!Cheney_title) {
      Cheney_setStatus('会话名称不能为空。', true);
      return;
    }

    const Cheney_result = await Cheney_api.Cheney_put('/api/ai/conversations/' + Cheney_item.Cheney_id, {
      Cheney_title: Cheney_title
    });
    if (Cheney_result.code !== 0) {
      Cheney_setStatus('重命名失败：' + Cheney_result.msg, true);
      return;
    }

    Cheney_setStatus('会话已重命名为《' + Cheney_title + '》。', false);
    if (Cheney_item.Cheney_id === Cheney_currentId) {
      Cheney_currentTitle = Cheney_title;
      Cheney_convTitleEl.textContent = Cheney_title;
    }
    await Cheney_loadConversations();
  }

  async function Cheney_deleteConversation(Cheney_item) {
    if (!window.confirm('确定删除会话《' + (Cheney_item.Cheney_title || '新对话') + '》及其全部消息吗？')) {
      return;
    }

    const Cheney_result = await Cheney_api.Cheney_delete('/api/ai/conversations/' + Cheney_item.Cheney_id);
    if (Cheney_result.code !== 0) {
      Cheney_setStatus('删除会话失败：' + Cheney_result.msg, true);
      return;
    }

    if (Cheney_item.Cheney_id === Cheney_currentId) {
      Cheney_currentId = null;
      localStorage.removeItem(Cheney_STORAGE_KEY);
    }
    Cheney_setStatus('会话已删除。', false);
    await Cheney_loadConversations();
  }

  /* ---------- 发送与中断 ---------- */
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

    if (!Cheney_currentId) {
      const Cheney_created = await Cheney_createConversation();
      if (!Cheney_created) {
        return;
      }
    }

    Cheney_appendMsg('user', Cheney_text, false);
    Cheney_inputEl.value = '';
    Cheney_resizeInput();
    Cheney_setPending(true);
    Cheney_setStatus('AI 正在思考，可点击“停止”中断本次请求……', false);
    const Cheney_typingEl = Cheney_appendTyping();
    Cheney_controller = new AbortController();

    try {
      const Cheney_result = await Cheney_api.Cheney_post(
        '/api/ai/chat',
        {
          Cheney_conversation_id: Cheney_currentId,
          Cheney_message: Cheney_text
        },
        { signal: Cheney_controller.signal }
      );
      Cheney_api.Cheney_showJson(Cheney_apiDataEl, Cheney_result);
      Cheney_typingEl.remove();

      if (Cheney_result.code !== 0) {
        console.error('[Cheney] AI 对话失败：' + Cheney_result.msg);
        Cheney_appendMsg('assistant', '回复失败：' + Cheney_result.msg, true);
        Cheney_setStatus('本次回复失败，可稍后重试。', true);
        return;
      }

      const Cheney_data = Cheney_result.data || {};
      Cheney_appendMsg('assistant', Cheney_data.Cheney_reply, false);

      if (Cheney_data.Cheney_conversation_title) {
        Cheney_currentTitle = Cheney_data.Cheney_conversation_title;
        Cheney_convTitleEl.textContent = Cheney_currentTitle;
      }

      const Cheney_usage = Cheney_data.Cheney_usage || {};
      Cheney_setStatus(
        '回复完成 · 模型 ' +
          (Cheney_data.Cheney_model || '未知') +
          ' · tokens ' +
          (Cheney_usage.total_tokens || '-') +
          (Cheney_data.Cheney_history_trimmed
            ? ' · 已按 Token 预算裁剪 ' + Cheney_data.Cheney_history_trimmed + ' 条历史'
            : ''),
        false
      );
      Cheney_inputEl.focus();
      await Cheney_refreshConversationList();
    } catch (Cheney_error) {
      Cheney_typingEl.remove();
      if (Cheney_error.name === 'AbortError') {
        console.log('[Cheney] 用户已停止生成');
        Cheney_setStatus('已停止生成，本次内容未保存。', false);
      } else {
        console.error('[Cheney] AI 对话请求异常：', Cheney_error);
        Cheney_appendMsg('assistant', '无法连接后端服务，请确认 http://localhost:8111 已启动。', true);
        Cheney_setStatus('请求异常：' + Cheney_error.message, true);
      }
    } finally {
      Cheney_controller = null;
      Cheney_setPending(false);
    }
  }

  function Cheney_stop() {
    if (!Cheney_pending || !Cheney_controller) {
      return;
    }
    Cheney_setStatus('正在停止……', false);
    Cheney_controller.abort();
  }

  /* ---------- 事件绑定 ---------- */
  Cheney_sendEl.addEventListener('click', Cheney_send);
  Cheney_stopEl.addEventListener('click', Cheney_stop);
  Cheney_newEl.addEventListener('click', function () {
    if (!Cheney_pending) {
      Cheney_createConversation();
    }
  });

  Cheney_inputEl.addEventListener('input', Cheney_resizeInput);
  Cheney_inputEl.addEventListener('keydown', function (Cheney_event) {
    if (Cheney_event.key === 'Enter' && !Cheney_event.shiftKey) {
      Cheney_event.preventDefault();
      Cheney_send();
    }
  });

  Cheney_loadConversations();
})();
