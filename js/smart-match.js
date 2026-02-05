/**
 * Quest4You - Smart Match Logic
 * Sistema de compatibilidade e matching
 */

// ================================
// STATE
// ================================
let currentUser = null;
let userProfile = null;
let userResults = {};
let allMatches = [];
let filteredMatches = [];
let quizIndex = {};

// ================================
// INITIALIZATION
// ================================
document.addEventListener("DOMContentLoaded", async function() {
  console.log("💕 Smart Match inicializado");

  // Load quiz index for names/icons
  await loadQuizIndex();

  // Check authentication
  if (typeof firebase !== 'undefined' && window.firebaseAuth) {
    window.firebaseAuth.onAuthStateChanged(async function(user) {
      currentUser = user;

      if (user) {
        console.log("✅ Utilizador autenticado:", user.email);
        await initializeAuthenticatedUser(user);
      } else {
        console.log("⚠️ Utilizador não autenticado");
        showSection('loginRequired');
      }
    });
  } else {
    showSection('loginRequired');
  }

  // Setup form handlers
  setupFormHandlers();
});

// ================================
// LOAD QUIZ INDEX
// ================================
async function loadQuizIndex() {
  try {
    const response = await fetch('../data/quizzes/index.json');
    const data = await response.json();
    
    // Convert to lookup object
    data.quizzes.forEach(quiz => {
      quizIndex[quiz.id] = quiz;
    });
    
    console.log("📚 Quiz index carregado:", Object.keys(quizIndex).length, "quizzes");
  } catch (error) {
    console.error("❌ Erro ao carregar quiz index:", error);
  }
}

// ================================
// INITIALIZE AUTHENTICATED USER
// ================================
async function initializeAuthenticatedUser(user) {
  try {
    // Get user results from cloud
    if (window.CloudSync) {
      userResults = await window.CloudSync.getQuizResults(user.uid);
    }

    // Check if user has completed any quizzes
    if (Object.keys(userResults).length === 0) {
      showSection('noQuizzes');
      return;
    }

    // Get user profile from cloud
    if (window.CloudSync) {
      userProfile = await window.CloudSync.getUserProfile(user.uid);
    }

    // Check if profile is complete
    if (!userProfile || !userProfile.displayName) {
      showSection('profileSetup');
      prefillProfileForm(user);
      return;
    }    // Show main match section
    showSection('matchMain');
    updateYourProfileCard();
    await updateGenderValidationStatus(user);
    await loadMatches();

  } catch (error) {
    console.error("❌ Erro ao inicializar:", error);
    showSection('noQuizzes');
  }
}

// ================================
// SECTION MANAGEMENT
// ================================
function showSection(sectionId) {
  // Hide all sections
  document.getElementById('loginRequired').style.display = 'none';
  document.getElementById('noQuizzes').style.display = 'none';
  document.getElementById('profileSetup').style.display = 'none';
  document.getElementById('matchMain').style.display = 'none';

  // Show requested section
  document.getElementById(sectionId).style.display = 'block';
}

// ================================
// PROFILE SETUP
// ================================
function prefillProfileForm(user) {
  const displayName = document.getElementById('displayName');
  if (displayName && user.displayName) {
    displayName.value = user.displayName;
  }
}

function setupFormHandlers() {
  const form = document.getElementById('profileSetupForm');
  if (form) {
    form.addEventListener('submit', handleProfileSubmit);
  }
}

async function handleProfileSubmit(e) {
  e.preventDefault();

  if (!currentUser) return;

  const displayName = document.getElementById('displayName').value.trim();
  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;
  const location = document.getElementById('location').value.trim();
  const publishProfile = document.getElementById('publishProfile').checked;

  if (!displayName) {
    alert('Por favor, insere um nome de exibição.');
    return;
  }

  try {
    // Build quiz scores for public profile
    const quizScores = {};
    for (const [quizId, result] of Object.entries(userResults)) {
      quizScores[quizId] = result.score;
    }

    // Save user profile
    const profileData = {
      displayName,
      age: age ? parseInt(age) : null,
      gender: gender || null,
      location: location || null,
      quizScores,
      isPublic: publishProfile,
      createdAt: new Date().toISOString()
    };

    if (window.CloudSync) {
      await window.CloudSync.saveUserProfile(currentUser.uid, profileData);

      // Publish to Smart Match if enabled
      if (publishProfile) {
        await window.CloudSync.publishPublicProfile(currentUser.uid, profileData);
      }
    }

    userProfile = profileData;

    // Show main section
    showSection('matchMain');
    updateYourProfileCard();
    await loadMatches();

  } catch (error) {
    console.error("❌ Erro ao guardar perfil:", error);
    alert('Erro ao guardar perfil. Por favor, tenta novamente.');
  }
}

// ================================
// YOUR PROFILE CARD
// ================================
function updateYourProfileCard() {
  if (!userProfile) return;

  document.getElementById('yourName').textContent = userProfile.displayName || 'Utilizador';
  
  const details = [];
  if (userProfile.age) details.push(userProfile.age + ' anos');
  if (userProfile.gender) details.push(capitalizeFirst(userProfile.gender));
  if (userProfile.location) details.push(userProfile.location);
  document.getElementById('yourDetails').textContent = details.join('  ') || '';

  // Update quizzes badges
  const quizzesContainer = document.getElementById('yourQuizzes');
  let badgesHtml = '';
  for (const [quizId, result] of Object.entries(userResults)) {
    const quiz = quizIndex[quizId] || { icon: '❓', name: quizId };
    badgesHtml += `
      <span class="quiz-badge">
        ${quiz.icon} ${quiz.name}
        <span class="quiz-badge-score">${result.score}%</span>
      </span>
    `;
  }

  quizzesContainer.innerHTML = badgesHtml;

  // Update visibility icon
  updateVisibilityIcon();
}

function updateVisibilityIcon() {
  const icon = document.getElementById('visibilityIcon');
  if (userProfile && userProfile.isPublic) {
    icon.textContent = '';
    icon.title = 'Perfil visível no Smart Match';
  } else {
    icon.textContent = '';
    icon.title = 'Perfil oculto do Smart Match';
  }
}

async function toggleProfileVisibility() {
  if (!currentUser || !userProfile) return;

  try {
    const newVisibility = !userProfile.isPublic;

    if (window.CloudSync) {
      if (newVisibility) {
        // Build quiz scores
        const quizScores = {};
        for (const [quizId, result] of Object.entries(userResults)) {
          quizScores[quizId] = result.score;
        }

        await window.CloudSync.publishPublicProfile(currentUser.uid, {
          ...userProfile,
          quizScores
        });
      } else {
        await window.CloudSync.unpublishPublicProfile(currentUser.uid);
      }

      // Update local profile
      userProfile.isPublic = newVisibility;
      await window.CloudSync.saveUserProfile(currentUser.uid, { isPublic: newVisibility });

      updateVisibilityIcon();

      const msg = newVisibility ? 'Perfil visível no Smart Match!' : 'Perfil oculto do Smart Match.';
      showToast(msg, newVisibility ? 'success' : 'info');
    }
  } catch (error) {
    console.error("❌ Erro ao alterar visibilidade:", error);
    showToast('Erro ao alterar visibilidade.', 'error');
  }
}

// ================================
// LOAD MATCHES
// ================================
async function loadMatches() {
  const loadingEl = document.getElementById('loadingMatches');
  const gridEl = document.getElementById('matchesGrid');
  const noMatchesEl = document.getElementById('noMatches');

  loadingEl.style.display = 'block';
  gridEl.innerHTML = '';
  noMatchesEl.style.display = 'none';

  try {
    // Build user quiz scores
    const userScores = {};
    for (const [quizId, result] of Object.entries(userResults)) {
      userScores[quizId] = result.score;
    }

    // Get matches from cloud (using advanced algorithm)
    if (window.CloudSync) {
      allMatches = await window.CloudSync.findMatchesAdvanced(currentUser.uid);
      
      // Fallback to basic if advanced fails
      if (!allMatches || allMatches.length === 0) {
        allMatches = await window.CloudSync.findMatches(currentUser.uid, userScores);
      }
    } else {
      allMatches = [];
    }

    console.log("💕 Matches encontrados:", allMatches.length);

    // Apply filters
    applyFilters();

  } catch (error) {
    console.error("❌ Erro ao carregar matches:", error);
    loadingEl.style.display = 'none';
    noMatchesEl.style.display = 'block';
  }
}

// ================================
// FILTERS
// ================================
function applyFilters() {
  const genderFilter = document.getElementById('filterGender').value;
  const minCompat = parseInt(document.getElementById('filterMinCompat').value) || 0;

  filteredMatches = allMatches.filter(match => {
    // Gender filter
    if (genderFilter && match.gender !== genderFilter) {
      return false;
    }

    // Compatibility filter
    if (match.compatibility < minCompat) {
      return false;
    }

    return true;
  });

  renderMatches();
}

function updateCompatLabel() {
  const value = document.getElementById('filterMinCompat').value;
  document.getElementById('compatLabel').textContent = value + '%';
}

function refreshMatches() {
  loadMatches();
}

// ================================
// RENDER MATCHES
// ================================
function renderMatches() {
  const loadingEl = document.getElementById('loadingMatches');
  const gridEl = document.getElementById('matchesGrid');
  const noMatchesEl = document.getElementById('noMatches');
  const countEl = document.getElementById('matchCount');

  loadingEl.style.display = 'none';

  // Update count
  countEl.textContent = '(' + filteredMatches.length + ')';

  if (filteredMatches.length === 0) {
    noMatchesEl.style.display = 'block';
    gridEl.innerHTML = '';
    return;
  }

  noMatchesEl.style.display = 'none';

  // Render cards
  let html = '';

  filteredMatches.forEach((match, index) => {
    const details = [];
    if (match.age) details.push(match.age + ' anos');
    if (match.gender) details.push(capitalizeFirst(match.gender));
    if (match.location) details.push(match.location);

    // Get quiz tags    const quizTags = [];
    const matchQuizzes = match.quizScores || {};
    for (const quizId of Object.keys(matchQuizzes).slice(0, 3)) {
      const quiz = quizIndex[quizId] || { icon: '❓' };
      quizTags.push(`<span class="match-quiz-tag">${quiz.icon}</span>`);
    }

    // Compatibility color
    const compatClass = match.compatibility >= 80 ? 'high' : (match.compatibility >= 50 ? 'medium' : 'low');

    // Special badges for location and rare fetishes
    let specialBadges = '';
    if (match.sameLocation) {
      specialBadges += '<span class="special-badge location-badge" title="Mesma zona geográfica">📍 Perto de ti</span>';
    }
    if (match.hasRareFetishMatch && match.rareFetishesInCommon?.length > 0) {
      const fetishNames = match.rareFetishesInCommon.map(f => {
        const quiz = quizIndex[f.quizId];
        return quiz ? quiz.icon : '🔥';
      }).join(' ');
      specialBadges += `<span class="special-badge rare-badge" title="Interesses raros em comum!">🔥 Match Raro ${fetishNames}</span>`;
    }

    html += `
      <div class="match-card ${match.sameLocation ? 'nearby' : ''} ${match.hasRareFetishMatch ? 'rare-match' : ''}" onclick="openMatchDetail(${index})">
        ${specialBadges ? '<div class="special-badges">' + specialBadges + '</div>' : ''}
        <div class="match-card-header">
          <div class="match-avatar">${getAvatarEmoji(match.gender)}</div>
          <div class="match-info">
            <h3 class="match-name">${escapeHtml(match.displayName)}</h3>
            <p class="match-details">${details.join(' • ')}</p>
          </div>
          <div class="match-compat ${compatClass}">${match.compatibility}%</div>
        </div>
        <div class="match-card-body">
          <div class="match-quizzes">
            ${quizTags.join('')}
          </div>
        </div>
        <div class="match-card-footer">
          <button class="btn btn-primary btn-small">Ver Detalhes 👀</button>
        </div>
      </div>
    `;
  });

  gridEl.innerHTML = html;
}

// ================================
// MATCH DETAIL MODAL
// ================================
function openMatchDetail(index) {
  const match = filteredMatches[index];
  if (!match) return;

  const modal = document.getElementById('matchModal');

  // Update modal content
  document.getElementById('modalAvatar').textContent = getAvatarEmoji(match.gender);
  document.getElementById('modalName').textContent = match.displayName;

  const details = [];
  if (match.age) details.push(match.age + ' anos');
  if (match.gender) details.push(capitalizeFirst(match.gender));
  if (match.location) details.push(match.location);
  document.getElementById('modalDetails').textContent = details.join('  ') || '';

  document.getElementById('modalCompatValue').textContent = match.compatibility;

  // Build breakdown
  let breakdownHtml = '';
  const matchQuizzes = match.quizScores || {};
  for (const [quizId, theirScore] of Object.entries(matchQuizzes)) {
    const ourResult = userResults[quizId];
    if (!ourResult) continue;

    const quiz = quizIndex[quizId] || { icon: '❓', name: quizId };
    const diff = Math.abs(ourResult.score - theirScore);
    const matchPercent = Math.max(0, 100 - diff);

    breakdownHtml += `
      <div class="breakdown-item">
        <span class="breakdown-icon">${quiz.icon}</span>
        <div class="breakdown-info">
          <p class="breakdown-name">${quiz.name}</p>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="width: ${matchPercent}%"></div>
          </div>
        </div>
        <span class="breakdown-match">${matchPercent}%</span>
      </div>
    `;
  }

  document.getElementById('modalBreakdown').innerHTML = breakdownHtml || '<p style="text-align: center; color: #666;">Sem quizzes em comum.</p>';

  // Store current match for contact
  modal.dataset.matchId = match.id;

  // Show modal
  modal.style.display = 'flex';
}

function closeMatchModal() {
  document.getElementById('matchModal').style.display = 'none';
}

function initiateContact() {
  // For now, just show a coming soon message
  showToast('💬 Funcionalidade de chat em breve!', 'info');
}

// ================================
// UTILITIES
// ================================
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
}

function getAvatarEmoji(gender) {
  switch (gender) {
    case 'masculino': return '👨';
    case 'feminino': return '👩';
    case 'nao-binario': return '🧑';
    default: return '👤';
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  // Get background color based on type
  const bgColors = {
    'success': '#28a745',
    'error': '#dc3545',
    'info': '#17a2b8',
    'warning': '#ffc107'
  };
  const bgColor = bgColors[type] || bgColors['info'];

  // Create toast
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${bgColor};
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 1001;
    animation: toastIn 0.3s ease;
  `;
  toast.textContent = message;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(-50%) translateY(20px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'toastIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ================================
// GENDER VALIDATION
// ================================
async function updateGenderValidationStatus(user) {
  if (!user) return;
  
  try {
    const userDoc = await window.db.collection('quest4you_users').doc(user.uid).get();
    
    if (!userDoc.exists) return;
    
    const userData = userDoc.data();
    const statusContainer = document.getElementById('genderValidationStatus');
    const requestBtn = document.getElementById('requestValidationBtn');
    
    if (!statusContainer || !requestBtn) return;
    
    // Verificar estado de validação
    if (userData.genderValidated) {
      // Validado ✅
      statusContainer.innerHTML = `
        <div class="validation-badge validated">
          <span class="badge-icon">✅</span>
          <span class="badge-text">Género Validado</span>
        </div>
      `;
      requestBtn.style.display = 'none';
      
    } else if (userData.genderValidationRequested && !userData.genderValidationRejected) {
      // Pendente ⏳
      statusContainer.innerHTML = `
        <div class="validation-badge pending">
          <span class="badge-icon">⏳</span>
          <span class="badge-text">Validação Pendente</span>
        </div>
      `;
      requestBtn.style.display = 'none';
      
    } else if (userData.genderValidationRejected) {
      // Rejeitado ❌
      const reason = userData.genderValidationRejectionReason || 'Não especificado';
      statusContainer.innerHTML = `
        <div class="validation-badge rejected">
          <span class="badge-icon">❌</span>
          <span class="badge-text">Validação Rejeitada</span>
        </div>
        <div class="validation-reason">Motivo: ${reason}</div>
      `;
      requestBtn.style.display = 'inline-block';
      requestBtn.textContent = '🔄 Solicitar Novamente';
      
    } else {
      // Não validado - mostrar botão
      statusContainer.innerHTML = `
        <div class="validation-badge not-validated">
          <span class="badge-icon">⚠️</span>
          <span class="badge-text">Género Não Validado</span>
        </div>
      `;
      requestBtn.style.display = 'inline-block';
      requestBtn.textContent = '✅ Solicitar Validação de Género';
    }
    
  } catch (error) {
    console.error('Error updating validation status:', error);
  }
}

async function requestGenderValidation() {
  if (!currentUser) {
    alert('❌ Precisas de estar autenticado para solicitar validação de género.');
    return;
  }
  
  try {
    // Buscar dados do utilizador
    const userDoc = await window.db.collection('quest4you_users').doc(currentUser.uid).get();
    
    if (!userDoc.exists) {
      alert('❌ Dados do utilizador não encontrados.');
      return;
    }
    
    const userData = userDoc.data();
    
    // Verificar se tem fotos
    const hasPhotos = userData.publicPhotoUrl || userData.privatePhotoUrl || userData.secretPhotoUrl ||
                      userData.photos?.public || userData.photos?.private || userData.photos?.secret;
    
    if (!hasPhotos) {
      if (!confirm('⚠️ Não tens fotos no perfil. É altamente recomendado adicionar fotos para facilitar a validação.\n\nDesejas continuar mesmo assim?')) {
        return;
      }
    }
    
    // Verificar se já tem pedido pendente
    const existingRequest = await window.db.collection('genderValidations')
      .where('userId', '==', currentUser.uid)
      .where('status', '==', 'pending')
      .get();
    
    if (!existingRequest.empty) {
      alert('⏳ Já tens um pedido de validação pendente. Aguarda pela análise dos administradores.');
      return;
    }
    
    // Criar pedido de validação
    const validationData = {
      userId: currentUser.uid,
      email: userData.email,
      displayName: userData.displayName || 'Utilizador',
      declaredGender: userData.smartMatchPreferences?.gender || 'not_specified',
      orientation: userData.smartMatchPreferences?.orientation || 'not_specified',
      lookingFor: userData.smartMatchPreferences?.lookingFor || 'not_specified',
      publicPhotoUrl: userData.publicPhotoUrl || userData.photos?.public || null,
      privatePhotoUrl: userData.privatePhotoUrl || userData.photos?.private || null,
      secretPhotoUrl: userData.secretPhotoUrl || userData.photos?.secret || null,
      quizzesCompleted: userData.results ? Object.keys(userData.results).length : 0,
      status: 'pending',
      requestedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await window.db.collection('genderValidations').add(validationData);
    
    // Atualizar flag no utilizador
    await window.db.collection('quest4you_users').doc(currentUser.uid).update({
      genderValidationRequested: true,
      genderValidationRequestedAt: firebase.firestore.FieldValue.serverTimestamp(),
      genderValidationRejected: false // Reset rejection flag
    });
    
    alert('✅ Pedido de validação de género submetido com sucesso!\n\nOs administradores irão analisar o teu pedido em breve. Receberás uma notificação quando for processado.');
    
    // Atualizar status na interface
    await updateGenderValidationStatus(currentUser);
    
  } catch (error) {
    console.error('Error requesting gender validation:', error);
    alert('❌ Erro ao submeter pedido de validação. Por favor, tenta novamente.');
  }
}

// ================================
// EXPORTS
// ================================
window.applyFilters = applyFilters;
window.updateCompatLabel = updateCompatLabel;
window.refreshMatches = refreshMatches;
window.toggleProfileVisibility = toggleProfileVisibility;
window.openMatchDetail = openMatchDetail;
window.closeMatchModal = closeMatchModal;
window.initiateContact = initiateContact;
window.requestGenderValidation = requestGenderValidation;