/**
 * Dumas.Tech — Scripts principais
 * Cursor customizado, partículas, scroll reveal, menu mobile, formulário
 */

/* ─── Cursor ─── */
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX - 6 + 'px';
  cursor.style.top = mouseY - 6 + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX - 18 + 'px';
  follower.style.top = followerY - 18 + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

/* ─── Particles ─── */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.radius = Math.random() * 1.5 + 0.5;
    this.color = Math.random() > 0.5 ? '59,130,246' : '34,211,238';
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
    ctx.fill();
  }
}

for (let i = 0; i < 80; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(59,130,246,${0.08 * (1 - dist/120)})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animate);
}
animate();

/* ─── Nav Scroll ─── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

/* ─── Scroll Reveal ─── */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
revealEls.forEach(el => io.observe(el));

/* ─── Counter Animation ─── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  if (isNaN(target)) { el.textContent = el.dataset.text || el.textContent; return; }
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.num[data-target]').forEach(animateCounter);
      e.target.querySelectorAll('.num[data-text]').forEach(el => {
        el.textContent = el.dataset.text || el.textContent;
      });
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.hero-counters').forEach(el => counterObs.observe(el));

/* ─── Mobile Menu ─── */
function toggleMenu() {
  const m = document.getElementById('mobileMenu');
  m.classList.toggle('open');
}
function closeMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}
window.toggleMenu = toggleMenu;
window.closeMenu = closeMenu;

/* ─── Form Submit ─── */
function sendForm() {
  const name  = document.getElementById('cf-name').value.trim();
  const phone = document.getElementById('cf-phone').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const type  = document.getElementById('cf-type').value;
  const msg   = document.getElementById('cf-msg').value.trim();

  let text = `Olá! Vim pelo site Dumas.Tech e gostaria de solicitar um orçamento.\n\n`;
  if (name)  text += `👤 *Nome:* ${name}\n`;
  if (phone) text += `📞 *Telefone:* ${phone}\n`;
  if (email) text += `📧 *E-mail:* ${email}\n`;
  if (type)  text += `💼 *Projeto:* ${type}\n`;
  if (msg)   text += `\n📝 *Descrição:*\n${msg}`;

  window.open(`https://wa.me/5511963501236?text=${encodeURIComponent(text)}`, '_blank');
}
window.sendForm = sendForm;

/* ─── Parallax ─── */
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  const bgGlow = document.querySelector('.hero-bg-glow');
  if (bgGlow) bgGlow.style.transform = `translateY(${sy * 0.25}px)`;
  const gridLines = document.querySelector('.hero-grid-lines');
  if (gridLines) gridLines.style.transform = `translateY(${sy * 0.1}px)`;
});
