(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const SPACING = 10;
  const DOT_R = 2.2;
  const PATCH_SCALE = 160;
  const PATCH_THRESHOLD = 0.65;

  const purple = '#7C3AED';
  const yellow = '#DAAD30';

  let mouseX = width / 2;
  let mouseY = height / 2;
  let easedX = mouseX;
  let easedY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  function tick() {
    easedX += (mouseX - easedX) * 0.06;
    easedY += (mouseY - easedY) * 0.06;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const offsetX = (easedX - centerX) / centerX;
    const offsetY = (easedY - centerY) / centerY;

    const shiftX = offsetX * 10;
    const shiftY = offsetY * 10;

    const startX = -((width % SPACING) + SPACING);
    const startY = -((height % SPACING) + SPACING);

    const minDim = Math.min(width, height);
    const inner = minDim * 0.28;
    const outer = minDim * 0.52;

    for (let y = startY; y < height + SPACING; y += SPACING) {
      for (let x = startX; x < width + SPACING; x += SPACING) {
        const gx = x + shiftX;
        const gy = y + shiftY;

        const v = Math.sin(gx / PATCH_SCALE) + Math.cos(gy / PATCH_SCALE);
        const useColor = Math.abs(v) > PATCH_THRESHOLD;
        if (!useColor) continue;

        const dx = gx - centerX;
        const dy = gy - centerY;
        const dist = Math.hypot(dx, dy);
        let alpha = 1;
        if (dist < inner) {
          alpha = 0;
        } else if (dist < outer) {
          alpha = (dist - inner) / (outer - inner);
        }

        if (alpha <= 0) continue;

        ctx.beginPath();
        ctx.fillStyle = v > 0 ? purple : yellow;
        ctx.globalAlpha = alpha * 0.9;
        ctx.arc(gx, gy, DOT_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    requestAnimationFrame(tick);
  }

  tick();
})();


