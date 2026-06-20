/* =============================================
   SCROLL-VIDEO.JS
   Apple-style scroll-driven video
   + Parallax on second video
============================================= */
'use strict';

/* ============================================
   SCROLL-DRIVEN VIDEO (Apple iPhone style)
   Video currentTime = f(scrollY)
============================================= */
(function initScrollVideo() {
  const wrap   = document.getElementById('scrollVideoWrap');
  const canvas = document.getElementById('scrollVideoCanvas');
  const panels = document.querySelectorAll('.scroll-panel');
  const dots   = document.querySelectorAll('.scroll-dot');
  const bar    = document.querySelector('.scroll-progress-bar');

  if (!wrap || !canvas) return;

  const ctx = canvas.getContext('2d');
  const video = document.createElement('video');
  video.src = 'video/193-135845515.mp4';
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';

  let videoReady = false;
  let currentPanel = -1;

  video.addEventListener('loadeddata', () => {
    videoReady = true;
    renderFrame(0);
  });
  video.load();

  function resizeCanvas() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function renderFrame(time) {
    if (!videoReady) return;
    video.currentTime = Math.min(time, video.duration - 0.01);
  }

  video.addEventListener('seeked', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Fill black first
    ctx.fillStyle = '#02040a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw video frame — cover fit
    const vAspect = video.videoWidth / video.videoHeight;
    const cAspect = canvas.width / canvas.height;
    let sx=0, sy=0, sw=video.videoWidth, sh=video.videoHeight;

    if (vAspect > cAspect) {
      sw = video.videoHeight * cAspect;
      sx = (video.videoWidth - sw) / 2;
    } else {
      sh = video.videoWidth / cAspect;
      sy = (video.videoHeight - sh) / 2;
    }
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    // Vignette
    const gradient = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, canvas.height*0.3,
      canvas.width/2, canvas.height/2, canvas.height*0.8
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cyan tint at top
    const topGrad = ctx.createLinearGradient(0,0,0,canvas.height*0.4);
    topGrad.addColorStop(0, 'rgba(6,182,212,0.07)');
    topGrad.addColorStop(1, 'rgba(6,182,212,0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bottom fade to black
    const botGrad = ctx.createLinearGradient(0, canvas.height*0.7, 0, canvas.height);
    botGrad.addColorStop(0, 'rgba(2,4,10,0)');
    botGrad.addColorStop(1, 'rgba(2,4,10,1)');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  // PANELS config — when to show each panel (0-1 progress)
  const PANEL_BREAKS = [0, 0.28, 0.55, 0.82];

  function onScroll() {
    const rect = wrap.getBoundingClientRect();
    const totalH = wrap.offsetHeight - window.innerHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / totalH));

    // Map scroll progress to video time
    if (videoReady && video.duration) {
      renderFrame(progress * video.duration);
    }

    // Progress bar
    if (bar) bar.style.width = (progress * 100) + '%';

    // Which panel to show
    let newPanel = 0;
    for (let i = PANEL_BREAKS.length - 1; i >= 0; i--) {
      if (progress >= PANEL_BREAKS[i]) { newPanel = i; break; }
    }

    if (newPanel !== currentPanel) {
      panels.forEach((p, i) => p.classList.toggle('active', i === newPanel));
      dots.forEach((d, i) => d.classList.toggle('active', i === newPanel));
      currentPanel = newPanel;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  // Initial render
  setTimeout(() => {
    onScroll();
    if (panels[0]) panels[0].classList.add('active');
    if (dots[0]) dots[0].classList.add('active');
  }, 300);
})();

/* ============================================
   PARALLAX VIDEO (second video)
============================================= */
(function initParallaxVideo() {
  const section = document.querySelector('.parallax-section');
  const bgWrap  = document.querySelector('.parallax-video-bg');
  if (!section || !bgWrap) return;

  window.addEventListener('scroll', () => {
    const rect = section.getBoundingClientRect();
    const viewH = window.innerHeight;
    if (rect.bottom < 0 || rect.top > viewH) return;

    const progress = (viewH - rect.top) / (viewH + rect.height);
    const offset = (progress - 0.5) * 120; // px shift
    bgWrap.style.transform = `translateY(${offset}px)`;
  }, { passive: true });
})();
