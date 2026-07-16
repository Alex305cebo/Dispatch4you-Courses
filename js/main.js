// ========================================
// PARTICLE SYSTEM ANIMATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;

  // Отключаем анимацию на мобильных для производительности
  const isMobile = window.innerWidth <= 768;
  const isLowPerformance = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  
  if (isMobile || isLowPerformance) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const particles = [];
  const particleCount = 40;
  const mouse = { x: null, y: null, radius: 150 };

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.color = this.randomColor();
    }

    randomColor() {
      const colors = [
        'rgba(139, 92, 246, 0.15)',   // Purple
        'rgba(59, 130, 246, 0.15)',   // Blue
        'rgba(6, 182, 212, 0.15)',    // Cyan
        'rgba(168, 85, 247, 0.15)'    // Light purple
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Mouse interaction
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 3;
          this.y -= Math.sin(angle) * force * 3;
        }
      }

      // Bounce off edges. Скорость не просто флипается, а задаётся по знаку:
      // при сужении окна частица могла остаться ЗА новой границей, и тогда
      // условие срабатывало каждый кадр — частица залипала и вибрировала.
      if (this.x < 0) { this.x = 0; this.speedX = Math.abs(this.speedX); }
      else if (this.x > width) { this.x = width; this.speedX = -Math.abs(this.speedX); }
      if (this.y < 0) { this.y = 0; this.speedY = Math.abs(this.speedY); }
      else if (this.y > height) { this.y = height; this.speedY = -Math.abs(this.speedY); }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      // Very subtle glow
      ctx.shadowBlur = 4;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    // Стиль задаётся один раз на весь кадр, а не на каждую линию.
    ctx.strokeStyle = 'rgb(59, 130, 246)';
    ctx.lineWidth = 0.3;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          // Раньше здесь на КАЖДУЮ пару КАЖДЫЙ кадр создавался объект градиента
          // (~100 аллокаций в кадр → постоянное давление на сборщик мусора).
          // Переход фиолетовый→синий→циан при итоговой прозрачности ~2%
          // (0.08 линии × 0.28 непрозрачности канваса) под filter: blur(1px)
          // неразличим, поэтому — сплошной средний цвет через globalAlpha.
          ctx.globalAlpha = (1 - distance / 150) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1; // не даём альфе протечь на следующий кадр
  }

  let rafId = null;

  function animate() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(particle => {
      particle.update();
      particle.draw();
    });

    connectParticles();
    rafId = requestAnimationFrame(animate);
  }

  animate();

  // В фоновой вкладке рисовать некому. Канвас position:fixed и просвечивает
  // сквозь полупрозрачные секции на всей странице, поэтому останавливать его
  // по скроллу нельзя — частицы замрут на виду. А вот скрытую вкладку — можно.
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else if (rafId === null) {
      animate();
    }
  });

  // Mouse interaction - только отслеживание, без перехвата событий
  window.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  // mouseleave вешаем на <html>, а не на window: window — не элемент, и это
  // событие на нём не срабатывало, поэтому координаты мыши никогда не
  // сбрасывались и частицы продолжали шарахаться от «призрака» курсора.
  document.documentElement.addEventListener('mouseleave', function() {
    mouse.x = null;
    mouse.y = null;
  });

  // Handle resize
  window.addEventListener('resize', function() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
});
