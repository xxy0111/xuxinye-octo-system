/**
 * 姓名：徐欣烨 | 学号：22001010111 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
 * 首页背景动画：粒子漂浮 + 邻近连线
 */
(function () {
  const Cheney_canvas = document.getElementById('Cheney_canvas');
  if (!Cheney_canvas) {
    return;
  }

  const Cheney_ctx = Cheney_canvas.getContext('2d');
  const Cheney_dots = [];
  const Cheney_DOT_COUNT = 70;
  const Cheney_LINK_DISTANCE = 150;
  let Cheney_width = 0;
  let Cheney_height = 0;

  function Cheney_resize() {
    const Cheney_ratio = window.devicePixelRatio || 1;
    Cheney_width = window.innerWidth;
    Cheney_height = window.innerHeight;
    Cheney_canvas.width = Cheney_width * Cheney_ratio;
    Cheney_canvas.height = Cheney_height * Cheney_ratio;
    Cheney_ctx.setTransform(Cheney_ratio, 0, 0, Cheney_ratio, 0, 0);
  }

  function Cheney_createDots() {
    Cheney_dots.length = 0;
    for (let Cheney_i = 0; Cheney_i < Cheney_DOT_COUNT; Cheney_i += 1) {
      Cheney_dots.push({
        Cheney_x: Math.random() * Cheney_width,
        Cheney_y: Math.random() * Cheney_height,
        Cheney_vx: (Math.random() - 0.5) * 0.45,
        Cheney_vy: (Math.random() - 0.5) * 0.45,
        Cheney_r: Math.random() * 1.6 + 0.8
      });
    }
  }

  function Cheney_draw() {
    Cheney_ctx.clearRect(0, 0, Cheney_width, Cheney_height);

    for (let Cheney_i = 0; Cheney_i < Cheney_dots.length; Cheney_i += 1) {
      const Cheney_dot = Cheney_dots[Cheney_i];
      Cheney_dot.Cheney_x += Cheney_dot.Cheney_vx;
      Cheney_dot.Cheney_y += Cheney_dot.Cheney_vy;

      if (Cheney_dot.Cheney_x < 0 || Cheney_dot.Cheney_x > Cheney_width) {
        Cheney_dot.Cheney_vx *= -1;
      }
      if (Cheney_dot.Cheney_y < 0 || Cheney_dot.Cheney_y > Cheney_height) {
        Cheney_dot.Cheney_vy *= -1;
      }

      Cheney_ctx.beginPath();
      Cheney_ctx.arc(Cheney_dot.Cheney_x, Cheney_dot.Cheney_y, Cheney_dot.Cheney_r, 0, Math.PI * 2);
      Cheney_ctx.fillStyle = 'rgba(120, 200, 255, 0.75)';
      Cheney_ctx.fill();

      for (let Cheney_j = Cheney_i + 1; Cheney_j < Cheney_dots.length; Cheney_j += 1) {
        const Cheney_other = Cheney_dots[Cheney_j];
        const Cheney_dx = Cheney_dot.Cheney_x - Cheney_other.Cheney_x;
        const Cheney_dy = Cheney_dot.Cheney_y - Cheney_other.Cheney_y;
        const Cheney_distance = Math.sqrt(Cheney_dx * Cheney_dx + Cheney_dy * Cheney_dy);

        if (Cheney_distance < Cheney_LINK_DISTANCE) {
          Cheney_ctx.beginPath();
          Cheney_ctx.moveTo(Cheney_dot.Cheney_x, Cheney_dot.Cheney_y);
          Cheney_ctx.lineTo(Cheney_other.Cheney_x, Cheney_other.Cheney_y);
          Cheney_ctx.strokeStyle = 'rgba(79, 140, 255, ' + (0.22 * (1 - Cheney_distance / Cheney_LINK_DISTANCE)).toFixed(3) + ')';
          Cheney_ctx.lineWidth = 1;
          Cheney_ctx.stroke();
        }
      }
    }

    window.requestAnimationFrame(Cheney_draw);
  }

  Cheney_resize();
  Cheney_createDots();
  Cheney_draw();

  window.addEventListener('resize', function () {
    Cheney_resize();
    Cheney_createDots();
  });
})();
