/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 科技图文列表页：请求 /api/gallery 并渲染
 */
(function () {
  const xuxinye_apiDataEl = document.getElementById('xuxinye_apiData');
  const xuxinye_gridEl = document.getElementById('xuxinye_galleryGrid');

  function xuxinye_renderItem(xuxinye_item) {
    const xuxinye_card = document.createElement('article');
    xuxinye_card.className = 'xuxinye_galleryItem';

    const xuxinye_img = document.createElement('img');
    xuxinye_img.className = 'xuxinye_galleryItem__img';
    xuxinye_img.src = xuxinye_item.xuxinye_image_url;
    xuxinye_img.alt = xuxinye_item.xuxinye_title;
    xuxinye_img.loading = 'lazy';

    const xuxinye_body = document.createElement('div');
    xuxinye_body.className = 'xuxinye_galleryItem__body';

    const xuxinye_category = document.createElement('span');
    xuxinye_category.className = 'xuxinye_galleryItem__cat';
    xuxinye_category.textContent = xuxinye_item.xuxinye_category;

    const xuxinye_title = document.createElement('h2');
    xuxinye_title.className = 'xuxinye_galleryItem__title';
    xuxinye_title.textContent = xuxinye_item.xuxinye_title;

    const xuxinye_desc = document.createElement('p');
    xuxinye_desc.className = 'xuxinye_galleryItem__desc';
    xuxinye_desc.textContent = xuxinye_item.xuxinye_description;

    xuxinye_body.append(xuxinye_category, xuxinye_title, xuxinye_desc);
    xuxinye_card.append(xuxinye_img, xuxinye_body);
    return xuxinye_card;
  }

  async function xuxinye_init() {
    try {
      const xuxinye_result = await xuxinye_api.xuxinye_get('/api/gallery');
      xuxinye_api.xuxinye_showJson(xuxinye_apiDataEl, xuxinye_result);

      if (xuxinye_result.code !== 0) {
        console.error('[xuxinye] 图文接口返回错误：' + xuxinye_result.msg);
        xuxinye_gridEl.textContent = '数据加载失败：' + xuxinye_result.msg;
        return;
      }

      xuxinye_gridEl.textContent = '';
      xuxinye_result.data.xuxinye_list.forEach(function (xuxinye_item) {
        xuxinye_gridEl.appendChild(xuxinye_renderItem(xuxinye_item));
      });
      console.log('[xuxinye] 图文条数：' + xuxinye_result.data.xuxinye_total);
    } catch (xuxinye_error) {
      console.error('[xuxinye] 图文请求异常：', xuxinye_error);
      xuxinye_gridEl.textContent = '无法连接后端接口，请确认服务已在 8111 端口启动。';
    }
  }

  xuxinye_init();
})();
