/* ============================================
   TINY ARCADE - Particle System
   Ambient and effect particles
   ============================================ */

class ParticleSystem {
    constructor(canvasId = 'particles') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn('Particle canvas not found:', canvasId);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.maxAmbientParticles = 30;
        this.ambientSpawnRate = 0.02;
        this.running = true;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // ============================================
    // Particle Creation
    // ============================================

    // Generic particle
    addParticle(x, y, options = {}) {
        this.particles.push({
            x: x,
            y: y,
            vx: options.vx ?? (Math.random() - 0.5) * 2,
            vy: options.vy ?? (Math.random() - 0.5) * 2,
            life: options.life ?? 1,
            decay: options.decay ?? 0.02,
            size: options.size ?? (3 + Math.random() * 4),
            color: options.color ?? '#1a1a1a',
            alpha: options.alpha ?? 0.6
        });
    }

    // Burst of particles (for effects)
    addBurst(x, y, count = 8, color = '#1a1a1a', options = {}) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = (options.speed ?? 2) + Math.random() * 2;
            this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: options.size ?? (3 + Math.random() * 2),
                decay: options.decay ?? 0.03,
                alpha: options.alpha ?? 0.6
            });
        }
    }

    // Radial explosion
    addExplosion(x, y, count = 15, color = '#d4908a') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            this.addParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 2 + Math.random() * 4,
                decay: 0.02 + Math.random() * 0.02,
                alpha: 0.8
            });
        }
    }

    // Rising particles (celebration)
    addRising(x, y, count = 5, color = '#e8c872') {
        for (let i = 0; i < count; i++) {
            this.addParticle(x + (Math.random() - 0.5) * 20, y, {
                vx: (Math.random() - 0.5) * 1,
                vy: -2 - Math.random() * 3,
                color: color,
                size: 3 + Math.random() * 3,
                decay: 0.01,
                alpha: 0.7
            });
        }
    }

    // Trail effect (for moving objects)
    addTrail(x, y, color = '#8a8a8a') {
        this.addParticle(x, y, {
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            color: color,
            size: 2 + Math.random() * 2,
            decay: 0.05,
            alpha: 0.3
        });
    }

    // ============================================
    // Ambient Particles
    // ============================================

    addAmbientParticle() {
        const ambientCount = this.particles.filter(p => p.ambient).length;
        if (ambientCount < this.maxAmbientParticles && Math.random() < this.ambientSpawnRate) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: -0.3 - Math.random() * 0.5,
                life: 1,
                decay: 0.003 + Math.random() * 0.002,
                size: 2 + Math.random() * 3,
                color: `hsl(${Math.random() * 40 + 20}, 30%, 70%)`,
                alpha: 0.3,
                ambient: true
            });
        }
    }

    // Set ambient particle style
    setAmbientStyle(options = {}) {
        this.maxAmbientParticles = options.maxParticles ?? 30;
        this.ambientSpawnRate = options.spawnRate ?? 0.02;
        this.ambientColor = options.color ?? null;
    }

    // ============================================
    // Animation Loop
    // ============================================

    animate() {
        if (!this.running || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.addAmbientParticle();

        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) return false;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life * p.alpha;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;

            return true;
        });

        requestAnimationFrame(() => this.animate());
    }

    // Stop/start
    stop() {
        this.running = false;
    }

    start() {
        if (!this.running) {
            this.running = true;
            this.animate();
        }
    }

    // Clear all particles
    clear() {
        this.particles = [];
    }
}

// Global instance (created when DOM is ready)
let particles;
document.addEventListener('DOMContentLoaded', () => {
    particles = new ParticleSystem();
});
