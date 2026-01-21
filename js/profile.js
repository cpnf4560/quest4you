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
// LOAD RESULTS
// ================================
function loadResults() {
  const grid = document.getElementById("resultsGrid");
  const emptyState = document.getElementById("emptyResults");
  
  // Get results from Firestore
  const firestoreResults = userData?.quizResults || {};
  
  // Get local results
  const localResults = JSON.parse(localStorage.getItem("q4y_results") || "{}");
  
  // Merge results (prefer Firestore)
  const allResults = { ...localResults, ...firestoreResults };
  
  const resultIds = Object.keys(allResults);
  
  if (resultIds.length === 0) {
    emptyState.style.display = "block";
    return;
  }
  
  emptyState.style.display = "none";
  
  // Quiz metadata
  const quizMeta = {
    vanilla: { name: "Vanilla ou Kink", icon: "💕", color: "#e91e63" },
    orientation: { name: "Orientação Sexual", icon: "🌈", color: "#9c27b0" },
    cuckold: { name: "Stag/Cuckold", icon: "👀", color: "#673ab7" },
    swing: { name: "Swing/Poliamor", icon: "💜", color: "#00bcd4" },
    kinks: { name: "Fetiches e Kinks", icon: "🔥", color: "#f44336" }
  };
  
  let html = "";
  
  resultIds.forEach(quizId => {
    const result = allResults[quizId];
    const meta = quizMeta[quizId] || { name: quizId, icon: "📝", color: "#666" };
    
    html += `
      <div class="result-card">
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
              <span>${result.category}</span>
            </div>
          ` : ""}
          ${result.date ? `
            <div class="result-date">
              Completado em ${formatDate(new Date(result.date))}
            </div>
          ` : ""}
        </div>
      </div>
    `;
  });
  
  grid.innerHTML = html;
}

function loadLocalResults() {
  // Sync local results to Firestore if available
  const localResults = JSON.parse(localStorage.getItem("q4y_results") || "{}");
  
  if (Object.keys(localResults).length > 0 && userData) {
    syncResultsToFirestore(localResults);
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
  const firestoreResults = userData?.quizResults || {};
  const localResults = JSON.parse(localStorage.getItem("q4y_results") || "{}");
  const allResults = { ...localResults, ...firestoreResults };
  return Object.keys(allResults).length;
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
    // Clear localStorage
    localStorage.removeItem("q4y_results");
    
    // Get all quiz keys and remove
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("q4y_")) {
        localStorage.removeItem(key);
      }
    }
    
    // Clear Firestore data
    if (db && currentUser) {
      await db.collection("quest4you_users").doc(currentUser.uid).update({
        quizResults: {},
        progress: {}
      });
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
// EXPORTS
// ================================
window.editProfile = editProfile;
window.closeEditModal = closeEditModal;
window.saveProfile = saveProfile;
window.deleteAllData = deleteAllData;
window.deleteAccount = deleteAccount;