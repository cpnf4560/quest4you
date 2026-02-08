/**
 * Quest4You - i18n (Internationalization)
 * Lightweight translation engine
 * Supports: pt (default), en, es
 */

const I18n = (function () {
  const SUPPORTED_LANGS = ['pt', 'en', 'es'];
  const DEFAULT_LANG = 'pt';
  const STORAGE_KEY = 'quest4you_lang';

  let currentLang = DEFAULT_LANG;
  let translations = {};
  let loaded = false;

  // Detect base path (works from root or /pages/)
  function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/') || path.includes('/admin/')) {
      return '../';
    }
    return './';
  }

  // Get saved language or detect from browser
  function detectLanguage() {
    // 1. Check localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) return saved;

    // 2. Check URL param ?lang=xx
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && SUPPORTED_LANGS.includes(urlLang)) return urlLang;

    // 3. Check browser language
    const browserLang = (navigator.language || navigator.userLanguage || '').substring(0, 2).toLowerCase();
    if (SUPPORTED_LANGS.includes(browserLang)) return browserLang;

    return DEFAULT_LANG;
  }

  // Load translation file
  async function loadTranslations(lang) {
    try {
      const basePath = getBasePath();
      const response = await fetch(basePath + 'i18n/' + lang + '.json?v=' + Date.now());
      if (!response.ok) throw new Error('Failed to load ' + lang);
      translations = await response.json();
      currentLang = lang;
      loaded = true;
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang === 'pt' ? 'pt-PT' : lang === 'es' ? 'es' : 'en';
      console.log('🌐 i18n loaded:', lang, '(' + Object.keys(translations).length + ' keys)');
    } catch (error) {
      console.warn('⚠️ i18n: Could not load', lang, '- falling back to pt');
      if (lang !== DEFAULT_LANG) {
        await loadTranslations(DEFAULT_LANG);
      }
    }
  }

  // Get translation by key (supports nested keys: "nav.home")
  function t(key, params) {
    if (!loaded || !translations) return key;

    // Support dot notation: "nav.home" -> translations.nav.home
    const parts = key.split('.');
    let value = translations;
    for (let i = 0; i < parts.length; i++) {
      if (value && typeof value === 'object' && parts[i] in value) {
        value = value[parts[i]];
      } else {
        return key; // Key not found, return key itself
      }
    }

    if (typeof value !== 'string') return key;

    // Replace {{param}} placeholders
    if (params) {
      Object.keys(params).forEach(function (param) {
        value = value.replace(new RegExp('\\{\\{' + param + '\\}\\}', 'g'), params[param]);
      });
    }

    return value;
  }

  // Apply translations to all elements with data-i18n attribute
  function applyToDOM() {
    if (!loaded) return;

    // Translate text content
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      const translated = t(key);
      if (translated !== key) {
        el.textContent = translated;
      }
    });

    // Translate HTML content (for elements with emojis + text)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-html');
      const translated = t(key);
      if (translated !== key) {
        el.innerHTML = translated;
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-placeholder');
      const translated = t(key);
      if (translated !== key) {
        el.placeholder = translated;
      }
    });

    // Translate title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-title');
      const translated = t(key);
      if (translated !== key) {
        el.title = translated;
      }
    });

    // Translate <title> tag
    const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
    if (titleKey) {
      const translated = t(titleKey);
      if (translated !== titleKey) {
        document.title = translated;
      }
    }

    // Update language selector state
    updateLangSelector();
  }

  // Update language selector UI
  function updateLangSelector() {
    document.querySelectorAll('.lang-option').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  // Change language
  async function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    if (lang === currentLang && loaded) return;

    await loadTranslations(lang);
    applyToDOM();

    // Dispatch event for JS modules that need to react
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
  }

  // Initialize
  async function init() {
    const lang = detectLanguage();
    await loadTranslations(lang);

    // Apply translations once DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyToDOM);
    } else {
      applyToDOM();
    }
  }

  // Create language selector HTML
  function createSelector() {
    const container = document.createElement('div');
    container.className = 'lang-selector';
    container.innerHTML =
      '<button class="lang-option" data-lang="pt" onclick="I18n.setLanguage(\'pt\')" title="Português">🇵🇹</button>' +
      '<button class="lang-option" data-lang="en" onclick="I18n.setLanguage(\'en\')" title="English">🇬🇧</button>' +
      '<button class="lang-option" data-lang="es" onclick="I18n.setLanguage(\'es\')" title="Español">🇪🇸</button>';
    return container;
  }

  // Inject selector into header
  function injectSelector() {
    const nav = document.querySelector('.nav') || document.querySelector('.header-content');
    if (nav) {
      const selector = createSelector();
      nav.appendChild(selector);
      updateLangSelector();
    }
  }

  // Public API
  return {
    init: init,
    t: t,
    setLanguage: setLanguage,
    getCurrentLang: function () { return currentLang; },
    applyToDOM: applyToDOM,
    injectSelector: injectSelector,
    isLoaded: function () { return loaded; }
  };
})();

// Global shortcut
function t(key, params) {
  return I18n.t(key, params);
}

// Auto-init
I18n.init().then(function () {
  I18n.injectSelector();
});
