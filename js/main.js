// ========================================
// PARTICLE SYSTEM ANIMATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const particles = [];
  const particleCount = 40;
  const mouse = { x: null, y: null, radius: 150 };
  const mouseRadiusSq = mouse.radius * mouse.radius;

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
        // BOLT OPTIMIZATION: Use squared distance to avoid expensive Math.sqrt calls
        const distSq = dx * dx + dy * dy;
        
        if (distSq < mouseRadiusSq && distSq > 0) {
          const distance = Math.sqrt(distSq);
          const force = (mouse.radius - distance) / mouse.radius;
          // BOLT OPTIMIZATION: Avoid Math.atan2/cos/sin by using vector normalization
          const invDist = 1 / distance;
          this.x -= (dx * invDist) * force * 3;
          this.y -= (dy * invDist) * force * 3;
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
      ctx.fill();

      // BOLT OPTIMIZATION: Removed shadowBlur and redundant fill().
      // shadowBlur is extremely expensive as it often requires an extra offscreen buffer
      // or a Gaussian blur pass on every frame.
    }
  }

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    // BOLT OPTIMIZATION: Reduced connection limit and pre-squared it
    const connectionLimitSq = 150 * 150;

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < connectionLimitSq) {
          const distance = Math.sqrt(distSq);
          const opacity = (1 - distance / 150) * 0.08;
          
          // BOLT OPTIMIZATION: Replaced createLinearGradient with simple strokeStyle.
          // createLinearGradient creates a new object and expensive state change every iteration.
          ctx.beginPath();
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
          ctx.lineWidth = 0.3;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // BOLT OPTIMIZATION: Using a standard for loop for better performance over forEach
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
