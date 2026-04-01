/**
 * Quest4You - Accessibility Enhancements
 * Melhorias de acessibilidade WCAG 2.1
 * @fileoverview Sistema de acessibilidade
 */

(function() {
  'use strict';
  
  // ================================
  // INITIALIZATION
  // ================================
  
  function initAccessibility() {
    addSkipLink();
    handleFocusVisible();
    createLiveRegions();
    enhanceKeyboardNav();
    handleReducedMotion();
    enhanceFormLabels();
    addLandmarks();
    
    console.log('♿ Accessibility features initialized');
  }
  
  // ================================
  // SKIP LINK
  // ================================
  
  function addSkipLink() {
    if (document.getElementById('skipLink')) return;
    
    const skipLink = document.createElement('a');
    skipLink.id = 'skipLink';
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Saltar para conteúdo principal';
    
    // Estilos inline para garantir que funcionam
    const style = document.createElement('style');
    style.textContent = `
      .skip-link {
        position: absolute;
        top: -100%;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary, #C41E3A);
        color: white;
        padding: 12px 24px;
        border-radius: 0 0 8px 8px;
        z-index: 10001;
        transition: top 0.3s ease;
        text-decoration: none;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      }
      
      .skip-link:focus {
        top: 0;
        outline: 3px solid var(--accent-gold, #D4AF37);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
    
    document.body.prepend(skipLink);
    
    // Garantir que existe um elemento main
    const main = document.querySelector('main, [role="main"]');
    if (main && !main.id) {
      main.id = 'main-content';
    } else if (!main) {
      // Criar landmark se não existir
      const content = document.querySelector('.quiz-container, .container, .main-content');
      if (content) {
        content.id = 'main-content';
        content.setAttribute('role', 'main');
      }
    }
  }
  
  // ================================
  // FOCUS VISIBLE
  // ================================
  
  function handleFocusVisible() {
    // Adicionar classe para distinguir foco de teclado vs mouse
    document.body.classList.add('js-focus-visible');
    
    const style = document.createElement('style');
    style.id = 'focusVisibleStyles';
    style.textContent = `
      /* Esconder outline para cliques de mouse */
      .js-focus-visible :focus:not(:focus-visible) {
        outline: none;
      }
      
      /* Mostrar outline claro para navegação por teclado */
      .js-focus-visible :focus-visible {
        outline: 3px solid var(--primary, #C41E3A);
        outline-offset: 2px;
      }
      
      /* Estilos específicos para botões */
      .js-focus-visible button:focus-visible,
      .js-focus-visible .btn:focus-visible,
      .js-focus-visible .option-btn:focus-visible {
        outline-color: var(--accent-gold, #D4AF37);
        box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.3);
      }
      
      /* Links */
      .js-focus-visible a:focus-visible {
        outline-offset: 4px;
      }
      
      /* Inputs */
      .js-focus-visible input:focus-visible,
      .js-focus-visible textarea:focus-visible,
      .js-focus-visible select:focus-visible {
        outline: 2px solid var(--primary, #C41E3A);
        border-color: var(--primary, #C41E3A);
      }
    `;
    document.head.appendChild(style);
  }
  
  // ================================
  // ARIA LIVE REGIONS
  // ================================
  
  function createLiveRegions() {
    // Region para anúncios gerais (polite)
    if (!document.getElementById('ariaAnnouncer')) {
      const announcer = document.createElement('div');
      announcer.id = 'ariaAnnouncer';
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      styleScreenReaderOnly(announcer);
      document.body.appendChild(announcer);
    }
    
    // Region para alertas urgentes (assertive)
    if (!document.getElementById('ariaAlert')) {
      const alert = document.createElement('div');
      alert.id = 'ariaAlert';
      alert.setAttribute('role', 'alert');
      alert.setAttribute('aria-live', 'assertive');
      alert.setAttribute('aria-atomic', 'true');
      alert.className = 'sr-only';
      styleScreenReaderOnly(alert);
      document.body.appendChild(alert);
    }
    
    // Adicionar classe sr-only global
    const style = document.createElement('style');
    style.textContent = `
      .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  function styleScreenReaderOnly(element) {
    Object.assign(element.style, {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: '0'
    });
  }
  
  /**
   * Anuncia mensagem para screen readers
   * @param {string} message - Mensagem a anunciar
   * @param {boolean} [urgent=false] - Se é urgente (usa assertive)
   */
  window.announceToScreenReader = function(message, urgent = false) {
    const region = document.getElementById(urgent ? 'ariaAlert' : 'ariaAnnouncer');
    if (!region) return;
    
    // Limpar e definir com delay para garantir anúncio
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 100);
  };
  
  // ================================
  // KEYBOARD NAVIGATION
  // ================================
  
  function enhanceKeyboardNav() {
    // Fechar modais com Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Procurar modal aberto
        const modal = document.querySelector(
          '.result-modal[style*="display: flex"], ' +
          '.modal.active, ' +
          '.modal[style*="display: flex"], ' +
          '[role="dialog"][aria-hidden="false"]'
        );
        
        if (modal) {
          const closeBtn = modal.querySelector(
            '.close-btn, [data-close], button[onclick*="close"], .modal-close'
          );
          if (closeBtn) {
            closeBtn.click();
            e.preventDefault();
          }
        }
      }
    });
    
    // Focus trap em modais
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      
      const modal = document.querySelector(
        '.result-modal[style*="display: flex"], .modal.active'
      );
      if (!modal) return;
      
      const focusables = modal.querySelectorAll(
        'button:not([disabled]), ' +
        '[href], ' +
        'input:not([disabled]), ' +
        'select:not([disabled]), ' +
        'textarea:not([disabled]), ' +
        '[tabindex]:not([tabindex="-1"])'
      );
      
      if (focusables.length === 0) return;
      
      const firstFocusable = focusables[0];
      const lastFocusable = focusables[focusables.length - 1];
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });
    
    // Arrow keys para navegação em grupos de opções
    document.addEventListener('keydown', (e) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      
      const optionGroup = e.target.closest('[role="radiogroup"], .options-container, #optionsContainer');
      if (!optionGroup) return;
      
      const options = optionGroup.querySelectorAll('[role="radio"], .option-btn');
      if (options.length === 0) return;
      
      const currentIndex = Array.from(options).indexOf(e.target);
      if (currentIndex === -1) return;
      
      let newIndex;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        newIndex = (currentIndex + 1) % options.length;
      } else {
        newIndex = (currentIndex - 1 + options.length) % options.length;
      }
      
      options[newIndex].focus();
      e.preventDefault();
    });
  }
  
  // ================================
  // REDUCED MOTION
  // ================================
  
  function handleReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    function updateMotionPreference() {
      if (prefersReducedMotion.matches) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    }
    
    // Estilos para reduced motion
    const style = document.createElement('style');
    style.textContent = `
      .reduce-motion *,
      .reduce-motion *::before,
      .reduce-motion *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      /* Manter algumas transições essenciais mas mais rápidas */
      .reduce-motion .toast,
      .reduce-motion .modal {
        animation-duration: 0.1s !important;
      }
    `;
    document.head.appendChild(style);
    
    updateMotionPreference();
    prefersReducedMotion.addEventListener('change', updateMotionPreference);
  }
  
  // ================================
  // FORM LABELS
  // ================================
  
  function enhanceFormLabels() {
    // Adicionar aria-label a inputs sem label associada
    document.querySelectorAll('input, textarea, select').forEach(input => {
      if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        // Tentar encontrar label associada
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (!label && input.placeholder) {
          input.setAttribute('aria-label', input.placeholder);
        }
      }
      
      // Adicionar aria-required
      if (input.required && !input.getAttribute('aria-required')) {
        input.setAttribute('aria-required', 'true');
      }
    });
    
    // Melhorar mensagens de erro
    document.querySelectorAll('.error-message, .validation-error').forEach(error => {
      error.setAttribute('role', 'alert');
      error.setAttribute('aria-live', 'polite');
    });
  }
  
  // ================================
  // LANDMARKS
  // ================================
  
  function addLandmarks() {
    // Adicionar roles onde faltam
    const header = document.querySelector('header, .header');
    if (header && !header.getAttribute('role')) {
      header.setAttribute('role', 'banner');
    }
    
    const nav = document.querySelector('nav, .nav, .navigation');
    if (nav && !nav.getAttribute('role')) {
      nav.setAttribute('role', 'navigation');
      if (!nav.getAttribute('aria-label')) {
        nav.setAttribute('aria-label', 'Menu principal');
      }
    }
    
    const main = document.querySelector('main, .main-content');
    if (main && !main.getAttribute('role')) {
      main.setAttribute('role', 'main');
    }
    
    const footer = document.querySelector('footer, .footer');
    if (footer && !footer.getAttribute('role')) {
      footer.setAttribute('role', 'contentinfo');
    }
    
    // Adicionar aria-label a regiões sem título
    document.querySelectorAll('[role="region"]').forEach(region => {
      if (!region.getAttribute('aria-label') && !region.getAttribute('aria-labelledby')) {
        const heading = region.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading) {
          if (!heading.id) {
            heading.id = 'region-' + Math.random().toString(36).substr(2, 9);
          }
          region.setAttribute('aria-labelledby', heading.id);
        }
      }
    });
  }
  
  // ================================
  // HIGH CONTRAST
  // ================================
  
  /**
   * Toggle modo de alto contraste
   */
  window.toggleHighContrast = function() {
    document.documentElement.classList.toggle('high-contrast');
    
    const isEnabled = document.documentElement.classList.contains('high-contrast');
    localStorage.setItem('q4y_high_contrast', isEnabled);
    
    // Adicionar estilos se não existirem
    if (!document.getElementById('highContrastStyles')) {
      const style = document.createElement('style');
      style.id = 'highContrastStyles';
      style.textContent = `
        .high-contrast {
          --primary: #000;
          --text-primary: #000;
          --bg-light: #fff;
          --bg-card: #fff;
        }
        
        .high-contrast * {
          border-color: #000 !important;
        }
        
        .high-contrast a,
        .high-contrast button {
          text-decoration: underline;
        }
        
        .high-contrast img {
          filter: grayscale(100%) contrast(1.2);
        }
      `;
      document.head.appendChild(style);
    }
    
    announceToScreenReader(isEnabled ? 'Alto contraste ativado' : 'Alto contraste desativado');
  };
  
  // Restaurar preferência de alto contraste
  if (localStorage.getItem('q4y_high_contrast') === 'true') {
    document.documentElement.classList.add('high-contrast');
  }
  
  // ================================
  // FONT SIZE
  // ================================
  
  /**
   * Ajusta tamanho da fonte
   * @param {number} change - Mudança em rem (ex: 0.1 ou -0.1)
   */
  window.adjustFontSize = function(change) {
    const html = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(html).fontSize);
    const newSize = Math.max(12, Math.min(24, currentSize + change));
    
    html.style.fontSize = newSize + 'px';
    localStorage.setItem('q4y_font_size', newSize);
    
    announceToScreenReader(`Tamanho da fonte: ${Math.round(newSize)} pixels`);
  };
  
  // Restaurar tamanho de fonte
  const savedFontSize = localStorage.getItem('q4y_font_size');
  if (savedFontSize) {
    document.documentElement.style.fontSize = savedFontSize + 'px';
  }
  
  // ================================
  // INITIALIZE
  // ================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAccessibility);
  } else {
    initAccessibility();
  }
  
  // Re-verificar após conteúdo dinâmico
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        enhanceFormLabels();
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
})();
