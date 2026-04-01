/**
 * Quest4You - Utility Functions
 * Funções comuns reutilizáveis em todo o projeto
 * @fileoverview Módulo de utilitários
 */

// ================================
// COLOR UTILITIES
// ================================

/**
 * Ajusta o brilho de uma cor hex
 * @param {string} color - Cor em formato hex (#RRGGBB)
 * @param {number} amount - Quantidade para ajustar (-255 a 255)
 * @returns {string} Cor hex ajustada
 */
function adjustColor(color, amount) {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  let r = Math.max(0, Math.min(255, (num >> 16) + amount));
  let g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  let b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

/**
 * Converte hex para rgba
 * @param {string} hex - Cor hex
 * @param {number} [alpha=1] - Valor alpha (0-1)
 * @returns {string} String de cor RGBA
 */
function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Gera uma cor aleatória
 * @returns {string} Cor hex aleatória
 */
function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// ================================
// AUTHENTICATION UTILITIES
// ================================

/**
 * Verifica se o utilizador está autenticado
 * @returns {boolean}
 */
function isAuthenticated() {
  return !!window.firebaseAuth?.currentUser;
}

/**
 * Obtém o utilizador atual
 * @returns {Object|null}
 */
function getCurrentUser() {
  return window.firebaseAuth?.currentUser || null;
}

/**
 * Obtém o ID do utilizador atual
 * @returns {string|null}
 */
function getCurrentUserId() {
  return window.firebaseAuth?.currentUser?.uid || null;
}

/**
 * Obtém o email do utilizador atual
 * @returns {string|null}
 */
function getCurrentUserEmail() {
  return window.firebaseAuth?.currentUser?.email || null;
}

// ================================
// DATE/TIME UTILITIES
// ================================

/**
 * Formata data para string local
 * @param {Date|string} date - Data a formatar
 * @param {string} [locale='pt-PT'] - Locale
 * @returns {string}
 */
function formatDate(date, locale = 'pt-PT') {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formata data de forma curta
 * @param {Date|string} date - Data a formatar
 * @param {string} [locale='pt-PT'] - Locale
 * @returns {string}
 */
function formatDateShort(date, locale = 'pt-PT') {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Formata tempo relativo (ex: "há 2 horas")
 * @param {Date|string} date - Data
 * @param {string} [locale='pt-PT'] - Locale
 * @returns {string}
 */
function formatRelativeTime(date, locale = 'pt-PT') {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const isPt = locale.startsWith('pt');

  if (diffMins < 1) return isPt ? 'agora mesmo' : 'just now';
  if (diffMins < 60) return isPt ? `há ${diffMins} min` : `${diffMins}m ago`;
  if (diffHours < 24) return isPt ? `há ${diffHours}h` : `${diffHours}h ago`;
  if (diffDays < 7) return isPt ? `há ${diffDays} dias` : `${diffDays}d ago`;
  
  return formatDate(d, locale);
}

/**
 * Verifica se uma data é hoje
 * @param {Date|string} date
 * @returns {boolean}
 */
function isToday(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

// ================================
// STRING UTILITIES
// ================================

/**
 * Trunca string com reticências
 * @param {string} str - String a truncar
 * @param {number} [maxLength=100] - Comprimento máximo
 * @returns {string}
 */
function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Capitaliza a primeira letra
 * @param {string} str
 * @returns {string}
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitaliza todas as palavras
 * @param {string} str
 * @returns {string}
 */
function capitalizeWords(str) {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
}

/**
 * Remove acentos de uma string
 * @param {string} str
 * @returns {string}
 */
function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gera um ID aleatório
 * @param {number} [length=8] - Comprimento do ID
 * @returns {string}
 */
function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Gera um UUID v4
 * @returns {string}
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Escapa HTML para prevenir XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ================================
// DOM UTILITIES
// ================================

/**
 * Query selector seguro
 * @param {string} selector
 * @param {Element} [parent=document]
 * @returns {Element|null}
 */
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Query selector all seguro (retorna array)
 * @param {string} selector
 * @param {Element} [parent=document]
 * @returns {Element[]}
 */
function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Cria elemento com atributos
 * @param {string} tag - Nome da tag
 * @param {Object} [attrs={}] - Atributos
 * @param {string|Element|Element[]} [children] - Conteúdo filho
 * @returns {Element}
 */
function createElement(tag, attrs = {}, children = null) {
  const el = document.createElement(tag);
  
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'data' && typeof value === 'object') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        el.dataset[dataKey] = dataValue;
      });
    } else if (key === 'html') {
      el.innerHTML = value;
    } else {
      el.setAttribute(key, value);
    }
  });
  
  if (children) {
    if (typeof children === 'string') {
      el.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (child) el.appendChild(child);
      });
    } else {
      el.appendChild(children);
    }
  }
  
  return el;
}

/**
 * Remove todos os filhos de um elemento
 * @param {Element} element
 */
function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Verifica se elemento está visível no viewport
 * @param {Element} element
 * @returns {boolean}
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ================================
// VALIDATION UTILITIES
// ================================

/**
 * Valida formato de email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida idade
 * @param {number} age
 * @param {number} [min=18]
 * @param {number} [max=120]
 * @returns {boolean}
 */
function isValidAge(age, min = 18, max = 120) {
  const num = parseInt(age, 10);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Valida se string não está vazia
 * @param {string} str
 * @returns {boolean}
 */
function isNotEmpty(str) {
  return typeof str === 'string' && str.trim().length > 0;
}

/**
 * Valida URL
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ================================
// STORAGE UTILITIES
// ================================

/**
 * Obtém valor do localStorage com parse JSON seguro
 * @param {string} key
 * @param {*} [defaultValue=null]
 * @returns {*}
 */
function getLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn('localStorage get error:', e);
    return defaultValue;
  }
}

/**
 * Define valor no localStorage com stringify JSON seguro
 * @param {string} key
 * @param {*} value
 * @returns {boolean}
 */
function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('localStorage set error:', e);
    return false;
  }
}

/**
 * Remove item do localStorage
 * @param {string} key
 */
function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn('localStorage remove error:', e);
  }
}

// ================================
// DEBOUNCE / THROTTLE
// ================================

/**
 * Debounce - executa função após delay sem chamadas
 * @param {Function} func
 * @param {number} [wait=300]
 * @returns {Function}
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle - executa função no máximo uma vez por intervalo
 * @param {Function} func
 * @param {number} [limit=300]
 * @returns {Function}
 */
function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ================================
// LAZY LOADING
// ================================

/**
 * Inicializa lazy loading para imagens
 */
function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Carregar src
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          // Carregar srcset
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }
          
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    document.querySelectorAll('img[data-src], img[loading="lazy"]').forEach(img => {
      observer.observe(img);
    });
    
    console.log('🖼️ Lazy loading initialized');
  }
}

// ================================
// SKELETON LOADING
// ================================

/**
 * Cria HTML de skeleton loading
 * @param {string} type - 'card' | 'text' | 'quiz' | 'profile' | 'list'
 * @param {number} [count=1] - Número de skeletons
 * @returns {string} HTML string
 */
function createSkeleton(type, count = 1) {
  const skeletons = {
    quiz: `
      <div class="quiz-skeleton">
        <div class="skeleton skeleton-question"></div>
        <div class="skeleton skeleton-option"></div>
        <div class="skeleton skeleton-option"></div>
        <div class="skeleton skeleton-option"></div>
        <div class="skeleton skeleton-option"></div>
      </div>
    `,
    card: `<div class="skeleton skeleton-card"></div>`,
    profile: `
      <div class="skeleton-profile">
        <div class="skeleton skeleton-avatar"></div>
        <div class="skeleton-profile-info">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>
    `,
    list: `
      <div class="skeleton-list-item">
        <div class="skeleton skeleton-avatar-small"></div>
        <div class="skeleton skeleton-text" style="flex: 1;"></div>
      </div>
    `,
    text: `
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width: 70%;"></div>
    `
  };

  const template = skeletons[type] || skeletons.text;
  return Array(count).fill(template).join('');
}

/**
 * Mostra skeleton num container
 * @param {Element|string} container - Elemento ou selector
 * @param {string} type - Tipo de skeleton
 * @param {number} [count=1] - Número de skeletons
 */
function showSkeleton(container, type, count = 1) {
  const el = typeof container === 'string' ? document.querySelector(container) : container;
  if (el) {
    el.innerHTML = createSkeleton(type, count);
  }
}

// ================================
// CLIPBOARD
// ================================

/**
 * Copia texto para a área de transferência
 * @param {string} text
 * @returns {Promise<boolean>}
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback para browsers antigos
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch (e) {
    console.error('Copy to clipboard failed:', e);
    return false;
  }
}

// ================================
// NÚMEROS
// ================================

/**
 * Formata número com separadores
 * @param {number} num
 * @param {string} [locale='pt-PT']
 * @returns {string}
 */
function formatNumber(num, locale = 'pt-PT') {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Gera número aleatório entre min e max
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamp - limita valor entre min e max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// ================================
// ARRAYS
// ================================

/**
 * Baralha array (Fisher-Yates)
 * @param {Array} array
 * @returns {Array}
 */
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Remove duplicados de array
 * @param {Array} array
 * @returns {Array}
 */
function unique(array) {
  return [...new Set(array)];
}

/**
 * Agrupa array por propriedade
 * @param {Array} array
 * @param {string|Function} key
 * @returns {Object}
 */
function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    (groups[groupKey] = groups[groupKey] || []).push(item);
    return groups;
  }, {});
}

// ================================
// EXPORT
// ================================

// Exportar para uso global (não-módulos)
if (typeof window !== 'undefined') {
  window.Q4YUtils = {
    // Colors
    adjustColor,
    hexToRgba,
    randomColor,
    
    // Auth
    isAuthenticated,
    getCurrentUser,
    getCurrentUserId,
    getCurrentUserEmail,
    
    // Date/Time
    formatDate,
    formatDateShort,
    formatRelativeTime,
    isToday,
    
    // Strings
    truncate,
    capitalize,
    capitalizeWords,
    removeAccents,
    generateId,
    generateUUID,
    escapeHtml,
    
    // DOM
    $,
    $$,
    createElement,
    clearChildren,
    isInViewport,
    
    // Validation
    isValidEmail,
    isValidAge,
    isNotEmpty,
    isValidUrl,
    
    // Storage
    getLocalStorage,
    setLocalStorage,
    removeLocalStorage,
    
    // Functions
    debounce,
    throttle,
    
    // Lazy Loading
    initLazyLoading,
    createSkeleton,
    showSkeleton,
    
    // Clipboard
    copyToClipboard,
    
    // Numbers
    formatNumber,
    randomBetween,
    clamp,
    
    // Arrays
    shuffle,
    unique,
    groupBy
  };
  
  // Também exportar funções mais usadas diretamente no window
  window.adjustColor = adjustColor;
  window.debounce = debounce;
  window.throttle = throttle;
}

// ES Module exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    adjustColor,
    hexToRgba,
    randomColor,
    isAuthenticated,
    getCurrentUser,
    getCurrentUserId,
    getCurrentUserEmail,
    formatDate,
    formatDateShort,
    formatRelativeTime,
    isToday,
    truncate,
    capitalize,
    capitalizeWords,
    removeAccents,
    generateId,
    generateUUID,
    escapeHtml,
    $,
    $$,
    createElement,
    clearChildren,
    isInViewport,
    isValidEmail,
    isValidAge,
    isNotEmpty,
    isValidUrl,
    getLocalStorage,
    setLocalStorage,
    removeLocalStorage,
    debounce,
    throttle,
    initLazyLoading,
    createSkeleton,
    showSkeleton,
    copyToClipboard,
    formatNumber,
    randomBetween,
    clamp,
    shuffle,
    unique,
    groupBy
  };
}

console.log('🛠️ Utils loaded');
