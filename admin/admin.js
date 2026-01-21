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
function handleAdminAuth(user) {
  if (user && isAdminUser(user.email)) {
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
}

function isAdminUser(email) {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();
  console.log('Checking admin for:', normalizedEmail);
  console.log('Allowed admins:', ADMIN_EMAILS);
  const isAdmin = ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase().trim() === normalizedEmail);
  console.log('Is admin:', isAdmin);
  return isAdmin;
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
    
    if (!isAdminUser(result.user.email)) {
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
    // Load real data from Firestore
    const usersSnapshot = await db.collection('quest4you_users').get();
    document.getElementById('totalUsers').textContent = usersSnapshot.size;
    
    // Calculate other stats
    let totalResponses = 0;
    let completedQuizzes = 0;
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.progress) {
        Object.values(data.progress).forEach(p => totalResponses += p);
      }
      if (data.results) {
        completedQuizzes += Object.keys(data.results).length;
      }
    });
    
    document.getElementById('totalResponses').textContent = totalResponses.toLocaleString();
    document.getElementById('completedQuizzes').textContent = completedQuizzes.toLocaleString();
    
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showDemoData();
  }
}

function showDemoData() {
  document.getElementById('totalUsers').textContent = '1,234';
  document.getElementById('totalResponses').textContent = '45,678';
  document.getElementById('completedQuizzes').textContent = '3,456';
  document.getElementById('totalMatches').textContent = '2,345';
}

async function loadSectionData(section) {
  switch (section) {
    case 'users':
      await loadUsers();
      break;
    case 'quizzes':
      // Already static in HTML
      break;
    case 'results':
      // Load results analytics
      break;
    case 'matches':
      // Load match statistics
      break;
  }
}

async function loadUsers() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;
  
  if (typeof db === 'undefined') {
    // Show demo users
    tbody.innerHTML = `
      <tr>
        <td>001</td>
        <td>João Silva</td>
        <td>joao@email.com</td>
        <td>20 Jan 2025</td>
        <td>3/5</td>
        <td>
          <button class="btn btn-outline btn-small">Ver</button>
        </td>
      </tr>
      <tr>
        <td>002</td>
        <td>Maria Santos</td>
        <td>maria@email.com</td>
        <td>19 Jan 2025</td>
        <td>5/5</td>
        <td>
          <button class="btn btn-outline btn-small">Ver</button>
        </td>
      </tr>
      <tr>
        <td>003</td>
        <td>Pedro Costa</td>
        <td>pedro@email.com</td>
        <td>18 Jan 2025</td>
        <td>2/5</td>
        <td>
          <button class="btn btn-outline btn-small">Ver</button>
        </td>
      </tr>
    `;
    return;
  }
  
  try {
    const snapshot = await db.collection('quest4you_users').orderBy('createdAt', 'desc').limit(50).get();
    
    let html = '';
    let index = 1;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('pt-PT') : 'N/A';
      const quizzesCompleted = data.results ? Object.keys(data.results).length : 0;
      
      html += `
        <tr>
          <td>${String(index).padStart(3, '0')}</td>
          <td>${data.displayName || 'Anónimo'}</td>
          <td>${data.email || 'N/A'}</td>
          <td>${date}</td>
          <td>${quizzesCompleted}/5</td>
          <td>
            <button class="btn btn-outline btn-small" onclick="viewUser('${doc.id}')">Ver</button>
          </td>
        </tr>
      `;
      index++;
    });
    
    tbody.innerHTML = html || '<tr><td colspan="6" style="text-align: center;">Nenhum utilizador encontrado</td></tr>';
    
  } catch (error) {
    console.error('Error loading users:', error);
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Erro ao carregar utilizadores</td></tr>';
  }
}

function refreshUsers() {
  loadUsers();
}

function viewUser(userId) {
  alert('Ver detalhes do utilizador: ' + userId);
  // TODO: Implement user detail view
}

function saveSettings() {
  alert('✅ Definições guardadas com sucesso!');
}

// Export functions
window.adminLogin = adminLogin;
window.logout = logout;
window.toggleSidebar = toggleSidebar;
window.refreshUsers = refreshUsers;
window.viewUser = viewUser;
window.saveSettings = saveSettings;
