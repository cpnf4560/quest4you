/**
 * Quest4You - Global Error Handler
 * Captura e reporta erros globais
 * @fileoverview Sistema de tratamento de erros global
 */

(function() {
  'use strict';
  
  // Configuração
  const CONFIG = {
    LOG_ENDPOINT: null, // URL para enviar logs (ex: Sentry, LogRocket)
    MAX_ERRORS_PER_SESSION: 20,
    SHOW_USER_ERRORS: true,
    DEBUG_MODE: location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  };
  
  // Estado
  let errorCount = 0;
  const errorLog = [];
  
  /**
   * Formata informação do erro
   * @param {Object} errorData
   * @returns {Object}
   */
  function formatError(errorData) {
    return {
      ...errorData,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: window.firebaseAuth?.currentUser?.uid || 'anonymous',
      sessionId: getSessionId(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      online: navigator.onLine
    };
  }
  
  /**
   * Obtém ou cria session ID
   * @returns {string}
   */
  function getSessionId() {
    let sessionId = sessionStorage.getItem('q4y_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('q4y_session_id', sessionId);
    }
    return sessionId;
  }
  
  /**
   * Envia erro para serviço externo
   * @param {Object} errorData
   */
  function sendToExternalService(errorData) {
    if (!CONFIG.LOG_ENDPOINT) return;
    
    try {
      // Usar sendBeacon para garantir envio mesmo em page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(CONFIG.LOG_ENDPOINT, JSON.stringify(errorData));
      } else {
        fetch(CONFIG.LOG_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorData),
          keepalive: true
        }).catch(() => {}); // Ignorar erros de envio
      }
    } catch (e) {
      // Falha silenciosa
    }
  }
  
  /**
   * Log do erro
   * @param {Object} errorData
   */
  function logError(errorData) {
    errorCount++;
    
    // Prevenir flooding
    if (errorCount > CONFIG.MAX_ERRORS_PER_SESSION) {
      if (errorCount === CONFIG.MAX_ERRORS_PER_SESSION + 1) {
        console.warn('⚠️ Quest4You: Muitos erros detectados, suspendendo logging');
      }
      return;
    }
    
    const formattedError = formatError(errorData);
    
    // Log no console
    if (CONFIG.DEBUG_MODE) {
      console.group('🔴 Quest4You Error');
      console.error('Type:', errorData.type);
      console.error('Message:', errorData.message);
      if (errorData.stack) console.error('Stack:', errorData.stack);
      console.error('Details:', formattedError);
      console.groupEnd();
    } else {
      console.error('🔴 Quest4You Error:', errorData.message);
    }
    
    // Guardar no log local
    errorLog.push(formattedError);
    if (errorLog.length > 50) errorLog.shift(); // Manter últimos 50
    
    // Enviar para serviço externo
    sendToExternalService(formattedError);
    
    // Mostrar toast ao utilizador para erros críticos
    if (CONFIG.SHOW_USER_ERRORS && shouldShowToUser(errorData)) {
      showUserError(errorData);
    }
  }
  
  /**
   * Determina se o erro deve ser mostrado ao utilizador
   * @param {Object} errorData
   * @returns {boolean}
   */
  function shouldShowToUser(errorData) {
    const msg = (errorData.message || '').toLowerCase();
    
    // Erros de rede/conexão
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
      return true;
    }
    
    // Erros de Firebase
    if (msg.includes('firebase') || msg.includes('firestore') || msg.includes('auth')) {
      return true;
    }
    
    // Erros de permissão
    if (msg.includes('permission') || msg.includes('unauthorized')) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Mostra erro amigável ao utilizador
   * @param {Object} errorData
   */
  function showUserError(errorData) {
    const msg = (errorData.message || '').toLowerCase();
    let userMessage = 'Ocorreu um erro. Por favor, tenta novamente.';
    
    // Mensagens específicas
    if (msg.includes('network') || msg.includes('fetch') || !navigator.onLine) {
      userMessage = '📶 Erro de conexão. Verifica a tua internet.';
    } else if (msg.includes('permission') || msg.includes('unauthorized')) {
      userMessage = '🔒 Sem permissão. Faz login novamente.';
    } else if (msg.includes('not found') || msg.includes('404')) {
      userMessage = '🔍 Recurso não encontrado.';
    } else if (msg.includes('timeout')) {
      userMessage = '⏱️ Tempo esgotado. Tenta novamente.';
    }
    
    // Usar toast system se disponível
    if (window.showToast) {
      window.showToast({
        message: userMessage,
        type: 'error',
        duration: 5000
      });
    } else {
      // Fallback: criar toast simples
      showFallbackToast(userMessage);
    }
  }
  
  /**
   * Toast de fallback quando sistema principal não está disponível
   * @param {string} message
   */
  function showFallbackToast(message) {
    // Verificar se já existe container
    let container = document.getElementById('errorToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'errorToastContainer';
      container.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'error-toast-fallback';
    toast.style.cssText = `
      background: #e53935;
      color: white;
      padding: 14px 24px;
      border-radius: 8px;
      font-family: 'Poppins', sans-serif;
      font-size: 0.9rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      animation: errorToastIn 0.3s ease;
      pointer-events: auto;
      max-width: 90vw;
      text-align: center;
    `;
    toast.textContent = message;
    
    // Adicionar estilos de animação se não existirem
    if (!document.getElementById('errorToastStyles')) {
      const style = document.createElement('style');
      style.id = 'errorToastStyles';
      style.textContent = `
        @keyframes errorToastIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes errorToastOut {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    container.appendChild(toast);
    
    // Remover após 5 segundos
    setTimeout(() => {
      toast.style.animation = 'errorToastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
    
    // Permitir fechar ao clicar
    toast.addEventListener('click', () => {
      toast.style.animation = 'errorToastOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    });
  }
  
  // ================================
  // GLOBAL ERROR HANDLERS
  // ================================
  
  /**
   * Handler para erros não capturados
   */
  window.onerror = function(message, source, lineno, colno, error) {
    logError({
      type: 'uncaught',
      message: message,
      source: source,
      line: lineno,
      column: colno,
      stack: error?.stack || null
    });
    
    return false; // Não suprimir o erro
  };
  
  /**
   * Handler para promise rejections não tratadas
   */
  window.addEventListener('unhandledrejection', function(event) {
    logError({
      type: 'unhandledRejection',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack || null,
      reason: String(event.reason)
    });
    
    // Prevenir mensagem default no console
    if (!CONFIG.DEBUG_MODE) {
      event.preventDefault();
    }
  });
  
  /**
   * Handler para erros de recursos (imagens, scripts, etc.)
   */
  window.addEventListener('error', function(event) {
    // Só tratar erros de recursos, não erros de script
    if (event.target && (event.target.tagName === 'IMG' || event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
      logError({
        type: 'resource',
        message: `Failed to load ${event.target.tagName.toLowerCase()}: ${event.target.src || event.target.href}`,
        element: event.target.tagName,
        source: event.target.src || event.target.href
      });
    }
  }, true); // Capture phase para pegar erros de recursos
  
  /**
   * Handler para estado offline
   */
  window.addEventListener('offline', function() {
    console.warn('📶 Quest4You: Offline detected');
    logError({
      type: 'network',
      message: 'Device went offline',
      critical: false
    });
  });
  
  /**
   * Handler para estado online
   */
  window.addEventListener('online', function() {
    console.log('📶 Quest4You: Back online');
  });
  
  // ================================
  // PUBLIC API
  // ================================
  
  /**
   * Reporta erro manualmente
   * @param {string} message - Mensagem de erro
   * @param {Object} [details={}] - Detalhes adicionais
   */
  window.reportError = function(message, details = {}) {
    logError({
      type: 'manual',
      message: message,
      ...details
    });
  };
  
  /**
   * Obtém log de erros da sessão
   * @returns {Array}
   */
  window.getErrorLog = function() {
    return [...errorLog];
  };
  
  /**
   * Limpa log de erros
   */
  window.clearErrorLog = function() {
    errorLog.length = 0;
    errorCount = 0;
  };
  
  /**
   * Wrapper para executar código com error handling
   * @param {Function} fn - Função a executar
   * @param {string} [context='unknown'] - Contexto para logging
   * @returns {*}
   */
  window.tryCatch = function(fn, context = 'unknown') {
    try {
      return fn();
    } catch (error) {
      logError({
        type: 'caught',
        message: error.message,
        stack: error.stack,
        context: context
      });
      return null;
    }
  };
  
  /**
   * Wrapper async com error handling
   * @param {Function} fn - Função async a executar
   * @param {string} [context='unknown'] - Contexto para logging
   * @returns {Promise<*>}
   */
  window.tryCatchAsync = async function(fn, context = 'unknown') {
    try {
      return await fn();
    } catch (error) {
      logError({
        type: 'caught-async',
        message: error.message,
        stack: error.stack,
        context: context
      });
      return null;
    }
  };
  
  console.log('✅ Global error handler initialized');
  
})();
