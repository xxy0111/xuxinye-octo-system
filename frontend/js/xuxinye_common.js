/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 公共脚本：接口请求、数据打印、时间格式化
 */
const xuxinye_api = {
  // 统一 GET 请求，数据与错误都输出到控制台
  async xuxinye_get(xuxinye_url) {
    const xuxinye_response = await fetch(xuxinye_url);
    const xuxinye_data = await xuxinye_response.json();
    console.log('[xuxinye] 接口请求：' + xuxinye_url, xuxinye_data);
    return xuxinye_data;
  },

  // 统一 POST 请求，xuxinye_options.signal 可用于中断请求
  async xuxinye_post(xuxinye_url, xuxinye_body, xuxinye_options) {
    const xuxinye_fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(xuxinye_body)
    };
    if (xuxinye_options && xuxinye_options.signal) {
      xuxinye_fetchOptions.signal = xuxinye_options.signal;
    }
    const xuxinye_response = await fetch(xuxinye_url, xuxinye_fetchOptions);
    const xuxinye_data = await xuxinye_response.json();
    console.log('[xuxinye] 接口请求：' + xuxinye_url, xuxinye_data);
    return xuxinye_data;
  },

  // 统一 PUT 请求
  async xuxinye_put(xuxinye_url, xuxinye_body) {
    const xuxinye_response = await fetch(xuxinye_url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(xuxinye_body)
    });
    const xuxinye_data = await xuxinye_response.json();
    console.log('[xuxinye] 接口请求：' + xuxinye_url, xuxinye_data);
    return xuxinye_data;
  },

  // 统一 DELETE 请求
  async xuxinye_delete(xuxinye_url) {
    const xuxinye_response = await fetch(xuxinye_url, { method: 'DELETE' });
    const xuxinye_data = await xuxinye_response.json();
    console.log('[xuxinye] 接口请求：' + xuxinye_url, xuxinye_data);
    return xuxinye_data;
  },

  // 把接口返回的 JSON 打印到页面上
  xuxinye_showJson(xuxinye_el, xuxinye_data) {
    if (!xuxinye_el) {
      return;
    }
    xuxinye_el.textContent = JSON.stringify(xuxinye_data, null, 2);
  },

  // 数据库时间格式化为 yyyy-mm-dd hh:mm
  xuxinye_formatDate(xuxinye_value) {
    if (!xuxinye_value) {
      return '';
    }
    const xuxinye_date = new Date(xuxinye_value);
    if (Number.isNaN(xuxinye_date.getTime())) {
      return String(xuxinye_value);
    }
    const xuxinye_pad = (xuxinye_num) => String(xuxinye_num).padStart(2, '0');
    return (
      xuxinye_date.getFullYear() +
      '-' +
      xuxinye_pad(xuxinye_date.getMonth() + 1) +
      '-' +
      xuxinye_pad(xuxinye_date.getDate()) +
      ' ' +
      xuxinye_pad(xuxinye_date.getHours()) +
      ':' +
      xuxinye_pad(xuxinye_date.getMinutes())
    );
  }
};
