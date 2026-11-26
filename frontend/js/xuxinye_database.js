/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 数据库连接测试页：提交账号密码到 /api/db/test
 */
(function () {
  const xuxinye_form = document.getElementById('xuxinye_dbForm');
  const xuxinye_userEl = document.getElementById('xuxinye_user');
  const xuxinye_passwordEl = document.getElementById('xuxinye_password');
  const xuxinye_submitEl = document.getElementById('xuxinye_submit');
  const xuxinye_resultEl = document.getElementById('xuxinye_result');
  const xuxinye_apiDataEl = document.getElementById('xuxinye_apiData');

  async function xuxinye_submit(xuxinye_event) {
    xuxinye_event.preventDefault();

    xuxinye_submitEl.disabled = true;
    xuxinye_submitEl.textContent = '正在连接……';
    xuxinye_resultEl.className = 'xuxinye_result';
    xuxinye_resultEl.textContent = '';

    try {
      const xuxinye_result = await xuxinye_api.xuxinye_post('/api/db/test', {
        xuxinye_user: xuxinye_userEl.value,
        xuxinye_password: xuxinye_passwordEl.value
      });

      xuxinye_api.xuxinye_showJson(xuxinye_apiDataEl, xuxinye_result);

      if (xuxinye_result.code === 0) {
        xuxinye_resultEl.className = 'xuxinye_result xuxinye_result--ok';
        xuxinye_resultEl.textContent =
          '连接成功：数据库 ' +
          xuxinye_result.data.xuxinye_database +
          '，版本 ' +
          xuxinye_result.data.xuxinye_version +
          '，账号 ' +
          xuxinye_result.data.xuxinye_account;
        console.log('[xuxinye] 数据库连接成功：', xuxinye_result.data);
      } else {
        xuxinye_resultEl.className = 'xuxinye_result xuxinye_result--error';
        xuxinye_resultEl.textContent = '连接失败：' + xuxinye_result.msg;
        console.error('[xuxinye] 数据库连接失败：' + xuxinye_result.msg);
      }
    } catch (xuxinye_error) {
      xuxinye_resultEl.className = 'xuxinye_result xuxinye_result--error';
      xuxinye_resultEl.textContent = '请求异常：无法连接后端接口，请确认服务已在 8111 端口启动。';
      console.error('[xuxinye] 数据库测试请求异常：', xuxinye_error);
    } finally {
      xuxinye_submitEl.disabled = false;
      xuxinye_submitEl.textContent = '连接数据库';
    }
  }

  xuxinye_form.addEventListener('submit', xuxinye_submit);
})();
