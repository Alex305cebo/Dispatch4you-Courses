// Particle Hero Effect - Vanilla JS Version
// Based on Anti-Gravity Canvas concept

class ParticleHero {
    constructor(canvasId, containerId) {
        this.canvas = document.getElementById(canvasId);
        this.container = document.getElementById(containerId);
        this.ctx = this.canvas.getContext('2d');

        // Configuration
        this.PARTICLE_DENSITY = 0.00015;
        this.BG_PARTICLE_DENSITY = 0.00005;
        this.MOUSE_RADIUS = 180;
        this.RETURN_SPEED = 0.08;
        this.DAMPING = 0.90;
        this.REPULSION_STRENGTH = 1.2;

        // State
        this.particles = [];
        this.backgroundParticles = [];
        this.mouse = { x: -1000, y: -1000, isActive: false };
        this.frameId = null;
        this.lastTime = 0;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.initParticles();
        this.setupEventListeners();
        this.animate(0);
    }

    setupCanvas() {
        const { width, height } = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;

        this.ctx.scale(dpr, dpr);
        this.width = width;
        this.height = height;
    }

    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    initParticles() {
        // Main interactive particles
        const particleCount = Math.floor(this.width * this.height * this.PARTICLE_DENSITY);
        this.particles = [];

        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;

            this.particles.push({
                x, y,
                originX: x,
                originY: y,
                vx: 0,
                vy: 0,
                size: this.randomRange(1, 2.5),
                color: Math.random() > 0.9 ? '#6366f1' : '#ffffff',
                angle: Math.random() * Math.PI * 2
            });
        }

        // Background ambient particles
        const bgCount = Math.floor(this.width * this.height * this.BG_PARTICLE_DENSITY);
        this.backgroundParticles = [];

        for (let i = 0; i < bgCount; i++) {
            this.backgroundParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                size: this.randomRange(0.5, 1.5),
                alpha: this.randomRange(0.1, 0.4),
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    setupEventListeners() {
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouse = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                isActive: true
            };
        });

        this.container.addEventListener('mouseleave', () => {
            this.mouse.isActive = false;
        });

        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.initParticles();
        });
    }

    animate(time) {
        const delta = time - this.lastTime;
        this.lastTime = time;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw pulsating radial glow
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const pulseOpacity = Math.sin(time * 0.0008) * 0.035 + 0.085;

        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, Math.max(this.width, this.height) * 0.7
        );
        gradient.addColorStop(0, `rgba(99, 102, 241, ${pulseOpacity})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw background particles
        this.drawBackgroundParticles(time);

        // Update and draw main particles
        this.updateParticles();
        this.drawParticles();

        this.frameId = requestAnimationFrame((t) => this.animate(t));
    }

    drawBackgroundParticles(time) {
        this.ctx.fillStyle = '#ffffff';

        for (let p of this.backgroundParticles) {
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;
            if (p.y < 0) p.y = this.height;
            if (p.y > this.height) p.y = 0;

            // Twinkle effect
            const twinkle = Math.sin(time * 0.002 + p.phase) * 0.5 + 0.5;
            const currentAlpha = p.alpha * (0.3 + 0.7 * twinkle);

            this.ctx.globalAlpha = currentAlpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalAlpha = 1.0;
    }

    updateParticles() {
        // Apply forces
        for (let p of this.particles) {
            // Mouse repulsion
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (this.mouse.isActive && distance < this.MOUSE_RADIUS) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (this.MOUSE_RADIUS - distance) / this.MOUSE_RADIUS;
                const repulsion = force * this.REPULSION_STRENGTH;

                p.vx -= forceDirectionX * repulsion * 5;
                p.vy -= forceDirectionY * repulsion * 5;
            }

            // Spring force (return to origin)
            const springDx = p.originX - p.x;
            const springDy = p.originY - p.y;
            p.vx += springDx * this.RETURN_SPEED;
            p.vy += springDy * this.RETURN_SPEED;
        }

        // Resolve collisions
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const distSq = dx * dx + dy * dy;
                const minDist = p1.size + p2.size;

                if (distSq < minDist * minDist) {
                    const dist = Math.sqrt(distSq);
                    if (dist > 0.01) {
                        const nx = dx / dist;
                        const ny = dy / dist;

                        // Push apart
                        const overlap = minDist - dist;
                        const pushX = nx * overlap * 0.5;
                        const pushY = ny * overlap * 0.5;

                        p1.x -= pushX;
                        p1.y -= pushY;
                        p2.x += pushX;
                        p2.y += pushY;

                        // Elastic collision
                        const dvx = p1.vx - p2.vx;
                        const dvy = p1.vy - p2.vy;
                        const velocityAlongNormal = dvx * nx + dvy * ny;

                        if (velocityAlongNormal > 0) {
                            const m1 = p1.size;
                            const m2 = p2.size;
                            const restitution = 0.85;
                            const impulseMagnitude = (-(1 + restitution) * velocityAlongNormal) / (1 / m1 + 1 / m2);

                            const impulseX = impulseMagnitude * nx;
                            const impulseY = impulseMagnitude * ny;

                            p1.vx += impulseX / m1;
                            p1.vy += impulseY / m1;
                            p2.vx -= impulseX / m2;
                            p2.vy -= impulseY / m2;
                        }
                    }
                }
            }
        }

        // Integration
        for (let p of this.particles) {
            p.vx *= this.DAMPING;
            p.vy *= this.DAMPING;
            p.x += p.vx;
            p.y += p.vy;
        }
    }

    drawParticles() {
        for (let p of this.particles) {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

            const velocity = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const opacity = Math.min(0.3 + velocity * 0.1, 1);

            this.ctx.fillStyle = p.color === '#ffffff'
                ? `rgba(255, 255, 255, ${opacity})`
                : p.color;
            this.ctx.fill();
        }
    }

    destroy() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particle-canvas');
    const container = document.getElementById('particle-container');

    if (canvas && container) {
        window.particleHero = new ParticleHero('particle-canvas', 'particle-container');
    }
});
