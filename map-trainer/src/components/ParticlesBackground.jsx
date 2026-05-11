import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 40;
const CONNECTION_DISTANCE = 120;
const SPEED = 0.08;

export default function ParticlesBackground() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Инициализация частиц — равномерная сетка с небольшим смещением
    const cols = Math.ceil(Math.sqrt(PARTICLE_COUNT * (canvas.width / canvas.height)));
    const rows = Math.ceil(PARTICLE_COUNT / cols);
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        x: cellW * col + cellW * 0.2 + Math.random() * cellW * 0.6,
        y: cellH * row + cellH * 0.2 + Math.random() * cellH * 0.6,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        size: 1.2 + Math.random() * 1.5,
        opacity: 0.2 + Math.random() * 0.25,
      };
    });

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      // Обновляем позиции
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));
      }

      // Рисуем соединения
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212,168,83,${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      // Рисуем частицы
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,168,83,${p.opacity})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        grad.addColorStop(0, `rgba(251,191,36,${p.opacity * 0.2})`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 0,
      pointerEvents: "none",
      overflow: "hidden",
    }}>
      {/* Анимированный градиент фона */}
      <div className="animated-bg" />

      {/* Canvas с частицами и соединениями */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
        }}
      />

      <style>{`
        .animated-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            #060810 0%,
            #0a0e17 25%,
            #12100c 50%,
            #0a0e17 75%,
            #060810 100%
          );
          background-size: 400% 400%;
          animation: gradientShift 20s ease infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 50% 100%; }
          75% { background-position: 0% 50%; }
          100% { background-position: 0% 0%; }
        }
      `}</style>
    </div>
  );
}
