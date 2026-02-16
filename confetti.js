/* ===================================================
   CONFETTI ENGINE — lightweight canvas confetti
   =================================================== */
const ConfettiEngine = (() => {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId = null;
    const COLORS = ['#FF4D4D','#FFD93D','#FFB6C1','#FF8C42','#fff','#e63946','#f0c040','#ff6b6b'];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height * 0.4 - canvas.height * 0.1;
            this.w = Math.random() * 10 + 6;
            this.h = Math.random() * 6 + 4;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.vx = (Math.random() - 0.5) * 6;
            this.vy = Math.random() * 3 + 2;
            this.rot = Math.random() * 360;
            this.rotSpeed = (Math.random() - 0.5) * 12;
            this.life = 1;
            this.decay = Math.random() * 0.005 + 0.003;
            this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
        }
        update() {
            this.x += this.vx;
            this.vy += 0.07;
            this.y += this.vy;
            this.rot += this.rotSpeed;
            this.life -= this.decay;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(this.life, 0);
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rot * Math.PI) / 180);
            ctx.fillStyle = this.color;
            if (this.shape === 'rect') {
                ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter(p => p.life > 0 && p.y < canvas.height + 20);
        particles.forEach(p => { p.update(); p.draw(); });
        if (particles.length > 0) {
            animId = requestAnimationFrame(loop);
        } else {
            animId = null;
        }
    }

    function fire(count = 120) {
        for (let i = 0; i < count; i++) particles.push(new Particle());
        if (!animId) loop();
    }

    return { fire };
})();
