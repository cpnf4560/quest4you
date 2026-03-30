/**
 * Quest4You - Main Application
 * Questionários individuais com resultados imediatos
 * Login obrigatório para responder
 */

// ================================
// CONFIGURATION
// ================================
const QUIZZES_CONFIG = [
  // GROUP 1: Core Discovery
  {
    id: "vanilla",
    nameKey: "quizNames.vanilla",
    icon: "🔥",
    color: "#e91e63",
    descKey: "quizDescriptions.vanilla",
    questions: 15,
    resultType: "spectrum",
    group: "quizGroups.discovery"
  },
  {
    id: "orientation",
    nameKey: "quizNames.orientation",
    icon: "🌈",
    color: "#9c27b0",
    descKey: "quizDescriptions.orientation",
    questions: 15,
    resultType: "spectrum",
    group: "quizGroups.discovery"
  },
  {
    id: "kinks",
    nameKey: "quizNames.kinks",
    icon: "🎭",
    color: "#9c27b0",
    descKey: "quizDescriptions.kinks",
    questions: 50,
    resultType: "tags",
    group: "quizGroups.discovery"
  },
  // GROUP 2: Power & Dynamics
  {
    id: "bdsm",
    nameKey: "quizNames.bdsm",
    icon: "⛓️",
    color: "#4a148c",
    descKey: "quizDescriptions.bdsm",
    questions: 15,
    resultType: "spectrum",
    group: "quizGroups.dynamics"
  },
  {
    id: "cuckold",
    nameKey: "quizNames.cuckold",
    icon: "👁️",
    color: "#673ab7",
    descKey: "quizDescriptions.cuckold",
    questions: 15,
    resultType: "spectrum",
    group: "quizGroups.dynamics"
  },
  {
    id: "swing",
    nameKey: "quizNames.swing",
    icon: "💑",
    color: "#00bcd4",
    descKey: "quizDescriptions.swing",
    questions: 15,
    resultType: "spectrum",
    group: "quizGroups.dynamics"
  },
  // GROUP 3: Fantasy & Expression
  {
    id: "fantasies",
    nameKey: "quizNames.fantasies",
    icon: "🌙",
    color: "#7b1fa2",
    descKey: "quizDescriptions.fantasies",
    questions: 15,
    resultType: "spectrum",
    group: "quizGroups.fantasy"
  },
  {
    id: "exhibitionism",
    nameKey: "quizNames.exhibitionism",
    icon: "👁️",
    color: "#ff9800",
    descKey: "quizDescriptions.exhibitionism",
    questions: 15,
    resultType: "spectrum",
    group: "quizGroups.fantasy"
  },
  {
    id: "adventure",
    nameKey: "quizNames.adventure",
    icon: "🚀",
    color: "#ff5722",
    descKey: "quizDescriptions.adventure",
    questions: 15,
    resultType: "spectrum",
    group: "quizGroups.fantasy"
  },
  // GROUP 4: Relationship & Communication
  {
    id: "communication",
    nameKey: "quizNames.communication",
    icon: "🗣️",
    color: "#2196f3",
    descKey: "quizDescriptions.communication",
    questions: 15,
    resultType: "spectrum",
    group: "quizGroups.relationship"
  },
  {
    id: "intimacy",
    nameKey: "quizNames.intimacy",
    icon: "💖",
    color: "#e91e63",
    descKey: "quizDescriptions.intimacy",
    questions: 15,
    resultType: "spectrum",
    group: "quizGroups.relationship"
  },
  {
    id: "rhythm",
    nameKey: "quizNames.rhythm",
    icon: "⏱️",
    color: "#009688",
    descKey: "quizDescriptions.rhythm",
    questions: 15,
    resultType: "spectrum",
    group: "quizGroups.relationship"
  },
  // GROUP 5: Lifestyle & Values
  {
    id: "lifestyle",
    nameKey: "quizNames.lifestyle",
    icon: "🌍",
    color: "#4caf50",
    descKey: "quizDescriptions.lifestyle",
    questions: 15,
    resultType: "spectrum",
    group: "quizGroups.lifestyle"
  },
  {
    id: "digital",
    nameKey: "quizNames.digital",
    icon: "📱",
    color: "#607d8b",
    descKey: "quizDescriptions.digital",
    questions: 15,
    resultType: "spectrum",
    group: "quizGroups.lifestyle"
  }
];

// Helper: get translated quiz name/description
function getQuizName(quiz) {
  return (typeof t === 'function' && quiz.nameKey) ? t(quiz.nameKey) : (quiz.name || quiz.id);
}
function getQuizDesc(quiz) {
  return (typeof t === 'function' && quiz.descKey) ? t(quiz.descKey) : (quiz.description || '');
}

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

  // Re-render when language changes
  window.addEventListener('languageChanged', function() {
    renderQuizzes();
    renderProgress();
    // Re-apply dynamic text for auth state
    if (currentUser) {
      updateUIForUser(currentUser);
    } else {
      updateUIForGuest();
    }
  });
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
    authLink.textContent = "👤 " + (user.displayName || t('nav.profile'));
    authLink.href = "./pages/profile.html";
    authLink.classList.remove("btn-nav-login");
  }

  // Show chat link for authenticated users
  const chatLinks = document.querySelectorAll(".nav-link-auth");
  chatLinks.forEach(link => {
    link.style.display = "inline-flex";
  });

  // Initialize notifications
  if (typeof initNotifications === "function") {
    initNotifications(user.uid);
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
      userName.textContent = user.displayName || user.email?.split("@")[0] || t('hero.welcomeUser');
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
    authLink.textContent = t('nav.login');
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
  const validQuizIds = ['vanilla', 'orientation', 'kinks', 'bdsm', 'cuckold', 'swing', 'fantasies', 'exhibitionism', 'adventure', 'communication', 'intimacy', 'rhythm', 'lifestyle', 'digital'];
  
  // Load from cloud via CloudSync
  if (window.CloudSync) {
    try {
      const cloudResults = await window.CloudSync.getQuizResults(currentUser.uid);
      
      // Filter and process cloud results
      for (const [quizId, result] of Object.entries(cloudResults)) {
        // Skip invalid keys (like Firebase UIDs saved incorrectly)
        if (!validQuizIds.includes(quizId)) {
          if (quizId.length > 15 && /^[a-zA-Z0-9]+$/.test(quizId)) {
            console.warn("Ignoring invalid quiz ID from cloud:", quizId);
            continue;
          }
        }
        
        if (result && result.score !== undefined) {
          const quizConfig = QUIZZES_CONFIG.find(q => q.id === quizId);
          if (quizConfig) {
            userProgress[quizId] = quizConfig.questions; // Mark as completed
            userResults[quizId] = result;
          }
        }
      }
        console.log("📊 User results loaded from cloud:", Object.keys(userResults).length, "quizzes");
    } catch (error) {
      console.error("Error loading results from cloud:", error);
    }
  }
  
  // Re-render quizzes grid with loaded results
  renderQuizzes();
  renderProgress();
}

// ================================
// RENDER
// ================================
function renderQuizzes() {
  const grid = document.getElementById("quizzesGrid");
  if (!grid) return;

  let html = "";
  let currentGroup = "";
  
  for (let i = 0; i < QUIZZES_CONFIG.length; i++) {
    const quiz = QUIZZES_CONFIG[i];
    const result = userResults[quiz.id];
    const isCompleted = result && result.score !== undefined;
    const score = isCompleted ? result.score : 0;

    // Render group header when group changes
    if (quiz.group && quiz.group !== currentGroup) {
      currentGroup = quiz.group;
      html += '<div class="quiz-group-title">' + t(quiz.group) + '</div>';
    }
    
    html += '<div class="quiz-card ' + (isCompleted ? 'completed' : '') + '" data-quiz="' + quiz.id + '">';
    html += '  <div class="quiz-card-header" style="background: ' + quiz.color + '">';
    if (isCompleted) {
      html += '    <div class="quiz-completed-badge">✓</div>';
    }
    html += '    <div class="quiz-card-icon">' + quiz.icon + '</div>';
    html += '    <h3 class="quiz-card-title">' + getQuizName(quiz) + '</h3>';
    html += '  </div>';
    html += '  <div class="quiz-card-body">';
    html += '    <p class="quiz-card-description">' + getQuizDesc(quiz) + '</p>';
      // Show progress bar and score if completed
    if (isCompleted) {
      html += '    <div class="quiz-card-progress">';
      html += '      <div class="quiz-progress-bar">';
      html += '        <div class="quiz-progress-fill" style="width: ' + score + '%; background: ' + quiz.color + '"></div>';
      html += '      </div>';
      html += '      <span class="quiz-progress-score">' + score + '/100</span>';
      html += '    </div>';
      html += '    <div class="quiz-card-actions">';
      html += '      <button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); viewResults(\'' + quiz.id + '\')">' + t('quizzes.viewResults') + '</button>';
      html += '    </div>';
      html += '    <div class="quiz-card-actions">';
      html += '      <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); editQuizAnswers(\'' + quiz.id + '\')">' + t('quizzes.edit') + '</button>';
      html += '      <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); openQuiz(\'' + quiz.id + '\')">' + t('quizzes.redo') + '</button>';
      html += '    </div>';
    } else {
      html += '    <div class="quiz-card-footer">';
      html += '      <span class="quiz-meta">📝 ' + quiz.questions + ' ' + t('quizzes.questions') + '</span>';
      html += '      <span class="quiz-badge free">' + t('quizzes.free') + '</span>';
      html += '    </div>';
      html += '    <button class="btn btn-primary btn-full quiz-start-btn" onclick="event.stopPropagation(); openQuiz(\'' + quiz.id + '\')">' + t('quizzes.start') + '</button>';
    }
    
    html += '  </div>';
    html += '</div>';
  }
  
  grid.innerHTML = html;
}

// Open quiz in edit mode (keep previous answers)
function editQuizAnswers(quizId) {
  window.location.href = './pages/quiz.html?id=' + quizId + '&mode=edit';
}

async function renderProgress() {
  // Calculate statistics
  const totalQuizzes = QUIZZES_CONFIG.length;
  const completedQuizzes = Object.keys(userResults).length;
  const totalQuestions = QUIZZES_CONFIG.reduce((sum, q) => sum + q.questions, 0);
  const questionsAnswered = Object.keys(userResults).reduce((sum, quizId) => {
    const config = QUIZZES_CONFIG.find(q => q.id === quizId);
    return sum + (config ? config.questions : 0);
  }, 0);
  const progressPercent = Math.round((completedQuizzes / totalQuizzes) * 100);
  
  // Update stats cards
  const statQuizzesCompleted = document.getElementById("statQuizzesCompleted");
  const statQuizzesDetail = document.getElementById("statQuizzesDetail");
  const statQuestionsAnswered = document.getElementById("statQuestionsAnswered");
  const statQuestionsDetail = document.getElementById("statQuestionsDetail");
  const statFriends = document.getElementById("statFriends");
  const statMatches = document.getElementById("statMatches");
  const statsProgressPercent = document.getElementById("statsProgressPercent");
  const statsProgressFill = document.getElementById("statsProgressFill");
  
  if (statQuizzesCompleted) statQuizzesCompleted.textContent = completedQuizzes;
  if (statQuizzesDetail) statQuizzesDetail.textContent = t('stats.ofAvailable', { count: totalQuizzes });
  if (statQuestionsAnswered) statQuestionsAnswered.textContent = questionsAnswered;
  if (statQuestionsDetail) statQuestionsDetail.textContent = t('stats.ofTotal', { count: totalQuestions });
  if (statsProgressPercent) statsProgressPercent.textContent = progressPercent + "%";
  if (statsProgressFill) statsProgressFill.style.width = progressPercent + "%";
  
  // Load friends and matches count from Firestore
  if (currentUser && typeof db !== "undefined") {
    try {
      // Get friends count
      const friendsDoc = await db.collection("quest4you_friends").doc(currentUser.uid).get();
      if (friendsDoc.exists && friendsDoc.data().friends) {
        const friendsCount = friendsDoc.data().friends.length;
        if (statFriends) statFriends.textContent = friendsCount;
      }
      
      // Get matches count (users with compatibility > 70%)
      const userDoc = await db.collection("quest4you_users_public").doc(currentUser.uid).get();
      if (userDoc.exists) {
        // For now, show 0 - could add a real query later
        if (statMatches) statMatches.textContent = "0";
      }
    } catch (error) {
      console.warn("Could not load friends/matches count:", error);
    }
  }
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
  
  alert(t('app.progressSaved'));
}

function goToSmartMatch() {
  console.log("Smart Match");
  window.location.href = "./pages/smart-match.html";
}

// ================================
// VIEW RESULTS
// ================================
let currentViewingQuizId = null;

async function viewResults(quizId) {
  currentViewingQuizId = quizId;
  
  // Get quiz config
  const quiz = QUIZZES_CONFIG.find(q => q.id === quizId);
  if (!quiz) {
    console.error("Quiz not found:", quizId);
    return;
  }
  
  // Get saved results from cloud
  let result = userResults[quizId];
  
  if (!result && currentUser && window.CloudSync) {
    result = await window.CloudSync.getQuizResult(currentUser.uid, quizId);
  }
  
  if (!result) {
    alert(t('app.noResultsFound'));
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
    document.getElementById("resultCategoryEmoji").textContent = result.categoryEmoji || quiz.icon;
    document.getElementById("resultCategoryLabel").textContent = result.category;
  } else {
    document.getElementById("resultCategoryEmoji").textContent = "🎯";
    document.getElementById("resultCategoryLabel").textContent = result.score + "% de Intensidade";
  }
  
  // Description (use saved or generate based on score)
  const description = result.categoryDescription || generateResultDescription(quiz.name, result.score);
  document.getElementById("resultDescription").textContent = description;
  
  // Breakdown
  const breakdownHtml = buildResultBreakdown(result.categoryScores || {}, result);
  document.getElementById("resultBreakdown").innerHTML = breakdownHtml;
  
  // Show modal
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function generateResultDescription(quizName, score) {
  if (score >= 80) {
    return t('resultDesc.veryHigh') !== 'resultDesc.veryHigh' ? t('resultDesc.veryHigh') : "Tens um nível muito elevado nesta área! Os teus resultados mostram um grande interesse e abertura.";
  } else if (score >= 60) {
    return t('resultDesc.high') !== 'resultDesc.high' ? t('resultDesc.high') : "Tens uma curiosidade saudável e estás aberto/a a explorar esta área com moderação.";
  } else if (score >= 40) {
    return t('resultDesc.medium') !== 'resultDesc.medium' ? t('resultDesc.medium') : "Tens um interesse moderado nesta área. Podes explorar mais ao teu ritmo.";
  } else if (score >= 20) {
    return t('resultDesc.low') !== 'resultDesc.low' ? t('resultDesc.low') : "Esta área não é particularmente do teu interesse, mas manténs a mente aberta.";
  } else {
    return t('resultDesc.veryLow') !== 'resultDesc.veryLow' ? t('resultDesc.veryLow') : "Esta área não parece ser do teu interesse no momento. E está tudo bem assim!";
  }
}

function buildResultBreakdown(categoryScores, result) {
  // Check if this is a role-based result
  if (result && result.dominantRole && result.rolePercentages) {
    return buildRoleBreakdown(result);
  }
  
  const entries = Object.entries(categoryScores);  if (entries.length === 0) return "<p style='text-align: center;' class='text-muted'>Sem dados de categorias disponíveis.</p>";
  
  // Sort by score descending
  entries.sort((a, b) => b[1] - a[1]);
  const top5 = entries.slice(0, 5);
  
  let html = '<p class="result-breakdown-heading">Top Categorias:</p>';
  
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

function buildRoleBreakdown(result) {
  const rolePercentages = result.rolePercentages || {};
  const sortedRoles = Object.entries(rolePercentages).sort((a, b) => b[1] - a[1]);
  
  let html = '<p class="result-breakdown-heading">' + t('profile.resultsTitle') + ':</p>';
  
  sortedRoles.forEach(([roleId, percentage]) => {
    const label = formatCategoryLabel(roleId);
    html += '<div class="result-breakdown-item">';
    html += '<span class="result-breakdown-label">' + label + '</span>';
    html += '<div class="result-breakdown-bar"><div class="result-breakdown-fill" style="width: ' + percentage + '%"></div></div>';
    html += '<span class="result-breakdown-value">' + percentage + '%</span>';
    html += '</div>';
  });
  
  // Show compatible roles
  if (result.matchWith && result.matchWith.length > 0) {    html += '<div class="result-match-section">';
    html += '<p class="result-breakdown-heading">💕 Compatível com:</p>';
    result.matchWith.forEach(matchRole => {
      html += '<span class="result-match-tag">' + formatCategoryLabel(matchRole) + '</span>';
    });
    html += '</div>';
  }
  
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
  const result = userResults[currentViewingQuizId];
  
  if (!quiz || !result) return;
  
  const quizName = getQuizName(quiz);
  const text = t('quiz.shareText') !== 'quiz.shareText'
    ? t('quiz.shareText', { name: quizName, result: (result.category || result.score + '/100') })
    : 'Fiz o questionário "' + quizName + '" no Quest4You!\n\nO meu resultado: ' + (result.category || result.score + '/100') + '\n\nDescobre o teu também em quest4you.pt';
  
  if (navigator.share) {
    navigator.share({
      title: 'Quest4You - ' + quizName,
      text: text,
      url: window.location.origin
    });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert(t('common.success') + '!');
    });
  }
}

async function retakeQuizFromHome() {
  if (!currentViewingQuizId) return;
  
  if (confirm(t('quiz.retakeConfirm') !== 'quiz.retakeConfirm' ? t('quiz.retakeConfirm') : "Tens a certeza que queres refazer o questionário? As tuas respostas serão apagadas.")) {
    // Delete from cloud
    if (currentUser && window.CloudSync) {
      try {
        await window.CloudSync.deleteQuizResult(currentUser.uid, currentViewingQuizId);
        await window.CloudSync.clearQuizProgress(currentUser.uid, currentViewingQuizId);
        console.log("Result deleted from cloud");
      } catch (error) {
        console.error("Error deleting from cloud:", error);
      }
    }
    
    // Close modal and go to quiz
    closeResultModal();
    window.location.href = './pages/quiz.html?id=' + currentViewingQuizId;
  }
}

// Export for global access
window.QUIZZES_CONFIG = QUIZZES_CONFIG;
window.openQuiz = openQuiz;
window.saveProgress = saveProgress;
window.goToSmartMatch = goToSmartMatch;
window.showLoginModal = showLoginModal;
window.closeLoginModal = closeLoginModal;
window.viewResults = viewResults;
window.closeResultModal = closeResultModal;
window.shareResultFromHome = shareResultFromHome;
window.retakeQuizFromHome = retakeQuizFromHome;
