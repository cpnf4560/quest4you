/**
 * Quest4You - Firebase App Check
 * Protege a API contra uso não autorizado
 * @fileoverview Inicialização do Firebase App Check com reCAPTCHA v3
 */

(function() {
  'use strict';

  /**
   * Inicializa Firebase App Check
   * Deve ser chamado após firebase.initializeApp()
   */
  function initializeAppCheck() {
    // Verificar se Firebase está disponível
    if (typeof firebase === 'undefined') {
      console.warn('⚠️ Firebase não disponível, App Check não inicializado');
      return;
    }

    // Verificar se App Check está disponível
    if (!firebase.appCheck) {
      console.warn('⚠️ Firebase App Check SDK não carregado');
      return;
    }

    try {
      // Para desenvolvimento local, usar debug token
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        // Ativar modo debug (gera token no console)
        self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        console.log('🔧 App Check em modo DEBUG (localhost)');
      }

      // Inicializar App Check com reCAPTCHA v3
      // NOTA: Substituir pela tua chave do reCAPTCHA v3 do Firebase Console
      const appCheck = firebase.appCheck();
        appCheck.activate(
        // Site key do reCAPTCHA v3
        '6LdmnKEsAAAAAP-KXVbanvntl0zvQu0SnojeYnb_',
        true // isTokenAutoRefreshEnabled
      );

      console.log('✅ Firebase App Check ativado');

      // Listener para erros de token
      appCheck.onTokenChanged(
        (token) => {
          console.log('🔐 App Check token atualizado');
        },
        (error) => {
          console.error('❌ Erro no App Check token:', error);
        }
      );

    } catch (error) {
      console.error('❌ Erro ao inicializar App Check:', error);
    }
  }

  /**
   * Verifica se App Check está ativo
   * @returns {boolean}
   */
  function isAppCheckActive() {
    return typeof firebase !== 'undefined' && 
           firebase.appCheck && 
           firebase.appCheck()._delegate?._activated;
  }

  // Exportar para uso global
  window.initializeAppCheck = initializeAppCheck;
  window.isAppCheckActive = isAppCheckActive;

  // Auto-inicializar quando Firebase estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Pequeno delay para garantir que Firebase foi inicializado
      setTimeout(initializeAppCheck, 100);
    });
  } else {
    setTimeout(initializeAppCheck, 100);
  }

})();
