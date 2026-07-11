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

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('.navbar__link').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

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

document.addEventListener('DOMContentLoaded', () => {
  typeEffect('typedName', 'Lucas Luz', 110);
});

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
   8. ANO ATUAL NO RODAPÉ
   ========================================================================== */
document.getElementById('currentYear').textContent = new Date().getFullYear();
