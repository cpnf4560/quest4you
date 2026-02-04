/**
 * Quest4You - Profile Page Logic
 * Gestão de perfil do utilizador
 */

// ================================
// STATE
// ================================
let currentUser = null;
let userData = null;

// ================================
// INITIALIZATION
// ================================
document.addEventListener("DOMContentLoaded", function() {
  // Check auth state
  if (typeof auth !== "undefined") {
    auth.onAuthStateChanged(handleAuthChange);
  } else {
    console.error("Firebase Auth not available");
    window.location.href = "auth.html";
  }

  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // Settings toggles
  document.getElementById("settingNotifications").addEventListener("change", saveSettings);
  document.getElementById("settingPublicProfile").addEventListener("change", saveSettings);
  document.getElementById("settingSmartMatch").addEventListener("change", saveSettings);
});

// ================================
// AUTH
// ================================
function handleAuthChange(user) {
  if (user) {
    currentUser = user;
    console.log("User logged in:", user.email);
    loadUserProfile();
  } else {
    console.log("User not logged in, redirecting...");
    window.location.href = "auth.html?redirect=" + encodeURIComponent(window.location.href);
  }
}

async function logout() {
  try {
    await auth.signOut();
    window.location.href = "../index.html";
  } catch (error) {
    console.error("Logout error:", error);
    alert("Erro ao terminar sessão. Tenta novamente.");
  }
}

// ================================
// LOAD PROFILE
// ================================
async function loadUserProfile() {
  // Update basic info from Firebase Auth
  updateProfileHeader();

  // Load full profile from Firestore
  if (typeof db !== "undefined") {
    try {
      const doc = await db.collection("quest4you_users").doc(currentUser.uid).get();
      
      if (doc.exists) {
        userData = doc.data();
        updateProfileFromFirestore();
        loadResults();
        loadBadges();
        updateStats();
        loadAllPhotos();
      } else {
        // Create profile if doesn't exist
        await createUserProfile();
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  // Also load local results
  loadLocalResults();
}

function updateProfileHeader() {
  // Name
  document.getElementById("profileName").textContent = currentUser.displayName || "Utilizador";
  
  // Email
  document.getElementById("profileEmail").textContent = currentUser.email;
  
  // Avatar
  const avatarImg = document.getElementById("avatarImg");
  const avatarFallback = document.getElementById("avatarFallback");
  
  if (currentUser.photoURL) {
    avatarImg.src = currentUser.photoURL;
    avatarImg.onload = function() {
      avatarImg.classList.add("loaded");
      avatarFallback.style.display = "none";
    };
  } else {
    // Show initials
    const name = currentUser.displayName || currentUser.email || "?";
    avatarFallback.textContent = name.charAt(0).toUpperCase();
  }
  
  // Joined date
  const createdAt = currentUser.metadata?.creationTime;
  if (createdAt) {
    const date = new Date(createdAt);
    document.getElementById("profileJoined").textContent = `Membro desde ${formatDate(date)}`;
  }
}

function updateProfileFromFirestore() {
  if (!userData) return;

  // Update nickname display
  if (userData.nickname) {
    const nicknameDisplay = document.getElementById("profileNickname");
    if (nicknameDisplay) {
      nicknameDisplay.textContent = `${userData.nicknameEmoji || '👤'} ${userData.nickname}`;
    }
    // Also populate the form
    const nicknameInput = document.getElementById("nicknameInput");
    const emojiSelect = document.getElementById("nicknameEmoji");
    if (nicknameInput) nicknameInput.value = userData.nickname;
    if (emojiSelect) emojiSelect.value = userData.nicknameEmoji || '👤';
  } else {
    const nicknameDisplay = document.getElementById("profileNickname");
    if (nicknameDisplay) {
      nicknameDisplay.textContent = "Ainda não definiste um nickname";
      nicknameDisplay.style.color = '#999';
    }
  }

  // Update settings toggles
  if (userData.settings) {
    document.getElementById("settingNotifications").checked = userData.settings.notifications !== false;
    document.getElementById("settingPublicProfile").checked = userData.settings.publicProfile === true;
    document.getElementById("settingSmartMatch").checked = userData.settings.smartMatchEnabled !== false;
  }
}

async function createUserProfile() {
  try {
    await db.collection("quest4you_users").doc(currentUser.uid).set({
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || "Utilizador",
      photoURL: currentUser.photoURL || null,
      nickname: null,
      nicknameEmoji: '👤',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      quizResults: {},
      progress: {},
      settings: {
        notifications: true,
        publicProfile: false,
        smartMatchEnabled: true
      }
    });
    console.log("Profile created");
  } catch (error) {
    console.error("Error creating profile:", error);
  }
}

// ================================
// NICKNAME
// ================================
async function saveNickname() {
  if (!currentUser || !db) {
    alert("Erro: Não estás autenticado.");
    return;
  }
  
  const nicknameInput = document.getElementById("nicknameInput");
  const emojiSelect = document.getElementById("nicknameEmoji");
  
  const nickname = nicknameInput.value.trim();
  const emoji = emojiSelect.value || '👤';
  
  if (!nickname) {
    alert("Por favor, insere um nickname.");
    return;
  }
  
  if (nickname.length < 3) {
    alert("O nickname deve ter pelo menos 3 caracteres.");
    return;
  }
  
  if (nickname.length > 20) {
    alert("O nickname não pode ter mais de 20 caracteres.");
    return;
  }
  
  // Check for inappropriate characters
  if (!/^[a-zA-Z0-9_\-\u00C0-\u017F ]+$/.test(nickname)) {
    alert("O nickname só pode conter letras, números, espaços, _ e -");
    return;
  }
  
  try {
    await db.collection("quest4you_users").doc(currentUser.uid).update({
      nickname: nickname,
      nicknameEmoji: emoji,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update local data
    if (userData) {
      userData.nickname = nickname;
      userData.nicknameEmoji = emoji;
    }
    
    // Update display
    const nicknameDisplay = document.getElementById("profileNickname");
    if (nicknameDisplay) {
      nicknameDisplay.textContent = `${emoji} ${nickname}`;
      nicknameDisplay.style.color = '#e53935';
    }
    
    alert("✅ Nickname guardado com sucesso!");
    console.log("Nickname saved:", emoji, nickname);
  } catch (error) {
    console.error("Error saving nickname:", error);
    alert("Erro ao guardar nickname. Tenta novamente.");
  }
}

// ================================
// LOAD RESULTS
// ================================
async function loadResults() {
  const grid = document.getElementById("resultsGrid");
  const emptyState = document.getElementById("emptyResults");
  
  // Get results from cloud via CloudSync
  let allResults = {};
  
  if (window.CloudSync) {
    try {
      allResults = await window.CloudSync.getQuizResults(currentUser.uid);
    } catch (error) {
      console.error("Error loading results from cloud:", error);
    }
  }
  
  // Fallback to userData if CloudSync not available
  if (Object.keys(allResults).length === 0) {
    allResults = userData?.quizResults || {};
  }
  
  // Filter out invalid keys (like user IDs that got saved incorrectly)
  const validQuizIds = ['vanilla', 'orientation', 'cuckold', 'swing', 'kinks', 'bdsm', 'adventure', 'fantasies', 'exhibitionism'];
  const resultIds = Object.keys(allResults).filter(key => {
    // Only keep valid quiz IDs
    if (validQuizIds.includes(key)) return true;
    // Filter out keys that look like Firebase UIDs (20+ alphanumeric chars)
    if (key.length > 15 && /^[a-zA-Z0-9]+$/.test(key)) {
      console.warn("Ignoring invalid quiz ID (looks like UID):", key);
      return false;
    }
    return true;
  });
  
  if (resultIds.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  
  emptyState.style.display = "none";
  
  // Quiz metadata
  const quizMeta = {
    vanilla: { name: "Vanilla ou Kink", icon: "🔥", color: "#e91e63" },
    orientation: { name: "Orientação Sexual", icon: "🌈", color: "#9c27b0" },
    cuckold: { name: "Voyeurismo & Partilha", icon: "👀", color: "#673ab7" },
    swing: { name: "Swing/Poliamor", icon: "💑", color: "#00bcd4" },
    kinks: { name: "Fetiches e Kinks", icon: "⛓️", color: "#f44336" },
    bdsm: { name: "BDSM & Dinâmicas de Poder", icon: "🎭", color: "#7B1FA2" },
    adventure: { name: "Aventura Sexual", icon: "🎲", color: "#FF5722" },
    fantasies: { name: "Fantasias Secretas", icon: "🔮", color: "#E91E63" },
    exhibitionism: { name: "Exibicionismo & Admiração", icon: "📸", color: "#FFC107" }
  };
  
  let html = "";
  
  resultIds.forEach(quizId => {
    const result = allResults[quizId];
    const meta = quizMeta[quizId] || { name: quizId, icon: "📝", color: "#666" };
    
    html += `
      <div class="result-card" onclick="viewResult('${quizId}')" style="cursor: pointer;">
        <div class="result-card-header" style="background: ${meta.color}">
          <span class="result-card-icon">${meta.icon}</span>
          <span class="result-card-title">${meta.name}</span>
        </div>
        <div class="result-card-body">
          <div class="result-score">
            <div class="result-score-bar">
              <div class="result-score-fill" style="width: ${result.score || 0}%"></div>
            </div>
            <span class="result-score-value">${result.score || 0}%</span>
          </div>
          ${result.category ? `
            <div class="result-category">
              <span>${result.categoryEmoji || ''} ${result.category}</span>
            </div>
          ` : ""}
          ${result.dominantRole ? `
            <div class="result-category">
              <span>Role: ${result.dominantRole}</span>
            </div>
          ` : ""}
          ${result.date ? `
            <div class="result-date">
              Completado em ${formatDate(new Date(result.date))}
            </div>
          ` : ""}
          <div class="result-card-action">
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); viewResult('${quizId}')">👁️ Ver Detalhes</button>
          </div>
        </div>
      </div>
    `;
  });
  
  grid.innerHTML = html;
    // Store results for later use
  window.profileResults = allResults;
  
  // Show full report button if user has at least 2 quizzes
  const fullReportContainer = document.getElementById("fullReportContainer");
  if (fullReportContainer && resultIds.length >= 2) {
    fullReportContainer.style.display = "block";
  }
}

// loadLocalResults is deprecated - now using cloud only
function loadLocalResults() {
  // Migrar dados locais para cloud se existirem
  if (window.CloudSync && currentUser) {
    const localResults = localStorage.getItem("q4y_results");
    if (localResults) {
      window.CloudSync.migrateFromLocalStorage(currentUser.uid).then(result => {
        if (result.migrated > 0) {
          console.log("Migrated", result.migrated, "results to cloud");
          loadResults(); // Reload results from cloud
        }
      });
    }
  }
}

async function syncResultsToFirestore(localResults) {
  if (!db || !currentUser) return;
  
  try {
    const updates = {};
    
    for (const [quizId, result] of Object.entries(localResults)) {
      updates[`quizResults.${quizId}`] = result;
    }
    
    await db.collection("quest4you_users").doc(currentUser.uid).update(updates);
    console.log("Results synced to Firestore");
  } catch (error) {
    console.error("Error syncing results:", error);
  }
}

// ================================
// BADGES
// ================================
function loadBadges() {
  const grid = document.getElementById("badgesGrid");
  
  // Define available badges
  const badges = [
    { id: "first_quiz", icon: "🎯", name: "Primeiro Quiz", condition: () => getQuizCount() >= 1 },
    { id: "explorer", icon: "🧭", name: "Explorador", condition: () => getQuizCount() >= 3 },
    { id: "completist", icon: "🏆", name: "Completista", condition: () => getQuizCount() >= 5 },
    { id: "quick", icon: "⚡", name: "Rápido", condition: () => false }, // TODO: time-based
    { id: "sharer", icon: "📤", name: "Partilhador", condition: () => false }, // TODO: share tracking
    { id: "matcher", icon: "💕", name: "Matcher", condition: () => false } // TODO: smart match
  ];
  
  let html = "";
  let unlockedCount = 0;
  
  badges.forEach(badge => {
    const unlocked = badge.condition();
    if (unlocked) unlockedCount++;
    
    html += `
      <div class="badge-item ${unlocked ? '' : 'locked'}">
        <span class="badge-icon">${badge.icon}</span>
        <span class="badge-name">${badge.name}</span>
      </div>
    `;
  });
  
  grid.innerHTML = html;
  document.getElementById("statBadges").textContent = unlockedCount;
}

// ================================
// STATS
// ================================
function updateStats() {
  const quizCount = getQuizCount();
  document.getElementById("statQuizzes").textContent = quizCount;
  
  // Questions answered (estimate: 50 per quiz)
  document.getElementById("statQuestions").textContent = quizCount * 50;
  
  // Matches (placeholder)
  document.getElementById("statMatches").textContent = "0";
}

function getQuizCount() {
  // Use cached profile results
  const results = window.profileResults || userData?.quizResults || {};
  
  // Filter valid quiz IDs
  const validQuizIds = ['vanilla', 'orientation', 'cuckold', 'swing', 'kinks', 'bdsm', 'adventure', 'fantasies', 'exhibitionism'];
  const validResults = Object.keys(results).filter(key => validQuizIds.includes(key));
  
  return validResults.length;
}

// ================================
// SETTINGS
// ================================
async function saveSettings() {
  if (!db || !currentUser) return;
  
  const settings = {
    notifications: document.getElementById("settingNotifications").checked,
    publicProfile: document.getElementById("settingPublicProfile").checked,
    smartMatchEnabled: document.getElementById("settingSmartMatch").checked
  };
  
  try {
    await db.collection("quest4you_users").doc(currentUser.uid).update({ settings });
    console.log("Settings saved");
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

// ================================
// EDIT PROFILE
// ================================
function editProfile() {
  document.getElementById("editName").value = currentUser.displayName || "";
  document.getElementById("editPhoto").value = currentUser.photoURL || "";
  document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

async function saveProfile(event) {
  event.preventDefault();
  
  const name = document.getElementById("editName").value.trim();
  const photoURL = document.getElementById("editPhoto").value.trim();
  
  try {
    // Update Firebase Auth profile
    await currentUser.updateProfile({
      displayName: name,
      photoURL: photoURL || null
    });
    
    // Update Firestore
    if (db) {
      await db.collection("quest4you_users").doc(currentUser.uid).update({
        displayName: name,
        photoURL: photoURL || null
      });
    }
    
    // Update UI
    updateProfileHeader();
    closeEditModal();
    
    alert("Perfil atualizado com sucesso!");
    
  } catch (error) {
    console.error("Error saving profile:", error);
    alert("Erro ao guardar. Tenta novamente.");
  }
}

// ================================
// DANGER ZONE
// ================================
async function deleteAllData() {
  if (!confirm("Tens a certeza que queres apagar todos os teus dados? Esta ação não pode ser revertida.")) {
    return;
  }
  
  try {
    // Clear all quiz results from cloud
    if (db && currentUser) {
      await db.collection("quest4you_users").doc(currentUser.uid).update({
        quizResults: {},
        quizProgress: {},
        progress: {}
      });
      
      // Clear CloudSync cache
      if (window.CloudSync) {
        window.CloudSync.clearCache();
      }
    }
    
    // Clear any remaining localStorage data (legacy)
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("q4y_")) {
        localStorage.removeItem(key);
      }
    }
    
    alert("Todos os dados foram apagados.");
    window.location.reload();
    
  } catch (error) {
    console.error("Error deleting data:", error);
    alert("Erro ao apagar dados. Tenta novamente.");
  }
}

async function deleteAccount() {
  if (!confirm("Tens a certeza que queres eliminar a tua conta? Esta ação é PERMANENTE e não pode ser revertida.")) {
    return;
  }
  
  if (!confirm("ÚLTIMA CONFIRMAÇÃO: Ao eliminar a conta, perdes todos os dados. Continuar?")) {
    return;
  }
  
  try {
    // Delete Firestore document
    if (db) {
      await db.collection("quest4you_users").doc(currentUser.uid).delete();
    }
    
    // Clear localStorage
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("q4y_")) {
        localStorage.removeItem(key);
      }
    }
    
    // Delete Firebase Auth account
    await currentUser.delete();
    
    alert("Conta eliminada com sucesso.");
    window.location.href = "../index.html";
    
  } catch (error) {
    console.error("Error deleting account:", error);
    
    if (error.code === "auth/requires-recent-login") {
      alert("Por razões de segurança, precisas de fazer login novamente antes de eliminar a conta.");
      await auth.signOut();
      window.location.href = "auth.html";
    } else {
      alert("Erro ao eliminar conta. Tenta novamente.");
    }
  }
}

// ================================
// UTILITIES
// ================================
function formatDate(date) {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return date.toLocaleDateString("pt-PT", options);
}

// ================================
// VIEW RESULT MODAL
// ================================
let currentViewingQuizId = null;

// Quiz metadata for modal
const QUIZ_META = {
  vanilla: { name: "Vanilla ou Kink", icon: "🔥", color: "#e91e63" },
  orientation: { name: "Orientação Sexual", icon: "🌈", color: "#9c27b0" },
  cuckold: { name: "Voyeurismo & Partilha", icon: "👀", color: "#673ab7" },
  swing: { name: "Swing/Poliamor", icon: "💑", color: "#00bcd4" },
  kinks: { name: "Fetiches e Kinks", icon: "⛓️", color: "#f44336" },
  bdsm: { name: "BDSM & Dinâmicas de Poder", icon: "🎭", color: "#7B1FA2" },
  adventure: { name: "Aventura Sexual", icon: "🎲", color: "#FF5722" },
  fantasies: { name: "Fantasias Secretas", icon: "🔮", color: "#E91E63" },
  exhibitionism: { name: "Exibicionismo & Admiração", icon: "📸", color: "#FFC107" }
};

async function viewResult(quizId) {
  currentViewingQuizId = quizId;
  
  // Get quiz config
  const quiz = QUIZ_META[quizId] || { name: quizId, icon: "📝", color: "#666" };
  
  // Get saved results from cloud
  const allResults = window.profileResults || userData?.quizResults || {};
  let result = allResults[quizId];
  
  // Try to load from cloud if not available
  if (!result && currentUser && window.CloudSync) {
    result = await window.CloudSync.getQuizResult(currentUser.uid, quizId);
  }
  
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
    document.getElementById("resultCategoryEmoji").textContent = result.categoryEmoji || quiz.icon;
    document.getElementById("resultCategoryLabel").textContent = result.category;
  } else if (result.dominantRole) {
    document.getElementById("resultCategoryEmoji").textContent = "🎭";
    document.getElementById("resultCategoryLabel").textContent = "Role: " + result.dominantRole;
  } else {
    document.getElementById("resultCategoryEmoji").textContent = "🎯";
    document.getElementById("resultCategoryLabel").textContent = result.score + "% de Intensidade";
  }
  
  // Description (use saved or generate based on score)
  const description = result.categoryDescription || generateResultDescription(quiz.name, result.score);
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

function shareResult() {
  if (!currentViewingQuizId) return;
  
  const quiz = QUIZ_META[currentViewingQuizId] || { name: currentViewingQuizId };
  const allResults = window.profileResults || userData?.quizResults || {};
  const result = allResults[currentViewingQuizId];
  
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

async function retakeQuiz() {
  if (!currentViewingQuizId) return;
  
  if (confirm("Tens a certeza que queres refazer o questionário? As tuas respostas serão apagadas.")) {
    // Delete from cloud
    if (currentUser && window.CloudSync) {
      try {
        await window.CloudSync.deleteQuizResult(currentUser.uid, currentViewingQuizId);
        await window.CloudSync.clearQuizProgress(currentUser.uid, currentViewingQuizId);
        console.log("Result and progress deleted from cloud");
      } catch (error) {
        console.error("Error deleting from cloud:", error);
      }
    }
    
    // Close modal and go to quiz
    closeResultModal();
    window.location.href = './quiz.html?id=' + currentViewingQuizId;
  }
}

// ================================
// EXPORTS
// ================================
window.editProfile = editProfile;
window.closeEditModal = closeEditModal;
window.saveProfile = saveProfile;
window.deleteAllData = deleteAllData;
window.deleteAccount = deleteAccount;
window.viewResult = viewResult;
window.closeResultModal = closeResultModal;
window.shareResult = shareResult;
window.retakeQuiz = retakeQuiz;
window.viewFullReport = viewFullReport;
window.closeFullReport = closeFullReport;
window.shareFullReport = shareFullReport;
window.downloadFullReport = downloadFullReport;
window.saveNickname = saveNickname;

// ================================
// FULL REPORT
// ================================
function viewFullReport() {
  const allResults = window.profileResults || userData?.quizResults || {};
  
  // Filter valid quiz IDs
  const validQuizIds = ['vanilla', 'orientation', 'cuckold', 'swing', 'kinks', 'bdsm', 'adventure', 'fantasies', 'exhibitionism'];
  const resultIds = Object.keys(allResults).filter(key => validQuizIds.includes(key));
  
  if (resultIds.length < 2) {
    alert("Precisas de completar pelo menos 2 questionários para ver o relatório completo.");
    return;
  }
  
  // Generate report content
  const reportBody = document.getElementById("fullReportBody");
  let html = "";
  
  // Overview Section
  html += '<div class="report-section">';
  html += '<h2 class="report-section-title">📈 Visão Geral</h2>';
  html += '<div class="report-overview-grid">';
  
  // Calculate average score
  let totalScore = 0;
  resultIds.forEach(id => {
    totalScore += allResults[id].score || 0;
  });
  const avgScore = Math.round(totalScore / resultIds.length);
  
  html += '<div class="report-stat-card">';
  html += '  <div class="report-stat-icon">📝</div>';
  html += '  <div class="report-stat-value">' + resultIds.length + '</div>';
  html += '  <div class="report-stat-label">Questionários</div>';
  html += '</div>';
  
  html += '<div class="report-stat-card">';
  html += '  <div class="report-stat-icon">📊</div>';
  html += '  <div class="report-stat-value">' + avgScore + '%</div>';
  html += '  <div class="report-stat-label">Média Global</div>';
  html += '</div>';
  
  html += '<div class="report-stat-card">';
  html += '  <div class="report-stat-icon">❓</div>';
  html += '  <div class="report-stat-value">' + (resultIds.length * 50) + '</div>';
  html += '  <div class="report-stat-label">Perguntas Respondidas</div>';
  html += '</div>';
  
  html += '</div></div>';
  
  // Scores Comparison Section
  html += '<div class="report-section">';
  html += '<h2 class="report-section-title">🎯 Comparação de Resultados</h2>';
  html += '<div class="report-scores-chart">';
  
  // Sort by score descending
  const sortedResults = resultIds.map(id => ({
    id,
    ...allResults[id],
    meta: QUIZ_META[id] || { name: id, icon: "📝", color: "#666" }
  })).sort((a, b) => (b.score || 0) - (a.score || 0));
  
  sortedResults.forEach(result => {
    html += '<div class="report-score-row">';
    html += '  <div class="report-score-quiz">';
    html += '    <span class="report-quiz-icon" style="color: ' + result.meta.color + '">' + result.meta.icon + '</span>';
    html += '    <span class="report-quiz-name">' + result.meta.name + '</span>';
    html += '  </div>';
    html += '  <div class="report-score-bar-container">';
    html += '    <div class="report-score-bar" style="width: ' + (result.score || 0) + '%; background: ' + result.meta.color + '"></div>';
    html += '  </div>';
    html += '  <span class="report-score-value">' + (result.score || 0) + '%</span>';
    html += '</div>';
  });
  
  html += '</div></div>';
  
  // Detailed Results Section
  html += '<div class="report-section">';
  html += '<h2 class="report-section-title">📋 Resultados Detalhados</h2>';
  html += '<div class="report-details-grid">';
  
  sortedResults.forEach(result => {
    html += '<div class="report-detail-card">';
    html += '  <div class="report-detail-header" style="background: ' + result.meta.color + '">';
    html += '    <span class="report-detail-icon">' + result.meta.icon + '</span>';
    html += '    <span class="report-detail-title">' + result.meta.name + '</span>';
    html += '  </div>';
    html += '  <div class="report-detail-body">';
    html += '    <div class="report-detail-score">' + (result.score || 0) + '%</div>';
    
    if (result.category) {
      html += '    <div class="report-detail-category">';
      html += '      <span>' + (result.categoryEmoji || result.meta.icon) + ' ' + result.category + '</span>';
      html += '    </div>';
    } else if (result.dominantRole) {
      html += '    <div class="report-detail-category">';
      html += '      <span>🎭 Role: ' + result.dominantRole + '</span>';
      html += '    </div>';
    }
    
    // Show top categories if available
    if (result.categoryScores) {
      const topCategories = Object.entries(result.categoryScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      if (topCategories.length > 0) {
        html += '    <div class="report-detail-breakdown">';
        topCategories.forEach(([cat, score]) => {
          html += '      <div class="report-mini-bar">';
          html += '        <span>' + formatCategoryLabel(cat) + '</span>';
          html += '        <div class="report-mini-bar-bg"><div class="report-mini-bar-fill" style="width: ' + score + '%; background: ' + result.meta.color + '"></div></div>';
          html += '        <span>' + score + '%</span>';
          html += '      </div>';
        });
        html += '    </div>';
      }
    }
    
    if (result.date) {
      html += '    <div class="report-detail-date">Completado em ' + formatDate(new Date(result.date)) + '</div>';
    }
    
    html += '  </div>';
    html += '</div>';
  });
  
  html += '</div></div>';
  
  // Profile Summary Section
  html += '<div class="report-section">';
  html += '<h2 class="report-section-title">✨ O Teu Perfil</h2>';
  html += '<div class="report-profile-summary">';
  
  // Generate profile insights based on results
  const profileInsights = generateProfileInsights(sortedResults);
  html += '<p class="report-profile-text">' + profileInsights + '</p>';
  
  // Highlight areas
  if (sortedResults.length >= 3) {
    const top3 = sortedResults.slice(0, 3);
    html += '<div class="report-highlights">';
    html += '  <h4>🏆 Top 3 Áreas de Interesse:</h4>';
    html += '  <div class="report-highlight-tags">';
    top3.forEach(r => {
      html += '    <span class="report-tag" style="background: ' + r.meta.color + '">' + r.meta.icon + ' ' + r.meta.name + '</span>';
    });
    html += '  </div>';
    html += '</div>';
  }
  
  html += '</div></div>';
  
  reportBody.innerHTML = html;
  
  // Show modal
  const modal = document.getElementById("fullReportModal");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function generateProfileInsights(sortedResults) {
  if (sortedResults.length === 0) return "Completa mais questionários para descobrir o teu perfil!";
  
  const avgScore = sortedResults.reduce((sum, r) => sum + (r.score || 0), 0) / sortedResults.length;
  const topQuiz = sortedResults[0];
  
  let text = "";
  
  if (avgScore >= 70) {
    text = "Os teus resultados mostram que és uma pessoa muito aberta à exploração e novas experiências. ";
  } else if (avgScore >= 50) {
    text = "Tens uma mente curiosa e equilibrada, aberta a explorar mas com limites bem definidos. ";
  } else if (avgScore >= 30) {
    text = "Preferes uma abordagem mais tradicional, mas manténs curiosidade sobre diferentes temas. ";
  } else {
    text = "Valorizas experiências mais convencionais e confortáveis. E está tudo bem assim! ";
  }
  
  text += "A tua área de maior interesse é <strong>" + topQuiz.meta.name + "</strong> com " + topQuiz.score + "% de afinidade";
  
  if (topQuiz.category) {
    text += ", classificando-te como <strong>" + topQuiz.category + "</strong>";
  }
  
  text += ". ";
  
  if (sortedResults.length >= 5) {
    text += "Com " + sortedResults.length + " questionários completos, tens um perfil bem definido e detalhado!";
  } else {
    text += "Completa mais questionários para ter um perfil ainda mais detalhado.";
  }
  
  return text;
}

function closeFullReport() {
  const modal = document.getElementById("fullReportModal");
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
}

function shareFullReport() {
  const allResults = window.profileResults || {};
  const validQuizIds = ['vanilla', 'orientation', 'cuckold', 'swing', 'kinks', 'bdsm', 'adventure', 'fantasies', 'exhibitionism'];
  const count = Object.keys(allResults).filter(k => validQuizIds.includes(k)).length;
  
  const text = '🎯 O meu perfil Quest4You!\n\nCompletei ' + count + ' questionários de autoconhecimento.\n\nDescobre o teu perfil também em quest4you.com';
  
  if (navigator.share) {
    navigator.share({
      title: 'Quest4You - Meu Perfil',
      text: text,
      url: window.location.origin
    });
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert("Texto copiado para a área de transferência!");
    });
  }
}

function downloadFullReport() {
  // For now, show message - PDF generation would require a library
  alert("📥 Funcionalidade de download PDF em breve!\n\nPor agora, podes usar Ctrl+P (ou Cmd+P no Mac) para imprimir/guardar como PDF enquanto o relatório está aberto.");
}

// ================================
// PROFILE PHOTOS
// ================================
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

async function uploadPhoto(type, inputElement) {
  if (!currentUser) {
    alert("Precisas de estar autenticado para fazer upload de fotos.");
    return;
  }

  const file = inputElement.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert("Por favor, seleciona uma imagem válida.");
    return;
  }

  // Validate file size
  if (file.size > MAX_PHOTO_SIZE) {
    alert("A imagem é demasiado grande. Máximo: 5MB");
    return;
  }

  // Check if secret photo requires validation
  if (type === 'secret') {
    const validationStatus = userData?.genderValidation?.status;
    if (validationStatus !== 'approved') {
      alert("Precisas de ter a validação de género aprovada para usar fotos secretas.");
      inputElement.value = '';
      return;
    }
  }

  try {
    // Show loading state
    const previewEl = document.getElementById(type + 'PhotoPreview');
    previewEl.innerHTML = '<div class="photo-loading">📤 A carregar...</div>';

    // Convert to base64 (for now - later use Firebase Storage)
    const base64 = await fileToBase64(file);

    // Resize image if needed
    const resizedBase64 = await resizeImage(base64, 800);

    // Save to Firestore
    const photoKey = type + 'Photo';
    await db.collection("quest4you_users").doc(currentUser.uid).update({
      [photoKey]: resizedBase64,
      [photoKey + 'UpdatedAt']: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Update local data
    if (userData) {
      userData[photoKey] = resizedBase64;
    }    // Update UI
    updatePhotoPreview(type, resizedBase64);
    
    console.log("✅ Photo uploaded:", type);
    alert("Foto atualizada com sucesso!");

  } catch (error) {
    console.error("Error uploading photo:", error);
    alert("Erro ao carregar foto. Por favor, tenta novamente.");
  }

  inputElement.value = '';
}

async function removePhoto(type) {
  if (!currentUser) return;

  if (!confirm("Tens a certeza que queres remover esta foto?")) {
    return;
  }

  try {
    const photoKey = type + 'Photo';
    await db.collection("quest4you_users").doc(currentUser.uid).update({
      [photoKey]: firebase.firestore.FieldValue.delete(),
      [photoKey + 'UpdatedAt']: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Update local data
    if (userData) {
      delete userData[photoKey];
    }

    // Update UI
    updatePhotoPreview(type, null);
    
    console.log("✅ Photo removed:", type);

  } catch (error) {
    console.error("Error removing photo:", error);
    alert("Erro ao remover foto.");
  }
}

function updatePhotoPreview(type, photoUrl) {
  const previewEl = document.getElementById(type + 'PhotoPreview');
  const imgEl = document.getElementById(type + 'PhotoImg');
  const removeBtn = document.getElementById('remove' + capitalizeFirst(type) + 'Btn');

  if (!previewEl || !imgEl) {
    console.warn(`Preview elements not found for ${type} photo`);
    return;
  }

  if (photoUrl) {
    imgEl.src = photoUrl;
    imgEl.style.display = 'block';
    // Remove placeholder if exists
    const placeholder = previewEl.querySelector('.photo-placeholder');
    if (placeholder) placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'inline-flex';
  } else {
    imgEl.src = '';
    imgEl.style.display = 'none';
    // Show placeholder
    const placeholder = previewEl.querySelector('.photo-placeholder');
    if (placeholder) placeholder.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'none';
  }
}

function loadAllPhotos() {
  if (!userData) return;

  ['public', 'private', 'secret'].forEach(type => {
    const photoKey = type + 'Photo';
    if (userData[photoKey]) {
      updatePhotoPreview(type, userData[photoKey]);
    }
  });

  // Update gender validation status
  updateValidationStatusUI();
}

// ================================
// GENDER VALIDATION
// ================================
async function submitGenderValidation(inputElement) {
  if (!currentUser) {
    alert("Precisas de estar autenticado.");
    return;
  }

  const file = inputElement.files[0];
  if (!file) return;

  // Validate file
  if (!file.type.startsWith('image/')) {
    alert("Por favor, seleciona uma imagem válida.");
    return;
  }

  if (file.size > MAX_PHOTO_SIZE) {
    alert("A imagem é demasiado grande. Máximo: 5MB");
    return;
  }

  try {
    // Show loading
    const statusSection = document.getElementById('validationNotStarted');
    statusSection.innerHTML = '<div class="photo-loading">📤 A enviar...</div>';

    // Convert and resize
    const base64 = await fileToBase64(file);
    const resizedBase64 = await resizeImage(base64, 600);

    // Save validation request to Firestore
    await db.collection("quest4you_users").doc(currentUser.uid).update({
      genderValidation: {
        status: 'pending',
        photoUrl: resizedBase64,
        submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null
      }
    });

    // Update local data
    if (userData) {
      userData.genderValidation = {
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
    }

    // Update UI
    updateValidationStatusUI();
    
    console.log("✅ Gender validation submitted");
    alert("Foto de validação enviada! Será analisada em 24-48 horas.");

  } catch (error) {
    console.error("Error submitting validation:", error);
    alert("Erro ao enviar. Por favor, tenta novamente.");
    updateValidationStatusUI(); // Restore state
  }

  inputElement.value = '';
}

function updateValidationStatusUI() {
  const notStarted = document.getElementById('validationNotStarted');
  const pending = document.getElementById('validationPending');
  const approved = document.getElementById('validationApproved');
  const rejected = document.getElementById('validationRejected');
  const secretUpload = document.getElementById('secretPhotoInput');
  const genderStatus = document.getElementById('genderValidationStatus');

  // Hide all
  [notStarted, pending, approved, rejected].forEach(el => {
    if (el) el.style.display = 'none';
  });

  const validation = userData?.genderValidation;

  if (!validation || !validation.status) {
    // Not started
    if (notStarted) notStarted.style.display = 'block';
    if (secretUpload) secretUpload.disabled = true;
    if (genderStatus) genderStatus.innerHTML = '<span class="validation-pending">⏳ Validação pendente</span>';
  } else if (validation.status === 'pending') {
    // Pending review
    if (pending) pending.style.display = 'block';
    if (secretUpload) secretUpload.disabled = true;
    if (genderStatus) genderStatus.innerHTML = '<span class="validation-pending">⏳ Em análise</span>';
  } else if (validation.status === 'approved') {
    // Approved
    if (approved) approved.style.display = 'block';
    if (secretUpload) secretUpload.disabled = false;
    if (genderStatus) genderStatus.innerHTML = '<span style="color: #4CAF50;">✅ Validado</span>';
  } else if (validation.status === 'rejected') {
    // Rejected
    if (rejected) {
      rejected.style.display = 'block';
      const reasonEl = document.getElementById('rejectionReason');
      if (reasonEl && validation.rejectionReason) {
        reasonEl.textContent = 'Motivo: ' + validation.rejectionReason;
      }
    }
    if (secretUpload) secretUpload.disabled = true;
    if (genderStatus) genderStatus.innerHTML = '<span style="color: #f44336;">❌ Rejeitado</span>';
  }
}

// ================================
// UTILITY FUNCTIONS
// ================================
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resizeImage(base64, maxSize) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = base64;
  });
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export new functions
window.uploadPhoto = uploadPhoto;
window.removePhoto = removePhoto;
window.submitGenderValidation = submitGenderValidation;