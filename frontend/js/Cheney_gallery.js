/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 科技图文列表页：请求 /api/gallery 并渲染
 */
(function () {
  const Cheney_apiDataEl = document.getElementById('Cheney_apiData');
  const Cheney_gridEl = document.getElementById('Cheney_galleryGrid');

  function Cheney_renderItem(Cheney_item) {
    const Cheney_card = document.createElement('article');
    Cheney_card.className = 'Cheney_galleryItem';

    const Cheney_img = document.createElement('img');
    Cheney_img.className = 'Cheney_galleryItem__img';
    Cheney_img.src = Cheney_item.Cheney_image_url;
    Cheney_img.alt = Cheney_item.Cheney_title;
    Cheney_img.loading = 'lazy';

    const Cheney_body = document.createElement('div');
    Cheney_body.className = 'Cheney_galleryItem__body';

    const Cheney_category = document.createElement('span');
    Cheney_category.className = 'Cheney_galleryItem__cat';
    Cheney_category.textContent = Cheney_item.Cheney_category;

    const Cheney_title = document.createElement('h2');
    Cheney_title.className = 'Cheney_galleryItem__title';
    Cheney_title.textContent = Cheney_item.Cheney_title;

    const Cheney_desc = document.createElement('p');
    Cheney_desc.className = 'Cheney_galleryItem__desc';
    Cheney_desc.textContent = Cheney_item.Cheney_description;

    Cheney_body.append(Cheney_category, Cheney_title, Cheney_desc);
    Cheney_card.append(Cheney_img, Cheney_body);
    return Cheney_card;
  }

  async function Cheney_init() {
    try {
      const Cheney_result = await Cheney_api.Cheney_get('/api/gallery');
      Cheney_api.Cheney_showJson(Cheney_apiDataEl, Cheney_result);

      if (Cheney_result.code !== 0) {
        console.error('[Cheney] 图文接口返回错误：' + Cheney_result.msg);
        Cheney_gridEl.textContent = '数据加载失败：' + Cheney_result.msg;
        return;
      }

      Cheney_gridEl.textContent = '';
      Cheney_result.data.Cheney_list.forEach(function (Cheney_item) {
        Cheney_gridEl.appendChild(Cheney_renderItem(Cheney_item));
      });
      console.log('[Cheney] 图文条数：' + Cheney_result.data.Cheney_total);
    } catch (Cheney_error) {
      console.error('[Cheney] 图文请求异常：', Cheney_error);
      Cheney_gridEl.textContent = '无法连接后端接口，请确认服务已在 8111 端口启动。';
    }
  }

  Cheney_init();
})();
