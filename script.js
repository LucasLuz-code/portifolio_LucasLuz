'use strict';

/* ==========================================================================
   1. NAVBAR: efeito glassmorphism ao rolar
   ========================================================================== */
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}

window.addEventListener('scroll', handleNavbarScroll);
handleNavbarScroll();

/* ==========================================================================
   2. MENU MOBILE (toggle)
   ========================================================================== */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const aberto = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', aberto);
    navToggle.setAttribute('aria-expanded', String(aberto));
  });

  navLinks.querySelectorAll('.navbar__link').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
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
   4. FADE-IN AO ROLAR (Intersection Observer)
   ========================================================================== */
const fadeElements = document.querySelectorAll('.fade-in, .fade-up');

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

fadeElements.forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index % 6, 5) * 0.08}s`;
  fadeObserver.observe(el);
});

/* ==========================================================================
   5. EFEITO DE DIGITAÇÃO NO TÍTULO DA HERO
   ========================================================================== */
function typeEffect(elementId, text, speed = 90) {
  const el = document.getElementById(elementId);
  let charIndex = 0;

  function type() {
    if (charIndex < text.length) {
      el.textContent += text.charAt(charIndex);
      charIndex++;
      setTimeout(type, speed);
    }
  }

  type();
}

if (document.getElementById('typedName')) {
  document.addEventListener('DOMContentLoaded', () => {
    typeEffect('typedName', 'Lucas Luz', 110);
  });
}

/* ==========================================================================
   6. BARRA DE PROGRESSO DE ROLAGEM
   ========================================================================== */
const scrollProgress = document.getElementById('scrollProgress');

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollProgress.style.width = `${progress}%`;
}

window.addEventListener('scroll', updateScrollProgress);
updateScrollProgress();

/* ==========================================================================
   7. BOTÃO VOLTAR AO TOPO
   ========================================================================== */
const backToTop = document.getElementById('backToTop');

function toggleBackToTop() {
  backToTop.classList.toggle('visible', window.scrollY > 500);
}

window.addEventListener('scroll', toggleBackToTop);
toggleBackToTop();

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ==========================================================================
   8. FORMULÁRIO DE CONTATO (Web3Forms)
   ========================================================================== */
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');
const CHAVE_NAO_CONFIGURADA = 'COLE_SUA_CHAVE_WEB3FORMS_AQUI';

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

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    limparStatus();

    // Valida todos os campos e foca no primeiro com erro.
    const invalidos = Object.keys(validadores).filter((campo) => !validarCampo(campo));
    if (invalidos.length) {
      contactForm.elements[invalidos[0]].focus();
      return;
    }

    const chave = contactForm.elements.access_key.value;
    if (chave === CHAVE_NAO_CONFIGURADA) {
      definirStatus(
        'O formulário ainda não foi configurado. Use o WhatsApp ou o e-mail ao lado.',
        'error'
      );
      console.warn(
        'Web3Forms: falta a chave de acesso. Crie a sua em https://web3forms.com e ' +
        'substitua o valor do input "access_key" no index.html.'
      );
      return;
    }

    const rotulo = submitBtn.querySelector('.contact__submit-label');
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');
    rotulo.textContent = 'Enviando...';

    try {
      const resposta = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(contactForm),
      });
      const dados = await resposta.json();

      if (resposta.ok && dados.success) {
        definirStatus('Mensagem enviada! Respondo o quanto antes. Obrigado pelo contato.', 'success');
        contactForm.reset();
        Object.keys(validadores).forEach((campo) => mostrarErro(campo, ''));
      } else {
        throw new Error(dados.message || 'Falha no envio');
      }
    } catch (erro) {
      console.error('Erro ao enviar o formulário:', erro);
      definirStatus(
        'Não consegui enviar sua mensagem. Tente novamente ou fale comigo pelo WhatsApp.',
        'error'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      rotulo.textContent = 'Enviar mensagem';
    }
  });
}

/* ==========================================================================
   9. ANO ATUAL NO RODAPÉ
   ========================================================================== */
const anoAtual = document.getElementById('currentYear');
if (anoAtual) anoAtual.textContent = new Date().getFullYear();
