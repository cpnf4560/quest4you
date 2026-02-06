// filepath: g:\O meu disco\Formação JAVA - Projetos\Quest4You_v1\js\config.js
/**
 * Quest4You - Global Configuration
 * Configurações centralizadas do projeto
 */

// ================================
// ADMIN CONFIGURATION
// ================================

// Admin principal do Quest4You (info@quest4couple.pt)
// Este admin aparece como amigo de todos os utilizadores automaticamente
const ADMIN_CONFIG = {
  // UID do admin no Firebase Auth - SUBSTITUIR pelo UID real após criar a conta
  // Para obter o UID: Firebase Console > Authentication > Users
  uid: 'ADMIN_UID_HERE', // TODO: Substituir pelo UID real
  email: 'info@quest4couple.pt',
  displayName: 'Quest4You Team',
  nickname: 'Quest4You',
  nicknameEmoji: '🎯',
  photo: null, // Pode adicionar URL de foto oficial
  isSystemAdmin: true
};

// Mensagem de boas-vindas enviada automaticamente quando um utilizador
// abre uma conversa com o admin pela primeira vez
const WELCOME_MESSAGE = {
  text: `👋 Olá! Bem-vindo ao Quest4You!

Este é o chat direto com a equipa Quest4You. Usa este canal para:

💬 **Feedback** - Diz-nos o que achas da aplicação
💡 **Sugestões** - Ideias para novas funcionalidades
🐛 **Bugs** - Reporta problemas que encontres
⚠️ **Denúncias** - Reporta comportamentos inadequados

Estamos aqui para ajudar! 🎯`,
  type: 'system_welcome'
};

// Lista de emails de administradores
const ADMIN_EMAILS = [
  'info@quest4couple.pt',
  'admin@quest4you.pt',
  'admin@quest4couple.pt'
];

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Verifica se um UID pertence ao admin do sistema
 */
function isSystemAdmin(uid) {
  return uid === ADMIN_CONFIG.uid;
}

/**
 * Verifica se um email pertence a um admin
 */
function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.some(adminEmail => 
    adminEmail.toLowerCase().trim() === email.toLowerCase().trim()
  );
}

/**
 * Obtém os dados do admin para exibição
 */
function getAdminData() {
  return {
    id: ADMIN_CONFIG.uid,
    displayName: ADMIN_CONFIG.displayName,
    nickname: ADMIN_CONFIG.nickname,
    nicknameEmoji: ADMIN_CONFIG.nicknameEmoji,
    photos: {
      public: ADMIN_CONFIG.photo
    },
    isSystemAdmin: true
  };
}

// Export para uso global
window.ADMIN_CONFIG = ADMIN_CONFIG;
window.WELCOME_MESSAGE = WELCOME_MESSAGE;
window.ADMIN_EMAILS = ADMIN_EMAILS;
window.isSystemAdmin = isSystemAdmin;
window.isAdminEmail = isAdminEmail;
window.getAdminData = getAdminData;
