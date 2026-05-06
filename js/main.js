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

      // Mouse interaction - Optimized: using squared distance and avoiding trig functions
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = mouse.radius * mouse.radius;
        
        if (distSq < radiusSq && distSq > 0) {
          const distance = Math.sqrt(distSq);
          const force = (mouse.radius - distance) / mouse.radius;
          // Normalize vector (dx/distance, dy/distance) and apply force
          this.x += (dx / distance) * force * 3;
          this.y += (dy / distance) * force * 3;
        }
      }

      // Bounce off edges
      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < 0 || this.y > height) this.speedY *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;

      // Optimized: single fill call, shadow only if absolutely necessary
      // and only on some particles to save performance
      if (this.size > 2) {
        ctx.shadowBlur = 4;
        ctx.shadowColor = this.color;
      }

      ctx.fill();

      if (this.size > 2) {
        ctx.shadowBlur = 0;
      }
    }
  }

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    const maxDistanceSq = 150 * 150;

    // Set common styles outside the loop
    ctx.lineWidth = 0.3;

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < maxDistanceSq) {
          const distance = Math.sqrt(distSq);
          const opacity = (1 - distance / 150) * 0.08;
          
          // Optimized: avoid createLinearGradient which creates GC pressure
          // Use a simple stroke color instead
          ctx.beginPath();
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Optimized: using standard for loop instead of forEach
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    connectParticles();
    requestAnimationFrame(animate);
  }

  animate();

  // Mouse interaction - только отслеживание, без перехвата событий
  window.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', function() {
    mouse.x = null;
    mouse.y = null;
  });

  // Handle resize
  window.addEventListener('resize', function() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
});
