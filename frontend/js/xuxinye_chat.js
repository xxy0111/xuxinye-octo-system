/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * AI 对话页：会话持久化（列表/新建/重命名/删除/历史）、Markdown 渲染、可中断请求
 */
(function () {
  const xuxinye_STORAGE_KEY = 'xuxinye_activeConversation';

  const xuxinye_listEl = document.getElementById('xuxinye_chatList');
  const xuxinye_emptyEl = document.getElementById('xuxinye_chatEmpty');
  const xuxinye_inputEl = document.getElementById('xuxinye_chatInput');
  const xuxinye_sendEl = document.getElementById('xuxinye_chatSend');
  const xuxinye_stopEl = document.getElementById('xuxinye_chatStop');
  const xuxinye_statusEl = document.getElementById('xuxinye_chatStatus');
  const xuxinye_apiDataEl = document.getElementById('xuxinye_apiData');
  const xuxinye_convListEl = document.getElementById('xuxinye_conversationList');
  const xuxinye_convTitleEl = document.getElementById('xuxinye_conversationTitle');
  const xuxinye_newEl = document.getElementById('xuxinye_newConversation');

  let xuxinye_conversations = [];
  let xuxinye_currentId = null;
  let xuxinye_currentTitle = '';
  let xuxinye_pending = false;
  let xuxinye_controller = null;

  /* ---------- Markdown 渲染（先转义再解析，避免注入） ---------- */
  function xuxinye_escapeHtml(xuxinye_text) {
    return String(xuxinye_text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function xuxinye_renderInline(xuxinye_text) {
    return xuxinye_text
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      );
  }

  function xuxinye_renderTextBlock(xuxinye_text) {
    const xuxinye_lines = xuxinye_text.split('\n');
    let xuxinye_html = '';
    let xuxinye_para = [];
    let xuxinye_listTag = null;

    function xuxinye_flushPara() {
      if (xuxinye_para.length) {
        xuxinye_html += '<p>' + xuxinye_para.map(xuxinye_renderInline).join('<br>') + '</p>';
        xuxinye_para = [];
      }
    }

    function xuxinye_closeList() {
      if (xuxinye_listTag) {
        xuxinye_html += '</' + xuxinye_listTag + '>';
        xuxinye_listTag = null;
      }
    }

    xuxinye_lines.forEach(function (xuxinye_line) {
      const xuxinye_trimmed = xuxinye_line.trim();
      if (!xuxinye_trimmed) {
        xuxinye_flushPara();
        xuxinye_closeList();
        return;
      }

      let xuxinye_match = xuxinye_trimmed.match(/^(#{1,4})\s+(.*)$/);
      if (xuxinye_match) {
        xuxinye_flushPara();
        xuxinye_closeList();
        const xuxinye_level = xuxinye_match[1].length;
        xuxinye_html +=
          '<h' + xuxinye_level + '>' + xuxinye_renderInline(xuxinye_match[2]) + '</h' + xuxinye_level + '>';
        return;
      }

      xuxinye_match = xuxinye_trimmed.match(/^[-*]\s+(.*)$/);
      if (xuxinye_match) {
        xuxinye_flushPara();
        if (xuxinye_listTag !== 'ul') {
          xuxinye_closeList();
          xuxinye_html += '<ul>';
          xuxinye_listTag = 'ul';
        }
        xuxinye_html += '<li>' + xuxinye_renderInline(xuxinye_match[1]) + '</li>';
        return;
      }

      xuxinye_match = xuxinye_trimmed.match(/^\d+[.)]\s+(.*)$/);
      if (xuxinye_match) {
        xuxinye_flushPara();
        if (xuxinye_listTag !== 'ol') {
          xuxinye_closeList();
          xuxinye_html += '<ol>';
          xuxinye_listTag = 'ol';
        }
        xuxinye_html += '<li>' + xuxinye_renderInline(xuxinye_match[1]) + '</li>';
        return;
      }

      xuxinye_match = xuxinye_trimmed.match(/^&gt;\s?(.*)$/);
      if (xuxinye_match) {
        xuxinye_flushPara();
        xuxinye_closeList();
        xuxinye_html += '<blockquote>' + xuxinye_renderInline(xuxinye_match[1]) + '</blockquote>';
        return;
      }

      xuxinye_closeList();
      xuxinye_para.push(xuxinye_trimmed);
    });

    xuxinye_flushPara();
    xuxinye_closeList();
    return xuxinye_html;
  }

  function xuxinye_renderMarkdown(xuxinye_text) {
    const xuxinye_escaped = xuxinye_escapeHtml(xuxinye_text);
    const xuxinye_codePattern = /```([A-Za-z0-9+#.-]*)\n?([\s\S]*?)```/g;
    let xuxinye_html = '';
    let xuxinye_last = 0;
    let xuxinye_match = xuxinye_codePattern.exec(xuxinye_escaped);

    while (xuxinye_match) {
      xuxinye_html += xuxinye_renderTextBlock(xuxinye_escaped.slice(xuxinye_last, xuxinye_match.index));
      const xuxinye_lang = xuxinye_match[1] ? ' data-lang="' + xuxinye_match[1] + '"' : '';
      xuxinye_html +=
        '<pre class="xuxinye_mdCode"><code' +
        xuxinye_lang +
        '>' +
        xuxinye_match[2].replace(/\n$/, '') +
        '</code></pre>';
      xuxinye_last = xuxinye_codePattern.lastIndex;
      xuxinye_match = xuxinye_codePattern.exec(xuxinye_escaped);
    }

    xuxinye_html += xuxinye_renderTextBlock(xuxinye_escaped.slice(xuxinye_last));
    return xuxinye_html || '<p>' + xuxinye_escaped + '</p>';
  }

  /* ---------- 消息渲染 ---------- */
  function xuxinye_createMsg(xuxinye_role, xuxinye_content, xuxinye_isError) {
    const xuxinye_wrap = document.createElement('div');
    xuxinye_wrap.className =
      'xuxinye_chatMsg xuxinye_chatMsg--' +
      (xuxinye_role === 'user' ? 'user' : 'assistant') +
      (xuxinye_isError ? ' xuxinye_chatMsg--error' : '');

    const xuxinye_roleEl = document.createElement('span');
    xuxinye_roleEl.className = 'xuxinye_chatMsg__role';
    xuxinye_roleEl.textContent = xuxinye_role === 'user' ? '我' : 'AI 助手';

    const xuxinye_bubble = document.createElement('div');
    xuxinye_bubble.className = 'xuxinye_chatMsg__bubble';
    if (xuxinye_role === 'assistant' && !xuxinye_isError) {
      xuxinye_bubble.classList.add('xuxinye_chatMsg__bubble--markdown');
      xuxinye_bubble.innerHTML = xuxinye_renderMarkdown(xuxinye_content);
    } else {
      xuxinye_bubble.textContent = xuxinye_content;
    }

    xuxinye_wrap.append(xuxinye_roleEl, xuxinye_bubble);
    return xuxinye_wrap;
  }

  function xuxinye_clearList() {
    xuxinye_listEl.innerHTML = '';
  }

  function xuxinye_showEmpty(xuxinye_html) {
    xuxinye_clearList();
    const xuxinye_empty = document.createElement('p');
    xuxinye_empty.className = 'xuxinye_chatEmpty';
    xuxinye_empty.id = 'xuxinye_chatEmpty';
    xuxinye_empty.innerHTML = xuxinye_html;
    xuxinye_listEl.appendChild(xuxinye_empty);
  }

  function xuxinye_appendMsg(xuxinye_role, xuxinye_content, xuxinye_isError) {
    const xuxinye_emptyNode = document.getElementById('xuxinye_chatEmpty');
    if (xuxinye_emptyNode) {
      xuxinye_emptyNode.remove();
    }
    const xuxinye_node = xuxinye_createMsg(xuxinye_role, xuxinye_content, xuxinye_isError);
    xuxinye_listEl.appendChild(xuxinye_node);
    xuxinye_listEl.scrollTop = xuxinye_listEl.scrollHeight;
    return xuxinye_node;
  }

  function xuxinye_appendTyping() {
    const xuxinye_wrap = document.createElement('div');
    xuxinye_wrap.className = 'xuxinye_chatMsg xuxinye_chatMsg--assistant';

    const xuxinye_roleEl = document.createElement('span');
    xuxinye_roleEl.className = 'xuxinye_chatMsg__role';
    xuxinye_roleEl.textContent = 'AI 助手';

    const xuxinye_bubble = document.createElement('div');
    xuxinye_bubble.className = 'xuxinye_chatMsg__bubble';
    xuxinye_bubble.innerHTML = '<span class="xuxinye_typing"><i></i><i></i><i></i></span>';

    xuxinye_wrap.append(xuxinye_roleEl, xuxinye_bubble);
    xuxinye_listEl.appendChild(xuxinye_wrap);
    xuxinye_listEl.scrollTop = xuxinye_listEl.scrollHeight;
    return xuxinye_wrap;
  }

  function xuxinye_setStatus(xuxinye_text, xuxinye_isError) {
    xuxinye_statusEl.textContent = xuxinye_text || '';
    xuxinye_statusEl.className = 'xuxinye_chatStatus' + (xuxinye_isError ? ' xuxinye_chatStatus--error' : '');
  }

  function xuxinye_setPending(xuxinye_flag) {
    xuxinye_pending = xuxinye_flag;
    xuxinye_sendEl.disabled = xuxinye_flag;
    xuxinye_sendEl.hidden = xuxinye_flag;
    xuxinye_stopEl.hidden = !xuxinye_flag;
    xuxinye_newEl.disabled = xuxinye_flag;
    xuxinye_sendEl.textContent = '发送';
  }

  function xuxinye_resizeInput() {
    xuxinye_inputEl.style.height = 'auto';
    xuxinye_inputEl.style.height = Math.min(xuxinye_inputEl.scrollHeight, 140) + 'px';
  }

  /* ---------- 会话列表 ---------- */
  function xuxinye_renderConversations() {
    xuxinye_convListEl.innerHTML = '';
    if (!xuxinye_conversations.length) {
      const xuxinye_empty = document.createElement('p');
      xuxinye_empty.className = 'xuxinye_chatSide__empty';
      xuxinye_empty.textContent = '暂无会话，点击“新建”开始。';
      xuxinye_convListEl.appendChild(xuxinye_empty);
      return;
    }

    xuxinye_conversations.forEach(function (xuxinye_item) {
      const xuxinye_row = document.createElement('div');
      xuxinye_row.className =
        'xuxinye_convItem' + (xuxinye_item.xuxinye_id === xuxinye_currentId ? ' xuxinye_convItem--active' : '');

      const xuxinye_titleBtn = document.createElement('button');
      xuxinye_titleBtn.type = 'button';
      xuxinye_titleBtn.className = 'xuxinye_convItem__title';
      xuxinye_titleBtn.textContent = xuxinye_item.xuxinye_title || '新对话';
      xuxinye_titleBtn.title = xuxinye_item.xuxinye_title || '新对话';
      xuxinye_titleBtn.addEventListener('click', function () {
        xuxinye_selectConversation(xuxinye_item.xuxinye_id);
      });

      const xuxinye_meta = document.createElement('span');
      xuxinye_meta.className = 'xuxinye_convItem__meta';
      xuxinye_meta.textContent =
        (xuxinye_item.xuxinye_message_count || 0) +
        ' 条 · ' +
        xuxinye_api.xuxinye_formatDate(xuxinye_item.xuxinye_update_time);

      const xuxinye_actions = document.createElement('div');
      xuxinye_actions.className = 'xuxinye_convItem__actions';

      const xuxinye_renameBtn = document.createElement('button');
      xuxinye_renameBtn.type = 'button';
      xuxinye_renameBtn.className = 'xuxinye_convItem__action';
      xuxinye_renameBtn.textContent = '重命名';
      xuxinye_renameBtn.addEventListener('click', function (xuxinye_event) {
        xuxinye_event.stopPropagation();
        xuxinye_renameConversation(xuxinye_item);
      });

      const xuxinye_deleteBtn = document.createElement('button');
      xuxinye_deleteBtn.type = 'button';
      xuxinye_deleteBtn.className = 'xuxinye_convItem__action xuxinye_convItem__action--danger';
      xuxinye_deleteBtn.textContent = '删除';
      xuxinye_deleteBtn.addEventListener('click', function (xuxinye_event) {
        xuxinye_event.stopPropagation();
        xuxinye_deleteConversation(xuxinye_item);
      });

      xuxinye_actions.append(xuxinye_renameBtn, xuxinye_deleteBtn);
      xuxinye_row.append(xuxinye_titleBtn, xuxinye_meta, xuxinye_actions);
      xuxinye_convListEl.appendChild(xuxinye_row);
    });
  }

  async function xuxinye_refreshConversationList() {
    try {
      const xuxinye_result = await xuxinye_api.xuxinye_get('/api/ai/conversations');
      if (xuxinye_result.code === 0) {
        xuxinye_conversations = xuxinye_result.data.xuxinye_list || [];
        xuxinye_renderConversations();
      }
    } catch (xuxinye_error) {
      console.error('[xuxinye] 会话列表刷新异常：', xuxinye_error);
    }
  }

  async function xuxinye_loadConversations() {
    try {
      const xuxinye_result = await xuxinye_api.xuxinye_get('/api/ai/conversations');
      if (xuxinye_result.code !== 0) {
        xuxinye_convListEl.innerHTML = '<p class="xuxinye_chatSide__empty">会话加载失败：' + xuxinye_result.msg + '</p>';
        return;
      }

      xuxinye_conversations = xuxinye_result.data.xuxinye_list || [];

      const xuxinye_exists = function (xuxinye_id) {
        return xuxinye_conversations.some(function (xuxinye_item) {
          return xuxinye_item.xuxinye_id === xuxinye_id;
        });
      };

      let xuxinye_targetId = null;
      const xuxinye_storedId = Number(localStorage.getItem(xuxinye_STORAGE_KEY));
      if (xuxinye_currentId && xuxinye_exists(xuxinye_currentId)) {
        xuxinye_targetId = xuxinye_currentId;
      } else if (xuxinye_storedId && xuxinye_exists(xuxinye_storedId)) {
        xuxinye_targetId = xuxinye_storedId;
      } else if (xuxinye_conversations.length) {
        xuxinye_targetId = xuxinye_conversations[0].xuxinye_id;
      }

      xuxinye_currentId = xuxinye_targetId;
      xuxinye_renderConversations();

      if (xuxinye_currentId) {
        await xuxinye_loadMessages(xuxinye_currentId);
      } else {
        xuxinye_currentTitle = '';
        xuxinye_convTitleEl.textContent = '未选择会话';
        xuxinye_showEmpty(
          '<strong>开始和 AI 助手对话</strong>先点击左上角“新建”创建会话，或直接输入内容发送，系统会自动创建会话。'
        );
      }
    } catch (xuxinye_error) {
      console.error('[xuxinye] 会话列表请求异常：', xuxinye_error);
      xuxinye_convListEl.innerHTML = '<p class="xuxinye_chatSide__empty">无法连接后端，请确认 8111 服务已启动。</p>';
    }
  }

  async function xuxinye_loadMessages(xuxinye_id) {
    try {
      const xuxinye_result = await xuxinye_api.xuxinye_get('/api/ai/conversations/' + xuxinye_id + '/messages');
      if (xuxinye_result.code !== 0) {
        xuxinye_showEmpty('历史消息加载失败：' + xuxinye_result.msg);
        return;
      }

      const xuxinye_conversation = xuxinye_result.data.xuxinye_conversation || {};
      xuxinye_currentTitle = xuxinye_conversation.xuxinye_title || '新对话';
      xuxinye_convTitleEl.textContent = xuxinye_currentTitle;
      localStorage.setItem(xuxinye_STORAGE_KEY, String(xuxinye_id));

      const xuxinye_messages = xuxinye_result.data.xuxinye_list || [];
      xuxinye_clearList();

      if (!xuxinye_messages.length) {
        xuxinye_showEmpty(
          '<strong>这是一个新会话</strong>输入问题开始对话。历史消息会保存到服务端，刷新页面后可继续查看。'
        );
        xuxinye_setStatus('', false);
        return;
      }

      xuxinye_messages.forEach(function (xuxinye_item) {
        const xuxinye_node = xuxinye_createMsg(xuxinye_item.xuxinye_role, xuxinye_item.xuxinye_content, false);
        xuxinye_listEl.appendChild(xuxinye_node);
      });
      xuxinye_listEl.scrollTop = xuxinye_listEl.scrollHeight;
      xuxinye_setStatus('已加载 ' + xuxinye_messages.length + ' 条历史消息。', false);
    } catch (xuxinye_error) {
      console.error('[xuxinye] 历史消息请求异常：', xuxinye_error);
      xuxinye_showEmpty('无法连接后端服务，请确认 http://localhost:8111 已启动。');
    }
  }

  async function xuxinye_selectConversation(xuxinye_id) {
    if (xuxinye_pending || xuxinye_id === xuxinye_currentId) {
      return;
    }
    xuxinye_currentId = xuxinye_id;
    xuxinye_renderConversations();
    await xuxinye_loadMessages(xuxinye_id);
  }

  async function xuxinye_createConversation() {
    const xuxinye_result = await xuxinye_api.xuxinye_post('/api/ai/conversations', {});
    if (xuxinye_result.code !== 0) {
      xuxinye_setStatus('新建会话失败：' + xuxinye_result.msg, true);
      return null;
    }

    const xuxinye_conversation = xuxinye_result.data;
    xuxinye_currentId = xuxinye_conversation.xuxinye_id;
    xuxinye_currentTitle = xuxinye_conversation.xuxinye_title;
    xuxinye_convTitleEl.textContent = xuxinye_currentTitle;
    localStorage.setItem(xuxinye_STORAGE_KEY, String(xuxinye_currentId));
    xuxinye_showEmpty('<strong>这是一个新会话</strong>输入问题开始对话。');
    xuxinye_conversations.unshift({
      xuxinye_id: xuxinye_conversation.xuxinye_id,
      xuxinye_title: xuxinye_conversation.xuxinye_title,
      xuxinye_message_count: 0,
      xuxinye_update_time: xuxinye_conversation.xuxinye_update_time
    });
    xuxinye_renderConversations();
    xuxinye_inputEl.focus();
    return xuxinye_conversation;
  }

  async function xuxinye_renameConversation(xuxinye_item) {
    const xuxinye_newTitle = window.prompt('请输入新的会话名称：', xuxinye_item.xuxinye_title || '新对话');
    if (xuxinye_newTitle === null) {
      return;
    }
    const xuxinye_title = xuxinye_newTitle.trim();
    if (!xuxinye_title) {
      xuxinye_setStatus('会话名称不能为空。', true);
      return;
    }

    const xuxinye_result = await xuxinye_api.xuxinye_put('/api/ai/conversations/' + xuxinye_item.xuxinye_id, {
      xuxinye_title: xuxinye_title
    });
    if (xuxinye_result.code !== 0) {
      xuxinye_setStatus('重命名失败：' + xuxinye_result.msg, true);
      return;
    }

    xuxinye_setStatus('会话已重命名为《' + xuxinye_title + '》。', false);
    if (xuxinye_item.xuxinye_id === xuxinye_currentId) {
      xuxinye_currentTitle = xuxinye_title;
      xuxinye_convTitleEl.textContent = xuxinye_title;
    }
    await xuxinye_loadConversations();
  }

  async function xuxinye_deleteConversation(xuxinye_item) {
    if (!window.confirm('确定删除会话《' + (xuxinye_item.xuxinye_title || '新对话') + '》及其全部消息吗？')) {
      return;
    }

    const xuxinye_result = await xuxinye_api.xuxinye_delete('/api/ai/conversations/' + xuxinye_item.xuxinye_id);
    if (xuxinye_result.code !== 0) {
      xuxinye_setStatus('删除会话失败：' + xuxinye_result.msg, true);
      return;
    }

    if (xuxinye_item.xuxinye_id === xuxinye_currentId) {
      xuxinye_currentId = null;
      localStorage.removeItem(xuxinye_STORAGE_KEY);
    }
    xuxinye_setStatus('会话已删除。', false);
    await xuxinye_loadConversations();
  }

  /* ---------- 发送与中断 ---------- */
  async function xuxinye_send() {
    if (xuxinye_pending) {
      return;
    }

    const xuxinye_text = xuxinye_inputEl.value.trim();
    if (!xuxinye_text) {
      xuxinye_setStatus('请输入内容后再发送。', true);
      xuxinye_inputEl.focus();
      return;
    }

    if (!xuxinye_currentId) {
      const xuxinye_created = await xuxinye_createConversation();
      if (!xuxinye_created) {
        return;
      }
    }

    xuxinye_appendMsg('user', xuxinye_text, false);
    xuxinye_inputEl.value = '';
    xuxinye_resizeInput();
    xuxinye_setPending(true);
    xuxinye_setStatus('AI 正在思考，可点击“停止”中断本次请求……', false);
    const xuxinye_typingEl = xuxinye_appendTyping();
    xuxinye_controller = new AbortController();

    try {
      const xuxinye_result = await xuxinye_api.xuxinye_post(
        '/api/ai/chat',
        {
          xuxinye_conversation_id: xuxinye_currentId,
          xuxinye_message: xuxinye_text
        },
        { signal: xuxinye_controller.signal }
      );
      xuxinye_api.xuxinye_showJson(xuxinye_apiDataEl, xuxinye_result);
      xuxinye_typingEl.remove();

      if (xuxinye_result.code !== 0) {
        console.error('[xuxinye] AI 对话失败：' + xuxinye_result.msg);
        xuxinye_appendMsg('assistant', '回复失败：' + xuxinye_result.msg, true);
        xuxinye_setStatus('本次回复失败，可稍后重试。', true);
        return;
      }

      const xuxinye_data = xuxinye_result.data || {};
      xuxinye_appendMsg('assistant', xuxinye_data.xuxinye_reply, false);

      if (xuxinye_data.xuxinye_conversation_title) {
        xuxinye_currentTitle = xuxinye_data.xuxinye_conversation_title;
        xuxinye_convTitleEl.textContent = xuxinye_currentTitle;
      }

      const xuxinye_usage = xuxinye_data.xuxinye_usage || {};
      xuxinye_setStatus(
        '回复完成 · 模型 ' +
          (xuxinye_data.xuxinye_model || '未知') +
          ' · tokens ' +
          (xuxinye_usage.total_tokens || '-') +
          (xuxinye_data.xuxinye_history_trimmed
            ? ' · 已按 Token 预算裁剪 ' + xuxinye_data.xuxinye_history_trimmed + ' 条历史'
            : ''),
        false
      );
      xuxinye_inputEl.focus();
      await xuxinye_refreshConversationList();
    } catch (xuxinye_error) {
      xuxinye_typingEl.remove();
      if (xuxinye_error.name === 'AbortError') {
        console.log('[xuxinye] 用户已停止生成');
        xuxinye_setStatus('已停止生成，本次内容未保存。', false);
      } else {
        console.error('[xuxinye] AI 对话请求异常：', xuxinye_error);
        xuxinye_appendMsg('assistant', '无法连接后端服务，请确认 http://localhost:8111 已启动。', true);
        xuxinye_setStatus('请求异常：' + xuxinye_error.message, true);
      }
    } finally {
      xuxinye_controller = null;
      xuxinye_setPending(false);
    }
  }

  function xuxinye_stop() {
    if (!xuxinye_pending || !xuxinye_controller) {
      return;
    }
    xuxinye_setStatus('正在停止……', false);
    xuxinye_controller.abort();
  }

  /* ---------- 事件绑定 ---------- */
  xuxinye_sendEl.addEventListener('click', xuxinye_send);
  xuxinye_stopEl.addEventListener('click', xuxinye_stop);
  xuxinye_newEl.addEventListener('click', function () {
    if (!xuxinye_pending) {
      xuxinye_createConversation();
    }
  });

  xuxinye_inputEl.addEventListener('input', xuxinye_resizeInput);
  xuxinye_inputEl.addEventListener('keydown', function (xuxinye_event) {
    if (xuxinye_event.key === 'Enter' && !xuxinye_event.shiftKey) {
      xuxinye_event.preventDefault();
      xuxinye_send();
    }
  });

  xuxinye_loadConversations();
})();
