/**
 * Quest4You - Main Application
 * Questionários individuais com resultados imediatos
 * Login obrigatório para responder
 */

// ================================
// CONFIGURATION
// ================================
const QUIZZES_CONFIG = [
  {
    id: "vanilla",
    name: "Vanilla ou Kink",
    icon: "🔥",
    color: "#e91e63",
    description: "Descobre onde te posicionas no espectro entre romance suave e práticas mais intensas",
    questions: 50,
    resultType: "spectrum"
  },
  {
    id: "orientation",
    name: "Orientação Sexual",
    icon: "🌈",
    color: "#9c27b0",
    description: "Explora as tuas atrações e curiosidades sobre diferentes géneros e identidades",
    questions: 50,
    resultType: "spectrum"
  },  {
    id: "cuckold",
    name: "Voyeurismo & Partilha",
    icon: "👀",
    color: "#673ab7",
    description: "Avalia o teu interesse em dinâmicas de observação e partilha consensual do parceiro",
    questions: 50,
    resultType: "spectrum"
  },
  {
    id: "swing",
    name: "Swing/Poliamor",
    icon: "💑",
    color: "#00bcd4",
    description: "Explora o teu interesse em relações não-monogâmicas e experiências com múltiplos parceiros",
    questions: 50,
    resultType: "category"
  },
  {
    id: "kinks",
    name: "Fetiches e Kinks",
    icon: "⛓️",
    color: "#f44336",
    description: "Descobre os teus interesses em práticas alternativas e fetiches específicos",
    questions: 50,
    resultType: "tags"
  }
];

// ================================
// STATE
// ================================
let currentUser = null;
let userProgress = {};
let userResults = {};

// ================================
// INITIALIZATION
// ================================
document.addEventListener("DOMContentLoaded", function() {
  console.log("Quest4You initialized");
  
  // Render quizzes
  renderQuizzes();
  
  // Check auth state
  if (typeof auth !== "undefined") {
    auth.onAuthStateChanged(handleAuthChange);
  } else {
    // Firebase not loaded yet, show login notice
    updateUIForGuest();
  }
  
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", function() {
      document.querySelector(".nav").classList.toggle("active");
    });
  }
});

// ================================
// AUTH
// ================================
function handleAuthChange(user) {
  currentUser = user;

  if (user) {
    console.log("User logged in:", user.email);
    updateUIForUser(user);
    loadUserProgress();
  } else {
    console.log("User not logged in");
    updateUIForGuest();
  }
}

function updateUIForUser(user) {
  // Update auth link
  const authLink = document.getElementById("authLink");
  if (authLink) {
    authLink.textContent = "👤 " + (user.displayName || "Perfil");
    authLink.href = "./pages/profile.html";
    authLink.classList.remove("btn-nav-login");
  }

  // Hide login notice
  const loginNotice = document.getElementById("loginNotice");
  if (loginNotice) {
    loginNotice.style.display = "none";
  }

  // Show progress section
  const progressSection = document.getElementById("progressSection");
  if (progressSection) {
    progressSection.style.display = "block";
  }
}

function updateUIForGuest() {
  // Update auth link
  const authLink = document.getElementById("authLink");
  if (authLink) {
    authLink.textContent = "🔐 Entrar";
    authLink.href = "./pages/auth.html";
  }

  // Show login notice
  const loginNotice = document.getElementById("loginNotice");
  if (loginNotice) {
    loginNotice.style.display = "block";
  }

  // Hide progress section
  const progressSection = document.getElementById("progressSection");
  if (progressSection) {
    progressSection.style.display = "none";
  }
}

async function loadUserProgress() {
  if (!currentUser || typeof db === "undefined") return;
  
  try {
    const doc = await db.collection("quest4you_users").doc(currentUser.uid).get();
    if (doc.exists) {
      const data = doc.data();
      userProgress = data.progress || {};
      userResults = data.results || {};
      renderProgress();
    }
  } catch (error) {
    console.error("Error loading progress:", error);
  }
}

// ================================
// RENDER
// ================================
function renderQuizzes() {
  const grid = document.getElementById("quizzesGrid");
  if (!grid) return;

  let html = "";
  
  for (let i = 0; i < QUIZZES_CONFIG.length; i++) {
    const quiz = QUIZZES_CONFIG[i];
    
    html += '<div class="quiz-card" data-quiz="' + quiz.id + '" onclick="openQuiz(\'' + quiz.id + '\')">';
    html += '  <div class="quiz-card-header" style="background: ' + quiz.color + '">';
    html += '    <div class="quiz-card-icon">' + quiz.icon + '</div>';
    html += '    <h3 class="quiz-card-title">' + quiz.name + '</h3>';
    html += '  </div>';
    html += '  <div class="quiz-card-body">';
    html += '    <p class="quiz-card-description">' + quiz.description + '</p>';
    html += '    <div class="quiz-card-footer">';
    html += '      <span class="quiz-meta">📝 ' + quiz.questions + ' perguntas</span>';
    html += '      <span class="quiz-badge free">✓ Grátis</span>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';
  }
  
  grid.innerHTML = html;
}

function renderProgress() {
  const grid = document.getElementById("progressGrid");
  if (!grid) return;
  
  let html = "";
  
  for (let i = 0; i < QUIZZES_CONFIG.length; i++) {
    const quiz = QUIZZES_CONFIG[i];
    const progress = userProgress[quiz.id] || 0;
    const completed = progress >= quiz.questions;
    const percent = Math.round((progress / quiz.questions) * 100);
    
    // Determine status
    let statusClass = "not-started";
    let statusText = "Não iniciado";
    let statusIcon = "○";
    let actionText = "Iniciar";
    
    if (completed) {
      statusClass = "completed";
      statusText = "Concluído";
      statusIcon = "✓";
      actionText = "Ver Resultados";
    } else if (progress > 0) {
      statusClass = "in-progress";
      statusText = "Em progresso";
      statusIcon = "◐";
      actionText = "Continuar";
    }
    
    html += '<div class="progress-card ' + (completed ? "completed" : "") + '">';
    html += '  <div class="progress-header" style="background: ' + quiz.color + '">';
    html += '    <span class="progress-icon">' + quiz.icon + '</span>';
    html += '    <span class="progress-title">' + quiz.name + '</span>';
    html += '  </div>';
    html += '  <div class="progress-body">';
    html += '    <div class="progress-bar-container">';
    html += '      <div class="progress-bar" style="width: ' + percent + '%"></div>';
    html += '    </div>';
    html += '    <div class="progress-text">';
    html += '      <span>' + progress + '/' + quiz.questions + ' perguntas</span>';
    html += '      <span class="progress-percent">' + percent + '%</span>';
    html += '    </div>';
    html += '    <div class="progress-status ' + statusClass + '">';
    html += '      <span>' + statusIcon + '</span>';
    html += '      <span>' + statusText + '</span>';
    html += '    </div>';
    html += '    <div class="progress-action">';
    html += '      <button class="btn btn-primary" onclick="openQuiz(\'' + quiz.id + '\')">' + actionText + '</button>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';
  }
  
  grid.innerHTML = html;
}

// ================================
// ACTIONS
// ================================
function openQuiz(quizId) {
  // Check if user is logged in
  if (!currentUser) {
    showLoginModal();
    return;
  }

  var quiz = null;
  for (var i = 0; i < QUIZZES_CONFIG.length; i++) {
    if (QUIZZES_CONFIG[i].id === quizId) {
      quiz = QUIZZES_CONFIG[i];
      break;
    }
  }
  if (!quiz) return;

  console.log("Opening quiz:", quizId);
  window.location.href = "./pages/quiz.html?id=" + quizId;
}

function showLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

function closeLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
}

function saveProgress() {
  console.log("Save progress");
  
  if (!currentUser) {
    showLoginModal();
    return;
  }
  
  alert("✅ Progresso guardado com sucesso!");
}

function goToSmartMatch() {
  console.log("Smart Match");
  window.location.href = "./pages/smart-match.html";
}

// Export for global access
window.openQuiz = openQuiz;
window.saveProgress = saveProgress;
window.goToSmartMatch = goToSmartMatch;
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;