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