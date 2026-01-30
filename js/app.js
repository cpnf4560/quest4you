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
  },
  {
    id: "cuckold",
    name: "Voyeurismo & Partilha",
    icon: "👀",
    color: "#673ab7",
    description: "Avalia o teu interesse em dinâmicas de observação e partilha consensual",
    questions: 50,
    resultType: "spectrum"
  },
  {
    id: "swing",
    name: "Swing/Poliamor",
    icon: "💑",
    color: "#00bcd4",
    description: "Explora o teu interesse em relações não-monogâmicas e experiências com múltiplas pessoas",
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
  },
  {
    id: "bdsm",
    name: "BDSM & Dinâmicas de Poder",
    icon: "🎭",
    color: "#7B1FA2",
    description: "Descobre o teu papel no espectro Dominante/Submisso e o teu interesse em dinâmicas de poder",
    questions: 50,
    resultType: "spectrum"
  },
  {
    id: "adventure",
    name: "Aventura Sexual",
    icon: "🎲",
    color: "#FF5722",
    description: "Descobre quão aberto/a estás a experimentar coisas novas e sair da zona de conforto",
    questions: 50,
    resultType: "spectrum"
  },
  {
    id: "fantasies",
    name: "Fantasias Secretas",
    icon: "🔮",
    color: "#E91E63",
    description: "Explora as tuas fantasias mais íntimas e descobre quão alinhadas estão com outras pessoas",
    questions: 50,
    resultType: "spectrum"
  },
  {
    id: "exhibitionism",
    name: "Exibicionismo & Admiração",
    icon: "📸",
    color: "#FFC107",
    description: "O prazer de mostrar, ser admirado/a e apreciar a beleza de outras pessoas",
    questions: 50,
    resultType: "spectrum"
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

  // Hide "Criar Conta" CTA and show welcome message
  const heroCta = document.getElementById("heroCta");
  if (heroCta) {
    heroCta.style.display = "none";
  }
  
  const heroWelcome = document.getElementById("heroWelcome");
  if (heroWelcome) {
    heroWelcome.style.display = "block";
    const userName = document.getElementById("heroUserName");
    if (userName) {
      userName.textContent = user.displayName || user.email?.split("@")[0] || "Utilizador";
    }
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

  // Show "Criar Conta" CTA and hide welcome message
  const heroCta = document.getElementById("heroCta");
  if (heroCta) {
    heroCta.style.display = "block";
  }
  
  const heroWelcome = document.getElementById("heroWelcome");
  if (heroWelcome) {
    heroWelcome.style.display = "none";
  }

  // Hide progress section
  const progressSection = document.getElementById("progressSection");
  if (progressSection) {
    progressSection.style.display = "none";
  }
}

async function loadUserProgress() {
  if (!currentUser) return;
  
  // Valid quiz IDs
  const validQuizIds = ['vanilla', 'orientation', 'cuckold', 'swing', 'kinks', 'bdsm', 'adventure', 'fantasies', 'exhibitionism'];
  
  // First, load from localStorage as fallback
  const localResults = JSON.parse(localStorage.getItem('q4y_results') || '{}');
  
  // Convert local results to progress format
  for (const [quizId, result] of Object.entries(localResults)) {
    // Skip invalid keys (like Firebase UIDs saved incorrectly)
    if (!validQuizIds.includes(quizId)) {
      if (quizId.length > 15 && /^[a-zA-Z0-9]+$/.test(quizId)) {
        console.warn("Ignoring invalid quiz ID in localStorage:", quizId);
        continue;
      }
    }
    
    if (result && result.score !== undefined) {
      // Quiz was completed locally
      const quizConfig = QUIZZES_CONFIG.find(q => q.id === quizId);
      if (quizConfig) {
        userProgress[quizId] = quizConfig.questions; // Mark as completed
        userResults[quizId] = result;
      }
    }
  }
    // Then try to load from Firestore
  if (typeof db !== "undefined") {
    try {
      const doc = await db.collection("quest4you_users").doc(currentUser.uid).get();
      if (doc.exists) {
        const data = doc.data();
        
        // Filter cloud results to remove invalid keys
        const cloudResults = data.quizResults || data.results || {};
        const filteredCloudResults = {};
        for (const [key, value] of Object.entries(cloudResults)) {
          // Skip keys that look like Firebase UIDs
          if (key.length > 15 && /^[a-zA-Z0-9]+$/.test(key) && !validQuizIds.includes(key)) {
            console.warn("Ignoring invalid quiz ID from cloud:", key);
            continue;
          }
          filteredCloudResults[key] = value;
        }
        
        // Merge cloud progress with local (cloud takes priority)
        userProgress = { ...userProgress, ...(data.progress || {}) };
        userResults = { ...userResults, ...filteredCloudResults };
      }
    } catch (error) {
      console.error("Error loading progress from cloud:", error);
    }
  }
  
  console.log("📊 User progress loaded:", Object.keys(userProgress).length, "quizzes");
  renderProgress();
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
    html += '    </div>';    html += '    <div class="progress-action">';
    if (completed) {
      html += '      <button class="btn btn-primary" onclick="viewResults(\'' + quiz.id + '\')">👁️ Ver Resultados</button>';
    } else {
      html += '      <button class="btn btn-primary" onclick="openQuiz(\'' + quiz.id + '\')">' + actionText + '</button>';
    }
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

// ================================
// VIEW RESULTS
// ================================
let currentViewingQuizId = null;

function viewResults(quizId) {
  currentViewingQuizId = quizId;
  
  // Get quiz config
  const quiz = QUIZZES_CONFIG.find(q => q.id === quizId);
  if (!quiz) {
    console.error("Quiz not found:", quizId);
    return;
  }
  
  // Get saved results
  const savedResults = JSON.parse(localStorage.getItem('q4y_results') || '{}');
  const result = savedResults[quizId];
  
  if (!result) {
    alert("Não foram encontrados resultados para este questionário.");
    return;
  }
  
  // Update modal content
  const modal = document.getElementById("resultModal");
  
  // Header
  document.getElementById("resultEmoji").textContent = quiz.icon;
  document.getElementById("resultHeader").style.background = 
    'linear-gradient(135deg, ' + quiz.color + ' 0%, ' + adjustColor(quiz.color, -20) + ' 100%)';
  
  // Score
  document.getElementById("resultScore").textContent = result.score || 0;
  
  // Category
  if (result.category) {
    document.getElementById("resultCategoryEmoji").textContent = quiz.icon;
    document.getElementById("resultCategoryLabel").textContent = result.category;
  } else {
    document.getElementById("resultCategoryEmoji").textContent = "🎯";
    document.getElementById("resultCategoryLabel").textContent = result.score + "% de Intensidade";
  }
  
  // Description (generate based on score)
  const description = generateResultDescription(quiz.name, result.score);
  document.getElementById("resultDescription").textContent = description;
  
  // Breakdown
  const breakdownHtml = buildResultBreakdown(result.categoryScores || {});
  document.getElementById("resultBreakdown").innerHTML = breakdownHtml;
  
  // Show modal
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function generateResultDescription(quizName, score) {
  if (score >= 80) {
    return "Tens um nível muito elevado nesta área! Os teus resultados mostram um grande interesse e abertura.";
  } else if (score >= 60) {
    return "Tens uma curiosidade saudável e estás aberto/a a explorar esta área com moderação.";
  } else if (score >= 40) {
    return "Tens um interesse moderado nesta área. Podes explorar mais ao teu ritmo.";
  } else if (score >= 20) {
    return "Esta área não é particularmente do teu interesse, mas manténs a mente aberta.";
  } else {
    return "Esta área não parece ser do teu interesse no momento. E está tudo bem assim!";
  }
}

function buildResultBreakdown(categoryScores) {
  const entries = Object.entries(categoryScores);
  if (entries.length === 0) return "<p style='text-align: center; color: #888;'>Sem dados de categorias disponíveis.</p>";
  
  // Sort by score descending
  entries.sort((a, b) => b[1] - a[1]);
  const top5 = entries.slice(0, 5);
  
  let html = '<p style="font-weight: 600; margin-bottom: 0.75rem; color: #333;">Top Categorias:</p>';
  
  top5.forEach(([category, score]) => {
    const label = formatCategoryLabel(category);
    html += '<div class="result-breakdown-item">';
    html += '  <span class="result-breakdown-label">' + label + '</span>';
    html += '  <div class="result-breakdown-bar"><div class="result-breakdown-fill" style="width: ' + score + '%"></div></div>';
    html += '  <span class="result-breakdown-value">' + score + '%</span>';
    html += '</div>';
  });
  
  return html;
}

function formatCategoryLabel(category) {
  return category.split("_").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
}

function adjustColor(color, amount) {
  // Simple color adjustment
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function closeResultModal() {
  const modal = document.getElementById("resultModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
}

function shareResultFromHome() {
  if (!currentViewingQuizId) return;
  
  const quiz = QUIZZES_CONFIG.find(q => q.id === currentViewingQuizId);
  const savedResults = JSON.parse(localStorage.getItem('q4y_results') || '{}');
  const result = savedResults[currentViewingQuizId];
  
  if (!quiz || !result) return;
  
  const text = 'Fiz o questionário "' + quiz.name + '" no Quest4You!\n\nO meu resultado: ' + (result.category || result.score + '%') + '\n\nDescobre o teu também em quest4you.com';
  
  if (navigator.share) {
    navigator.share({
      title: 'Quest4You - ' + quiz.name,
      text: text,
      url: window.location.origin
    });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert("Resultado copiado para a área de transferência!");
    });
  }
}

function retakeQuizFromHome() {
  if (!currentViewingQuizId) return;
  
  if (confirm("Tens a certeza que queres refazer o questionário? As tuas respostas serão apagadas.")) {
    // Clear saved data
    localStorage.removeItem('q4y_quiz_' + currentViewingQuizId);
    
    // Remove from results
    const savedResults = JSON.parse(localStorage.getItem('q4y_results') || '{}');
    delete savedResults[currentViewingQuizId];
    localStorage.setItem('q4y_results', JSON.stringify(savedResults));
    
    // Close modal and go to quiz
    closeResultModal();
    window.location.href = './pages/quiz.html?id=' + currentViewingQuizId;
  }
}

// Export for global access
window.openQuiz = openQuiz;
window.saveProgress = saveProgress;
window.goToSmartMatch = goToSmartMatch;
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.viewResults = viewResults;
window.closeResultModal = closeResultModal;
window.shareResultFromHome = shareResultFromHome;
window.retakeQuizFromHome = retakeQuizFromHome;