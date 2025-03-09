// canvas-animation.js
class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('background-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.addEventListeners();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const particleCount = Math.floor(window.innerWidth * 0.2);
        for(let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speedX: Math.random() * 0.5 - 0.25,
                speedY: Math.random() * 0.5 - 0.25,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        }
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.fill();
    }

    updateParticle(particle) {
        // Movimiento base
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Interacción con mouse
        if(this.mouse.x && this.mouse.y) {
            const dx = particle.x - this.mouse.x;
            const dy = particle.y - this.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if(distance < 100) {
                particle.x += (dx / distance) * 0.5;
                particle.y += (dy / distance) * 0.5;
            }
        }
        
        // Rebote en bordes
        if(particle.x > this.canvas.width || particle.x < 0) particle.speedX *= -1;
        if(particle.y > this.canvas.height || particle.y < 0) particle.speedY *= -1;
    }

    drawConnections() {
        this.particles.forEach(p1 => {
            this.particles.forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if(distance < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(255,255,255,${1 - distance/120})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            });
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
        });
        
        this.drawConnections();
        requestAnimationFrame(() => this.animate());
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});