/* =============================================
   MAIN.JS — All interactions & animations
   Magic MCP patterns: Particles, Tilt, Counters
============================================= */
'use strict';

/* ---- 1. PARTICLE CANVAS ---- */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, raf;
  const mouse = { x: -9999, y: -9999 };

  const COLORS = ['6,182,212', '139,92,246', '59,130,246', '249,115,22'];
  let particles = [];

  function rand(a, b) { return Math.random() * (b - a) + a; }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor(W * H / 12000), 90);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: rand(0, W), y: rand(0, H),
        vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
        r: rand(1, 2.8),
        alpha: rand(0.15, 0.55),
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }
  }

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    createParticles();
  }

  window.addEventListener('resize', resize);
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(6,182,212,${0.05 * (1 - d / 130)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      // Mouse repel
      const mdx = particles[i].x - mouse.x;
      const mdy = particles[i].y - mouse.y;
      const md = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < 110) {
        particles[i].vx += (mdx / md) * 0.35;
        particles[i].vy += (mdy / md) * 0.35;
      }

      // Update
      particles[i].vx *= 0.99;
      particles[i].vy *= 0.99;
      const sp = Math.sqrt(particles[i].vx ** 2 + particles[i].vy ** 2);
      if (sp > 1.4) { particles[i].vx = (particles[i].vx / sp) * 1.4; particles[i].vy = (particles[i].vy / sp) * 1.4; }
      particles[i].x += particles[i].vx;
      particles[i].y += particles[i].vy;

      // Wrap edges
      if (particles[i].x < -5) particles[i].x = W + 5;
      if (particles[i].x > W + 5) particles[i].x = -5;
      if (particles[i].y < -5) particles[i].y = H + 5;
      if (particles[i].y > H + 5) particles[i].y = -5;

      // Draw dot
      ctx.beginPath();
      ctx.arc(particles[i].x, particles[i].y, particles[i].r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particles[i].color},${particles[i].alpha})`;
      ctx.fill();
    }

    raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
})();

/* ---- 2. TYPING EFFECT on hero gradient text ---- */
(function initTyping() {
  const el = document.querySelector('.hero-type-target');
  if (!el) return;

  const text = el.dataset.text || el.textContent;
  el.textContent = '';

  let i = 0;
  const type = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, 55 + Math.random() * 30);
    }
  };
  // Delay to allow hero fade-in first
  setTimeout(type, 600);
})();

/* ---- 3. SCROLL REVEAL ---- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ---- 4. 3D TILT on bento cards ---- */
(function initTilt() {
  const cards = document.querySelectorAll('.bento-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `translateY(-7px) scale(1.01) rotateX(${-y * 7}deg) rotateY(${x * 7}deg)`;
      card.style.transition = 'none';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = '';
    });
  });
})();

/* ---- 5. COUNTER ANIMATION ---- */
(function initCounters() {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el   = e.target;
      const end  = parseFloat(el.dataset.count);
      const pre  = el.dataset.pre  || '';
      const suf  = el.dataset.suf  || '';
      const dec  = parseInt(el.dataset.dec) || 0;
      const dur  = 2000;
      const t0   = performance.now();

      const update = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = pre + (end * eased).toFixed(dec) + suf;
        if (p < 1) requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(el => io.observe(el));
})();

/* ---- 6. STAT PROGRESS BARS ---- */
(function initBars() {
  const bars = document.querySelectorAll('.stat-b-bar[data-w]');
  if (!bars.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const bar = e.target;
      bar.style.width = '0';
      bar.style.transition = 'none';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.transition = 'width 1.6s cubic-bezier(0,0,0.2,1)';
          bar.style.width = bar.dataset.w;
        });
      });
      io.unobserve(bar);
    });
  }, { threshold: 0.5 });

  bars.forEach(b => io.observe(b));
})();

/* ---- 7. PROFESSION CARDS ACCORDION ---- */
(function initProfCards() {
  const cards = document.querySelectorAll('.prof-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const wasOpen = card.classList.contains('open');
      cards.forEach(c => c.classList.remove('open'));
      if (!wasOpen) card.classList.add('open');
    });
  });
})();

/* ---- 8. AURORA CTA BOX — dynamic gradient ---- */
(function initAurora() {
  const box = document.querySelector('.cta-box');
  if (!box) return;

  let hue = 0;
  const tick = () => {
    hue = (hue + 0.2) % 360;
    box.style.background =
      `linear-gradient(${hue}deg,
       rgba(6,182,212,0.07),
       rgba(139,92,246,0.05),
       rgba(59,130,246,0.06))`;
    requestAnimationFrame(tick);
  };
  tick();
})();

/* ---- 9. SMOOTH SCROLL for anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ---- 10. NAVBAR SCROLL EFFECT (if nav-placeholder is loaded) ---- */
(function initNavScroll() {
  let last = 0;
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    const y = window.scrollY;
    if (y > 80) {
      nav.style.background = 'rgba(6,9,22,0.97)';
      nav.style.borderBottom = '1px solid rgba(6,182,212,0.12)';
    } else {
      nav.style.background = '';
      nav.style.borderBottom = '';
    }
    last = y;
  }, { passive: true });
})();
