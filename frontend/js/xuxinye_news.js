/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 科技新闻列表页：请求 /api/news 并渲染
 */
(function () {
  const xuxinye_apiDataEl = document.getElementById('xuxinye_apiData');
  const xuxinye_listEl = document.getElementById('xuxinye_newsList');

  function xuxinye_renderItem(xuxinye_item) {
    const xuxinye_article = document.createElement('article');
    xuxinye_article.className = 'xuxinye_newsItem';

    const xuxinye_meta = document.createElement('div');
    xuxinye_meta.className = 'xuxinye_newsItem__meta';

    const xuxinye_source = document.createElement('span');
    xuxinye_source.className = 'xuxinye_newsItem__source';
    xuxinye_source.textContent = xuxinye_item.xuxinye_source;

    const xuxinye_time = document.createElement('span');
    xuxinye_time.textContent = xuxinye_api.xuxinye_formatDate(xuxinye_item.xuxinye_publish_time);

    const xuxinye_author = document.createElement('span');
    xuxinye_author.textContent = '作者：' + xuxinye_item.xuxinye_author;

    const xuxinye_views = document.createElement('span');
    xuxinye_views.textContent = '浏览 ' + xuxinye_item.xuxinye_view_count;

    xuxinye_meta.append(xuxinye_source, xuxinye_time, xuxinye_author, xuxinye_views);

    const xuxinye_title = document.createElement('h2');
    xuxinye_title.className = 'xuxinye_newsItem__title';
    xuxinye_title.textContent = xuxinye_item.xuxinye_title;

    const xuxinye_summary = document.createElement('p');
    xuxinye_summary.className = 'xuxinye_newsItem__summary';
    xuxinye_summary.textContent = xuxinye_item.xuxinye_summary;

    const xuxinye_content = document.createElement('p');
    xuxinye_content.className = 'xuxinye_newsItem__content';
    xuxinye_content.textContent = xuxinye_item.xuxinye_content;

    xuxinye_article.append(xuxinye_meta, xuxinye_title, xuxinye_summary, xuxinye_content);
    return xuxinye_article;
  }

  async function xuxinye_init() {
    try {
      const xuxinye_result = await xuxinye_api.xuxinye_get('/api/news');
      xuxinye_api.xuxinye_showJson(xuxinye_apiDataEl, xuxinye_result);

      if (xuxinye_result.code !== 0) {
        console.error('[xuxinye] 新闻接口返回错误：' + xuxinye_result.msg);
        xuxinye_listEl.textContent = '数据加载失败：' + xuxinye_result.msg;
        return;
      }

      xuxinye_listEl.textContent = '';
      xuxinye_result.data.xuxinye_list.forEach(function (xuxinye_item) {
        xuxinye_listEl.appendChild(xuxinye_renderItem(xuxinye_item));
      });
      console.log('[xuxinye] 新闻条数：' + xuxinye_result.data.xuxinye_total);
    } catch (xuxinye_error) {
      console.error('[xuxinye] 新闻请求异常：', xuxinye_error);
      xuxinye_listEl.textContent = '无法连接后端接口，请确认服务已在 8111 端口启动。';
    }
  }

  xuxinye_init();
})();
