/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 科技新闻列表页：请求 /api/news 并渲染
 */
(function () {
  const Cheney_apiDataEl = document.getElementById('Cheney_apiData');
  const Cheney_listEl = document.getElementById('Cheney_newsList');

  function Cheney_renderItem(Cheney_item) {
    const Cheney_article = document.createElement('article');
    Cheney_article.className = 'Cheney_newsItem';

    const Cheney_meta = document.createElement('div');
    Cheney_meta.className = 'Cheney_newsItem__meta';

    const Cheney_source = document.createElement('span');
    Cheney_source.className = 'Cheney_newsItem__source';
    Cheney_source.textContent = Cheney_item.Cheney_source;

    const Cheney_time = document.createElement('span');
    Cheney_time.textContent = Cheney_api.Cheney_formatDate(Cheney_item.Cheney_publish_time);

    const Cheney_author = document.createElement('span');
    Cheney_author.textContent = '作者：' + Cheney_item.Cheney_author;

    const Cheney_views = document.createElement('span');
    Cheney_views.textContent = '浏览 ' + Cheney_item.Cheney_view_count;

    Cheney_meta.append(Cheney_source, Cheney_time, Cheney_author, Cheney_views);

    const Cheney_title = document.createElement('h2');
    Cheney_title.className = 'Cheney_newsItem__title';
    Cheney_title.textContent = Cheney_item.Cheney_title;

    const Cheney_summary = document.createElement('p');
    Cheney_summary.className = 'Cheney_newsItem__summary';
    Cheney_summary.textContent = Cheney_item.Cheney_summary;

    const Cheney_content = document.createElement('p');
    Cheney_content.className = 'Cheney_newsItem__content';
    Cheney_content.textContent = Cheney_item.Cheney_content;

    Cheney_article.append(Cheney_meta, Cheney_title, Cheney_summary, Cheney_content);
    return Cheney_article;
  }

  async function Cheney_init() {
    try {
      const Cheney_result = await Cheney_api.Cheney_get('/api/news');
      Cheney_api.Cheney_showJson(Cheney_apiDataEl, Cheney_result);

      if (Cheney_result.code !== 0) {
        console.error('[Cheney] 新闻接口返回错误：' + Cheney_result.msg);
        Cheney_listEl.textContent = '数据加载失败：' + Cheney_result.msg;
        return;
      }

      Cheney_listEl.textContent = '';
      Cheney_result.data.Cheney_list.forEach(function (Cheney_item) {
        Cheney_listEl.appendChild(Cheney_renderItem(Cheney_item));
      });
      console.log('[Cheney] 新闻条数：' + Cheney_result.data.Cheney_total);
    } catch (Cheney_error) {
      console.error('[Cheney] 新闻请求异常：', Cheney_error);
      Cheney_listEl.textContent = '无法连接后端接口，请确认服务已在 8111 端口启动。';
    }
  }

  Cheney_init();
})();
