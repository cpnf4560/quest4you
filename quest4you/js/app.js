/**
 * Quest4You - Main Application
 * Questionarios individuais com resultados imediatos
 */

// ================================
// CONFIGURATION
// ================================
const QUIZZES_CONFIG = [
  {
    id: "vanilla",
    name: "Vanilla ou Kink",
    icon: "heart",
    color: "#e91e63",
    description: "Descobre onde te posicionas no espectro entre romance suave e práticas mais intensas",
    questions: 50,
    resultType: "spectrum"
  },
  {
    id: "orientation",
    name: "Orientação Sexual",
    icon: "rainbow",
    color: "#9c27b0",
    description: "Explora as tuas atrações e curiosidades sobre diferentes géneros e identidades",
    questions: 50,
    resultType: "spectrum"
  },
  {
    id: "cuckold",
    name: "Stag/Cuckold",
    icon: "eyes",
    color: "#673ab7",
    description: "Avalia o teu interesse em dinâmicas de voyeurismo e humilhação consensual",
    questions: 50,
    resultType: "spectrum"
  },
  {
    id: "swing",
    name: "Swing/Poliamor",
    icon: "hearts",
    color: "#00bcd4",
    description: "Explora o teu interesse em relações não-monogâmicas e experiências com múltiplos parceiros",
    questions: 50,
    resultType: "category"
  },
  {
    id: "kinks",
    name: "Fetiches e Kinks",
    icon: "fire",
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
  }
  
  // Load saved name
  const savedName = localStorage.getItem("q4y_userName");
  if (savedName && document.getElementById("userName")) {
    document.getElementById("userName").value = savedName;
  }
  
  // Save name on change
  var nameInput = document.getElementById("userName");
  if (nameInput) {
    nameInput.addEventListener("change", function(e) {
      localStorage.setItem("q4y_userName", e.target.value);
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
    var authLink = document.getElementById("authLink");
    if (authLink) {
      authLink.textContent = user.displayName || "Meu Perfil";
      authLink.href = "/quest4you/pages/profile.html";
    }

    loadUserProgress();

    var progressSection = document.getElementById("progressSection");
    if (progressSection) {
      progressSection.style.display = "block";
    }
  } else {
    console.log("User not logged in");
    var authLink = document.getElementById("authLink");
    if (authLink) {
      authLink.textContent = "Entrar";
      authLink.href = "/quest4you/pages/auth.html";
    }
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

  const icons = {
    heart: "💕",
    rainbow: "🌈",
    eyes: "👀",
    hearts: "💜",
    fire: "🔥"
  };

  let html = "";
  
  for (let i = 0; i < QUIZZES_CONFIG.length; i++) {
    const quiz = QUIZZES_CONFIG[i];
    const icon = icons[quiz.icon] || "";
    
    html += '<div class="quiz-card" data-quiz="' + quiz.id + '" onclick="openQuiz(\'' + quiz.id + '\')">';
    html += '  <div class="quiz-card-header" style="background: ' + quiz.color + '">';
    html += '    <div class="quiz-card-icon">' + icon + '</div>';
    html += '    <h3 class="quiz-card-title">' + quiz.name + '</h3>';
    html += '  </div>';
    html += '  <div class="quiz-card-body">';
    html += '    <p class="quiz-card-description">' + quiz.description + '</p>';
    html += '    <div class="quiz-card-footer">';
    html += '      <span class="quiz-meta">📝 ' + quiz.questions + ' perguntas</span>';
    html += '      <span class="quiz-badge free">✨ Grátis</span>';
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
    
    html += '<div class="progress-card ' + (completed ? "completed" : "") + '">';
    html += '  <div class="progress-header" style="background: ' + quiz.color + '">';
    html += '    <span class="progress-title">' + quiz.name + '</span>';
    html += '  </div>';
    html += '  <div class="progress-body">';
    html += '    <div class="progress-bar-container">';
    html += '      <div class="progress-bar" style="width: ' + percent + '%"></div>';
    html += '    </div>';
    html += '    <span class="progress-text">' + progress + '/' + quiz.questions + '</span>';
    html += '  </div>';
    html += '</div>';
  }
  
  grid.innerHTML = html;
}

// ================================
// ACTIONS
// ================================
function openQuiz(quizId) {
  var quiz = null;
  for (var i = 0; i < QUIZZES_CONFIG.length; i++) {
    if (QUIZZES_CONFIG[i].id === quizId) {
      quiz = QUIZZES_CONFIG[i];
      break;
    }
  }
  if (!quiz) return;

  console.log("Opening quiz:", quizId);
  window.location.href = "/quest4you/pages/quiz.html?id=" + quizId;
}

function saveProgress() {
  console.log("Save progress");
  
  if (!currentUser) {
    alert("Faz login para guardar o teu progresso!");
    window.location.href = "/quest4you/pages/auth.html";
    return;
  }
  
  alert("Progresso guardado!");
}

function goToSmartMatch() {
  console.log("Smart Match");
  window.location.href = "/quest4you/pages/smart-match.html";
}

// Export for global access
window.openQuiz = openQuiz;
window.saveProgress = saveProgress;
window.goToSmartMatch = goToSmartMatch;