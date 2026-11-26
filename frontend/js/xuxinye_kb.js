/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * RAG 知识库页：上传、文件列表与删除、片段查看、检索问答与来源展示
 */
(function () {
  const xuxinye_ALLOWED_EXT = ['.doc', '.docx', '.ppt', '.pptx', '.pdf', '.txt'];
  const xuxinye_MAX_SIZE = 25 * 1024 * 1024;

  const xuxinye_uploadZoneEl = document.getElementById('xuxinye_uploadZone');
  const xuxinye_fileInputEl = document.getElementById('xuxinye_kbFileInput');
  const xuxinye_uploadStatusEl = document.getElementById('xuxinye_uploadStatus');
  const xuxinye_uploadProgressEl = document.getElementById('xuxinye_uploadProgress');
  const xuxinye_uploadProgressBarEl = document.getElementById('xuxinye_uploadProgressBar');
  const xuxinye_fileBodyEl = document.getElementById('xuxinye_kbFileBody');
  const xuxinye_fileSummaryEl = document.getElementById('xuxinye_kbFileSummary');
  const xuxinye_refreshEl = document.getElementById('xuxinye_kbRefresh');
  const xuxinye_questionEl = document.getElementById('xuxinye_kbQuestion');
  const xuxinye_askBtnEl = document.getElementById('xuxinye_kbAskBtn');
  const xuxinye_askStatusEl = document.getElementById('xuxinye_kbAskStatus');
  const xuxinye_answerEl = document.getElementById('xuxinye_kbAnswer');
  const xuxinye_sourcesEl = document.getElementById('xuxinye_kbSources');
  const xuxinye_apiDataEl = document.getElementById('xuxinye_kbApiData');
  const xuxinye_modalEl = document.getElementById('xuxinye_chunkModal');
  const xuxinye_chunkTitleEl = document.getElementById('xuxinye_chunkTitle');
  const xuxinye_chunkBodyEl = document.getElementById('xuxinye_chunkBody');
  const xuxinye_chunkCloseEl = document.getElementById('xuxinye_chunkClose');

  let xuxinye_asking = false;
  let xuxinye_uploading = false;

  function xuxinye_formatSize(xuxinye_size) {
    if (xuxinye_size >= 1024 * 1024) {
      return (xuxinye_size / 1024 / 1024).toFixed(1) + ' MB';
    }
    return Math.max(1, Math.round(xuxinye_size / 1024)) + ' KB';
  }

  function xuxinye_setUploadStatus(xuxinye_text, xuxinye_type) {
    xuxinye_uploadStatusEl.textContent = xuxinye_text;
    xuxinye_uploadStatusEl.className =
      'xuxinye_kbStatus' + (xuxinye_type ? ' xuxinye_kbStatus--' + xuxinye_type : '');
  }

  // 上传进度条：0-100
  function xuxinye_setUploadProgress(xuxinye_percent) {
    xuxinye_uploadProgressEl.hidden = false;
    xuxinye_uploadProgressBarEl.style.width = Math.max(0, Math.min(100, xuxinye_percent)) + '%';
  }

  function xuxinye_setAskStatus(xuxinye_text, xuxinye_type) {
    xuxinye_askStatusEl.textContent = xuxinye_text;
    xuxinye_askStatusEl.className =
      'xuxinye_kbStatus' + (xuxinye_type ? ' xuxinye_kbStatus--' + xuxinye_type : '');
  }

  function xuxinye_statusText(xuxinye_status) {
    if (xuxinye_status === 'ready') {
      return '已入库';
    }
    if (xuxinye_status === 'failed') {
      return '解析失败';
    }
    return '解析中';
  }

  // 渲染文件列表
  async function xuxinye_loadFiles() {
    try {
      const xuxinye_result = await xuxinye_api.xuxinye_get('/api/kb/files');
      if (xuxinye_result.code !== 0) {
        console.error('[xuxinye] 知识库列表失败：' + xuxinye_result.msg);
        xuxinye_fileSummaryEl.textContent = '列表加载失败：' + xuxinye_result.msg;
        return;
      }

      const xuxinye_list = xuxinye_result.data.xuxinye_list || [];
      const xuxinye_chunkTotal = xuxinye_list.reduce(function (xuxinye_sum, xuxinye_item) {
        return xuxinye_sum + (xuxinye_item.xuxinye_chunk_count || 0);
      }, 0);
      xuxinye_fileSummaryEl.textContent =
        '共 ' + xuxinye_list.length + ' 个文件，' + xuxinye_chunkTotal + ' 个文本片段';

      xuxinye_fileBodyEl.innerHTML = '';
      if (!xuxinye_list.length) {
        const xuxinye_emptyRow = document.createElement('tr');
        const xuxinye_emptyCell = document.createElement('td');
        xuxinye_emptyCell.colSpan = 5;
        xuxinye_emptyCell.className = 'xuxinye_kbEmpty';
        xuxinye_emptyCell.textContent = '知识库为空，请先上传文件。';
        xuxinye_emptyRow.appendChild(xuxinye_emptyCell);
        xuxinye_fileBodyEl.appendChild(xuxinye_emptyRow);
        return;
      }

      xuxinye_list.forEach(function (xuxinye_item) {
        const xuxinye_row = document.createElement('tr');

        const xuxinye_nameCell = document.createElement('td');
        xuxinye_nameCell.className = 'xuxinye_kbTable__name';
        xuxinye_nameCell.textContent = xuxinye_item.xuxinye_file_name;
        xuxinye_nameCell.title =
          xuxinye_item.xuxinye_file_name +
          '（' +
          xuxinye_formatSize(xuxinye_item.xuxinye_file_size) +
          '）' +
          (xuxinye_item.xuxinye_error_msg ? '\n备注：' + xuxinye_item.xuxinye_error_msg : '');

        const xuxinye_extCell = document.createElement('td');
        xuxinye_extCell.textContent = xuxinye_item.xuxinye_file_ext.replace('.', '').toUpperCase();

        const xuxinye_chunkCell = document.createElement('td');
        xuxinye_chunkCell.textContent = xuxinye_item.xuxinye_chunk_count;

        const xuxinye_statusCell = document.createElement('td');
        const xuxinye_badge = document.createElement('span');
        xuxinye_badge.className = 'xuxinye_kbBadge xuxinye_kbBadge--' + xuxinye_item.xuxinye_status;
        xuxinye_badge.textContent = xuxinye_statusText(xuxinye_item.xuxinye_status);
        if (xuxinye_item.xuxinye_error_msg) {
          xuxinye_badge.title = xuxinye_item.xuxinye_error_msg;
        }
        xuxinye_statusCell.appendChild(xuxinye_badge);

        const xuxinye_actionCell = document.createElement('td');
        const xuxinye_viewBtn = document.createElement('button');
        xuxinye_viewBtn.type = 'button';
        xuxinye_viewBtn.className = 'xuxinye_kbAction';
        xuxinye_viewBtn.textContent = '查看片段';
        xuxinye_viewBtn.addEventListener('click', function () {
          xuxinye_openChunks(xuxinye_item.xuxinye_id, xuxinye_item.xuxinye_file_name);
        });

        const xuxinye_deleteBtn = document.createElement('button');
        xuxinye_deleteBtn.type = 'button';
        xuxinye_deleteBtn.className = 'xuxinye_kbAction xuxinye_kbAction--danger';
        xuxinye_deleteBtn.textContent = '删除';
        xuxinye_deleteBtn.addEventListener('click', function () {
          xuxinye_deleteFile(xuxinye_item);
        });

        xuxinye_actionCell.append(xuxinye_viewBtn, xuxinye_deleteBtn);
        xuxinye_row.append(xuxinye_nameCell, xuxinye_extCell, xuxinye_chunkCell, xuxinye_statusCell, xuxinye_actionCell);
        xuxinye_fileBodyEl.appendChild(xuxinye_row);
      });
    } catch (xuxinye_error) {
      console.error('[xuxinye] 知识库列表请求异常：', xuxinye_error);
      xuxinye_fileSummaryEl.textContent = '无法连接后端接口，请确认 8111 服务已启动。';
    }
  }

  // 上传文件
  async function xuxinye_uploadFile(xuxinye_file) {
    if (xuxinye_uploading || !xuxinye_file) {
      return;
    }

    const xuxinye_ext = xuxinye_file.name.slice(xuxinye_file.name.lastIndexOf('.')).toLowerCase();
    if (xuxinye_ALLOWED_EXT.indexOf(xuxinye_ext) === -1) {
      xuxinye_setUploadStatus('不支持的文件类型：仅支持 doc、docx、ppt、pptx、pdf、txt', 'error');
      return;
    }
    if (xuxinye_file.size > xuxinye_MAX_SIZE) {
      xuxinye_setUploadStatus('文件超过 25MB 限制', 'error');
      return;
    }

    xuxinye_uploading = true;
    xuxinye_setUploadProgress(0);
    xuxinye_setUploadStatus('正在上传《' + xuxinye_file.name + '》 0%');

    const xuxinye_form = new FormData();
    xuxinye_form.append('xuxinye_file', xuxinye_file);

    try {
      // 使用 XHR 才能拿到上传进度事件
      const xuxinye_result = await new Promise(function (xuxinye_resolve, xuxinye_reject) {
        const xuxinye_xhr = new XMLHttpRequest();
        xuxinye_xhr.open('POST', '/api/kb/upload');

        xuxinye_xhr.upload.onprogress = function (xuxinye_event) {
          if (!xuxinye_event.lengthComputable) {
            return;
          }
          const xuxinye_percent = Math.round((xuxinye_event.loaded / xuxinye_event.total) * 100);
          xuxinye_setUploadProgress(xuxinye_percent);
          xuxinye_setUploadStatus('正在上传《' + xuxinye_file.name + '》 ' + xuxinye_percent + '%');
        };

        xuxinye_xhr.upload.onload = function () {
          xuxinye_setUploadProgress(100);
          xuxinye_setUploadStatus('上传完成，服务端正在解析文本并切分片段，请稍候……');
        };

        xuxinye_xhr.onload = function () {
          try {
            xuxinye_resolve(JSON.parse(xuxinye_xhr.responseText));
          } catch (xuxinye_parseError) {
            xuxinye_reject(new Error('接口返回格式异常'));
          }
        };

        xuxinye_xhr.onerror = function () {
          xuxinye_reject(new Error('网络错误'));
        };

        xuxinye_xhr.send(xuxinye_form);
      });

      console.log('[xuxinye] 知识库上传接口返回：', xuxinye_result);

      if (xuxinye_result.code !== 0) {
        console.error('[xuxinye] 上传解析失败：' + xuxinye_result.msg);
        xuxinye_setUploadStatus(xuxinye_result.msg, 'error');
      } else {
        const xuxinye_data = xuxinye_result.data || {};
        xuxinye_setUploadProgress(100);
        xuxinye_setUploadStatus(
          '《' +
            xuxinye_data.xuxinye_file_name +
            '》解析完成，共 ' +
            xuxinye_data.xuxinye_chunk_count +
            ' 个片段' +
            (xuxinye_data.xuxinye_warning ? '（' + xuxinye_data.xuxinye_warning + '）' : ''),
          'ok'
        );
      }
      await xuxinye_loadFiles();
    } catch (xuxinye_error) {
      console.error('[xuxinye] 知识库上传异常：', xuxinye_error);
      xuxinye_setUploadStatus('上传失败：' + xuxinye_error.message, 'error');
    } finally {
      xuxinye_uploading = false;
      xuxinye_fileInputEl.value = '';
    }
  }

  // 删除文件
  async function xuxinye_deleteFile(xuxinye_item) {
    if (!window.confirm('确定删除《' + xuxinye_item.xuxinye_file_name + '》及其全部片段吗？')) {
      return;
    }
    try {
      const xuxinye_response = await fetch('/api/kb/files/' + xuxinye_item.xuxinye_id, { method: 'DELETE' });
      const xuxinye_result = await xuxinye_response.json();
      console.log('[xuxinye] 知识库删除接口返回：', xuxinye_result);
      if (xuxinye_result.code !== 0) {
        xuxinye_setUploadStatus('删除失败：' + xuxinye_result.msg, 'error');
      } else {
        xuxinye_setUploadStatus('已删除《' + xuxinye_item.xuxinye_file_name + '》', 'ok');
      }
      await xuxinye_loadFiles();
    } catch (xuxinye_error) {
      console.error('[xuxinye] 知识库删除异常：', xuxinye_error);
      xuxinye_setUploadStatus('删除失败：无法连接后端服务', 'error');
    }
  }

  // 查看片段
  async function xuxinye_openChunks(xuxinye_fileId, xuxinye_fileName) {
    xuxinye_chunkTitleEl.textContent = xuxinye_fileName + ' · 文本片段';
    xuxinye_chunkBodyEl.textContent = '正在加载片段……';
    xuxinye_modalEl.classList.add('xuxinye_modal--open');

    try {
      const xuxinye_response = await fetch('/api/kb/files/' + xuxinye_fileId + '/chunks');
      const xuxinye_result = await xuxinye_response.json();
      console.log('[xuxinye] 知识库片段接口返回：', xuxinye_result);
      if (xuxinye_result.code !== 0) {
        xuxinye_chunkBodyEl.textContent = '加载失败：' + xuxinye_result.msg;
        return;
      }

      const xuxinye_chunks = xuxinye_result.data.xuxinye_list || [];
      xuxinye_chunkBodyEl.innerHTML = '';
      if (!xuxinye_chunks.length) {
        xuxinye_chunkBodyEl.textContent = '该文件暂无片段。';
        return;
      }

      xuxinye_chunks.forEach(function (xuxinye_chunk) {
        const xuxinye_block = document.createElement('div');
        xuxinye_block.className = 'xuxinye_kbChunk';

        const xuxinye_meta = document.createElement('span');
        xuxinye_meta.className = 'xuxinye_kbChunk__meta';
        xuxinye_meta.textContent =
          '片段 ' + (xuxinye_chunk.xuxinye_chunk_index + 1) + ' · ' + xuxinye_chunk.xuxinye_char_count + ' 字';

        xuxinye_block.append(xuxinye_meta, document.createTextNode(xuxinye_chunk.xuxinye_content));
        xuxinye_chunkBodyEl.appendChild(xuxinye_block);
      });
    } catch (xuxinye_error) {
      console.error('[xuxinye] 知识库片段请求异常：', xuxinye_error);
      xuxinye_chunkBodyEl.textContent = '加载失败：无法连接后端服务';
    }
  }

  // 渲染来源卡片
  function xuxinye_renderSources(xuxinye_sources) {
    xuxinye_sourcesEl.innerHTML = '';
    if (!xuxinye_sources || !xuxinye_sources.length) {
      return;
    }

    xuxinye_sources.forEach(function (xuxinye_source, xuxinye_index) {
      const xuxinye_card = document.createElement('div');
      xuxinye_card.className = 'xuxinye_kbSource';

      const xuxinye_head = document.createElement('div');
      xuxinye_head.className = 'xuxinye_kbSource__head';

      const xuxinye_label = document.createElement('span');
      xuxinye_label.textContent =
        '来源' +
        (xuxinye_index + 1) +
        ' · 《' +
        xuxinye_source.xuxinye_file_name +
        '》片段 ' +
        (xuxinye_source.xuxinye_chunk_index + 1);

      const xuxinye_score = document.createElement('span');
      xuxinye_score.className = 'xuxinye_kbSource__score';
      xuxinye_score.textContent = 'BM25 ' + xuxinye_source.xuxinye_score;

      const xuxinye_snippet = document.createElement('p');
      xuxinye_snippet.className = 'xuxinye_kbSource__snippet';
      xuxinye_snippet.textContent = xuxinye_source.xuxinye_snippet;

      xuxinye_head.append(xuxinye_label, xuxinye_score);
      xuxinye_card.append(xuxinye_head, xuxinye_snippet);
      xuxinye_sourcesEl.appendChild(xuxinye_card);
    });
  }

  // 检索问答
  async function xuxinye_ask() {
    if (xuxinye_asking) {
      return;
    }
    const xuxinye_question = xuxinye_questionEl.value.trim();
    if (!xuxinye_question) {
      xuxinye_setAskStatus('请先输入问题。', 'error');
      xuxinye_questionEl.focus();
      return;
    }

    xuxinye_asking = true;
    xuxinye_askBtnEl.disabled = true;
    xuxinye_askBtnEl.textContent = '检索中…';
    xuxinye_setAskStatus('正在检索知识库并请求大模型，免费模型可能响应较慢……');
    xuxinye_answerEl.hidden = true;
    xuxinye_answerEl.textContent = '';
    xuxinye_sourcesEl.innerHTML = '';

    try {
      const xuxinye_result = await xuxinye_api.xuxinye_post('/api/kb/ask', {
        xuxinye_question: xuxinye_question
      });
      xuxinye_api.xuxinye_showJson(xuxinye_apiDataEl, xuxinye_result);

      const xuxinye_data = xuxinye_result.data || {};
      xuxinye_renderSources(xuxinye_data.xuxinye_sources);

      if (xuxinye_result.code === 429) {
        xuxinye_answerEl.hidden = false;
        xuxinye_answerEl.textContent =
          '知识库检索已完成（见下方依据），但 AI 接口当前限流，暂时无法生成回答，请稍后重试。';
        xuxinye_setAskStatus(xuxinye_result.msg, 'error');
        return;
      }

      if (xuxinye_result.code !== 0) {
        console.error('[xuxinye] 知识库问答失败：' + xuxinye_result.msg);
        xuxinye_setAskStatus('问答失败：' + xuxinye_result.msg, 'error');
        return;
      }

      xuxinye_answerEl.hidden = false;
      xuxinye_answerEl.textContent = xuxinye_data.xuxinye_answer;

      if (xuxinye_data.xuxinye_hit) {
        xuxinye_setAskStatus(
          '检索命中 ' +
            xuxinye_data.xuxinye_sources.length +
            ' 条片段，回答完成' +
            (xuxinye_data.xuxinye_usage ? ' · tokens ' + xuxinye_data.xuxinye_usage.total_tokens : ''),
          'ok'
        );
      } else {
        xuxinye_setAskStatus('知识库中未检索到相关内容，已如实告知。', 'error');
      }
    } catch (xuxinye_error) {
      console.error('[xuxinye] 知识库问答异常：', xuxinye_error);
      xuxinye_setAskStatus('问答失败：无法连接后端服务', 'error');
    } finally {
      xuxinye_asking = false;
      xuxinye_askBtnEl.disabled = false;
      xuxinye_askBtnEl.textContent = '检索并提问';
    }
  }

  // 事件绑定
  xuxinye_uploadZoneEl.addEventListener('click', function () {
    xuxinye_fileInputEl.click();
  });

  xuxinye_fileInputEl.addEventListener('change', function () {
    if (xuxinye_fileInputEl.files && xuxinye_fileInputEl.files[0]) {
      xuxinye_uploadFile(xuxinye_fileInputEl.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach(function (xuxinye_eventName) {
    xuxinye_uploadZoneEl.addEventListener(xuxinye_eventName, function (xuxinye_event) {
      xuxinye_event.preventDefault();
      xuxinye_uploadZoneEl.classList.add('xuxinye_uploadZone--drag');
    });
  });

  ['dragleave', 'drop'].forEach(function (xuxinye_eventName) {
    xuxinye_uploadZoneEl.addEventListener(xuxinye_eventName, function (xuxinye_event) {
      xuxinye_event.preventDefault();
      xuxinye_uploadZoneEl.classList.remove('xuxinye_uploadZone--drag');
    });
  });

  xuxinye_uploadZoneEl.addEventListener('drop', function (xuxinye_event) {
    const xuxinye_files = xuxinye_event.dataTransfer && xuxinye_event.dataTransfer.files;
    if (xuxinye_files && xuxinye_files[0]) {
      xuxinye_uploadFile(xuxinye_files[0]);
    }
  });

  xuxinye_refreshEl.addEventListener('click', xuxinye_loadFiles);
  xuxinye_askBtnEl.addEventListener('click', xuxinye_ask);
  xuxinye_questionEl.addEventListener('keydown', function (xuxinye_event) {
    if (xuxinye_event.key === 'Enter' && (xuxinye_event.ctrlKey || xuxinye_event.metaKey)) {
      xuxinye_event.preventDefault();
      xuxinye_ask();
    }
  });

  xuxinye_chunkCloseEl.addEventListener('click', function () {
    xuxinye_modalEl.classList.remove('xuxinye_modal--open');
  });
  xuxinye_modalEl.addEventListener('click', function (xuxinye_event) {
    if (xuxinye_event.target === xuxinye_modalEl) {
      xuxinye_modalEl.classList.remove('xuxinye_modal--open');
    }
  });

  xuxinye_loadFiles();
})();
