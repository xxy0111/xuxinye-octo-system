/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 数据库连接测试页：提交账号密码到 /api/db/test
 */
(function () {
  const Cheney_form = document.getElementById('Cheney_dbForm');
  const Cheney_userEl = document.getElementById('Cheney_user');
  const Cheney_passwordEl = document.getElementById('Cheney_password');
  const Cheney_submitEl = document.getElementById('Cheney_submit');
  const Cheney_resultEl = document.getElementById('Cheney_result');
  const Cheney_apiDataEl = document.getElementById('Cheney_apiData');

  async function Cheney_submit(Cheney_event) {
    Cheney_event.preventDefault();

    Cheney_submitEl.disabled = true;
    Cheney_submitEl.textContent = '正在连接……';
    Cheney_resultEl.className = 'Cheney_result';
    Cheney_resultEl.textContent = '';

    try {
      const Cheney_result = await Cheney_api.Cheney_post('/api/db/test', {
        Cheney_user: Cheney_userEl.value,
        Cheney_password: Cheney_passwordEl.value
      });

      Cheney_api.Cheney_showJson(Cheney_apiDataEl, Cheney_result);

      if (Cheney_result.code === 0) {
        Cheney_resultEl.className = 'Cheney_result Cheney_result--ok';
        Cheney_resultEl.textContent =
          '连接成功：数据库 ' +
          Cheney_result.data.Cheney_database +
          '，版本 ' +
          Cheney_result.data.Cheney_version +
          '，账号 ' +
          Cheney_result.data.Cheney_account;
        console.log('[Cheney] 数据库连接成功：', Cheney_result.data);
      } else {
        Cheney_resultEl.className = 'Cheney_result Cheney_result--error';
        Cheney_resultEl.textContent = '连接失败：' + Cheney_result.msg;
        console.error('[Cheney] 数据库连接失败：' + Cheney_result.msg);
      }
    } catch (Cheney_error) {
      Cheney_resultEl.className = 'Cheney_result Cheney_result--error';
      Cheney_resultEl.textContent = '请求异常：无法连接后端接口，请确认服务已在 8111 端口启动。';
      console.error('[Cheney] 数据库测试请求异常：', Cheney_error);
    } finally {
      Cheney_submitEl.disabled = false;
      Cheney_submitEl.textContent = '连接数据库';
    }
  }

  Cheney_form.addEventListener('submit', Cheney_submit);
})();
