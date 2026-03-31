/**
 * Quest4You - Cookie Consent Banner
 * Injeta automaticamente o banner de consentimento de cookies em todas as páginas
 * @version 1.0.0
 */

(function() {
  'use strict';

  // CSS do banner (inline para não depender de arquivos externos)
  const cookieBannerStyles = `
    .cookie-banner {
      position: fixed;
      bottom: -100%;
      left: 0;
      right: 0;
      background: var(--bg-card, #ffffff);
      border-top: 1px solid var(--border, #e0e0e0);
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      transition: bottom 0.4s ease;
      padding: 1rem;
    }
    .cookie-banner.show {
      bottom: 0;
    }
    .cookie-banner-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      flex-wrap: wrap;
    }
    .cookie-banner-text {
      flex: 1;
      min-width: 300px;
    }
    .cookie-banner-text h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-color, #1a1a2e);
    }
    .cookie-banner-text p {
      margin: 0;
      font-size: 0.9rem;
      color: var(--text-muted, #666);
      line-height: 1.5;
    }
    .cookie-banner-text a {
      color: var(--primary-color, #C41E3A);
      text-decoration: underline;
    }
    .cookie-banner-actions {
      display: flex;
      gap: 0.75rem;
      flex-shrink: 0;
    }
    .cookie-banner .btn {
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      border: none;
    }
    .cookie-banner .btn-accept {
      background: var(--primary-color, #C41E3A);
      color: white;
    }
    .cookie-banner .btn-accept:hover {
      background: var(--primary-dark, #a01830);
      transform: translateY(-1px);
    }
    .cookie-banner .btn-settings {
      background: var(--bg-warm, #f8f9fa);
      color: var(--text-color, #1a1a2e);
      border: 1px solid var(--border, #e0e0e0);
    }
    .cookie-banner .btn-settings:hover {
      background: var(--bg-card, #ffffff);
    }
    @media (max-width: 600px) {
      .cookie-banner-content {
        flex-direction: column;
        text-align: center;
      }
      .cookie-banner-actions {
        width: 100%;
        justify-content: center;
      }
      .cookie-banner-text {
        min-width: auto;
      }
    }
  `;

  // Determinar o caminho correto para a página de cookies
  function getCookiesPagePath() {
    const path = window.location.pathname;
    
    // Se estamos na raiz ou index.html
    if (path === '/' || path.endsWith('/index.html') || path.endsWith('/')) {
      return './pages/cookies.html';
    }
    
    // Se estamos numa página dentro de /pages/
    if (path.includes('/pages/')) {
      return './cookies.html';
    }
    
    // Se estamos numa página dentro de /admin/
    if (path.includes('/admin/')) {
      return '../pages/cookies.html';
    }
    
    // Se estamos numa página dentro de /pages/quizzes/
    if (path.includes('/quizzes/')) {
      return '../cookies.html';
    }
    
    // Default
    return './pages/cookies.html';
  }

  // HTML do banner
  function createBannerHTML() {
    const cookiesPath = getCookiesPagePath();
    return `
      <div class="cookie-banner" id="cookieBanner">
        <div class="cookie-banner-content">
          <div class="cookie-banner-text">
            <h4>🍪 Este site utiliza cookies</h4>
            <p>Utilizamos cookies para melhorar a tua experiência. Ao continuar a navegar, aceitas a nossa <a href="${cookiesPath}">Política de Cookies</a>.</p>
          </div>
          <div class="cookie-banner-actions">
            <button class="btn btn-accept" id="cookieAcceptBtn">Aceitar</button>
            <a href="${cookiesPath}" class="btn btn-settings">Saber mais</a>
          </div>
        </div>
      </div>
    `;
  }

  // Injetar estilos CSS
  function injectStyles() {
    const styleElement = document.createElement('style');
    styleElement.id = 'cookie-consent-styles';
    styleElement.textContent = cookieBannerStyles;
    document.head.appendChild(styleElement);
  }

  // Injetar HTML do banner
  function injectBanner() {
    const bannerHTML = createBannerHTML();
    const bannerContainer = document.createElement('div');
    bannerContainer.innerHTML = bannerHTML;
    document.body.appendChild(bannerContainer.firstElementChild);
  }

  // Verificar consentimento
  function checkCookieConsent() {
    return localStorage.getItem('cookie_consent') === 'accepted';
  }

  // Aceitar cookies
  function acceptCookies() {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    const banner = document.getElementById('cookieBanner');
    if (banner) {
      banner.classList.remove('show');
    }
  }

  // Mostrar banner
  function showBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
      setTimeout(() => {
        banner.classList.add('show');
      }, 1000); // Delay de 1 segundo para não ser intrusivo
    }
  }

  // Inicializar
  function init() {
    // Não mostrar na página de cookies
    if (window.location.pathname.includes('cookies.html')) {
      return;
    }

    // Injetar estilos
    injectStyles();

    // Injetar banner se ainda não existir (pode já existir no index.html)
    if (!document.getElementById('cookieBanner')) {
      injectBanner();
    }

    // Configurar evento do botão
    const acceptBtn = document.getElementById('cookieAcceptBtn');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', acceptCookies);
    }

    // Verificar consentimento e mostrar banner se necessário
    if (!checkCookieConsent()) {
      showBanner();
    }
  }

  // Expor função globalmente para compatibilidade com código existente
  window.acceptCookies = acceptCookies;

  // Iniciar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
