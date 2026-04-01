/**
 * Quest4You - Toast Notification System
 * Sistema de notificações elegante para substituir alert()
 * @fileoverview Toast notifications com múltiplos tipos e posições
 */

(function() {
  'use strict';
  
  // ================================
  // CONFIGURAÇÃO
  // ================================
  
  const DEFAULTS = {
    duration: 4000,
    position: 'bottom-center',
    type: 'info',
    dismissible: true,
    pauseOnHover: true,
    showProgress: true,
    maxToasts: 5
  };
  
  const ICONS = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  const COLORS = {
    info: { bg: '#2196f3', text: '#fff' },
    success: { bg: '#4caf50', text: '#fff' },
    warning: { bg: '#ff9800', text: '#000' },
    error: { bg: '#f44336', text: '#fff' }
  };
  
  // Estado
  let container = null;
  const activeToasts = new Map();
  let toastId = 0;
  
  // ================================
  // ESTILOS
  // ================================
  
  function injectStyles() {
    if (document.getElementById('toastStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'toastStyles';
    style.textContent = `
      .toast-container {
        position: fixed;
        z-index: 10002;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
        max-width: 90vw;
        width: 400px;
      }
      
      .toast-container.top-left { top: 20px; left: 20px; }
      .toast-container.top-center { top: 20px; left: 50%; transform: translateX(-50%); }
      .toast-container.top-right { top: 20px; right: 20px; }
      .toast-container.bottom-left { bottom: 20px; left: 20px; }
      .toast-container.bottom-center { bottom: 20px; left: 50%; transform: translateX(-50%); }
      .toast-container.bottom-right { bottom: 20px; right: 20px; }
      
      .toast {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 18px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        font-family: 'Poppins', -apple-system, sans-serif;
        font-size: 0.9rem;
        line-height: 1.4;
        pointer-events: auto;
        position: relative;
        overflow: hidden;
        animation: toastIn 0.3s ease;
        cursor: default;
      }
      
      .toast.dismissing {
        animation: toastOut 0.3s ease forwards;
      }
      
      .toast-icon {
        font-size: 1.2rem;
        flex-shrink: 0;
        line-height: 1;
      }
      
      .toast-content {
        flex: 1;
        min-width: 0;
      }
      
      .toast-title {
        font-weight: 600;
        margin-bottom: 2px;
      }
      
      .toast-message {
        opacity: 0.95;
        word-wrap: break-word;
      }
      
      .toast-close {
        background: none;
        border: none;
        color: inherit;
        opacity: 0.7;
        cursor: pointer;
        padding: 4px;
        font-size: 1.1rem;
        line-height: 1;
        transition: opacity 0.2s;
        flex-shrink: 0;
      }
      
      .toast-close:hover {
        opacity: 1;
      }
      
      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: rgba(255,255,255,0.4);
        transition: width linear;
      }
      
      .toast-actions {
        display: flex;
        gap: 8px;
        margin-top: 10px;
      }
      
      .toast-action {
        background: rgba(255,255,255,0.2);
        border: none;
        color: inherit;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      .toast-action:hover {
        background: rgba(255,255,255,0.3);
      }
      
      .toast-action.primary {
        background: rgba(255,255,255,0.9);
        color: #333;
      }
      
      @keyframes toastIn {
        from {
          transform: translateY(100%) scale(0.9);
          opacity: 0;
        }
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }
      
      @keyframes toastOut {
        from {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        to {
          transform: translateY(-20px) scale(0.9);
          opacity: 0;
        }
      }
      
      /* Top positions - adjust animation direction */
      .toast-container.top-left .toast,
      .toast-container.top-center .toast,
      .toast-container.top-right .toast {
        animation-name: toastInTop;
      }
      
      .toast-container.top-left .toast.dismissing,
      .toast-container.top-center .toast.dismissing,
      .toast-container.top-right .toast.dismissing {
        animation-name: toastOutTop;
      }
      
      @keyframes toastInTop {
        from {
          transform: translateY(-100%) scale(0.9);
          opacity: 0;
        }
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }
      
      @keyframes toastOutTop {
        from {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        to {
          transform: translateY(20px) scale(0.9);
          opacity: 0;
        }
      }
      
      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .toast {
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
      }
      
      /* Mobile adjustments */
      @media (max-width: 480px) {
        .toast-container {
          width: calc(100vw - 32px);
          left: 16px !important;
          right: 16px !important;
          transform: none !important;
        }
        
        .toast {
          padding: 12px 14px;
          font-size: 0.85rem;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // ================================
  // CONTAINER MANAGEMENT
  // ================================
  
  function getContainer(position) {
    const containerId = `toast-container-${position}`;
    let existingContainer = document.getElementById(containerId);
    
    if (!existingContainer) {
      existingContainer = document.createElement('div');
      existingContainer.id = containerId;
      existingContainer.className = `toast-container ${position}`;
      document.body.appendChild(existingContainer);
    }
    
    return existingContainer;
  }
  
  // ================================
  // TOAST CREATION
  // ================================
  
  /**
   * Mostra um toast
   * @param {Object|string} options - Opções ou mensagem
   * @returns {number} ID do toast
   */
  function showToast(options) {
    injectStyles();
    
    // Permitir string simples como mensagem
    if (typeof options === 'string') {
      options = { message: options };
    }
    
    const config = { ...DEFAULTS, ...options };
    const id = ++toastId;
    const colors = COLORS[config.type] || COLORS.info;
    const icon = config.icon || ICONS[config.type] || ICONS.info;
    
    // Verificar limite de toasts
    const containerEl = getContainer(config.position);
    const existingToasts = containerEl.querySelectorAll('.toast:not(.dismissing)');
    if (existingToasts.length >= config.maxToasts) {
      // Remover o mais antigo
      const oldestId = parseInt(existingToasts[0].dataset.toastId);
      dismissToast(oldestId);
    }
    
    // Criar elemento
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.dataset.toastId = id;
    toast.style.backgroundColor = colors.bg;
    toast.style.color = colors.text;
    
    // Construir HTML
    let html = `<span class="toast-icon">${icon}</span>`;
    html += '<div class="toast-content">';
    
    if (config.title) {
      html += `<div class="toast-title">${escapeHtml(config.title)}</div>`;
    }
    
    html += `<div class="toast-message">${escapeHtml(config.message)}</div>`;
    
    // Actions (botões)
    if (config.actions && config.actions.length > 0) {
      html += '<div class="toast-actions">';
      config.actions.forEach((action, index) => {
        const primaryClass = index === 0 ? ' primary' : '';
        html += `<button class="toast-action${primaryClass}" data-action="${index}">${escapeHtml(action.label)}</button>`;
      });
      html += '</div>';
    }
    
    html += '</div>';
    
    // Botão de fechar
    if (config.dismissible) {
      html += '<button class="toast-close" aria-label="Fechar">×</button>';
    }
    
    // Progress bar
    if (config.showProgress && config.duration > 0) {
      html += '<div class="toast-progress" style="width: 100%;"></div>';
    }
    
    toast.innerHTML = html;
    
    // Event listeners
    if (config.dismissible) {
      toast.querySelector('.toast-close').addEventListener('click', () => {
        dismissToast(id);
      });
    }
    
    // Actions handlers
    if (config.actions) {
      toast.querySelectorAll('.toast-action').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const actionIndex = parseInt(e.target.dataset.action);
          const action = config.actions[actionIndex];
          if (action && action.onClick) {
            action.onClick();
          }
          if (!action.keepOpen) {
            dismissToast(id);
          }
        });
      });
    }
    
    // Click handler
    if (config.onClick) {
      toast.style.cursor = 'pointer';
      toast.addEventListener('click', (e) => {
        if (!e.target.closest('.toast-close') && !e.target.closest('.toast-action')) {
          config.onClick();
          if (config.dismissOnClick !== false) {
            dismissToast(id);
          }
        }
      });
    }
    
    // Auto dismiss
    let timeoutId = null;
    let remainingTime = config.duration;
    let startTime = Date.now();
    
    const startTimeout = () => {
      if (config.duration > 0) {
        timeoutId = setTimeout(() => dismissToast(id), remainingTime);
        startTime = Date.now();
        
        // Update progress bar
        const progress = toast.querySelector('.toast-progress');
        if (progress) {
          progress.style.width = '100%';
          progress.style.transitionDuration = `${remainingTime}ms`;
          requestAnimationFrame(() => {
            progress.style.width = '0%';
          });
        }
      }
    };
    
    const pauseTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        remainingTime -= (Date.now() - startTime);
        
        const progress = toast.querySelector('.toast-progress');
        if (progress) {
          const currentWidth = progress.getBoundingClientRect().width;
          const containerWidth = toast.getBoundingClientRect().width;
          progress.style.transitionDuration = '0ms';
          progress.style.width = `${(currentWidth / containerWidth) * 100}%`;
        }
      }
    };
    
    // Pause on hover
    if (config.pauseOnHover && config.duration > 0) {
      toast.addEventListener('mouseenter', pauseTimeout);
      toast.addEventListener('mouseleave', startTimeout);
    }
    
    // Adicionar ao DOM
    containerEl.appendChild(toast);
    
    // Guardar referência
    activeToasts.set(id, { element: toast, timeoutId, config });
    
    // Iniciar timeout
    startTimeout();
    
    // Anunciar para screen readers
    if (window.announceToScreenReader) {
      window.announceToScreenReader(config.message, config.type === 'error');
    }
    
    return id;
  }
  
  /**
   * Remove um toast
   * @param {number} id - ID do toast
   */
  function dismissToast(id) {
    const toast = activeToasts.get(id);
    if (!toast) return;
    
    // Limpar timeout
    if (toast.timeoutId) {
      clearTimeout(toast.timeoutId);
    }
    
    // Animação de saída
    toast.element.classList.add('dismissing');
    
    // Remover após animação
    setTimeout(() => {
      if (toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }
      activeToasts.delete(id);
    }, 300);
  }
  
  /**
   * Remove todos os toasts
   */
  function dismissAllToasts() {
    activeToasts.forEach((_, id) => dismissToast(id));
  }
  
  /**
   * Escapa HTML
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  // ================================
  // CONVENIENCE METHODS
  // ================================
  
  /**
   * Toast de sucesso
   * @param {string} message
   * @param {Object} [options]
   */
  function success(message, options = {}) {
    return showToast({ ...options, message, type: 'success' });
  }
  
  /**
   * Toast de erro
   * @param {string} message
   * @param {Object} [options]
   */
  function error(message, options = {}) {
    return showToast({ ...options, message, type: 'error', duration: 6000 });
  }
  
  /**
   * Toast de aviso
   * @param {string} message
   * @param {Object} [options]
   */
  function warning(message, options = {}) {
    return showToast({ ...options, message, type: 'warning' });
  }
  
  /**
   * Toast de informação
   * @param {string} message
   * @param {Object} [options]
   */
  function info(message, options = {}) {
    return showToast({ ...options, message, type: 'info' });
  }
  
  /**
   * Toast com ação
   * @param {string} message
   * @param {string} actionLabel
   * @param {Function} actionCallback
   * @param {Object} [options]
   */
  function withAction(message, actionLabel, actionCallback, options = {}) {
    return showToast({
      ...options,
      message,
      duration: 8000,
      actions: [{ label: actionLabel, onClick: actionCallback }]
    });
  }
  
  /**
   * Toast de confirmação (Undo pattern)
   * @param {string} message
   * @param {Function} onUndo
   * @param {Object} [options]
   */
  function undo(message, onUndo, options = {}) {
    return showToast({
      type: 'info',
      message,
      duration: 8000,
      actions: [{ label: '↩️ Desfazer', onClick: onUndo }],
      ...options
    });
  }
  
  // ================================
  // EXPORT
  // ================================
  
  window.showToast = showToast;
  window.dismissToast = dismissToast;
  window.dismissAllToasts = dismissAllToasts;
  
  window.Toast = {
    show: showToast,
    dismiss: dismissToast,
    dismissAll: dismissAllToasts,
    success,
    error,
    warning,
    info,
    withAction,
    undo
  };
  
  console.log('🍞 Toast system loaded');
  
})();
