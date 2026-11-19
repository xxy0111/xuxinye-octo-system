/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 公共脚本：接口请求、数据打印、时间格式化
 */
const Cheney_api = {
  // 统一 GET 请求，数据与错误都输出到控制台
  async Cheney_get(Cheney_url) {
    const Cheney_response = await fetch(Cheney_url);
    const Cheney_data = await Cheney_response.json();
    console.log('[Cheney] 接口请求：' + Cheney_url, Cheney_data);
    return Cheney_data;
  },

  // 统一 POST 请求
  async Cheney_post(Cheney_url, Cheney_body) {
    const Cheney_response = await fetch(Cheney_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Cheney_body)
    });
    const Cheney_data = await Cheney_response.json();
    console.log('[Cheney] 接口请求：' + Cheney_url, Cheney_data);
    return Cheney_data;
  },

  // 把接口返回的 JSON 打印到页面上
  Cheney_showJson(Cheney_el, Cheney_data) {
    if (!Cheney_el) {
      return;
    }
    Cheney_el.textContent = JSON.stringify(Cheney_data, null, 2);
  },

  // 数据库时间格式化为 yyyy-mm-dd hh:mm
  Cheney_formatDate(Cheney_value) {
    if (!Cheney_value) {
      return '';
    }
    const Cheney_date = new Date(Cheney_value);
    if (Number.isNaN(Cheney_date.getTime())) {
      return String(Cheney_value);
    }
    const Cheney_pad = (Cheney_num) => String(Cheney_num).padStart(2, '0');
    return (
      Cheney_date.getFullYear() +
      '-' +
      Cheney_pad(Cheney_date.getMonth() + 1) +
      '-' +
      Cheney_pad(Cheney_date.getDate()) +
      ' ' +
      Cheney_pad(Cheney_date.getHours()) +
      ':' +
      Cheney_pad(Cheney_date.getMinutes())
    );
  }
};
