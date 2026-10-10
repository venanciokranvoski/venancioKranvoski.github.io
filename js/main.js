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

/**
 * Dicionário de frases completas (texto PT exato -> EN/ES).
 * Usado para traduzir os blocos de conteúdo longos sem precisar
 * marcar cada elemento com data-i18n. A chave é o texto em português
 * exatamente como aparece renderizado (espaços normalizados).
 */
const I18N_PHRASES = {
  en: {
    // Nossa Abordagem
    'Experiência e histórico': 'Experience and track record',
    'EM PRODUTOS DIGITAIS': 'IN DIGITAL PRODUCTS',
    'Pegamos a ideia do cliente e transformamos em um produto digital funcional, escalável e alinhado ao objetivo do negócio. Ao longo de mais de 10 anos, a Dumas.Tech construiu aplicações para startups, bancos, grandes organizações e instituições do setor público.':
      'We take the client\'s idea and turn it into a functional, scalable digital product aligned with business goals. Over more than 10 years, Dumas.Tech has built applications for startups, banks, large organizations and public sector institutions.',
    'Desenvolvemos aplicações mobile como principal especialidade, além de sites e plataformas web quando o projeto exige. Cada decisão técnica é tomada com base no contexto real de uso do produto e na necessidade do público final.':
      'We develop mobile applications as our main specialty, plus websites and web platforms when the project requires. Every technical decision is based on the real usage context of the product and the needs of the end audience.',
    'Startups': 'Startups',
    'Instituições financeiras': 'Financial institutions',
    'Grandes organizações': 'Large organizations',
    'Setor público': 'Public sector',
    'Especialização em mobile': 'Mobile specialization',
    'Aplicações mobile são nosso principal foco de atuação': 'Mobile apps are our main focus',
    'Projetos de diferentes portes': 'Projects of all sizes',
    'De startups a instituições com requisitos de alta complexidade': 'From startups to institutions with highly complex requirements',
    'Decisões baseadas em prática': 'Decisions based on practice',
    'Anos de experiência em projetos reais de diferentes segmentos': 'Years of experience in real projects across different segments',
    'Soluções complexas': 'Complex solutions',
    'Requisitos de segurança': 'Security requirements',
    'Projetos de grande escala': 'Large-scale projects',
    // IA
    'Inteligência Artificial': 'Artificial Intelligence',
    'Integramos inteligência artificial em aplicações mobile e web quando gera valor concreto. Atendimento automatizado, análise de dados e automação de processos — sempre com critério técnico e foco no resultado para o negócio.':
      'We integrate artificial intelligence into mobile and web applications when it delivers concrete value. Automated support, data analysis and process automation — always with technical judgment and a focus on business results.',
    'Conversar sobre IA no meu projeto': 'Talk about AI in my project',
    'Atendimento Automatizado': 'Automated Support',
    'Chatbots e assistentes que respondem demandas comuns e direcionam casos mais complexos.': 'Chatbots and assistants that answer common requests and route more complex cases.',
    'Análise de Dados': 'Data Analysis',
    'Insights automáticos para antecipar tendências e apoiar decisões.': 'Automatic insights to anticipate trends and support decisions.',
    'Recomendações': 'Recommendations',
    'Personalização de experiências com base no comportamento do usuário.': 'Personalized experiences based on user behavior.',
    'Automação': 'Automation',
    'Tarefas repetitivas automatizadas para ganhar escala e eficiência.': 'Repetitive tasks automated to gain scale and efficiency.',
    'Visão e Leitura': 'Vision and Reading',
    'Reconhecimento de imagens, leitura de documentos e inspeção visual.': 'Image recognition, document reading and visual inspection.',
    'Processamento de Texto': 'Text Processing',
    'Extração, categorização e análise de textos em larga escala.': 'Extraction, categorization and analysis of text at scale.',
    // Stats
    'Anos de experiência': 'Years of experience',
    'Especialistas': 'Specialists',
    'Projetos entregues': 'Projects delivered',
    'Segmentos atendidos': 'Segments served',
    // Diferenciais
    'Por que a Dumas.Tech': 'Why Dumas.Tech',
    'Experiência construída em projetos reais de diferentes complexidades.': 'Experience built on real projects of varying complexity.',
    'Especialização em Mobile': 'Mobile Specialization',
    'Aplicações mobile são nossa principal atuação, não um serviço secundário. Expertise consolidada em projetos nativos para iOS e Android.':
      'Mobile apps are our core business, not a side service. Solid expertise in native iOS and Android projects.',
    'Arquitetura e Escalabilidade': 'Architecture and Scalability',
    'Projetamos para crescimento e para requisitos de alta complexidade. Código organizado, documentado e preparado para evoluir.':
      'We design for growth and highly complex requirements. Clean, documented code ready to evolve.',
    'Experiência em Diferentes Segmentos': 'Experience Across Segments',
    'Trajetória com startups, instituições financeiras, grandes organizações e setor público. Decisões técnicas baseadas em anos de prática.':
      'Track record with startups, financial institutions, large organizations and public sector. Technical decisions based on years of practice.',
    'UX e Design': 'UX and Design',
    'Interfaces claras e intuitivas. Foco em usabilidade e em experiências que convertem.': 'Clear, intuitive interfaces. Focus on usability and experiences that convert.',
    'Requisitos Técnicos e de Segurança': 'Technical and Security Requirements',
    'Experiência em projetos com exigências elevadas de segurança e conformidade. Boas práticas aplicadas desde o início.':
      'Experience in projects with high security and compliance demands. Best practices applied from the start.',
    'Atendimento Consultivo': 'Consultative Service',
    'Parceria próxima e orientada a resultados. Cada decisão técnica considera o impacto real no seu negócio.':
      'Close, results-driven partnership. Every technical decision considers the real impact on your business.',
    'Produtos Sob Medida': 'Custom Products',
    'Não trabalhamos com soluções genéricas. Cada projeto nasce a partir da ideia do cliente e é desenvolvido de forma personalizada.':
      'We don\'t work with generic solutions. Each project starts from the client\'s idea and is built custom.',
    'White Label e Franquias': 'White Label and Franchises',
    'Experiência na criação de aplicativos white label e produtos digitais pensados para escalar como modelo de negócio.':
      'Experience building white label apps and digital products designed to scale as a business model.',
    'Integração com Inteligência Artificial': 'Artificial Intelligence Integration',
    'IA aplicada em diferentes idiomas, automação, análise de dados e funcionalidades inteligentes quando gera valor real.':
      'AI applied across languages, automation, data analysis and smart features when they deliver real value.',
    'Experiência Comprovada': 'Proven Experience',
    'Mais de uma década entregando soluções reais para diferentes setores, com foco em qualidade, segurança e resultado.':
      'Over a decade delivering real solutions across sectors, focused on quality, security and results.',
    'Governança Técnica e Qualidade': 'Technical Governance and Quality',
    'Aplicamos padrões de arquitetura, versionamento e revisão de código que garantem qualidade, manutenibilidade e evolução contínua do produto ao longo do tempo.':
      'We apply architecture, versioning and code review standards that ensure quality, maintainability and continuous product evolution over time.',
    'Foco no Contexto Real de Uso': 'Focus on Real Usage Context',
    'Projetamos aplicações considerando o ambiente onde serão utilizadas — conectividade, perfil do usuário, escala e operação — garantindo soluções funcionais na prática, não apenas no papel.':
      'We design applications considering the environment where they will be used — connectivity, user profile, scale and operation — ensuring solutions that work in practice, not just on paper.',
    // Serviços (descrições longas)
    'O que fazemos': 'What we do',
    'Mais de 10 anos entregando soluções de diferentes portes e complexidade.': 'Over 10 years delivering solutions of all sizes and complexity.',
    'Aplicações Mobile': 'Mobile Applications',
    'Desenvolvemos aplicativos para Android e iOS a partir da ideia do cliente, independentemente do segmento. Cada aplicação é construída conforme a necessidade real do projeto, podendo operar online, offline ou de forma híbrida. Nossa especialização está em aplicações robustas, seguras e escaláveis, utilizadas por startups, bancos, grandes organizações e instituições públicas.':
      'We build Android and iOS apps starting from the client\'s idea, regardless of the segment. Each app is built to the project\'s real needs and can run online, offline or hybrid. We specialize in robust, secure and scalable apps used by startups, banks, large organizations and public institutions.',
    'Soluções Complexas e de Grande Porte': 'Complex and Large-Scale Solutions',
    'Criamos todos os tipos de sites: institucionais, corporativos, landing pages, portais e sistemas web. Os sites podem ser projetos independentes ou parte de um ecossistema maior integrado a aplicações mobile.':
      'We create all kinds of websites: institutional, corporate, landing pages, portals and web systems. Sites can be standalone projects or part of a larger ecosystem integrated with mobile apps.',
    'IA aplicada com critério: atendimento automatizado, análise de dados, recomendações personalizadas e automação de processos quando faz sentido.':
      'AI applied with judgment: automated support, data analysis, personalized recommendations and process automation when it makes sense.',
    'Sites e Plataformas Web': 'Websites and Web Platforms',
    'Sites institucionais, landing pages e sistemas web que complementam aplicações mobile quando o projeto exige presença multicanal. Desenvolvimento profissional, responsivo e otimizado.':
      'Institutional websites, landing pages and web systems that complement mobile apps when the project needs a multichannel presence. Professional, responsive and optimized development.',
    'Saiba mais sobre desenvolvimento de aplicativos →': 'Learn more about app development →',
    'Saiba mais sobre desenvolvimento de sistemas →': 'Learn more about system development →',
    'Saiba mais sobre criação de sites →': 'Learn more about website creation →',
    // FAQ (perguntas e respostas)
    'Tudo o que você precisa saber antes de iniciar seu projeto conosco.': 'Everything you need to know before starting your project with us.',
    'Que tipos de projeto a Dumas.Tech desenvolve?': 'What types of projects does Dumas.Tech develop?',
    'Quanto tempo leva para desenvolver um projeto?': 'How long does it take to develop a project?',
    'Como funciona o orçamento?': 'How does the quote work?',
    'A Dumas.Tech atende empresas de qualquer segmento?': 'Does Dumas.Tech serve companies in any segment?',
    'Vocês dão suporte após a entrega do projeto?': 'Do you provide support after project delivery?',
    // CTA
    'INICIE SEU PROJETO': 'START YOUR PROJECT',
    'Resposta rápida. Atendimento consultivo. Sem compromisso.': 'Fast response. Consultative service. No commitment.',
    'Falar no WhatsApp agora': 'Chat on WhatsApp now',
    // Contato
    'Descreva seu projeto e retornamos com uma análise personalizada. Resposta rápida e objetiva.':
      'Describe your project and we\'ll get back with a personalized analysis. Fast and objective.',
    'VAMOS': 'LET\'S',
    'CONSTRUIR': 'BUILD',
    'JUNTOS': 'TOGETHER',
    'Telefone': 'Phone',
  },
  es: {
    'Experiência e histórico': 'Experiencia e historial',
    'EM PRODUTOS DIGITAIS': 'EN PRODUCTOS DIGITALES',
    'Pegamos a ideia do cliente e transformamos em um produto digital funcional, escalável e alinhado ao objetivo do negócio. Ao longo de mais de 10 anos, a Dumas.Tech construiu aplicações para startups, bancos, grandes organizações e instituições do setor público.':
      'Tomamos la idea del cliente y la convertimos en un producto digital funcional, escalable y alineado con el objetivo del negocio. A lo largo de más de 10 años, Dumas.Tech ha construido aplicaciones para startups, bancos, grandes organizaciones e instituciones del sector público.',
    'Desenvolvemos aplicações mobile como principal especialidade, além de sites e plataformas web quando o projeto exige. Cada decisão técnica é tomada com base no contexto real de uso do produto e na necessidade do público final.':
      'Desarrollamos aplicaciones móviles como especialidad principal, además de sitios web y plataformas web cuando el proyecto lo exige. Cada decisión técnica se toma según el contexto real de uso del producto y la necesidad del público final.',
    'Startups': 'Startups',
    'Instituições financeiras': 'Instituciones financieras',
    'Grandes organizações': 'Grandes organizaciones',
    'Setor público': 'Sector público',
    'Especialização em mobile': 'Especialización en móvil',
    'Aplicações mobile são nosso principal foco de atuação': 'Las apps móviles son nuestro principal foco',
    'Projetos de diferentes portes': 'Proyectos de distintos tamaños',
    'De startups a instituições com requisitos de alta complexidade': 'De startups a instituciones con requisitos de alta complejidad',
    'Decisões baseadas em prática': 'Decisiones basadas en la práctica',
    'Anos de experiência em projetos reais de diferentes segmentos': 'Años de experiencia en proyectos reales de distintos segmentos',
    'Soluções complexas': 'Soluciones complejas',
    'Requisitos de segurança': 'Requisitos de seguridad',
    'Projetos de grande escala': 'Proyectos de gran escala',
    'Inteligência Artificial': 'Inteligencia Artificial',
    'Integramos inteligência artificial em aplicações mobile e web quando gera valor concreto. Atendimento automatizado, análise de dados e automação de processos — sempre com critério técnico e foco no resultado para o negócio.':
      'Integramos inteligencia artificial en aplicaciones móviles y web cuando genera valor concreto. Atención automatizada, análisis de datos y automatización de procesos — siempre con criterio técnico y foco en el resultado del negocio.',
    'Conversar sobre IA no meu projeto': 'Hablar sobre IA en mi proyecto',
    'Atendimento Automatizado': 'Atención Automatizada',
    'Chatbots e assistentes que respondem demandas comuns e direcionam casos mais complexos.': 'Chatbots y asistentes que responden consultas comunes y derivan casos más complejos.',
    'Análise de Dados': 'Análisis de Datos',
    'Insights automáticos para antecipar tendências e apoiar decisões.': 'Insights automáticos para anticipar tendencias y apoyar decisiones.',
    'Recomendações': 'Recomendaciones',
    'Personalização de experiências com base no comportamento do usuário.': 'Personalización de experiencias según el comportamiento del usuario.',
    'Automação': 'Automatización',
    'Tarefas repetitivas automatizadas para ganhar escala e eficiência.': 'Tareas repetitivas automatizadas para ganar escala y eficiencia.',
    'Visão e Leitura': 'Visión y Lectura',
    'Reconhecimento de imagens, leitura de documentos e inspeção visual.': 'Reconocimiento de imágenes, lectura de documentos e inspección visual.',
    'Processamento de Texto': 'Procesamiento de Texto',
    'Extração, categorização e análise de textos em larga escala.': 'Extracción, categorización y análisis de textos a gran escala.',
    'Anos de experiência': 'Años de experiencia',
    'Especialistas': 'Especialistas',
    'Projetos entregues': 'Proyectos entregados',
    'Segmentos atendidos': 'Segmentos atendidos',
    'Por que a Dumas.Tech': 'Por qué Dumas.Tech',
    'Experiência construída em projetos reais de diferentes complexidades.': 'Experiencia construida en proyectos reales de distintas complejidades.',
    'Especialização em Mobile': 'Especialización en Móvil',
    'Aplicações mobile são nossa principal atuação, não um serviço secundário. Expertise consolidada em projetos nativos para iOS e Android.':
      'Las apps móviles son nuestra actividad principal, no un servicio secundario. Experiencia consolidada en proyectos nativos para iOS y Android.',
    'Arquitetura e Escalabilidade': 'Arquitectura y Escalabilidad',
    'Projetamos para crescimento e para requisitos de alta complexidade. Código organizado, documentado e preparado para evoluir.':
      'Diseñamos para el crecimiento y para requisitos de alta complejidad. Código organizado, documentado y preparado para evolucionar.',
    'Experiência em Diferentes Segmentos': 'Experiencia en Distintos Segmentos',
    'Trajetória com startups, instituições financeiras, grandes organizações e setor público. Decisões técnicas baseadas em anos de prática.':
      'Trayectoria con startups, instituciones financieras, grandes organizaciones y sector público. Decisiones técnicas basadas en años de práctica.',
    'UX e Design': 'UX y Diseño',
    'Interfaces claras e intuitivas. Foco em usabilidade e em experiências que convertem.': 'Interfaces claras e intuitivas. Foco en usabilidad y en experiencias que convierten.',
    'Requisitos Técnicos e de Segurança': 'Requisitos Técnicos y de Seguridad',
    'Experiência em projetos com exigências elevadas de segurança e conformidade. Boas práticas aplicadas desde o início.':
      'Experiencia en proyectos con altas exigencias de seguridad y cumplimiento. Buenas prácticas aplicadas desde el inicio.',
    'Atendimento Consultivo': 'Atención Consultiva',
    'Parceria próxima e orientada a resultados. Cada decisão técnica considera o impacto real no seu negócio.':
      'Alianza cercana y orientada a resultados. Cada decisión técnica considera el impacto real en tu negocio.',
    'Produtos Sob Medida': 'Productos a Medida',
    'Não trabalhamos com soluções genéricas. Cada projeto nasce a partir da ideia do cliente e é desenvolvido de forma personalizada.':
      'No trabajamos con soluciones genéricas. Cada proyecto nace de la idea del cliente y se desarrolla de forma personalizada.',
    'White Label e Franquias': 'White Label y Franquicias',
    'Experiência na criação de aplicativos white label e produtos digitais pensados para escalar como modelo de negócio.':
      'Experiencia en la creación de apps white label y productos digitales pensados para escalar como modelo de negocio.',
    'Integração com Inteligência Artificial': 'Integración con Inteligencia Artificial',
    'IA aplicada em diferentes idiomas, automação, análise de dados e funcionalidades inteligentes quando gera valor real.':
      'IA aplicada en distintos idiomas, automatización, análisis de datos y funcionalidades inteligentes cuando genera valor real.',
    'Experiência Comprovada': 'Experiencia Comprobada',
    'Mais de uma década entregando soluções reais para diferentes setores, com foco em qualidade, segurança e resultado.':
      'Más de una década entregando soluciones reales para distintos sectores, con foco en calidad, seguridad y resultado.',
    'Governança Técnica e Qualidade': 'Gobernanza Técnica y Calidad',
    'Aplicamos padrões de arquitetura, versionamento e revisão de código que garantem qualidade, manutenibilidade e evolução contínua do produto ao longo do tempo.':
      'Aplicamos estándares de arquitectura, versionado y revisión de código que garantizan calidad, mantenibilidad y evolución continua del producto a lo largo del tiempo.',
    'Foco no Contexto Real de Uso': 'Foco en el Contexto Real de Uso',
    'Projetamos aplicações considerando o ambiente onde serão utilizadas — conectividade, perfil do usuário, escala e operação — garantindo soluções funcionais na prática, não apenas no papel.':
      'Diseñamos aplicaciones considerando el entorno donde se usarán — conectividad, perfil del usuario, escala y operación — garantizando soluciones funcionales en la práctica, no solo en el papel.',
    'O que fazemos': 'Lo que hacemos',
    'Mais de 10 anos entregando soluções de diferentes portes e complexidade.': 'Más de 10 años entregando soluciones de distintos tamaños y complejidad.',
    'Aplicações Mobile': 'Aplicaciones Móviles',
    'Desenvolvemos aplicativos para Android e iOS a partir da ideia do cliente, independentemente do segmento. Cada aplicação é construída conforme a necessidade real do projeto, podendo operar online, offline ou de forma híbrida. Nossa especialização está em aplicações robustas, seguras e escaláveis, utilizadas por startups, bancos, grandes organizações e instituições públicas.':
      'Desarrollamos apps para Android e iOS a partir de la idea del cliente, sin importar el segmento. Cada app se construye según la necesidad real del proyecto y puede operar online, offline o híbrida. Nos especializamos en apps robustas, seguras y escalables, usadas por startups, bancos, grandes organizaciones e instituciones públicas.',
    'Soluções Complexas e de Grande Porte': 'Soluciones Complejas y de Gran Escala',
    'Criamos todos os tipos de sites: institucionais, corporativos, landing pages, portais e sistemas web. Os sites podem ser projetos independentes ou parte de um ecossistema maior integrado a aplicações mobile.':
      'Creamos todo tipo de sitios: institucionales, corporativos, landing pages, portales y sistemas web. Pueden ser proyectos independientes o parte de un ecosistema mayor integrado con apps móviles.',
    'IA aplicada com critério: atendimento automatizado, análise de dados, recomendações personalizadas e automação de processos quando faz sentido.':
      'IA aplicada con criterio: atención automatizada, análisis de datos, recomendaciones personalizadas y automatización de procesos cuando tiene sentido.',
    'Sites e Plataformas Web': 'Sitios y Plataformas Web',
    'Sites institucionais, landing pages e sistemas web que complementam aplicações mobile quando o projeto exige presença multicanal. Desenvolvimento profissional, responsivo e otimizado.':
      'Sitios institucionales, landing pages y sistemas web que complementan apps móviles cuando el proyecto exige presencia multicanal. Desarrollo profesional, responsivo y optimizado.',
    'Saiba mais sobre desenvolvimento de aplicativos →': 'Más sobre desarrollo de aplicaciones →',
    'Saiba mais sobre desenvolvimento de sistemas →': 'Más sobre desarrollo de sistemas →',
    'Saiba mais sobre criação de sites →': 'Más sobre creación de sitios →',
    'Tudo o que você precisa saber antes de iniciar seu projeto conosco.': 'Todo lo que necesitas saber antes de iniciar tu proyecto con nosotros.',
    'Que tipos de projeto a Dumas.Tech desenvolve?': '¿Qué tipos de proyecto desarrolla Dumas.Tech?',
    'Quanto tempo leva para desenvolver um projeto?': '¿Cuánto tiempo lleva desarrollar un proyecto?',
    'Como funciona o orçamento?': '¿Cómo funciona el presupuesto?',
    'A Dumas.Tech atende empresas de qualquer segmento?': '¿Dumas.Tech atiende empresas de cualquier segmento?',
    'Vocês dão suporte após a entrega do projeto?': '¿Ofrecen soporte después de la entrega del proyecto?',
    'INICIE SEU PROJETO': 'INICIA TU PROYECTO',
    'Resposta rápida. Atendimento consultivo. Sem compromisso.': 'Respuesta rápida. Atención consultiva. Sin compromiso.',
    'Falar no WhatsApp agora': 'Hablar por WhatsApp ahora',
    'Descreva seu projeto e retornamos com uma análise personalizada. Resposta rápida e objetiva.':
      'Describe tu proyecto y te respondemos con un análisis personalizado. Respuesta rápida y objetiva.',
    'VAMOS': 'VAMOS A',
    'CONSTRUIR': 'CONSTRUIR',
    'JUNTOS': 'JUNTOS',
    'Telefone': 'Teléfono',
  },
};

// Guarda o texto original (PT) de cada elemento traduzível por frase
let _phraseNodes = null;
function collectPhraseNodes() {
  if (_phraseNodes) return _phraseNodes;
  _phraseNodes = [];
  const selector = 'p, h2, h3, h4, span, strong, .big-label, .offline-badge, .sec-label, .service-link, summary > span:first-child';
  document.querySelectorAll(selector).forEach((el) => {
    // Ignora elementos já controlados por data-i18n (evita conflito entre os dois sistemas)
    if (el.hasAttribute('data-i18n')) return;
    // Só pega elementos "folha" (sem filhos de elemento), pra não quebrar HTML interno
    if (el.children.length === 0 && el.textContent.trim()) {
      _phraseNodes.push({ el, pt: el.textContent.trim() });
    }
  });
  return _phraseNodes;
}

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

  // Tradução de frases longas por conteúdo
  const phrases = collectPhraseNodes();
  const pdict = I18N_PHRASES[lang];
  phrases.forEach(({ el, pt }) => {
    if (lang === 'pt') {
      el.textContent = pt; // restaura original
    } else if (pdict && pdict[pt] !== undefined) {
      el.textContent = pdict[pt];
    }
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
