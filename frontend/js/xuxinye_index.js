/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 首页背景动画：粒子漂浮 + 邻近连线
 */
(function () {
  const xuxinye_canvas = document.getElementById('xuxinye_canvas');
  if (!xuxinye_canvas) {
    return;
  }

  const xuxinye_ctx = xuxinye_canvas.getContext('2d');
  const xuxinye_dots = [];
  const xuxinye_DOT_COUNT = 70;
  const xuxinye_LINK_DISTANCE = 150;
  let xuxinye_width = 0;
  let xuxinye_height = 0;

  function xuxinye_resize() {
    const xuxinye_ratio = window.devicePixelRatio || 1;
    xuxinye_width = window.innerWidth;
    xuxinye_height = window.innerHeight;
    xuxinye_canvas.width = xuxinye_width * xuxinye_ratio;
    xuxinye_canvas.height = xuxinye_height * xuxinye_ratio;
    xuxinye_ctx.setTransform(xuxinye_ratio, 0, 0, xuxinye_ratio, 0, 0);
  }

  function xuxinye_createDots() {
    xuxinye_dots.length = 0;
    for (let xuxinye_i = 0; xuxinye_i < xuxinye_DOT_COUNT; xuxinye_i += 1) {
      xuxinye_dots.push({
        xuxinye_x: Math.random() * xuxinye_width,
        xuxinye_y: Math.random() * xuxinye_height,
        xuxinye_vx: (Math.random() - 0.5) * 0.45,
        xuxinye_vy: (Math.random() - 0.5) * 0.45,
        xuxinye_r: Math.random() * 1.6 + 0.8
      });
    }
  }

  function xuxinye_draw() {
    xuxinye_ctx.clearRect(0, 0, xuxinye_width, xuxinye_height);

    for (let xuxinye_i = 0; xuxinye_i < xuxinye_dots.length; xuxinye_i += 1) {
      const xuxinye_dot = xuxinye_dots[xuxinye_i];
      xuxinye_dot.xuxinye_x += xuxinye_dot.xuxinye_vx;
      xuxinye_dot.xuxinye_y += xuxinye_dot.xuxinye_vy;

      if (xuxinye_dot.xuxinye_x < 0 || xuxinye_dot.xuxinye_x > xuxinye_width) {
        xuxinye_dot.xuxinye_vx *= -1;
      }
      if (xuxinye_dot.xuxinye_y < 0 || xuxinye_dot.xuxinye_y > xuxinye_height) {
        xuxinye_dot.xuxinye_vy *= -1;
      }

      xuxinye_ctx.beginPath();
      xuxinye_ctx.arc(xuxinye_dot.xuxinye_x, xuxinye_dot.xuxinye_y, xuxinye_dot.xuxinye_r, 0, Math.PI * 2);
      xuxinye_ctx.fillStyle = 'rgba(120, 200, 255, 0.75)';
      xuxinye_ctx.fill();

      for (let xuxinye_j = xuxinye_i + 1; xuxinye_j < xuxinye_dots.length; xuxinye_j += 1) {
        const xuxinye_other = xuxinye_dots[xuxinye_j];
        const xuxinye_dx = xuxinye_dot.xuxinye_x - xuxinye_other.xuxinye_x;
        const xuxinye_dy = xuxinye_dot.xuxinye_y - xuxinye_other.xuxinye_y;
        const xuxinye_distance = Math.sqrt(xuxinye_dx * xuxinye_dx + xuxinye_dy * xuxinye_dy);

        if (xuxinye_distance < xuxinye_LINK_DISTANCE) {
          xuxinye_ctx.beginPath();
          xuxinye_ctx.moveTo(xuxinye_dot.xuxinye_x, xuxinye_dot.xuxinye_y);
          xuxinye_ctx.lineTo(xuxinye_other.xuxinye_x, xuxinye_other.xuxinye_y);
          xuxinye_ctx.strokeStyle = 'rgba(79, 140, 255, ' + (0.22 * (1 - xuxinye_distance / xuxinye_LINK_DISTANCE)).toFixed(3) + ')';
          xuxinye_ctx.lineWidth = 1;
          xuxinye_ctx.stroke();
        }
      }
    }

    window.requestAnimationFrame(xuxinye_draw);
  }

  xuxinye_resize();
  xuxinye_createDots();
  xuxinye_draw();

  window.addEventListener('resize', function () {
    xuxinye_resize();
    xuxinye_createDots();
  });
})();
