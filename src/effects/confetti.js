export function createConfettiController(canvasId = 'confetti-canvas') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        return { fire: () => {} };
    }

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId = null;

    const COLORS = ['#ff4f4f', '#ffd65a', '#ffaf49', '#ffecac', '#ffffff', '#f0513e', '#f4bf31'];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height * 0.4 - canvas.height * 0.1;
            this.width = Math.random() * 10 + 6;
            this.height = Math.random() * 6 + 4;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.vx = (Math.random() - 0.5) * 6;
            this.vy = Math.random() * 2.5 + 2;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 12;
            this.life = 1;
            this.decay = Math.random() * 0.005 + 0.003;
            this.shape = Math.random() > 0.55 ? 'rect' : 'circle';
        }

        update() {
            this.x += this.vx;
            this.vy += 0.07;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            this.life -= this.decay;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(this.life, 0);
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillStyle = this.color;

            if (this.shape === 'rect') {
                ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles = particles.filter((particle) => particle.life > 0 && particle.y < canvas.height + 20);

        particles.forEach((particle) => {
            particle.update();
            particle.draw();
        });

        if (particles.length > 0) {
            animationId = requestAnimationFrame(loop);
        } else {
            animationId = null;
        }
    }

    function fire(count = 120) {
        for (let i = 0; i < count; i += 1) {
            particles.push(new Particle());
        }

        if (!animationId) {
            loop();
        }
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return { fire };
}
