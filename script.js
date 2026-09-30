'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   1. ROLAGEM: navbar, barra de progresso, voltar ao topo e parallax do retrato
      (um único listener, sincronizado com requestAnimationFrame)
   ========================================================================== */
const navbar = document.getElementById('navbar');
const scrollProgress = document.getElementById('scrollProgress');
const backToTop = document.getElementById('backToTop');
const heroPortrait = document.querySelector('.hero__portrait img');

let lastScrollY = window.scrollY;
let ticking = false;

function onScroll() {
  const y = window.scrollY;

  if (navbar) {
    navbar.classList.toggle('scrolled', y > 40);
    // Some ao descer, volta ao subir — a navegação nunca disputa atenção com o conteúdo.
    const descendo = y > lastScrollY && y > window.innerHeight * 0.6;
    const menuAberto = document.body.classList.contains('menu-open');
    navbar.classList.toggle('is-hidden', descendo && !menuAberto);
  }

  if (scrollProgress) {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress.style.width = `${docHeight > 0 ? (y / docHeight) * 100 : 0}%`;
  }

  if (backToTop) {
    backToTop.classList.toggle('visible', y > 500);
  }

  if (heroPortrait && !prefersReducedMotion && y < window.innerHeight) {
    heroPortrait.parentElement.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
  }

  lastScrollY = y;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(onScroll);
    ticking = true;
  }
}, { passive: true });
onScroll();

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

/* ==========================================================================
   2. MENU MOBILE (toggle)
   ========================================================================== */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

function definirMenu(aberto) {
  navLinks.classList.toggle('open', aberto);
  navToggle.classList.toggle('active', aberto);
  navToggle.setAttribute('aria-expanded', String(aberto));
  navToggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('menu-open', aberto);
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    definirMenu(!navLinks.classList.contains('open'));
  });

  navLinks.querySelectorAll('.navbar__link').forEach((link) => {
    link.addEventListener('click', () => definirMenu(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('open')) definirMenu(false);
  });
}

/* ==========================================================================
   3. SCROLL SPY: destaca o link ativo conforme a seção visível
   ========================================================================== */
const sections = document.querySelectorAll('main section[id]');
const navLinkItems = document.querySelectorAll('.navbar__link');

const scrollSpyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinkItems.forEach((link) => {
          link.classList.toggle('active', link.dataset.link === id);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
);

sections.forEach((section) => scrollSpyObserver.observe(section));

/* ==========================================================================
   4. REVEAL AO ENTRAR NA VIEWPORT
      .reveal  → sobe e aparece
      .mask    → títulos revelados linha a linha
   ========================================================================== */
const revealElements = document.querySelectorAll('.reveal, .mask');

// Escalona elementos vizinhos (mesmo pai) para a entrada ter ritmo, não um bloco único.
revealElements.forEach((el) => {
  const irmaos = [...el.parentElement.children].filter((c) => c.matches('.reveal, .mask'));
  el.style.setProperty('--delay', `${Math.min(irmaos.indexOf(el), 5) * 0.09}s`);
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
);

revealElements.forEach((el) => revealObserver.observe(el));

// Entrada do retrato da hero assim que a imagem estiver pronta.
if (heroPortrait) {
  const mostrarRetrato = () => document.body.classList.add('is-loaded');
  if (heroPortrait.complete) mostrarRetrato();
  else heroPortrait.addEventListener('load', mostrarRetrato, { once: true });
}

/* ==========================================================================
   5. FORMULÁRIO DE CONTATO (sem backend: abre e-mail ou WhatsApp preenchido)
   ========================================================================== */
const contactForm = document.getElementById('contactForm');
const whatsappBtn = document.getElementById('whatsappBtn');
const formStatus = document.getElementById('formStatus');

const EMAIL_DESTINO = 'euprogramador484@gmail.com';
const WHATSAPP_NUMERO = '5517981276715'; // formato internacional, só dígitos

const validadores = {
  nome: (v) => {
    if (!v.trim()) return 'Informe seu nome.';
    if (v.trim().length < 2) return 'Nome muito curto.';
    return '';
  },
  email: (v) => {
    if (!v.trim()) return 'Informe seu e-mail.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'E-mail inválido.';
    return '';
  },
  mensagem: (v) => {
    if (!v.trim()) return 'Escreva uma mensagem.';
    if (v.trim().length < 10) return 'Conte um pouco mais (mínimo 10 caracteres).';
    return '';
  },
};

function mostrarErro(campo, mensagem) {
  const input = contactForm.elements[campo];
  const alvo = contactForm.querySelector(`[data-error-for="${campo}"]`);
  input.classList.toggle('is-invalid', Boolean(mensagem));
  input.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
  if (alvo) alvo.textContent = mensagem;
}

function validarCampo(campo) {
  const erro = validadores[campo](contactForm.elements[campo].value);
  mostrarErro(campo, erro);
  return !erro;
}

function definirStatus(mensagem, tipo) {
  formStatus.textContent = mensagem;
  formStatus.className = `form-status is-visible is-${tipo}`;
}

function limparStatus() {
  formStatus.className = 'form-status';
  formStatus.textContent = '';
}

// Valida ao sair do campo; depois de errar uma vez, revalida enquanto digita.
if (contactForm) {
  Object.keys(validadores).forEach((campo) => {
    const input = contactForm.elements[campo];

    input.addEventListener('blur', () => validarCampo(campo));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) validarCampo(campo);
    });
  });

  // Retorna os dados do formulário se estiver tudo válido; senão foca o primeiro erro.
  function coletarDados() {
    limparStatus();

    const invalidos = Object.keys(validadores).filter((campo) => !validarCampo(campo));
    if (invalidos.length) {
      contactForm.elements[invalidos[0]].focus();
      return null;
    }

    const valor = (campo) => contactForm.elements[campo].value.trim();
    return {
      nome: valor('nome'),
      email: valor('email'),
      assunto: valor('assunto') || 'Contato pelo portfólio',
      mensagem: valor('mensagem'),
    };
  }

  function enviarPorEmail(dados) {
    const corpo =
      `${dados.mensagem}\n\n` +
      `---\nNome: ${dados.nome}\nE-mail: ${dados.email}`;

    const url =
      `mailto:${EMAIL_DESTINO}` +
      `?subject=${encodeURIComponent(dados.assunto)}` +
      `&body=${encodeURIComponent(corpo)}`;

    window.location.href = url;
    definirStatus(
      'Abri seu app de e-mail com a mensagem pronta — é só clicar em enviar. ' +
      `Se nada abrir, escreva direto para ${EMAIL_DESTINO}.`,
      'success'
    );
  }

  function enviarPorWhatsApp(dados) {
    const texto =
      `Olá, Lucas! Vim pelo seu portfólio.\n\n` +
      `*Nome:* ${dados.nome}\n` +
      `*E-mail:* ${dados.email}\n` +
      `*Assunto:* ${dados.assunto}\n\n` +
      dados.mensagem;

    window.open(
      `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`,
      '_blank',
      'noopener'
    );
    definirStatus('Abri o WhatsApp com a mensagem pronta — é só clicar em enviar.', 'success');
  }

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const dados = coletarDados();
    if (dados) enviarPorEmail(dados);
  });

  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      const dados = coletarDados();
      if (dados) enviarPorWhatsApp(dados);
    });
  }
}

/* ==========================================================================
   6. ANO ATUAL NO RODAPÉ
   ========================================================================== */
const anoAtual = document.getElementById('currentYear');
if (anoAtual) anoAtual.textContent = new Date().getFullYear();

/* ==========================================================================
   7. HORA LOCAL NO RODAPÉ (Brasil, GMT-3)
   ========================================================================== */
const horaLocal = document.getElementById('localTime');

function atualizarHora() {
  const hora = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date());
  horaLocal.textContent = `Brasil — ${hora} (GMT-3)`;
}

if (horaLocal) {
  atualizarHora();
  setInterval(atualizarHora, 30000);
}
