/* =========================================
   DARK MODE TOGGLE - Quest4You
   JavaScript para controlo do tema
   ========================================= */

// Estado do tema
let currentTheme = localStorage.getItem('quest4you_theme') || 'light';

/**
 * Inicializa o sistema de Dark Mode
 */
function initDarkMode() {
  // Aplicar tema guardado
  applyTheme(currentTheme);
  
  // Criar botão de toggle
  createDarkModeToggle();
  
  // Verificar preferência do sistema
  checkSystemPreference();
  
  console.log('🌙 Dark Mode initialized:', currentTheme);
}

/**
 * Cria o botão de toggle do Dark Mode
 */
function createDarkModeToggle() {
  // Verificar se já existe
  if (document.getElementById('darkModeToggle')) return;
  
  const toggle = document.createElement('button');
  toggle.id = 'darkModeToggle';
  toggle.className = 'dark-mode-toggle';
  toggle.setAttribute('aria-label', 'Alternar tema escuro');
  toggle.setAttribute('title', 'Alternar tema escuro');
  
  toggle.innerHTML = `
    <span class="icon-sun">☀️</span>
    <span class="icon-moon">🌙</span>
  `;
  
  toggle.addEventListener('click', toggleDarkMode);
  
  document.body.appendChild(toggle);
}

/**
 * Alterna entre tema claro e escuro
 */
function toggleDarkMode() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(currentTheme);
  saveThemePreference(currentTheme);
  
  // Feedback visual
  showThemeToast(currentTheme);
}

/**
 * Aplica o tema especificado
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  currentTheme = theme;
  
  // Atualizar meta theme-color para mobile
  updateThemeColor(theme);
}

/**
 * Atualiza a cor do tema no mobile
 */
function updateThemeColor(theme) {
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    document.head.appendChild(metaThemeColor);
  }
  
  metaThemeColor.content = theme === 'dark' ? '#0d1117' : '#C41E3A';
}

/**
 * Guarda preferência do tema
 */
function saveThemePreference(theme) {
  localStorage.setItem('quest4you_theme', theme);
  
  // Se o utilizador estiver autenticado, guardar no Firestore
  if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
    const userId = firebase.auth().currentUser.uid;
    firebase.firestore().collection('quest4you_users').doc(userId).update({
      'preferences.theme': theme,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.log('Não foi possível guardar tema na cloud:', err));
  }
}

/**
 * Verifica preferência do sistema
 */
function checkSystemPreference() {
  // Só aplicar preferência do sistema se não houver preferência guardada
  if (!localStorage.getItem('quest4you_theme')) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      applyTheme('dark');
    }
  }
  
  // Listener para mudanças de preferência do sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // Só aplicar se o utilizador não tiver definido manualmente
    if (!localStorage.getItem('quest4you_theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/**
 * Mostra toast de feedback ao mudar tema
 */
function showThemeToast(theme) {
  // Usar sistema de notificações se disponível
  if (typeof showToast === 'function') {
    const message = theme === 'dark' 
      ? (typeof t === 'function' ? t('darkMode.darkEnabled') : '🌙 Dark mode enabled')
      : (typeof t === 'function' ? t('darkMode.lightEnabled') : '☀️ Light mode enabled');
    showToast(message, 'info', 2000);
  }
}

/**
 * Obtém tema atual
 */
function getCurrentTheme() {
  return currentTheme;
}

/**
 * Define tema programaticamente
 */
function setTheme(theme) {
  if (theme === 'dark' || theme === 'light') {
    applyTheme(theme);
    saveThemePreference(theme);
  }
}

/**
 * Carrega preferência de tema do utilizador do Firestore
 */
async function loadUserThemePreference(userId) {
  try {
    const doc = await firebase.firestore()
      .collection('quest4you_users')
      .doc(userId)
      .get();
    
    if (doc.exists && doc.data().preferences?.theme) {
      const userTheme = doc.data().preferences.theme;
      applyTheme(userTheme);
      localStorage.setItem('quest4you_theme', userTheme);
    }
  } catch (err) {
    console.log('Erro ao carregar tema do utilizador:', err);
  }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', initDarkMode);

// Exportar funções globalmente
window.toggleDarkMode = toggleDarkMode;
window.setTheme = setTheme;
window.getCurrentTheme = getCurrentTheme;
window.loadUserThemePreference = loadUserThemePreference;
