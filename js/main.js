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

/* ─── Rastreamento de Conversões (GA4 + Meta Pixel + Google Ads) ─── */
/**
 * Dispara um evento de conversão para todas as plataformas de uma vez.
 * Seguro mesmo que alguma ferramenta não esteja carregada.
 * @param {string} eventName  nome do evento (ex: 'contato_whatsapp')
 * @param {object} params     dados extras opcionais
 */
function trackConversion(eventName, params = {}) {
  // Google Analytics 4
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
    // Google Ads — SUBSTITUA pelo seu rótulo de conversão (AW-XXXXXXXXXX/AbCdEfGh)
    gtag('event', 'conversion', {
      send_to: 'AW-XXXXXXXXXX/SEU_LABEL_DE_CONVERSAO',
    });
  }
  // Meta Pixel (Facebook / Instagram)
  if (typeof fbq === 'function') {
    fbq('track', 'Lead', params);
  }
  // Microsoft Clarity — marca a sessão como conversão
  if (typeof clarity === 'function') {
    clarity('set', 'conversao', eventName);
  }
}
window.trackConversion = trackConversion;

/* Rastreia todo clique em link do WhatsApp automaticamente */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
  if (link) {
    trackConversion('contato_whatsapp', { metodo: 'whatsapp' });
  }
});

/* ─── Form Submit ─── */
function markError(el, hasError) {
  if (!el) return;
  el.classList.toggle('field-error', hasError);
}

function sendForm() {
  const nameEl  = document.getElementById('cf-name');
  const phoneEl = document.getElementById('cf-phone');
  const emailEl = document.getElementById('cf-email');
  const typeEl  = document.getElementById('cf-type');
  const msgEl   = document.getElementById('cf-msg');

  const name  = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const email = emailEl.value.trim();
  const type  = typeEl.value;
  const msg   = msgEl.value.trim();

  // Validação mínima para não perder leads mal preenchidos
  const emailOk = !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const nameMissing  = name.length < 2;
  // Precisa de pelo menos uma forma de contato (WhatsApp ou e-mail)
  const contactMissing = !phone && !email;

  markError(nameEl, nameMissing);
  markError(emailEl, !emailOk || (contactMissing && !phone));
  markError(phoneEl, contactMissing && !email);

  const feedback = document.getElementById('cf-feedback');
  if (nameMissing || !emailOk || contactMissing) {
    if (feedback) {
      feedback.textContent = contactMissing
        ? 'Informe seu nome e ao menos um contato (WhatsApp ou e-mail).'
        : (!emailOk ? 'Verifique o e-mail informado.' : 'Por favor, preencha seu nome.');
      feedback.className = 'cf-feedback error';
    }
    return;
  }

  if (feedback) {
    feedback.textContent = 'Abrindo o WhatsApp para enviar sua solicitação...';
    feedback.className = 'cf-feedback success';
  }

  let text = `Olá! Vim pelo site Dumas.Tech e gostaria de solicitar um orçamento.\n\n`;
  if (name)  text += `👤 *Nome:* ${name}\n`;
  if (phone) text += `📞 *Telefone:* ${phone}\n`;
  if (email) text += `📧 *E-mail:* ${email}\n`;
  if (type)  text += `💼 *Projeto:* ${type}\n`;
  if (msg)   text += `\n📝 *Descrição:*\n${msg}`;

  // Dispara a conversão de "orçamento solicitado"
  trackConversion('solicitou_orcamento', { tipo_projeto: type || 'nao_informado' });

  window.open(`https://wa.me/5511952365724?text=${encodeURIComponent(text)}`, '_blank');
}
window.sendForm = sendForm;

/* ─── Banner de Cookies / LGPD ─── */
(function initCookieBanner() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;

  const consent = localStorage.getItem('dumas_cookie_consent');

  // Se ainda não respondeu, mostra o banner
  if (!consent) {
    setTimeout(() => banner.classList.add('show'), 1200);
  } else if (consent === 'accepted') {
    enableTracking();
  }

  window.acceptCookies = function () {
    localStorage.setItem('dumas_cookie_consent', 'accepted');
    banner.classList.remove('show');
    enableTracking();
  };

  window.declineCookies = function () {
    localStorage.setItem('dumas_cookie_consent', 'declined');
    banner.classList.remove('show');
  };

  // Atualiza o Google Consent Mode para liberar medição após o aceite
  function enableTracking() {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        ad_storage: 'granted',
        analytics_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    }
    if (typeof fbq === 'function') {
      fbq('consent', 'grant');
    }
  }
})();

/* ─── Parallax ─── */
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  const bgGlow = document.querySelector('.hero-bg-glow');
  if (bgGlow) bgGlow.style.transform = `translateY(${sy * 0.25}px)`;
  const gridLines = document.querySelector('.hero-grid-lines');
  if (gridLines) gridLines.style.transform = `translateY(${sy * 0.1}px)`;
});
