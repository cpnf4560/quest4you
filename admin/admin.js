/**
 * Quest4You BackOffice - Admin JavaScript
 * Gestão de utilizadores, questionários e estatísticas
 */

// ================================
// CONFIGURATION
// ================================
const ADMIN_EMAILS = [
  'info@quest4couple.pt',
  'admin@quest4you.pt',
  'admin@quest4couple.pt'
];

// ================================
// STATE
// ================================
let currentAdmin = null;
let isAuthenticated = false;

// ================================
// INITIALIZATION
// ================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('Quest4You BackOffice initialized');
  
  // Setup navigation
  setupNavigation();
  
  // Check auth state
  if (typeof auth !== 'undefined') {
    auth.onAuthStateChanged(handleAdminAuth);
  }
});

// ================================
// AUTHENTICATION
// ================================
async function handleAdminAuth(user) {
  if (user) {
    // Verificar primeiro na lista de emails
    let isAdmin = isAdminUser(user.email);
    
    // Se não está na lista, verificar no Firestore
    if (!isAdmin && typeof db !== 'undefined') {
      isAdmin = await checkFirestoreAdmin(user.uid);
    }
    
    if (isAdmin) {
      currentAdmin = user;
      isAuthenticated = true;
      showDashboard();
      loadDashboardData();
      
      document.getElementById('adminUser').textContent = user.email;
    } else {
      currentAdmin = null;
      isAuthenticated = false;
      showLogin();
    }
  } else {
    currentAdmin = null;
    isAuthenticated = false;
    showLogin();
  }
}

function isAdminUser(email) {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  console.log('Checking admin for:', normalizedEmail);
  console.log('Allowed admins:', ADMIN_EMAILS);
  const isAdmin = ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase().trim() === normalizedEmail);
  console.log('Is admin (by email list):', isAdmin);
  return isAdmin;
}

// Verificar admin via Firestore (para permitir admin dinâmico)
async function checkFirestoreAdmin(userId) {
  try {
    const userDoc = await db.collection('quest4you_users').doc(userId).get();
    if (userDoc.exists) {
      const data = userDoc.data();
      if (data.isAdmin === true || data.role === 'admin') {
        console.log('✅ User is admin via Firestore field');
        return true;
      }
    }
    
    // Verificar também na coleção admins
    const adminDoc = await db.collection('admins').doc(userId).get();
    if (adminDoc.exists) {
      console.log('✅ User is admin via admins collection');
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn('Could not check Firestore admin status:', error);
    return false;
  }
}

async function adminLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorDiv = document.getElementById('loginError');
  
  try {
    errorDiv.style.display = 'none';
    
    console.log('Attempting login for:', email);
    const result = await auth.signInWithEmailAndPassword(email, password);
    console.log('Login successful:', result.user.email);
    
    // Verificar primeiro na lista de emails
    let isAdmin = isAdminUser(result.user.email);
    
    // Se não está na lista, verificar no Firestore
    if (!isAdmin && typeof db !== 'undefined') {
      isAdmin = await checkFirestoreAdmin(result.user.uid);
    }
    
    if (!isAdmin) {
      console.log('User is not admin, logging out');
      await auth.signOut();
      throw new Error('Sem permissões de administrador');
    }
      } catch (error) {
    console.error('Login error:', error);
    errorDiv.textContent = error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' 
      ? 'Email ou password incorretos.' 
      : 'Credenciais inválidas ou sem permissões de admin.';
    errorDiv.style.display = 'block';
  }
}

// Login com Google
async function adminLoginGoogle() {
  const errorDiv = document.getElementById('loginError');
  
  try {
    errorDiv.style.display = 'none';
    
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    console.log('Attempting Google login...');
    const result = await auth.signInWithPopup(provider);
    console.log('Google login successful:', result.user.email);
    
    // Verificar primeiro na lista de emails
    let isAdmin = isAdminUser(result.user.email);
    
    // Se não está na lista, verificar no Firestore
    if (!isAdmin && typeof db !== 'undefined') {
      isAdmin = await checkFirestoreAdmin(result.user.uid);
    }
    
    if (!isAdmin) {
      console.log('User is not admin, logging out');
      await auth.signOut();
      errorDiv.textContent = '⚠️ Sem permissões de admin. Usa a página make-admin.html primeiro.';
      errorDiv.style.display = 'block';
    }
    
  } catch (error) {
    console.error('Google login error:', error);
    errorDiv.textContent = 'Erro no login: ' + error.message;
    errorDiv.style.display = 'block';
  }
}

function logout() {
  if (typeof auth !== 'undefined') {
    auth.signOut();
  }
  showLogin();
}

function showLogin() {
  document.getElementById('loginSection').style.display = 'flex';
  document.querySelectorAll('.content-section').forEach(section => {
    section.style.display = 'none';
  });
}

function showDashboard() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('dashboardSection').style.display = 'block';
}

// ================================
// NAVIGATION
// ================================
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (!isAuthenticated) return;
      
      const section = this.dataset.section;
      navigateToSection(section);
      
      // Update active state
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

function navigateToSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.content-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Show target section
  const targetSection = document.getElementById(sectionName + 'Section');
  if (targetSection) {
    targetSection.style.display = 'block';
    document.getElementById('pageTitle').textContent = getSectionTitle(sectionName);
    
    // Load section data
    loadSectionData(sectionName);
  }
}

function getSectionTitle(section) {
  const titles = {
    dashboard: 'Dashboard',
    users: 'Utilizadores',
    quizzes: 'Questionários',
    results: 'Resultados',
    matches: 'Smart Matches',
    validation: 'Validação de Género',
    settings: 'Definições'
  };
  return titles[section] || section;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

// ================================
// DATA LOADING
// ================================
async function loadDashboardData() {
  if (typeof db === 'undefined') {
    console.log('Firestore not available - showing demo data');
    showDemoData();
    return;
  }
  
  try {
    console.log('Loading dashboard data from Firestore...');
    
    // 1. Total de Utilizadores
    const usersCount = await getUsersCount();
    document.getElementById('totalUsers').textContent = usersCount.toLocaleString('pt-PT');
    
    // 2. Total de Respostas (soma de todas as respostas)
    const responsesCount = await getResponsesCount();
    document.getElementById('totalResponses').textContent = responsesCount.toLocaleString('pt-PT');
    
    // 3. Questionários Completados (contagem de resultados)
    const completedCount = await getCompletedQuizzesCount();
    document.getElementById('completedQuizzes').textContent = completedCount.toLocaleString('pt-PT');
    
    // 4. Smart Matches Ativos
    const matchesCount = await getActiveMatchesCount();
    document.getElementById('totalMatches').textContent = matchesCount.toLocaleString('pt-PT');
    
    // 5. Atividade Recente
    await loadRecentActivity();
      // 6. Estatísticas de Questionários
    await loadQuizStatistics();
    
    // 7. Verificar validações pendentes
    await checkPendingValidations();
    
    console.log('Dashboard data loaded successfully');
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showDemoData();
  }
}

// Conta total de utilizadores
async function getUsersCount() {
  try {
    const snapshot = await db.collection('quest4you_users').get();
    return snapshot.size;
  } catch (error) {
    console.error('Error counting users:', error);
    return 0;
  }
}

// Conta total de respostas dadas
async function getResponsesCount() {
  try {
    const snapshot = await db.collection('quest4you_users').get();
    let totalResponses = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.progress) {
        // progress é um objeto { quizId: numberOfQuestions }
        Object.values(data.progress).forEach(count => {
          totalResponses += count || 0;
        });
      }
    });
    
    return totalResponses;
  } catch (error) {
    console.error('Error counting responses:', error);
    return 0;
  }
}

// Conta questionários completados (resultados salvos)
async function getCompletedQuizzesCount() {
  try {
    const snapshot = await db.collection('quest4you_users').get();
    let totalCompleted = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // Verificar ambos os campos: results E quizResults
      const results = data.results || data.quizResults || {};
      if (typeof results === 'object') {
        totalCompleted += Object.keys(results).length;
      }
    });
    
    return totalCompleted;
  } catch (error) {
    console.error('Error counting completed quizzes:', error);
    return 0;
  }
}

// Conta utilizadores com SmartMatch ativo
async function getActiveMatchesCount() {
  try {
    const snapshot = await db.collection('quest4you_users')
      .where('smartMatchEnabled', '==', true)
      .get();
    return snapshot.size;
  } catch (error) {
    console.error('Error counting active matches:', error);
    return 0;
  }
}

// Carrega atividade recente
async function loadRecentActivity() {
  try {
    const container = document.querySelector('.activity-list');
    if (!container) return;
    
    // Buscar últimos 5 utilizadores registados
    const snapshot = await db.collection('quest4you_users')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    let html = '';
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const displayName = data.displayName || 'Utilizador';
      const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
      const timeAgo = getTimeAgo(createdAt);
      
      // Novo utilizador
      html += `
        <div class="activity-item">
          <span class="activity-icon">👤</span>
          <div class="activity-info">
            <span class="activity-text">${displayName} registou-se na plataforma</span>
            <span class="activity-time">${timeAgo}</span>
          </div>
        </div>
      `;
    });
    
    if (html) {
      container.innerHTML = html;
    }
    
  } catch (error) {
    console.error('Error loading recent activity:', error);
  }
}

// Carrega estatísticas dos questionários para o Dashboard
async function loadQuizStatistics() {
  try {
    const snapshot = await db.collection('quest4you_users').get();
    
    // Contadores por questionário
    const quizStats = {
      vanilla: 0,
      orientation: 0,
      kinks: 0,
      exhibitionism: 0,
      fantasies: 0,
      swing: 0,
      cuckold: 0,
      bdsm: 0,
      communication: 0
    };
    
    const totalUsers = snapshot.size;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Verificar ambos os campos: results E quizResults
      const results = data.results || data.quizResults || {};
      
      if (Object.keys(results).length > 0) {
        Object.keys(results).forEach(quizId => {
          if (quizStats.hasOwnProperty(quizId)) {
            quizStats[quizId]++;
          }
        });
      }
    });
    
    console.log('📊 Dashboard Quiz Stats:', quizStats);
    console.log('👥 Total Users:', totalUsers);
    
    // Atualizar barras de progresso no dashboard
    if (totalUsers > 0) {
      Object.entries(quizStats).forEach(([quizId, count]) => {
        const percent = Math.round((count / totalUsers) * 100);
        
        const barEl = document.getElementById(`bar-${quizId}`);
        const percentEl = document.getElementById(`percent-${quizId}`);
        
        if (barEl) {
          barEl.style.setProperty('--percent', `${percent}%`);
        }
        if (percentEl) {
          percentEl.textContent = `${percent}%`;
        }
      });
    }
    
  } catch (error) {
    console.error('Error loading quiz statistics:', error);
  }
}

// Calcula tempo decorrido
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'Agora mesmo';
  if (seconds < 3600) return `Há ${Math.floor(seconds / 60)} minutos`;
  if (seconds < 86400) return `Há ${Math.floor(seconds / 3600)} horas`;
  if (seconds < 2592000) return `Há ${Math.floor(seconds / 86400)} dias`;
  return date.toLocaleDateString('pt-PT');
}

function showDemoData() {
  document.getElementById('totalUsers').textContent = '0';
  document.getElementById('totalResponses').textContent = '0';
  document.getElementById('completedQuizzes').textContent = '0';
  document.getElementById('totalMatches').textContent = '0';
}

async function loadSectionData(section) {
  switch (section) {
    case 'dashboard':
      await loadDashboardData();
      break;
    case 'users':
      await loadUsersData();
      break;
    case 'quizzes':
      await loadQuizzesData();
      break;
    case 'results':
      await loadResultsData();
      break;
    case 'matches':
      await loadMatchesData();
      break;
    case 'validation':
      await loadValidationData();
      break;
  }
}

// ================================
// USERS SECTION
// ================================
async function loadUsersData() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  
  // Verificar se Firebase está disponível
  if (typeof db === 'undefined' || !db) {
    console.error('Firebase db not available');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: orange;">⚠️ Firebase não disponível. Verifica a conexão.</td></tr>';
    return;
  }
  
  try {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;"><div class="loading-spinner">⏳</div> A carregar utilizadores...</td></tr>';
    
    console.log('🔄 Loading users from quest4you_users collection...');
    
    // Tentar primeiro sem orderBy (caso o índice não exista)
    let snapshot;
    try {
      snapshot = await db.collection('quest4you_users')
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();
    } catch (indexError) {
      console.warn('OrderBy failed, trying without order:', indexError);
      // Fallback: carregar sem ordenação
      snapshot = await db.collection('quest4you_users')
        .limit(100)
        .get();
    }
    
    console.log(`📊 Found ${snapshot.size} users`);
    
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">📭 Nenhum utilizador encontrado na base de dados</td></tr>';
      return;
    }
    
    let html = '';
    let index = 1;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const userId = doc.id;
      const displayName = data.displayName || data.name || 'Anónimo';
      const email = data.email || 'N/A';
      
      // Tratar diferentes formatos de data
      let createdAt = 'N/A';
      if (data.createdAt) {
        try {
          if (data.createdAt.toDate) {
            createdAt = data.createdAt.toDate().toLocaleDateString('pt-PT');
          } else if (data.createdAt instanceof Date) {
            createdAt = data.createdAt.toLocaleDateString('pt-PT');
          } else if (typeof data.createdAt === 'string') {
            createdAt = new Date(data.createdAt).toLocaleDateString('pt-PT');
          }
        } catch (e) {
          console.warn('Error parsing date:', e);
        }
      }
      
      const quizzesCompleted = data.results ? Object.keys(data.results).length : 
                             (data.quizResults ? Object.keys(data.quizResults).length : 0);
      const smartMatchEnabled = data.smartMatchEnabled ? '✅' : '❌';
      const genderValidated = data.genderValidated ? '✅' : '❌';
      
      // Total de questionários disponíveis (9 fixos)
      const totalQuizzes = 9;
      
      // Cor baseada no progresso
      const progressClass = quizzesCompleted === totalQuizzes ? 'progress-complete' : 
                           quizzesCompleted > 0 ? 'progress-partial' : 'progress-none';
      
      html += `
        <tr data-userid="${userId}">
          <td><span class="user-index">${String(index).padStart(3, '0')}</span></td>
          <td>
            <div class="user-name-cell">
              <span class="user-avatar">${displayName.charAt(0).toUpperCase()}</span>
              <span>${displayName}</span>
            </div>
          </td>
          <td><span class="user-email">${email}</span></td>
          <td>${createdAt}</td>
          <td>
            <span class="quiz-progress ${progressClass}">${quizzesCompleted}/${totalQuizzes}</span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-outline btn-small" onclick="viewUser('${userId}')" title="Ver detalhes">
                👁️ Ver
              </button>
              <button class="btn btn-danger btn-small" onclick="deleteUser('${userId}', '${displayName.replace(/'/g, "\\'")}')" title="Eliminar utilizador">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
      index++;
    });
    
    tbody.innerHTML = html;
    console.log(`✅ Rendered ${index - 1} users in table`);
    
  } catch (error) {
    console.error('❌ Error loading users:', error);
    console.error('Error details:', error.code, error.message);
    
    let errorMessage = '❌ Erro ao carregar utilizadores';
    if (error.code === 'permission-denied') {
      errorMessage = '🔒 Sem permissões para aceder aos utilizadores. Verifica as regras do Firestore.';
    } else if (error.code === 'unavailable') {
      errorMessage = '🌐 Sem conexão ao Firebase. Verifica a tua internet.';
    } else {
      errorMessage = `❌ Erro: ${error.message || 'Erro desconhecido'}`;
    }
    
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #A65D73; padding: 30px;">${errorMessage}</td></tr>`;
  }
}

async function loadUsers() {
  await loadUsersData();
}

function refreshUsers() {
  loadUsersData();
}

async function viewUser(userId) {
  try {
    const doc = await db.collection('quest4you_users').doc(userId).get();
    
    if (!doc.exists) {
      alert('❌ Utilizador não encontrado');
      return;
    }
    
    const data = doc.data();
    
    // Construir informação detalhada
    let info = `👤 INFORMAÇÕES DO UTILIZADOR\n`;
    info += `━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    info += `📧 Email: ${data.email || 'N/A'}\n`;
    info += `✏️ Nome: ${data.displayName || 'Anónimo'}\n`;
    info += `📅 Registo: ${data.createdAt ? data.createdAt.toDate().toLocaleString('pt-PT') : 'N/A'}\n\n`;
    
    // Progresso dos Questionários
    info += `📊 PROGRESSO DOS QUESTIONÁRIOS\n`;
    info += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    const quizNames = {
      vanilla: 'Vanilla ou Kink',
      orientation: 'Espectro de Atração',
      kinks: 'Fetiches & Parafilias',
      exhibitionism: 'Exibicionismo',
      fantasies: 'Fantasias Secretas',
      swing: 'Swing/Poliamor',
      cuckold: 'Stag/Hotwife/Cuckold',
      bdsm: 'BDSM & Power Play',
      communication: 'Comunicação Sexual'
    };
    
    if (data.progress) {
      Object.entries(data.progress).forEach(([quizId, count]) => {
        const quizName = quizNames[quizId] || quizId;
        info += `• ${quizName}: ${count} perguntas\n`;
      });
    } else {
      info += `Nenhum progresso registado\n`;
    }
    
    info += `\n`;
    
    // Questionários Completados
    info += `✅ QUESTIONÁRIOS COMPLETADOS\n`;
    info += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    // Verificar ambos os campos: results E quizResults
    const results = data.results || data.quizResults || {};
    
    if (Object.keys(results).length > 0) {
      Object.entries(results).forEach(([quizId, result]) => {
        const quizName = quizNames[quizId] || quizId;
        info += `• ${quizName}\n`;
        
        // Verificar diferentes formatos de scores
        const scores = result.scores || result.categoryScores || result.rolePercentages || {};
        if (Object.keys(scores).length > 0) {
          Object.entries(scores).forEach(([key, value]) => {
            const scoreValue = typeof value === 'number' ? value : parseFloat(value) || 0;
            info += `  - ${key}: ${Math.round(scoreValue)}%\n`;
          });
        } else if (result.score !== undefined) {
          info += `  - Score: ${result.score}%\n`;
        }
        if (result.category) {
          info += `  - Categoria: ${result.category}\n`;
        }
      });
    } else {
      info += `Nenhum questionário completado\n`;
    }
    
    info += `\n`;
    
    // SmartMatch
    info += `💕 SMARTMATCH\n`;
    info += `━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    info += `Estado: ${data.smartMatchEnabled ? '✅ Ativo' : '❌ Inativo'}\n`;
    
    if (data.smartMatchEnabled) {
      info += `Género validado: ${data.genderValidated ? '✅ Sim' : '❌ Não'}\n`;
      info += `Orientação declarada: ${data.smartMatchPreferences?.orientation || 'N/A'}\n`;
      info += `A procurar: ${data.smartMatchPreferences?.lookingFor || 'N/A'}\n`;
    }
    
    alert(info);
    
  } catch (error) {
    console.error('Error viewing user:', error);
    alert('❌ Erro ao carregar detalhes do utilizador');
  }
}

// Eliminar utilizador
async function deleteUser(userId, displayName) {
  if (!confirm(`⚠️ ATENÇÃO!\n\nTens a certeza que queres eliminar o utilizador "${displayName}"?\n\nIsto irá:\n• Eliminar o perfil do utilizador\n• Eliminar todos os questionários e resultados\n• Eliminar pedidos de validação de género\n• Eliminar dados do SmartMatch\n\nEsta ação é IRREVERSÍVEL!`)) {
    return;
  }
  
  // Segunda confirmação
  if (!confirm(`🔴 CONFIRMAÇÃO FINAL\n\nEscrever "ELIMINAR" para confirmar seria ideal, mas vou perguntar de novo:\n\nEliminar "${displayName}" permanentemente?`)) {
    return;
  }
  
  try {
    console.log(`🗑️ Deleting user: ${userId}`);
    
    // 1. Eliminar documento do utilizador
    await db.collection('quest4you_users').doc(userId).delete();
    console.log('✅ User document deleted');
    
    // 2. Eliminar pedido de validação de género (se existir)
    try {
      await db.collection('genderValidations').doc(userId).delete();
      console.log('✅ Gender validation deleted');
    } catch (e) {
      console.log('ℹ️ No gender validation to delete');
    }
    
    // 3. Eliminar da coleção admins (se for admin)
    try {
      await db.collection('admins').doc(userId).delete();
      console.log('✅ Admin record deleted');
    } catch (e) {
      console.log('ℹ️ No admin record to delete');
    }
    
    // 4. Remover da tabela visualmente
    const row = document.querySelector(`tr[data-userid="${userId}"]`);
    if (row) {
      row.style.transition = 'all 0.3s ease';
      row.style.backgroundColor = '#ffcccc';
      row.style.opacity = '0';
      setTimeout(() => row.remove(), 300);
    }
    
    alert(`✅ Utilizador "${displayName}" eliminado com sucesso!`);
    
    // Recarregar dados do dashboard
    loadDashboardData();
    
  } catch (error) {
    console.error('Error deleting user:', error);
    
    if (error.code === 'permission-denied') {
      alert('🔒 Sem permissões para eliminar utilizadores.\nVerifica as regras do Firestore.');
    } else {
      alert(`❌ Erro ao eliminar utilizador: ${error.message}`);
    }
  }
}

function saveSettings() {
  alert('✅ Definições guardadas com sucesso!');
}

// ================================
// QUIZZES SECTION
// ================================
async function loadQuizzesData() {
  if (typeof db === 'undefined') {
    console.log('Firebase not available');
    return;
  }
  
  try {
    console.log('🔄 Loading quiz statistics...');
    const snapshot = await db.collection('quest4you_users').get();
    
    // Contadores por questionário
    const quizStats = {
      vanilla: { completed: 0, inProgress: 0 },
      orientation: { completed: 0, inProgress: 0 },
      kinks: { completed: 0, inProgress: 0 },
      exhibitionism: { completed: 0, inProgress: 0 },
      fantasies: { completed: 0, inProgress: 0 },
      swing: { completed: 0, inProgress: 0 },
      cuckold: { completed: 0, inProgress: 0 },
      bdsm: { completed: 0, inProgress: 0 },
      communication: { completed: 0, inProgress: 0 }
    };
    
    const totalUsers = snapshot.size;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Verificar ambos os campos: results E quizResults
      const results = data.results || data.quizResults || {};
      
      // Contar completados
      if (Object.keys(results).length > 0) {
        Object.keys(results).forEach(quizId => {
          if (quizStats[quizId]) {
            quizStats[quizId].completed++;
          }
        });
      }
      
      // Contar em progresso (tem progress mas não tem resultado)
      if (data.progress) {
        Object.keys(data.progress).forEach(quizId => {
          if (quizStats[quizId] && !results[quizId]) {
            quizStats[quizId].inProgress++;
          }
        });
      }
    });
    
    console.log('📊 Quiz Stats:', quizStats);
    console.log('👥 Total Users:', totalUsers);
    
    // Atualizar todos os cards dos questionários
    Object.keys(quizStats).forEach(quizId => {
      const stats = quizStats[quizId];
      const completionRate = totalUsers > 0 ? Math.round((stats.completed / totalUsers) * 100) : 0;
      
      // Atualizar elementos no DOM
      const completedEl = document.getElementById(`${quizId}-completed`);
      const progressEl = document.getElementById(`${quizId}-progress`);
      const rateEl = document.getElementById(`${quizId}-rate`);
      
      if (completedEl) completedEl.textContent = `${stats.completed} completados`;
      if (progressEl) progressEl.textContent = `${stats.inProgress} em progresso`;
      if (rateEl) rateEl.textContent = `${completionRate}% taxa`;
    });
    
    console.log('✅ Quiz statistics updated');
    
  } catch (error) {
    console.error('❌ Error loading quiz data:', error);
  }
}

// ================================
// RESULTS SECTION
// ================================
async function loadResultsData() {
  if (typeof db === 'undefined') {
    console.log('Firebase not available');
    return;
  }
  
  const section = document.getElementById('resultsSection');
  if (!section) return;
  
  // Mostrar loading
  section.innerHTML = `
    <div class="section-header">
      <h2>📈 Análise de Resultados</h2>
    </div>
    <div class="loading-container">
      <div class="loading-spinner">⏳</div>
      <p>A carregar análise de resultados...</p>
    </div>
  `;
  
  try {
    const snapshot = await db.collection('quest4you_users').get();
    
    // Estrutura de análise completa
    const resultsAnalysis = {
      totalUsers: snapshot.size,
      totalResults: 0,
      usersWithResults: 0,
      quizData: {},
      distributions: {}
    };
    
    // Nomes dos questionários
    const quizNames = {
      vanilla: { name: 'Vanilla ou Kink', icon: '🔥', color: '#e91e63' },
      orientation: { name: 'Espectro de Atração', icon: '🌈', color: '#9c27b0' },
      kinks: { name: 'Fetiches & Parafilias', icon: '⛓️', color: '#f44336' },
      exhibitionism: { name: 'Exibicionismo', icon: '👀', color: '#ff9800' },
      fantasies: { name: 'Fantasias Secretas', icon: '💭', color: '#e040fb' },
      swing: { name: 'Swing/Poliamor', icon: '💑', color: '#00bcd4' },
      cuckold: { name: 'Stag/Hotwife/Cuckold', icon: '🦊', color: '#673ab7' },
      bdsm: { name: 'BDSM & Power Play', icon: '🔗', color: '#795548' },
      communication: { name: 'Comunicação Sexual', icon: '💬', color: '#4caf50' }
    };
    
    // Inicializar dados dos questionários
    Object.keys(quizNames).forEach(quizId => {
      resultsAnalysis.quizData[quizId] = {
        count: 0,
        scores: {},
        dimensions: {}
      };
    });
    
    // Agregar dados de todos os utilizadores
    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Verificar ambos os campos: results E quizResults
      const results = data.results || data.quizResults || {};
      
      if (Object.keys(results).length > 0) {
        resultsAnalysis.usersWithResults++;
        
        Object.entries(results).forEach(([quizId, result]) => {
          resultsAnalysis.totalResults++;
          
          if (resultsAnalysis.quizData[quizId]) {
            resultsAnalysis.quizData[quizId].count++;
            
            // Processar scores/dimensões (verificar vários formatos)
            const scores = result.scores || result.categoryScores || result.rolePercentages || {};
            if (Object.keys(scores).length > 0) {
              Object.entries(scores).forEach(([dimension, score]) => {
                if (!resultsAnalysis.quizData[quizId].dimensions[dimension]) {
                  resultsAnalysis.quizData[quizId].dimensions[dimension] = [];
                }
                resultsAnalysis.quizData[quizId].dimensions[dimension].push(
                  typeof score === 'number' ? score : parseFloat(score) || 0
                );
              });
            }
            
            // Processar outras métricas
            if (result.totalScore !== undefined) {
              if (!resultsAnalysis.quizData[quizId].totalScores) {
                resultsAnalysis.quizData[quizId].totalScores = [];
              }
              resultsAnalysis.quizData[quizId].totalScores.push(result.totalScore);
            }
          }
        });
      }
    });
    
    // Calcular médias
    Object.keys(resultsAnalysis.quizData).forEach(quizId => {
      const quizData = resultsAnalysis.quizData[quizId];
      quizData.averages = {};
      
      Object.entries(quizData.dimensions).forEach(([dimension, scores]) => {
        if (scores.length > 0) {
          quizData.averages[dimension] = Math.round(
            scores.reduce((a, b) => a + b, 0) / scores.length
          );
        }
      });
      
      if (quizData.totalScores && quizData.totalScores.length > 0) {
        quizData.averageTotal = Math.round(
          quizData.totalScores.reduce((a, b) => a + b, 0) / quizData.totalScores.length
        );
      }
    });
    
    console.log('Results Analysis:', resultsAnalysis);
    
    // Exibir resultados
    displayEnhancedResultsAnalysis(resultsAnalysis, quizNames);
    
  } catch (error) {
    console.error('Error loading results:', error);
    section.innerHTML = `
      <div class="section-header">
        <h2>📈 Análise de Resultados</h2>
      </div>
      <div class="error-container">
        <p>❌ Erro ao carregar resultados: ${error.message}</p>
      </div>
    `;
  }
}

function displayEnhancedResultsAnalysis(analysis, quizNames) {
  const section = document.getElementById('resultsSection');
  if (!section) return;
  
  // Calcular estatísticas gerais
  const completionRate = analysis.totalUsers > 0 
    ? Math.round((analysis.usersWithResults / analysis.totalUsers) * 100) 
    : 0;
  
  const avgQuizzesPerUser = analysis.usersWithResults > 0
    ? (analysis.totalResults / analysis.usersWithResults).toFixed(1)
    : 0;
  
  // Encontrar o quiz mais popular
  let mostPopularQuiz = { id: null, count: 0 };
  Object.entries(analysis.quizData).forEach(([quizId, data]) => {
    if (data.count > mostPopularQuiz.count) {
      mostPopularQuiz = { id: quizId, count: data.count };
    }
  });
  
  let html = `
    <div class="section-header">
      <h2>📈 Análise de Resultados</h2>
      <div class="header-actions">
        <button class="btn btn-outline" onclick="loadResultsData()">🔄 Atualizar</button>
      </div>
    </div>
    
    <!-- Estatísticas Gerais -->
    <div class="results-stats-grid">
      <div class="stat-card stat-highlight">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <span class="stat-value">${analysis.totalUsers}</span>
          <span class="stat-label">Total Utilizadores</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <span class="stat-value">${analysis.totalResults}</span>
          <span class="stat-label">Questionários Completados</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <span class="stat-value">${analysis.usersWithResults}</span>
          <span class="stat-label">Utilizadores com Resultados</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <span class="stat-value">${completionRate}%</span>
          <span class="stat-label">Taxa de Participação</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-info">
          <span class="stat-value">${avgQuizzesPerUser}</span>
          <span class="stat-label">Média por Utilizador</span>
        </div>
      </div>
      <div class="stat-card stat-popular">
        <div class="stat-icon">${mostPopularQuiz.id ? quizNames[mostPopularQuiz.id]?.icon || '🏆' : '🏆'}</div>
        <div class="stat-info">
          <span class="stat-value">${mostPopularQuiz.id ? quizNames[mostPopularQuiz.id]?.name || mostPopularQuiz.id : 'N/A'}</span>
          <span class="stat-label">Quiz Mais Popular (${mostPopularQuiz.count})</span>
        </div>
      </div>
    </div>
    
    <!-- Resultados por Questionário -->
    <div class="results-quizzes-section">
      <h3>📋 Resultados por Questionário</h3>
      <div class="quiz-results-grid">
  `;
  
  // Ordenar quizzes por número de resultados
  const sortedQuizzes = Object.entries(analysis.quizData)
    .filter(([_, data]) => data.count > 0)
    .sort((a, b) => b[1].count - a[1].count);
  
  if (sortedQuizzes.length === 0) {
    html += `
      <div class="empty-results">
        <div class="empty-icon">📭</div>
        <h4>Ainda não há resultados</h4>
        <p>Os resultados aparecerão aqui quando os utilizadores completarem questionários.</p>
      </div>
    `;
  } else {
    sortedQuizzes.forEach(([quizId, data]) => {
      const quizInfo = quizNames[quizId] || { name: quizId, icon: '📝', color: '#666' };
      const percentage = analysis.totalUsers > 0 
        ? Math.round((data.count / analysis.totalUsers) * 100) 
        : 0;
      
      html += `
        <div class="quiz-result-card" style="--quiz-color: ${quizInfo.color}">
          <div class="quiz-result-header">
            <span class="quiz-icon">${quizInfo.icon}</span>
            <div class="quiz-title-info">
              <h4>${quizInfo.name}</h4>
              <span class="quiz-completion-badge">${data.count} completados (${percentage}%)</span>
            </div>
          </div>
          
          <div class="quiz-result-body">
      `;
      
      // Mostrar dimensões/médias se existirem
      if (Object.keys(data.averages).length > 0) {
        html += `<div class="dimensions-container">`;
        
        Object.entries(data.averages).forEach(([dimension, avgScore]) => {
          // Formatar nome da dimensão
          const dimensionLabel = formatDimensionLabel(dimension);
          const barColor = getScoreColor(avgScore);
          
          html += `
            <div class="dimension-row">
              <div class="dimension-info">
                <span class="dimension-name">${dimensionLabel}</span>
                <span class="dimension-avg">${avgScore}%</span>
              </div>
              <div class="dimension-bar-container">
                <div class="dimension-bar" style="width: ${avgScore}%; background: ${barColor}"></div>
              </div>
            </div>
          `;
        });
        
        html += `</div>`;
      } else if (data.averageTotal !== undefined) {
        html += `
          <div class="total-score-display">
            <span class="total-label">Pontuação Média:</span>
            <span class="total-value">${data.averageTotal}%</span>
          </div>
        `;
      } else {
        html += `
          <div class="no-dimensions">
            <span>Dados detalhados não disponíveis</span>
          </div>
        `;
      }
      
      html += `
          </div>
        </div>
      `;
    });
  }
  
  html += `
      </div>
    </div>
  `;
  
  section.innerHTML = html;
}

// Formata o nome da dimensão para display
function formatDimensionLabel(dimension) {
  // Capitalizar e remover underscores
  return dimension
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Retorna cor baseada no score
function getScoreColor(score) {
  if (score >= 80) return '#4caf50'; // Verde
  if (score >= 60) return '#8bc34a'; // Verde claro
  if (score >= 40) return '#ffc107'; // Amarelo
  if (score >= 20) return '#ff9800'; // Laranja
  return '#f44336'; // Vermelho
}

// ================================
// MATCHES SECTION
// ================================
async function loadMatchesData() {
  if (typeof db === 'undefined') {
    console.log('Firebase not available');
    return;
  }
  
  const section = document.getElementById('matchesSection');
  if (!section) return;
  
  // Mostrar loading
  section.innerHTML = `
    <div class="section-header">
      <h2>💕 Smart Matches</h2>
    </div>
    <div class="loading-container">
      <div class="loading-spinner">⏳</div>
      <p>A carregar dados do SmartMatch...</p>
    </div>
  `;
  
  try {
    // Buscar TODOS os utilizadores para análise completa
    const allUsersSnapshot = await db.collection('quest4you_users').get();
    
    const matchesData = {
      totalUsers: allUsersSnapshot.size,
      totalActive: 0,
      totalValidated: 0,
      totalPendingValidation: 0,
      users: [],
      genderDistribution: {},
      orientationDistribution: {},
      lookingForDistribution: {}
    };
    
    allUsersSnapshot.forEach(doc => {
      const data = doc.data();
      
      // SmartMatch ativo
      if (data.smartMatchEnabled) {
        matchesData.totalActive++;
        
        // Género validado
        if (data.genderValidated) {
          matchesData.totalValidated++;
        }
        
        // Pendente de validação
        if (data.genderValidation?.status === 'pending' || data.genderValidationRequested) {
          matchesData.totalPendingValidation++;
        }
        
        // Preferências
        const prefs = data.smartMatchPreferences || {};
        const gender = prefs.gender || 'não especificado';
        const orientation = prefs.orientation || 'não especificado';
        const lookingFor = prefs.lookingFor || 'não especificado';
        
        // Distribuições
        matchesData.genderDistribution[gender] = (matchesData.genderDistribution[gender] || 0) + 1;
        matchesData.orientationDistribution[orientation] = (matchesData.orientationDistribution[orientation] || 0) + 1;
        matchesData.lookingForDistribution[lookingFor] = (matchesData.lookingForDistribution[lookingFor] || 0) + 1;
        
        // Adicionar à lista
        matchesData.users.push({
          id: doc.id,
          displayName: data.displayName || data.name || 'Anónimo',
          email: data.email || 'N/A',
          genderValidated: data.genderValidated || false,
          validationPending: data.genderValidation?.status === 'pending' || data.genderValidationRequested,
          gender: gender,
          orientation: orientation,
          lookingFor: lookingFor,
          quizzesCompleted: data.results ? Object.keys(data.results).length : 0,
          hasPhotos: !!(data.photos?.public || data.photos?.private || data.photos?.secret),
          createdAt: data.createdAt
        });
      }
    });
    
    // Ordenar por data de criação (mais recente primeiro)
    matchesData.users.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return b.createdAt.toDate() - a.createdAt.toDate();
    });
    
    console.log('Matches Data:', matchesData);
    displayEnhancedMatchesData(matchesData);
    
  } catch (error) {
    console.error('Error loading matches:', error);
    section.innerHTML = `
      <div class="section-header">
        <h2>💕 Smart Matches</h2>
      </div>
      <div class="error-container">
        <p>❌ Erro ao carregar dados: ${error.message}</p>
      </div>
    `;
  }
}

function displayEnhancedMatchesData(data) {
  const section = document.getElementById('matchesSection');
  if (!section) return;
  
  // Calcular taxas
  const validationRate = data.totalActive > 0 
    ? Math.round((data.totalValidated / data.totalActive) * 100) 
    : 0;
  
  const activationRate = data.totalUsers > 0 
    ? Math.round((data.totalActive / data.totalUsers) * 100) 
    : 0;
  
  let html = `
    <div class="section-header">
      <h2>💕 Smart Matches</h2>
      <div class="header-actions">
        <button class="btn btn-outline" onclick="loadMatchesData()">🔄 Atualizar</button>
      </div>
    </div>
    
    <!-- Estatísticas Principais -->
    <div class="matches-stats-grid">
      <div class="stat-card stat-primary">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <span class="stat-value">${data.totalUsers}</span>
          <span class="stat-label">Total Utilizadores</span>
        </div>
      </div>
      <div class="stat-card stat-active">
        <div class="stat-icon">💕</div>
        <div class="stat-info">
          <span class="stat-value">${data.totalActive}</span>
          <span class="stat-label">SmartMatch Ativo</span>
        </div>
      </div>
      <div class="stat-card stat-validated">
        <div class="stat-icon">✅</div>
        <div class="stat-info">
          <span class="stat-value">${data.totalValidated}</span>
          <span class="stat-label">Géneros Validados</span>
        </div>
      </div>
      <div class="stat-card stat-pending">
        <div class="stat-icon">⏳</div>
        <div class="stat-info">
          <span class="stat-value">${data.totalPendingValidation}</span>
          <span class="stat-label">Validações Pendentes</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-info">
          <span class="stat-value">${validationRate}%</span>
          <span class="stat-label">Taxa de Validação</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-info">
          <span class="stat-value">${activationRate}%</span>
          <span class="stat-label">Taxa de Ativação</span>
        </div>
      </div>
    </div>
    
    <!-- Distribuições -->
    <div class="matches-distributions">
      <div class="distribution-card">
        <h4>👤 Distribuição por Género</h4>
        <div class="distribution-bars">
          ${generateDistributionBars(data.genderDistribution, data.totalActive, getGenderLabel)}
        </div>
      </div>
      <div class="distribution-card">
        <h4>🌈 Distribuição por Orientação</h4>
        <div class="distribution-bars">
          ${generateDistributionBars(data.orientationDistribution, data.totalActive, getOrientationLabel)}
        </div>
      </div>
      <div class="distribution-card">
        <h4>💘 À Procura de</h4>
        <div class="distribution-bars">
          ${generateDistributionBars(data.lookingForDistribution, data.totalActive, getGenderLabel)}
        </div>
      </div>
    </div>
    
    <!-- Lista de Utilizadores -->
    <div class="matches-users-section">
      <h3>👥 Utilizadores com SmartMatch Ativo (${data.users.length})</h3>
  `;
  
  if (data.users.length === 0) {
    html += `
      <div class="empty-matches">
        <div class="empty-icon">💔</div>
        <h4>Nenhum utilizador com SmartMatch ativo</h4>
        <p>Os utilizadores aparecerão aqui quando ativarem o SmartMatch.</p>
      </div>
    `;
  } else {
    html += `
      <div class="table-container">
        <table class="data-table matches-table">
          <thead>
            <tr>
              <th>Utilizador</th>
              <th>Género</th>
              <th>Orientação</th>
              <th>À procura</th>
              <th>Validado</th>
              <th>Fotos</th>
              <th>Quizzes</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    data.users.forEach(user => {
      const validationStatus = user.genderValidated 
        ? '<span class="badge badge-success">✅ Validado</span>' 
        : user.validationPending 
          ? '<span class="badge badge-warning">⏳ Pendente</span>'
          : '<span class="badge badge-danger">❌ Não</span>';
      
      const photosStatus = user.hasPhotos 
        ? '<span class="badge badge-info">📷 Sim</span>' 
        : '<span class="badge badge-muted">Não</span>';
      
      html += `
        <tr>
          <td>
            <div class="user-cell">
              <span class="user-avatar-small">${user.displayName.charAt(0).toUpperCase()}</span>
              <div class="user-info">
                <span class="user-name">${user.displayName}</span>
                <span class="user-email">${user.email}</span>
              </div>
            </div>
          </td>
          <td>${getGenderLabel(user.gender)}</td>
          <td>${getOrientationLabel(user.orientation)}</td>
          <td>${getGenderLabel(user.lookingFor)}</td>
          <td>${validationStatus}</td>
          <td>${photosStatus}</td>
          <td><span class="quiz-badge">${user.quizzesCompleted}/9</span></td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
  }
  
  html += `</div>`;
  
  section.innerHTML = html;
}

// Gera barras de distribuição
function generateDistributionBars(distribution, total, labelFn) {
  if (!distribution || Object.keys(distribution).length === 0) {
    return '<p class="no-data">Sem dados disponíveis</p>';
  }
  
  // Ordenar por quantidade
  const sorted = Object.entries(distribution)
    .sort((a, b) => b[1] - a[1]);
  
  let html = '';
  const colors = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#00bcd4', '#009688', '#4caf50', '#ff9800'];
  
  sorted.forEach(([key, value], index) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    const color = colors[index % colors.length];
    const label = labelFn ? labelFn(key) : key;
    
    html += `
      <div class="distribution-item">
        <div class="distribution-label">
          <span>${label}</span>
          <span class="distribution-count">${value} (${percentage}%)</span>
        </div>
        <div class="distribution-bar-bg">
          <div class="distribution-bar-fill" style="width: ${percentage}%; background: ${color}"></div>
        </div>
      </div>
    `;
  });
  
  return html;
}

// ================================
// GENDER VALIDATION SECTION
// ================================
let currentValidationFilter = 'pending';
let allValidationRequests = [];

async function loadValidationData() {
  if (typeof db === 'undefined') {
    console.log('Firebase not available');
    return;
  }
  
  const container = document.getElementById('validationRequestsContainer');
  if (container) {
    container.innerHTML = '<div class="loading-container"><div class="loading-spinner">⏳</div><p>A carregar validações...</p></div>';
  }
  
  try {
    console.log('🔄 Loading gender validation requests...');
    
    allValidationRequests = [];
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0
    };
    
    // 1. Primeiro, buscar da coleção genderValidations
    let snapshot;
    try {
      snapshot = await db.collection('genderValidations')
        .orderBy('requestedAt', 'desc')
        .get();
    } catch (indexError) {
      console.warn('OrderBy failed, trying without order:', indexError);
      snapshot = await db.collection('genderValidations').get();
    }
    
    console.log(`📊 Found ${snapshot.size} validation requests in genderValidations collection`);
    
    const processedUserIds = new Set();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${doc.id}: status=${data.status}, email=${data.email}`);
      
      allValidationRequests.push({
        id: doc.id,
        ...data
      });
      
      processedUserIds.add(doc.id);
      
      if (stats.hasOwnProperty(data.status)) {
        stats[data.status]++;
      } else {
        stats.pending++;
      }
    });
    
    // 2. Também verificar documentos de utilizadores com genderValidation (fallback)
    console.log('🔄 Checking user documents for genderValidation field...');
    const usersSnapshot = await db.collection('quest4you_users').get();
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      
      // Se o utilizador tem genderValidation e ainda não foi processado
      if (data.genderValidation && !processedUserIds.has(doc.id)) {
        const validation = data.genderValidation;
        console.log(`  - Found in user doc ${doc.id}: status=${validation.status}`);
        
        // Criar objeto de validação a partir dos dados do utilizador
        allValidationRequests.push({
          id: doc.id,
          userId: doc.id,
          email: data.email || 'N/A',
          displayName: data.displayName || 'Utilizador',
          declaredGender: data.smartMatchPreferences?.gender || data.gender || 'not_specified',
          orientation: data.smartMatchPreferences?.orientation || 'not_specified',
          lookingFor: data.smartMatchPreferences?.lookingFor || 'not_specified',
          validationPhotoUrl: validation.photoUrl || null,
          status: validation.status || 'pending',
          requestedAt: validation.submittedAt || null,
          reviewedAt: validation.reviewedAt || null,
          fromUserDoc: true // Flag para indicar que veio do documento do utilizador
        });
        
        const status = validation.status || 'pending';
        if (stats.hasOwnProperty(status)) {
          stats[status]++;
        } else {
          stats.pending++;
        }
      }
    });
    
    console.log(`📊 Total validation requests found: ${allValidationRequests.length}`);
    console.log('📈 Validation stats:', stats);
    
    // Atualizar estatísticas
    updateValidationStats(stats);
    
    // Atualizar badge no menu
    updateValidationBadge(stats.pending);
    
    // Mostrar pedidos
    displayValidationRequests(currentValidationFilter);
    
  } catch (error) {
    console.error('❌ Error loading validation data:', error);
    console.error('Error details:', error.code, error.message);
    
    if (container) {
      let errorMsg = 'Erro ao carregar validações';
      if (error.code === 'permission-denied') {
        errorMsg = '🔒 Sem permissões para ver validações. Verifica as regras do Firestore.';
      }
      container.innerHTML = `<div class="error-message" style="text-align: center; padding: 40px; color: #A65D73;">${errorMsg}</div>`;
    }
  }
}

function updateValidationStats(stats) {
  document.getElementById('validationPendingCount').textContent = stats.pending;
  document.getElementById('validationApprovedCount').textContent = stats.approved;
  document.getElementById('validationRejectedCount').textContent = stats.rejected;
  
  const total = stats.approved + stats.rejected;
  const approvalRate = total > 0 ? Math.round((stats.approved / total) * 100) : 0;
  document.getElementById('validationApprovalRate').textContent = `${approvalRate}%`;
}

function updateValidationBadge(count) {
  const badge = document.getElementById('pendingValidationsBadge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

function filterValidations(filter) {
  currentValidationFilter = filter;
  displayValidationRequests(filter);
  
  // Atualizar botões ativos
  const buttons = document.querySelectorAll('.header-actions .btn');
  buttons.forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-outline');
  });
  
  event.target.classList.remove('btn-outline');
  event.target.classList.add('btn-primary');
}

function displayValidationRequests(filter) {
  const container = document.getElementById('validationRequestsContainer');
  const emptyState = document.getElementById('validationEmptyState');
  
  if (!container) return;
  
  // Filtrar pedidos
  let filteredRequests = allValidationRequests;
  if (filter !== 'all') {
    filteredRequests = allValidationRequests.filter(req => req.status === filter);
  }
  
  // Mostrar empty state se necessário
  if (filteredRequests.length === 0) {
    container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  container.style.display = 'grid';
  if (emptyState) emptyState.style.display = 'none';
  
  // Renderizar cards
  let html = '';
  
  filteredRequests.forEach(request => {
    const isPending = request.status === 'pending';
    const statusClass = `status-${request.status}`;
    const statusLabel = getStatusLabel(request.status);
    const requestDate = request.requestedAt ? new Date(request.requestedAt.toDate()).toLocaleString('pt-PT') : 'N/A';
    
    // Avatar inicial
    const initial = request.displayName ? request.displayName.charAt(0).toUpperCase() : '?';
    
    html += `
      <div class="validation-card ${statusClass}">
        <div class="validation-header">
          <div class="validation-user">
            <div class="validation-avatar">${initial}</div>
            <div class="validation-user-info">
              <h4>${request.displayName || 'Utilizador'}</h4>
              <p>${request.email || 'N/A'}</p>
            </div>
          </div>
          <span class="validation-status-badge ${request.status}">${statusLabel}</span>
        </div>
        
        <div class="validation-body">
          <div class="validation-info-row">
            <span class="validation-info-label">Género Declarado:</span>
            <span class="validation-info-value">${getGenderLabel(request.declaredGender)}</span>
          </div>
          <div class="validation-info-row">
            <span class="validation-info-label">Orientação:</span>
            <span class="validation-info-value">${getOrientationLabel(request.orientation)}</span>
          </div>
          <div class="validation-info-row">
            <span class="validation-info-label">À procura de:</span>
            <span class="validation-info-value">${getGenderLabel(request.lookingFor)}</span>
          </div>
          <div class="validation-info-row">
            <span class="validation-info-label">Questionários:</span>
            <span class="validation-info-value">${request.quizzesCompleted || 0}/9 completados</span>
          </div>
        </div>
        
        <div class="validation-photos">
          <span class="validation-photos-label">📸 Fotos de Validação:</span>
          <div class="validation-photos-grid">
            ${generatePhotoElements(request)}
          </div>
        </div>
        
        ${isPending ? `
          <div class="validation-actions">
            <button class="btn btn-approve" onclick="approveValidation('${request.id}', '${request.userId || request.id}', event)">
              ✅ Aprovar
            </button>
            <button class="btn btn-reject" onclick="rejectValidation('${request.id}', '${request.userId || request.id}', event)">
              ❌ Rejeitar
            </button>
          </div>
        ` : ''}
        
        <div class="validation-timestamp">
          📅 ${requestDate}
          ${request.reviewedAt ? ` | Revisto: ${new Date(request.reviewedAt.toDate()).toLocaleString('pt-PT')}` : ''}
          ${request.reviewedBy ? ` | Por: ${request.reviewedBy}` : ''}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function generatePhotoElements(request) {
  let html = '';
  
  // Mostrar watermark/identificador se existir
  const watermark = request.watermark || (request.userShortId ? `Q4Y-${request.userShortId}` : '');
  const requestDate = request.requestedAt ? new Date(request.requestedAt.toDate()).toLocaleDateString('pt-PT') : '';
  
  // Foto de validação principal (com watermark)
  if (request.validationPhotoUrl) {
    html += `
      <div class="validation-photo-wrapper">
        <img src="${request.validationPhotoUrl}" 
             alt="Foto de validação" 
             class="validation-photo main-validation-photo"
             onclick="openPhotoModal('${request.validationPhotoUrl}')"
             title="Foto de validação">
        ${watermark ? `<div class="photo-watermark">${watermark}</div>` : ''}
        ${requestDate ? `<div class="photo-date">${requestDate}</div>` : ''}
      </div>
    `;
  }
  
  // Fotos do perfil (públicas, privadas, secretas)
  const photoTypes = [
    { key: 'publicPhotoUrl', label: 'pública', icon: '🌍' },
    { key: 'privatePhotoUrl', label: 'privada', icon: '🔒' },
    { key: 'secretPhotoUrl', label: 'secreta', icon: '🔐' }
  ];
  
  photoTypes.forEach(({ key, label, icon }) => {
    if (request[key]) {
      html += `
        <div class="validation-photo-wrapper">
          <img src="${request[key]}" 
               alt="Foto ${label}" 
               class="validation-photo"
               onclick="openPhotoModal('${request[key]}')"
               title="Foto ${label}">
          <div class="photo-type-label">${icon} ${label}</div>
        </div>
      `;
    }
  });
  
  // Se não há fotos
  if (!html) {
    html = `
      <div class="validation-photo no-photo">
        ❌ Sem fotos disponíveis
      </div>
    `;
  }
  
  return html;
}

function getStatusLabel(status) {
  const labels = {
    pending: '⏳ Pendente',
    approved: '✅ Aprovado',
    rejected: '❌ Rejeitado'
  };
  return labels[status] || status;
}

function getGenderLabel(gender) {
  const labels = {
    male: 'Homem',
    female: 'Mulher',
    couple_mf: 'Casal H/M',
    couple_mm: 'Casal H/H',
    couple_ff: 'Casal M/M',
    other: 'Outro'
  };
  return labels[gender] || gender;
}

function getOrientationLabel(orientation) {
  const labels = {
    heterosexual: 'Heterossexual',
    homosexual: 'Homossexual',
    bisexual: 'Bissexual',
    pansexual: 'Pansexual',
    other: 'Outro'
  };
  return labels[orientation] || orientation;
}

async function approveValidation(validationId, userId, event) {
  if (!confirm('✅ Confirmas que queres APROVAR esta validação de género?')) {
    return;
  }
  
  try {
    // Desabilitar botão se evento disponível
    let button = null;
    if (event && event.target) {
      button = event.target;
      button.disabled = true;
      button.textContent = '⏳ A processar...';
    }
    
    console.log('🔄 Approving validation:', { validationId, userId });
    
    // Usar userId se validationId não existir (fallback do documento do utilizador)
    const actualUserId = userId || validationId;
    
    // Tentar atualizar na coleção genderValidations (pode não existir)
    try {
      const validationDoc = await db.collection('genderValidations').doc(validationId).get();
      if (validationDoc.exists) {
        await db.collection('genderValidations').doc(validationId).update({
          status: 'approved',
          reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
          reviewedBy: currentAdmin.email
        });
        console.log('✅ Updated genderValidations collection');
      }
    } catch (e) {
      console.log('ℹ️ genderValidations doc not found, skipping');
    }
    
    // Atualizar utilizador (sempre)
    await db.collection('quest4you_users').doc(actualUserId).update({
      genderValidated: true,
      genderValidatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      'genderValidation.status': 'approved',
      'genderValidation.reviewedAt': firebase.firestore.FieldValue.serverTimestamp(),
      'genderValidation.reviewedBy': currentAdmin.email
    });
    
    console.log(`✅ Validation approved for user ${actualUserId}`);
    
    // Recarregar dados
    await loadValidationData();
    
    alert('✅ Validação aprovada com sucesso!');
    
  } catch (error) {
    console.error('Error approving validation:', error);
    console.error('Error details:', error.code, error.message);
    alert('❌ Erro ao aprovar validação: ' + error.message);
  }
}

async function rejectValidation(validationId, userId, event) {
  const reason = prompt('❌ Motivo da rejeição (opcional):');
  
  if (reason === null) {
    return; // Cancelou
  }
  
  try {
    // Desabilitar botão se evento disponível
    let button = null;
    if (event && event.target) {
      button = event.target;
      button.disabled = true;
      button.textContent = '⏳ A processar...';
    }
    
    console.log('🔄 Rejecting validation:', { validationId, userId });
    
    // Usar userId se validationId não existir (fallback do documento do utilizador)
    const actualUserId = userId || validationId;
    
    // Preparar dados de atualização
    const updateData = {
      status: 'rejected',
      reviewedAt: firebase.firestore.FieldValue.serverTimestamp(),
      reviewedBy: currentAdmin.email
    };
    
    if (reason) {
      updateData.rejectionReason = reason;
    }
    
    // Tentar atualizar na coleção genderValidations (pode não existir)
    try {
      const validationDoc = await db.collection('genderValidations').doc(validationId).get();
      if (validationDoc.exists) {
        await db.collection('genderValidations').doc(validationId).update(updateData);
        console.log('✅ Updated genderValidations collection');
      }
    } catch (e) {
      console.log('ℹ️ genderValidations doc not found, skipping');
    }
    
    // Atualizar utilizador (sempre)
    await db.collection('quest4you_users').doc(actualUserId).update({
      genderValidated: false,
      genderValidationRejected: true,
      genderValidationRejectionReason: reason || 'Não especificado',
      'genderValidation.status': 'rejected',
      'genderValidation.reviewedAt': firebase.firestore.FieldValue.serverTimestamp(),
      'genderValidation.reviewedBy': currentAdmin.email,
      'genderValidation.rejectionReason': reason || 'Não especificado'
    });
    
    console.log(`❌ Validation rejected for user ${actualUserId}`);
    
    // Recarregar dados
    await loadValidationData();
    
    alert('❌ Validação rejeitada.');
    
  } catch (error) {
    console.error('Error rejecting validation:', error);
    console.error('Error details:', error.code, error.message);
    alert('❌ Erro ao rejeitar validação: ' + error.message);
  }
}

function openPhotoModal(photoUrl) {
  // Criar modal se não existir
  let modal = document.getElementById('imageModal');
  
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'imageModal';
    modal.className = 'image-modal';
    modal.innerHTML = `
      <button class="image-modal-close" onclick="closePhotoModal()">✕</button>
      <img id="imageModalContent" class="image-modal-content" src="" alt="Validation photo">
    `;
    document.body.appendChild(modal);
    
    // Fechar ao clicar fora
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closePhotoModal();
      }
    });
  }
  
  // Mostrar imagem
  document.getElementById('imageModalContent').src = photoUrl;
  modal.classList.add('active');
}

function closePhotoModal() {
  const modal = document.getElementById('imageModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Verificar pedidos pendentes ao carregar dashboard
async function checkPendingValidations() {
  if (typeof db === 'undefined') return;
  
  try {
    const snapshot = await db.collection('genderValidations')
      .where('status', '==', 'pending')
      .get();
    
    const pendingCount = snapshot.size;
    updateValidationBadge(pendingCount);
    
    // Se houver validações pendentes, mostrar notificação
    if (pendingCount > 0) {
      console.log(`📢 ${pendingCount} validações pendentes de revisão`);
      showPendingValidationNotification(pendingCount);
    }
  } catch (error) {
    console.error('Error checking pending validations:', error);
  }
}

// Mostra notificação de validações pendentes
function showPendingValidationNotification(count) {
  // Remover notificação anterior se existir
  const existing = document.getElementById('pendingNotification');
  if (existing) existing.remove();
  
  // Criar notificação
  const notification = document.createElement('div');
  notification.id = 'pendingNotification';
  notification.className = 'pending-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">⚠️</span>
      <div class="notification-text">
        <strong>${count} ${count === 1 ? 'pedido' : 'pedidos'} de validação de género pendente${count === 1 ? '' : 's'}</strong>
        <p>Clica para rever e processar</p>
      </div>
      <button class="notification-action" onclick="navigateToValidation()">Ver Pedidos</button>
      <button class="notification-close" onclick="closeNotification()">✕</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => notification.classList.add('show'), 100);
}

// Fechar notificação
function closeNotification() {
  const notification = document.getElementById('pendingNotification');
  if (notification) {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }
}

// Navegar para validação
function navigateToValidation() {
  closeNotification();
  
  // Simular clique no menu de validação
  const validationLink = document.querySelector('[data-section="validation"]');
  if (validationLink) {
    validationLink.click();
  }
}

// Função para enviar notificação de email (usando EmailJS ou similar)
async function sendValidationEmailNotification(type, validationData) {
  // Configuração do EmailJS (gratuito até 200 emails/mês)
  const EMAILJS_SERVICE_ID = 'service_quest4you'; // Configurar no EmailJS
  const EMAILJS_TEMPLATE_ID = type === 'new' ? 'template_new_validation' : 'template_validation_result';
  const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Substituir pela chave real
  
  try {
    // Verificar se EmailJS está disponível
    if (typeof emailjs === 'undefined') {
      console.log('📧 EmailJS não configurado. Notificação de email não enviada.');
      console.log('Para configurar: https://www.emailjs.com/');
      return false;
    }
    
    const templateParams = {
      to_email: 'info@quest4couple.pt',
      subject: type === 'new' 
        ? `🆕 Nova Validação de Género - ${validationData.displayName || 'Utilizador'}`
        : `📋 Resultado de Validação - ${validationData.displayName || 'Utilizador'}`,
      user_name: validationData.displayName || 'Utilizador',
      user_email: validationData.email || 'N/A',
      declared_gender: getGenderLabel(validationData.declaredGender),
      orientation: getOrientationLabel(validationData.orientation),
      status: type === 'new' ? 'Pendente de Revisão' : validationData.status,
      admin_url: window.location.href,
      timestamp: new Date().toLocaleString('pt-PT')
    };
    
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
    console.log('✅ Email de notificação enviado com sucesso');
    return true;
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
}

// Função alternativa usando mailto (abre o cliente de email do utilizador)
function openEmailNotification(validationData) {
  const subject = encodeURIComponent(`🆕 Nova Validação de Género - Quest4You`);
  const body = encodeURIComponent(`
Nova solicitação de validação de género:

👤 Utilizador: ${validationData.displayName || 'N/A'}
📧 Email: ${validationData.email || 'N/A'}
👤 Género Declarado: ${getGenderLabel(validationData.declaredGender)}
🌈 Orientação: ${getOrientationLabel(validationData.orientation)}
💘 À procura de: ${getGenderLabel(validationData.lookingFor)}
📊 Questionários: ${validationData.quizzesCompleted || 0}/9

🔗 Link para revisão: ${window.location.origin}/admin/index.html#validation

---
Quest4You BackOffice
`);
  
  window.open(`mailto:info@quest4couple.pt?subject=${subject}&body=${body}`, '_blank');
}

// Export functions
window.adminLogin = adminLogin;
window.logout = logout;
window.toggleSidebar = toggleSidebar;
window.refreshUsers = refreshUsers;
window.viewUser = viewUser;
window.saveSettings = saveSettings;
window.filterValidations = filterValidations;
window.approveValidation = approveValidation;
window.rejectValidation = rejectValidation;
window.openPhotoModal = openPhotoModal;
window.closePhotoModal = closePhotoModal;
window.loadResultsData = loadResultsData;
window.loadMatchesData = loadMatchesData;
window.loadQuizzesData = loadQuizzesData;
window.loadValidationData = loadValidationData;
window.openEmailNotification = openEmailNotification;
window.closeNotification = closeNotification;
window.navigateToValidation = navigateToValidation;
window.deleteUser = deleteUser;
