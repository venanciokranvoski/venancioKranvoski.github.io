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

/* ─── Seletor de Idioma (PT / EN / ES) ─── */
const I18N = {
  pt: {
    'nav.servicos': 'Serviços',
    'nav.abordagem': 'Nossa Abordagem',
    'nav.ia': 'IA',
    'nav.diferenciais': 'Diferenciais',
    'nav.faq': 'FAQ',
    'nav.contato': 'Contato',
    'nav.wa': 'WhatsApp',
    'hero.eyebrow': 'Dumas.Tech — Mais de 10 anos em produtos digitais',
    'hero.l1': 'APLICAÇÕES',
    'hero.l2': 'MOBILE',
    'hero.l3': 'E SOLUÇÕES DIGITAIS',
    'hero.sub': 'Transformamos ideias em produtos digitais sob medida. Há mais de 10 anos somos especialistas em desenvolvimento de aplicações mobile para Android e iOS, além de sites e plataformas web. Construímos soluções conforme a necessidade real de cada cliente — sejam aplicativos online, offline, híbridos, sistemas complexos, produtos white label ou plataformas com integração em inteligência artificial.',
    'hero.cta_wa': 'Fale no WhatsApp',
    'hero.cta_serv': 'Ver serviços',
    'services.label': 'O que fazemos',
    'services.title1': 'NOSSOS',
    'services.title2': 'SERVIÇOS',
    'faq.label': 'Dúvidas frequentes',
    'faq.title1': 'PERGUNTAS',
    'faq.title2': 'FREQUENTES',
    'contact.label': 'Contato',
    'contact.form_title': 'Solicitar Orçamento',
    'contact.name': 'Nome',
    'contact.phone': 'WhatsApp',
    'contact.email': 'E-mail',
    'contact.type': 'Tipo de projeto',
    'contact.desc': 'Descrição do projeto',
    'contact.submit': 'Enviar pelo WhatsApp →',
    'contact.trust1': '⚡ Resposta rápida',
    'contact.trust2': '🔒 Seus dados protegidos',
    'contact.trust3': '✓ Sem compromisso',
    'cookie.text': 'Usamos cookies e tecnologias de medição para melhorar sua experiência. Ao continuar navegando, você concorda com a nossa Política de Privacidade.',
    'cookie.accept': 'Aceitar',
    'cookie.decline': 'Recusar',
  },
  en: {
    'nav.servicos': 'Services',
    'nav.abordagem': 'Our Approach',
    'nav.ia': 'AI',
    'nav.diferenciais': 'Why Us',
    'nav.faq': 'FAQ',
    'nav.contato': 'Contact',
    'nav.wa': 'WhatsApp',
    'hero.eyebrow': 'Dumas.Tech — Over 10 years in digital products',
    'hero.l1': 'MOBILE',
    'hero.l2': 'APPS',
    'hero.l3': 'AND DIGITAL SOLUTIONS',
    'hero.sub': 'We turn ideas into custom digital products. For over 10 years we have specialized in mobile app development for Android and iOS, as well as websites and web platforms. We build solutions tailored to each client\'s real needs — whether online, offline or hybrid apps, complex systems, white label products or platforms with artificial intelligence integration.',
    'hero.cta_wa': 'Chat on WhatsApp',
    'hero.cta_serv': 'View services',
    'services.label': 'What we do',
    'services.title1': 'OUR',
    'services.title2': 'SERVICES',
    'faq.label': 'Frequently asked',
    'faq.title1': 'FREQUENT',
    'faq.title2': 'QUESTIONS',
    'contact.label': 'Contact',
    'contact.form_title': 'Request a Quote',
    'contact.name': 'Name',
    'contact.phone': 'WhatsApp',
    'contact.email': 'E-mail',
    'contact.type': 'Project type',
    'contact.desc': 'Project description',
    'contact.submit': 'Send via WhatsApp →',
    'contact.trust1': '⚡ Fast response',
    'contact.trust2': '🔒 Your data protected',
    'contact.trust3': '✓ No commitment',
    'cookie.text': 'We use cookies and measurement technologies to improve your experience. By continuing to browse, you agree to our Privacy Policy.',
    'cookie.accept': 'Accept',
    'cookie.decline': 'Decline',
  },
  es: {
    'nav.servicos': 'Servicios',
    'nav.abordagem': 'Nuestro Enfoque',
    'nav.ia': 'IA',
    'nav.diferenciais': 'Diferenciales',
    'nav.faq': 'FAQ',
    'nav.contato': 'Contacto',
    'nav.wa': 'WhatsApp',
    'hero.eyebrow': 'Dumas.Tech — Más de 10 años en productos digitales',
    'hero.l1': 'APLICACIONES',
    'hero.l2': 'MÓVILES',
    'hero.l3': 'Y SOLUCIONES DIGITALES',
    'hero.sub': 'Transformamos ideas en productos digitales a medida. Desde hace más de 10 años somos especialistas en desarrollo de aplicaciones móviles para Android e iOS, además de sitios web y plataformas web. Construimos soluciones según la necesidad real de cada cliente — ya sean aplicaciones online, offline, híbridas, sistemas complejos, productos white label o plataformas con integración de inteligencia artificial.',
    'hero.cta_wa': 'Hablar por WhatsApp',
    'hero.cta_serv': 'Ver servicios',
    'services.label': 'Lo que hacemos',
    'services.title1': 'NUESTROS',
    'services.title2': 'SERVICIOS',
    'faq.label': 'Preguntas frecuentes',
    'faq.title1': 'PREGUNTAS',
    'faq.title2': 'FRECUENTES',
    'contact.label': 'Contacto',
    'contact.form_title': 'Solicitar Presupuesto',
    'contact.name': 'Nombre',
    'contact.phone': 'WhatsApp',
    'contact.email': 'Correo',
    'contact.type': 'Tipo de proyecto',
    'contact.desc': 'Descripción del proyecto',
    'contact.submit': 'Enviar por WhatsApp →',
    'contact.trust1': '⚡ Respuesta rápida',
    'contact.trust2': '🔒 Tus datos protegidos',
    'contact.trust3': '✓ Sin compromiso',
    'cookie.text': 'Usamos cookies y tecnologías de medición para mejorar tu experiencia. Al continuar navegando, aceptas nuestra Política de Privacidad.',
    'cookie.accept': 'Aceptar',
    'cookie.decline': 'Rechazar',
  },
};

function applyLanguage(lang) {
  const dict = I18N[lang] || I18N.pt;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.textContent = dict[key];
  });
  // Placeholders de inputs
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    const key = el.getAttribute('data-i18n-ph');
    if (dict[key] !== undefined) el.setAttribute('placeholder', dict[key]);
  });
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang;
  localStorage.setItem('dumas_lang', lang);
  // Atualiza estado visual dos botões
  document.querySelectorAll('.lang-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
}
window.setLanguage = function (lang) { applyLanguage(lang); };

// Aplica idioma salvo (ou PT por padrão) ao carregar
(function initLanguage() {
  const saved = localStorage.getItem('dumas_lang') || 'pt';
  applyLanguage(saved);
})();

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
