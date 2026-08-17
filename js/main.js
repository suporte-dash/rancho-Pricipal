/**
 * RANCHO PIRABAS — main.js
 * JavaScript modular (ES6+), sem dependências externas.
 * Cada funcionalidade é isolada em sua própria função de
 * inicialização para facilitar manutenção.
 */

'use strict';

/* ---------- Header: sombra/blur ao rolar ---------- */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const toggleScrolled = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  toggleScrolled();
  window.addEventListener('scroll', toggleScrolled, { passive: true });
}

/* ---------- Menu mobile ---------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'nav-backdrop';
  backdrop.setAttribute('aria-label', 'Fechar menu');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backdrop);

  const closeNav = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    backdrop.classList.remove('is-visible');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
  };

  const openNav = () => {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu');
    backdrop.classList.add('is-visible');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
  };

  toggle.addEventListener('click', () => {
    if (nav.classList.contains('is-open')) closeNav();
    else openNav();
  });

  backdrop.addEventListener('click', closeNav);

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
  });

  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 720px)').matches) closeNav();
  }, { passive: true });
}

/* ---------- Estado ativo da navegação ---------- */
function initActiveNav() {
  const links = [...document.querySelectorAll('.main-nav a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

  const setActive = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActive(visible.target.id);
  }, { rootMargin: '-22% 0px -62% 0px', threshold: [0.15, 0.35, 0.6] });

  sections.forEach((section) => observer.observe(section));
  links.forEach((link) => {
    link.addEventListener('click', () => setActive(link.getAttribute('href').slice(1)));
  });
}

/* ---------- Parallax sutil da foto de fundo no Hero ---------- */
function initHeroParallax() {
  const bgWrapper = document.querySelector('.hero-bg');
  const hero = document.querySelector('.hero');
  if (!bgWrapper || !hero) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  let ticking = false;

  const update = () => {
    const heroHeight = hero.offsetHeight;
    const progress = Math.min(window.scrollY / heroHeight, 1);
    // A foto se desloca sutilmente para baixo conforme o usuário rola,
    // reforçando a sensação de "afundar" no pôr do sol.
    const translateY = progress * 50;
    bgWrapper.style.transform = `translateY(${translateY}px)`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

/* ---------- Scroll Reveal (IntersectionObserver) ---------- */
function initScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- Galeria: páginas automáticas ---------- */
function initGalleryPagedCarousel() {
  const track = document.querySelector('.gallery-track');
  if (!track) return;

  const items = Array.from(track.querySelectorAll('.gallery-item'));
  if (!items.length) return;

  const mobileQuery = window.matchMedia('(max-width: 720px)');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PAGE_DURATION_MS = 5000;
  let pages = [];
  let current = 0;
  let intervalId = null;
  let transitionId = null;

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const showPage = (index) => {
    const next = pages[index];
    const previous = pages[current];
    if (!next) return;

    if (transitionId) {
      clearTimeout(transitionId);
      transitionId = null;
    }

    if (next === previous) {
      next.classList.add('is-active');
      return;
    }

    if (previous) {
      previous.classList.remove('is-active');
      previous.classList.add('is-exiting');
    }

    next.classList.remove('is-exiting');
    next.classList.add('is-active');
    current = index;

    transitionId = setTimeout(() => {
      pages.forEach((page, i) => {
        if (i !== current) page.classList.remove('is-exiting');
      });
      transitionId = null;
    }, 900);
  };

  const start = () => {
    if (prefersReducedMotion || intervalId || pages.length < 2) return;
    intervalId = setInterval(() => {
      showPage((current + 1) % pages.length);
    }, PAGE_DURATION_MS);
  };

  const buildPages = () => {
    stop();
    current = 0;
    const pageSize = mobileQuery.matches ? 1 : 4;
    const fragment = document.createDocumentFragment();
    pages = [];

    for (let startIndex = 0; startIndex < items.length; startIndex += pageSize) {
      const page = document.createElement('div');
      page.className = 'gallery-page';
      page.append(...items.slice(startIndex, startIndex + pageSize));
      pages.push(page);
      fragment.append(page);
    }

    track.replaceChildren(fragment);
    pages[0].classList.add('is-active');
    current = 0;
    start();
  };

  buildPages();
  mobileQuery.addEventListener('change', buildPages);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });
}

/* ---------- Barra de progresso de rolagem ---------- */
function initScrollProgress() {
  const fill = document.querySelector('.scroll-progress-fill');
  if (!fill) return;

  let ticking = false;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    fill.style.width = `${Math.min(progress, 100)}%`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', update);
  update();
}

/* ---------- Contadores animados (números que "sobem" ao entrar na tela) ---------- */
function initCountUp() {
  const targets = document.querySelectorAll('[data-count-to]');
  if (!targets.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCount = (el) => {
    const endValue = parseFloat(el.dataset.countTo);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';

    if (prefersReducedMotion) {
      el.textContent = endValue.toFixed(decimals).replace('.', ',') + suffix;
      return;
    }

    const duration = 1400;
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuad — desacelera suavemente perto do final
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = endValue * eased;
      el.textContent = current.toFixed(decimals).replace('.', ',') + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = endValue.toFixed(decimals).replace('.', ',') + suffix;
      }
    };

    window.requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    targets.forEach(animateCount);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- Títulos em cascata (palavra por palavra) ---------- */
function initTextSplit() {
  const targets = document.querySelectorAll('[data-split-text]');
  if (!targets.length) return;

  targets.forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((word, i) => `<span class="split-word" style="transition-delay:${i * 0.05}s">${word}</span>`)
      .join(' ');
    el.classList.add('split-ready');
  });

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ---------- Parallax genérico para elementos marcados ---------- */
function initScrollParallax() {
  const items = document.querySelectorAll('[data-parallax]');
  if (!items.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  let ticking = false;

  const update = () => {
    const viewportCenter = window.innerHeight / 2;

    items.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const distanceFromCenter = elCenter - viewportCenter;
      const strength = parseFloat(el.dataset.parallaxStrength || '15');
      // normaliza a distância pela altura da tela para um deslocamento suave
      const offset = (distanceFromCenter / window.innerHeight) * strength;
      el.style.transform = `scale(1.12) translateY(${offset}px)`;
    });

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  update();
}

/* ---------- Carrossel de vídeos da seção Sobre ---------- */
function initAboutMediaCarousel() {
  const slides = document.querySelectorAll('.about-visual .about-slide');
  if (!slides.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IMAGE_DURATION_MS = 4500; // tempo que cada imagem fica em tela

  let current = 0;
  let timeoutId = null;

  // Ajuda a diagnosticar problemas de caminho/arquivo direto no console do navegador
  slides.forEach((el) => {
    if (el.tagName === 'VIDEO') {
      el.addEventListener('error', () => {
        console.warn('[Rancho Pirabas] Falha ao carregar vídeo:', el.currentSrc || el.src);
      });
    }
  });

  const clearPending = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  const advance = () => {
    goTo((current + 1) % slides.length);
  };

  const handleVideoEnded = () => advance();

  // agenda a transição para o próximo item da sequência: vídeos avançam
  // sozinhos ao terminar (evento nativo "ended"); imagens avançam por tempo fixo.
  const scheduleAdvance = () => {
    const el = slides[current];
    if (el.tagName === 'VIDEO') {
      el.addEventListener('ended', handleVideoEnded, { once: true });
    } else {
      timeoutId = setTimeout(advance, IMAGE_DURATION_MS);
    }
  };

  function goTo(index) {
    clearPending();
    slides.forEach((el, i) => {
      const isTarget = i === index;
      el.classList.toggle('is-active', isTarget);
      if (el.tagName === 'VIDEO') {
        if (isTarget) {
          el.currentTime = 0;
          el.play().catch(() => {
            // navegadores que bloqueiam autoplay silenciosamente — sem problema,
            // a imagem/vídeo seguinte assume normalmente no próximo ciclo.
          });
        } else {
          el.pause();
        }
      }
    });
    current = index;
    scheduleAdvance();
  }

  // exibe sempre o primeiro item da sequência (Vídeo 1) ao carregar
  slides.forEach((el, i) => el.classList.toggle('is-active', i === 0));

  if (prefersReducedMotion) return; // mantém o primeiro quadro parado, sem ciclar

  goTo(0);
}

/* ---------- Reflexo dos cards no mobile: toque, retorno e entrada ---------- */
function initHighlightMobileFx() {
  const cards = document.querySelectorAll('.highlights-grid .highlight-card');
  if (!cards.length) return;

  const isMobile = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (!isMobile) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const restartCardFx = (card) => {
    if (prefersReducedMotion) return;

    // Remove e readiciona a classe com reflow forçado para reiniciar a animação.
    card.classList.remove('is-mobile-inview');
    void card.offsetWidth;
    card.classList.add('is-mobile-inview');
  };

  const bindTouchRestart = (card) => {
    let lastTouch = 0;
    const handleTouch = (event) => {
      const pointerType = event.pointerType || 'touch';
      if (pointerType !== 'touch' && pointerType !== 'pen') return;

      const now = performance.now();
      if (now - lastTouch < 120) return;
      lastTouch = now;
      restartCardFx(card);
    };

    if ('PointerEvent' in window) {
      card.addEventListener('pointerdown', handleTouch, { passive: true });
    } else {
      card.addEventListener('touchstart', handleTouch, { passive: true });
    }
  };

  cards.forEach(bindTouchRestart);

  if (!('IntersectionObserver' in window)) {
    cards.forEach((card) => restartCardFx(card));
    return;
  }

  const visibilityState = new WeakMap();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const wasVisible = visibilityState.get(entry.target) === true;
        const isVisible = entry.isIntersecting;
        visibilityState.set(entry.target, isVisible);

        // Dispara na primeira entrada e novamente sempre que voltar à seção.
        if (isVisible && !wasVisible) restartCardFx(entry.target);
      });
    },
    { threshold: 0.45, rootMargin: '0px 0px -10% 0px' }
  );

  cards.forEach((card) => observer.observe(card));
}

/* ---------- Microinteração dos cards do Cardápio no mobile ---------- */
function initMenuCardFx() {
  const cards = document.querySelectorAll('.menu-grid .menu-card');
  if (!cards.length) return;

  const isMobile = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (!isMobile) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const restartCardFx = (card) => {
    if (prefersReducedMotion) return;
    card.classList.remove('is-menu-mobile-inview');
    void card.offsetWidth;
    card.classList.add('is-menu-mobile-inview');
  };

  const bindTouchRestart = (card) => {
    let lastTouch = 0;
    const handleTouch = (event) => {
      const pointerType = event.pointerType || 'touch';
      if (pointerType !== 'touch' && pointerType !== 'pen') return;

      const now = performance.now();
      if (now - lastTouch < 120) return;
      lastTouch = now;
      restartCardFx(card);
    };

    if ('PointerEvent' in window) {
      card.addEventListener('pointerdown', handleTouch, { passive: true });
    } else {
      card.addEventListener('touchstart', handleTouch, { passive: true });
    }
  };

  cards.forEach(bindTouchRestart);

  if (!('IntersectionObserver' in window)) {
    cards.forEach((card) => restartCardFx(card));
    return;
  }

  const visibilityState = new WeakMap();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const wasVisible = visibilityState.get(entry.target) === true;
        const isVisible = entry.isIntersecting;
        visibilityState.set(entry.target, isVisible);

        if (isVisible && !wasVisible) restartCardFx(entry.target);
      });
    },
    { threshold: 0.4, rootMargin: '0px 0px -10% 0px' }
  );

  cards.forEach((card) => observer.observe(card));
}

/* ---------- Tilt 3D sutil nos cards ao passar o mouse ---------- */
function initCardTilt() {
  const cards = document.querySelectorAll('.menu-card');
  if (!cards.length) return;

  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!supportsHover || prefersReducedMotion) return;

  const maxTilt = 6; // graus

  cards.forEach((card) => {
    let baseRect = null;

    card.addEventListener('mouseenter', () => {
      // Mantém a referência fixa para impedir que o próprio transform
      // altere o cálculo e faça o texto parecer “pular” durante o hover.
      baseRect = card.getBoundingClientRect();
    });

    card.addEventListener('mousemove', (e) => {
      if (!baseRect) baseRect = card.getBoundingClientRect();
      const x = (e.clientX - baseRect.left) / baseRect.width - 0.5;
      const y = (e.clientY - baseRect.top) / baseRect.height - 0.5;
      const rotateY = x * maxTilt * 2;
      const rotateX = -y * maxTilt * 2;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.015)`;
    });

    card.addEventListener('mouseleave', () => {
      baseRect = null;
      card.style.transform = '';
    });
  });
}

/* ---------- Ano dinâmico no footer ---------- */
function initFooterYear() {
  const el = document.querySelector('[data-current-year]');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- Lazy loading de imagens (fallback nativo + classe) ---------- */
function initLazyImages() {
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  imgs.forEach((img) => {
    img.addEventListener('load', () => img.classList.add('is-loaded'));
  });
}

/* ---------- Modal do Cardápio (janela flutuante) ---------- */
function initMenuModal() {
  const modal = document.querySelector('[data-menu-modal]');
  const openBtn = document.querySelector('[data-menu-open]');
  const closeEls = document.querySelectorAll('[data-menu-close]');
  const tabs = document.querySelectorAll('[data-menu-tab]');
  const img = document.querySelector('[data-menu-image]');
  if (!modal || !openBtn || !img) return;

  const menus = [
    { src: 'assets/images/cardapio/cardapio-completo-1.jpg', alt: 'Cardápio de comidas do Rancho Pirabas' },
    { src: 'assets/images/cardapio/cardapio-completo-2.jpg', alt: 'Cardápio de bebidas do Rancho Pirabas' },
  ];

  let lastFocused = null;

  const setTab = (index) => {
    tabs.forEach((btn, i) => {
      const active = i === index;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    img.style.opacity = '0';
    window.setTimeout(() => {
      img.src = menus[index].src;
      img.alt = menus[index].alt;
      img.style.opacity = '1';
    }, 150);
  };

  const openModal = () => {
    lastFocused = document.activeElement;
    setTab(0);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-modal-open');
    window.setTimeout(() => {
      const closeBtn = modal.querySelector('.menu-modal-close');
      if (closeBtn) closeBtn.focus();
    }, 50);
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  };

  openBtn.addEventListener('click', openModal);
  closeEls.forEach((el) => el.addEventListener('click', closeModal));
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => setTab(parseInt(btn.dataset.menuTab, 10)));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
}

/* ---------- Inicialização geral ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  initActiveNav();
  initHeroParallax();
  initScrollProgress();
  initScrollReveal();
  initCountUp();
  initTextSplit();
  initScrollParallax();
  initAboutMediaCarousel();
  initHighlightMobileFx();
  initMenuCardFx();
  initCardTilt();
  initMenuModal();
  initGalleryPagedCarousel();
  initFooterYear();
  initLazyImages();
});
/* ===== Ícones circulares dos canais de contato ===== */
document.addEventListener('DOMContentLoaded', () => {
  const names = ['phone', 'whatsapp', 'instagram', 'facebook'];
  document.querySelectorAll('.contact-channels .channel-card').forEach((card, index) => {
    const oldIcon = card.querySelector('svg');
    if (!oldIcon) return;
    const symbol = document.createElement('span');
    symbol.className = `contact-symbol contact-symbol-${names[index]}`;
    symbol.setAttribute('aria-hidden', 'true');
    oldIcon.replaceWith(symbol);
  });
});
