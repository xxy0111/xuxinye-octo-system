/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * RAG 知识库页：上传、文件列表与删除、片段查看、检索问答与来源展示
 */
(function () {
  const Cheney_ALLOWED_EXT = ['.doc', '.docx', '.ppt', '.pptx', '.pdf', '.txt'];
  const Cheney_MAX_SIZE = 25 * 1024 * 1024;

  const Cheney_uploadZoneEl = document.getElementById('Cheney_uploadZone');
  const Cheney_fileInputEl = document.getElementById('Cheney_kbFileInput');
  const Cheney_uploadStatusEl = document.getElementById('Cheney_uploadStatus');
  const Cheney_uploadProgressEl = document.getElementById('Cheney_uploadProgress');
  const Cheney_uploadProgressBarEl = document.getElementById('Cheney_uploadProgressBar');
  const Cheney_fileBodyEl = document.getElementById('Cheney_kbFileBody');
  const Cheney_fileSummaryEl = document.getElementById('Cheney_kbFileSummary');
  const Cheney_refreshEl = document.getElementById('Cheney_kbRefresh');
  const Cheney_questionEl = document.getElementById('Cheney_kbQuestion');
  const Cheney_askBtnEl = document.getElementById('Cheney_kbAskBtn');
  const Cheney_askStatusEl = document.getElementById('Cheney_kbAskStatus');
  const Cheney_answerEl = document.getElementById('Cheney_kbAnswer');
  const Cheney_sourcesEl = document.getElementById('Cheney_kbSources');
  const Cheney_apiDataEl = document.getElementById('Cheney_kbApiData');
  const Cheney_modalEl = document.getElementById('Cheney_chunkModal');
  const Cheney_chunkTitleEl = document.getElementById('Cheney_chunkTitle');
  const Cheney_chunkBodyEl = document.getElementById('Cheney_chunkBody');
  const Cheney_chunkCloseEl = document.getElementById('Cheney_chunkClose');

  let Cheney_asking = false;
  let Cheney_uploading = false;

  function Cheney_formatSize(Cheney_size) {
    if (Cheney_size >= 1024 * 1024) {
      return (Cheney_size / 1024 / 1024).toFixed(1) + ' MB';
    }
    return Math.max(1, Math.round(Cheney_size / 1024)) + ' KB';
  }

  function Cheney_setUploadStatus(Cheney_text, Cheney_type) {
    Cheney_uploadStatusEl.textContent = Cheney_text;
    Cheney_uploadStatusEl.className =
      'Cheney_kbStatus' + (Cheney_type ? ' Cheney_kbStatus--' + Cheney_type : '');
  }

  // 上传进度条：0-100
  function Cheney_setUploadProgress(Cheney_percent) {
    Cheney_uploadProgressEl.hidden = false;
    Cheney_uploadProgressBarEl.style.width = Math.max(0, Math.min(100, Cheney_percent)) + '%';
  }

  function Cheney_setAskStatus(Cheney_text, Cheney_type) {
    Cheney_askStatusEl.textContent = Cheney_text;
    Cheney_askStatusEl.className =
      'Cheney_kbStatus' + (Cheney_type ? ' Cheney_kbStatus--' + Cheney_type : '');
  }

  function Cheney_statusText(Cheney_status) {
    if (Cheney_status === 'ready') {
      return '已入库';
    }
    if (Cheney_status === 'failed') {
      return '解析失败';
    }
    return '解析中';
  }

  // 渲染文件列表
  async function Cheney_loadFiles() {
    try {
      const Cheney_result = await Cheney_api.Cheney_get('/api/kb/files');
      if (Cheney_result.code !== 0) {
        console.error('[Cheney] 知识库列表失败：' + Cheney_result.msg);
        Cheney_fileSummaryEl.textContent = '列表加载失败：' + Cheney_result.msg;
        return;
      }

      const Cheney_list = Cheney_result.data.Cheney_list || [];
      const Cheney_chunkTotal = Cheney_list.reduce(function (Cheney_sum, Cheney_item) {
        return Cheney_sum + (Cheney_item.Cheney_chunk_count || 0);
      }, 0);
      Cheney_fileSummaryEl.textContent =
        '共 ' + Cheney_list.length + ' 个文件，' + Cheney_chunkTotal + ' 个文本片段';

      Cheney_fileBodyEl.innerHTML = '';
      if (!Cheney_list.length) {
        const Cheney_emptyRow = document.createElement('tr');
        const Cheney_emptyCell = document.createElement('td');
        Cheney_emptyCell.colSpan = 5;
        Cheney_emptyCell.className = 'Cheney_kbEmpty';
        Cheney_emptyCell.textContent = '知识库为空，请先上传文件。';
        Cheney_emptyRow.appendChild(Cheney_emptyCell);
        Cheney_fileBodyEl.appendChild(Cheney_emptyRow);
        return;
      }

      Cheney_list.forEach(function (Cheney_item) {
        const Cheney_row = document.createElement('tr');

        const Cheney_nameCell = document.createElement('td');
        Cheney_nameCell.className = 'Cheney_kbTable__name';
        Cheney_nameCell.textContent = Cheney_item.Cheney_file_name;
        Cheney_nameCell.title =
          Cheney_item.Cheney_file_name +
          '（' +
          Cheney_formatSize(Cheney_item.Cheney_file_size) +
          '）' +
          (Cheney_item.Cheney_error_msg ? '\n备注：' + Cheney_item.Cheney_error_msg : '');

        const Cheney_extCell = document.createElement('td');
        Cheney_extCell.textContent = Cheney_item.Cheney_file_ext.replace('.', '').toUpperCase();

        const Cheney_chunkCell = document.createElement('td');
        Cheney_chunkCell.textContent = Cheney_item.Cheney_chunk_count;

        const Cheney_statusCell = document.createElement('td');
        const Cheney_badge = document.createElement('span');
        Cheney_badge.className = 'Cheney_kbBadge Cheney_kbBadge--' + Cheney_item.Cheney_status;
        Cheney_badge.textContent = Cheney_statusText(Cheney_item.Cheney_status);
        if (Cheney_item.Cheney_error_msg) {
          Cheney_badge.title = Cheney_item.Cheney_error_msg;
        }
        Cheney_statusCell.appendChild(Cheney_badge);

        const Cheney_actionCell = document.createElement('td');
        const Cheney_viewBtn = document.createElement('button');
        Cheney_viewBtn.type = 'button';
        Cheney_viewBtn.className = 'Cheney_kbAction';
        Cheney_viewBtn.textContent = '查看片段';
        Cheney_viewBtn.addEventListener('click', function () {
          Cheney_openChunks(Cheney_item.Cheney_id, Cheney_item.Cheney_file_name);
        });

        const Cheney_deleteBtn = document.createElement('button');
        Cheney_deleteBtn.type = 'button';
        Cheney_deleteBtn.className = 'Cheney_kbAction Cheney_kbAction--danger';
        Cheney_deleteBtn.textContent = '删除';
        Cheney_deleteBtn.addEventListener('click', function () {
          Cheney_deleteFile(Cheney_item);
        });

        Cheney_actionCell.append(Cheney_viewBtn, Cheney_deleteBtn);
        Cheney_row.append(Cheney_nameCell, Cheney_extCell, Cheney_chunkCell, Cheney_statusCell, Cheney_actionCell);
        Cheney_fileBodyEl.appendChild(Cheney_row);
      });
    } catch (Cheney_error) {
      console.error('[Cheney] 知识库列表请求异常：', Cheney_error);
      Cheney_fileSummaryEl.textContent = '无法连接后端接口，请确认 8111 服务已启动。';
    }
  }

  // 上传文件
  async function Cheney_uploadFile(Cheney_file) {
    if (Cheney_uploading || !Cheney_file) {
      return;
    }

    const Cheney_ext = Cheney_file.name.slice(Cheney_file.name.lastIndexOf('.')).toLowerCase();
    if (Cheney_ALLOWED_EXT.indexOf(Cheney_ext) === -1) {
      Cheney_setUploadStatus('不支持的文件类型：仅支持 doc、docx、ppt、pptx、pdf、txt', 'error');
      return;
    }
    if (Cheney_file.size > Cheney_MAX_SIZE) {
      Cheney_setUploadStatus('文件超过 25MB 限制', 'error');
      return;
    }

    Cheney_uploading = true;
    Cheney_setUploadProgress(0);
    Cheney_setUploadStatus('正在上传《' + Cheney_file.name + '》 0%');

    const Cheney_form = new FormData();
    Cheney_form.append('Cheney_file', Cheney_file);

    try {
      // 使用 XHR 才能拿到上传进度事件
      const Cheney_result = await new Promise(function (Cheney_resolve, Cheney_reject) {
        const Cheney_xhr = new XMLHttpRequest();
        Cheney_xhr.open('POST', '/api/kb/upload');

        Cheney_xhr.upload.onprogress = function (Cheney_event) {
          if (!Cheney_event.lengthComputable) {
            return;
          }
          const Cheney_percent = Math.round((Cheney_event.loaded / Cheney_event.total) * 100);
          Cheney_setUploadProgress(Cheney_percent);
          Cheney_setUploadStatus('正在上传《' + Cheney_file.name + '》 ' + Cheney_percent + '%');
        };

        Cheney_xhr.upload.onload = function () {
          Cheney_setUploadProgress(100);
          Cheney_setUploadStatus('上传完成，服务端正在解析文本并切分片段，请稍候……');
        };

        Cheney_xhr.onload = function () {
          try {
            Cheney_resolve(JSON.parse(Cheney_xhr.responseText));
          } catch (Cheney_parseError) {
            Cheney_reject(new Error('接口返回格式异常'));
          }
        };

        Cheney_xhr.onerror = function () {
          Cheney_reject(new Error('网络错误'));
        };

        Cheney_xhr.send(Cheney_form);
      });

      console.log('[Cheney] 知识库上传接口返回：', Cheney_result);

      if (Cheney_result.code !== 0) {
        console.error('[Cheney] 上传解析失败：' + Cheney_result.msg);
        Cheney_setUploadStatus(Cheney_result.msg, 'error');
      } else {
        const Cheney_data = Cheney_result.data || {};
        Cheney_setUploadProgress(100);
        Cheney_setUploadStatus(
          '《' +
            Cheney_data.Cheney_file_name +
            '》解析完成，共 ' +
            Cheney_data.Cheney_chunk_count +
            ' 个片段' +
            (Cheney_data.Cheney_warning ? '（' + Cheney_data.Cheney_warning + '）' : ''),
          'ok'
        );
      }
      await Cheney_loadFiles();
    } catch (Cheney_error) {
      console.error('[Cheney] 知识库上传异常：', Cheney_error);
      Cheney_setUploadStatus('上传失败：' + Cheney_error.message, 'error');
    } finally {
      Cheney_uploading = false;
      Cheney_fileInputEl.value = '';
    }
  }

  // 删除文件
  async function Cheney_deleteFile(Cheney_item) {
    if (!window.confirm('确定删除《' + Cheney_item.Cheney_file_name + '》及其全部片段吗？')) {
      return;
    }
    try {
      const Cheney_response = await fetch('/api/kb/files/' + Cheney_item.Cheney_id, { method: 'DELETE' });
      const Cheney_result = await Cheney_response.json();
      console.log('[Cheney] 知识库删除接口返回：', Cheney_result);
      if (Cheney_result.code !== 0) {
        Cheney_setUploadStatus('删除失败：' + Cheney_result.msg, 'error');
      } else {
        Cheney_setUploadStatus('已删除《' + Cheney_item.Cheney_file_name + '》', 'ok');
      }
      await Cheney_loadFiles();
    } catch (Cheney_error) {
      console.error('[Cheney] 知识库删除异常：', Cheney_error);
      Cheney_setUploadStatus('删除失败：无法连接后端服务', 'error');
    }
  }

  // 查看片段
  async function Cheney_openChunks(Cheney_fileId, Cheney_fileName) {
    Cheney_chunkTitleEl.textContent = Cheney_fileName + ' · 文本片段';
    Cheney_chunkBodyEl.textContent = '正在加载片段……';
    Cheney_modalEl.classList.add('Cheney_modal--open');

    try {
      const Cheney_response = await fetch('/api/kb/files/' + Cheney_fileId + '/chunks');
      const Cheney_result = await Cheney_response.json();
      console.log('[Cheney] 知识库片段接口返回：', Cheney_result);
      if (Cheney_result.code !== 0) {
        Cheney_chunkBodyEl.textContent = '加载失败：' + Cheney_result.msg;
        return;
      }

      const Cheney_chunks = Cheney_result.data.Cheney_list || [];
      Cheney_chunkBodyEl.innerHTML = '';
      if (!Cheney_chunks.length) {
        Cheney_chunkBodyEl.textContent = '该文件暂无片段。';
        return;
      }

      Cheney_chunks.forEach(function (Cheney_chunk) {
        const Cheney_block = document.createElement('div');
        Cheney_block.className = 'Cheney_kbChunk';

        const Cheney_meta = document.createElement('span');
        Cheney_meta.className = 'Cheney_kbChunk__meta';
        Cheney_meta.textContent =
          '片段 ' + (Cheney_chunk.Cheney_chunk_index + 1) + ' · ' + Cheney_chunk.Cheney_char_count + ' 字';

        Cheney_block.append(Cheney_meta, document.createTextNode(Cheney_chunk.Cheney_content));
        Cheney_chunkBodyEl.appendChild(Cheney_block);
      });
    } catch (Cheney_error) {
      console.error('[Cheney] 知识库片段请求异常：', Cheney_error);
      Cheney_chunkBodyEl.textContent = '加载失败：无法连接后端服务';
    }
  }

  // 渲染来源卡片
  function Cheney_renderSources(Cheney_sources) {
    Cheney_sourcesEl.innerHTML = '';
    if (!Cheney_sources || !Cheney_sources.length) {
      return;
    }

    Cheney_sources.forEach(function (Cheney_source, Cheney_index) {
      const Cheney_card = document.createElement('div');
      Cheney_card.className = 'Cheney_kbSource';

      const Cheney_head = document.createElement('div');
      Cheney_head.className = 'Cheney_kbSource__head';

      const Cheney_label = document.createElement('span');
      Cheney_label.textContent =
        '来源' +
        (Cheney_index + 1) +
        ' · 《' +
        Cheney_source.Cheney_file_name +
        '》片段 ' +
        (Cheney_source.Cheney_chunk_index + 1);

      const Cheney_score = document.createElement('span');
      Cheney_score.className = 'Cheney_kbSource__score';
      Cheney_score.textContent = 'BM25 ' + Cheney_source.Cheney_score;

      const Cheney_snippet = document.createElement('p');
      Cheney_snippet.className = 'Cheney_kbSource__snippet';
      Cheney_snippet.textContent = Cheney_source.Cheney_snippet;

      Cheney_head.append(Cheney_label, Cheney_score);
      Cheney_card.append(Cheney_head, Cheney_snippet);
      Cheney_sourcesEl.appendChild(Cheney_card);
    });
  }

  // 检索问答
  async function Cheney_ask() {
    if (Cheney_asking) {
      return;
    }
    const Cheney_question = Cheney_questionEl.value.trim();
    if (!Cheney_question) {
      Cheney_setAskStatus('请先输入问题。', 'error');
      Cheney_questionEl.focus();
      return;
    }

    Cheney_asking = true;
    Cheney_askBtnEl.disabled = true;
    Cheney_askBtnEl.textContent = '检索中…';
    Cheney_setAskStatus('正在检索知识库并请求大模型，免费模型可能响应较慢……');
    Cheney_answerEl.hidden = true;
    Cheney_answerEl.textContent = '';
    Cheney_sourcesEl.innerHTML = '';

    try {
      const Cheney_result = await Cheney_api.Cheney_post('/api/kb/ask', {
        Cheney_question: Cheney_question
      });
      Cheney_api.Cheney_showJson(Cheney_apiDataEl, Cheney_result);

      const Cheney_data = Cheney_result.data || {};
      Cheney_renderSources(Cheney_data.Cheney_sources);

      if (Cheney_result.code === 429) {
        Cheney_answerEl.hidden = false;
        Cheney_answerEl.textContent =
          '知识库检索已完成（见下方依据），但 AI 接口当前限流，暂时无法生成回答，请稍后重试。';
        Cheney_setAskStatus(Cheney_result.msg, 'error');
        return;
      }

      if (Cheney_result.code !== 0) {
        console.error('[Cheney] 知识库问答失败：' + Cheney_result.msg);
        Cheney_setAskStatus('问答失败：' + Cheney_result.msg, 'error');
        return;
      }

      Cheney_answerEl.hidden = false;
      Cheney_answerEl.textContent = Cheney_data.Cheney_answer;

      if (Cheney_data.Cheney_hit) {
        Cheney_setAskStatus(
          '检索命中 ' +
            Cheney_data.Cheney_sources.length +
            ' 条片段，回答完成' +
            (Cheney_data.Cheney_usage ? ' · tokens ' + Cheney_data.Cheney_usage.total_tokens : ''),
          'ok'
        );
      } else {
        Cheney_setAskStatus('知识库中未检索到相关内容，已如实告知。', 'error');
      }
    } catch (Cheney_error) {
      console.error('[Cheney] 知识库问答异常：', Cheney_error);
      Cheney_setAskStatus('问答失败：无法连接后端服务', 'error');
    } finally {
      Cheney_asking = false;
      Cheney_askBtnEl.disabled = false;
      Cheney_askBtnEl.textContent = '检索并提问';
    }
  }

  // 事件绑定
  Cheney_uploadZoneEl.addEventListener('click', function () {
    Cheney_fileInputEl.click();
  });

  Cheney_fileInputEl.addEventListener('change', function () {
    if (Cheney_fileInputEl.files && Cheney_fileInputEl.files[0]) {
      Cheney_uploadFile(Cheney_fileInputEl.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach(function (Cheney_eventName) {
    Cheney_uploadZoneEl.addEventListener(Cheney_eventName, function (Cheney_event) {
      Cheney_event.preventDefault();
      Cheney_uploadZoneEl.classList.add('Cheney_uploadZone--drag');
    });
  });

  ['dragleave', 'drop'].forEach(function (Cheney_eventName) {
    Cheney_uploadZoneEl.addEventListener(Cheney_eventName, function (Cheney_event) {
      Cheney_event.preventDefault();
      Cheney_uploadZoneEl.classList.remove('Cheney_uploadZone--drag');
    });
  });

  Cheney_uploadZoneEl.addEventListener('drop', function (Cheney_event) {
    const Cheney_files = Cheney_event.dataTransfer && Cheney_event.dataTransfer.files;
    if (Cheney_files && Cheney_files[0]) {
      Cheney_uploadFile(Cheney_files[0]);
    }
  });

  Cheney_refreshEl.addEventListener('click', Cheney_loadFiles);
  Cheney_askBtnEl.addEventListener('click', Cheney_ask);
  Cheney_questionEl.addEventListener('keydown', function (Cheney_event) {
    if (Cheney_event.key === 'Enter' && (Cheney_event.ctrlKey || Cheney_event.metaKey)) {
      Cheney_event.preventDefault();
      Cheney_ask();
    }
  });

  Cheney_chunkCloseEl.addEventListener('click', function () {
    Cheney_modalEl.classList.remove('Cheney_modal--open');
  });
  Cheney_modalEl.addEventListener('click', function (Cheney_event) {
    if (Cheney_event.target === Cheney_modalEl) {
      Cheney_modalEl.classList.remove('Cheney_modal--open');
    }
  });

  Cheney_loadFiles();
})();
