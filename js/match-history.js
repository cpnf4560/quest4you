/**
 * Quest4You - Match History System
 * Sistema de histórico de matches do Smart Match
 */

// ================================
// MATCH HISTORY
// ================================

/**
 * Guarda match no histórico
 */
async function saveMatchToHistory(matchData) {
  if (!currentUser || !db) return null;
  
  try {
    const historyRef = await db.collection("quest4you_match_history").add({
      userId: currentUser.uid,
      matchedUserId: matchData.userId,
      matchedUserName: matchData.name,
      matchedUserNickname: matchData.nickname,
      matchedUserPhoto: matchData.photo || null,
      compatibilityScore: matchData.compatibilityScore || 0,
      compatibilityDetails: matchData.details || {},
      matchType: matchData.type || 'smart_match',
      status: 'pending', // pending, accepted, rejected, expired
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Match saved to history:', historyRef.id);
    return historyRef.id;
    
  } catch (error) {
    console.error('Error saving match to history:', error);
    return null;
  }
}

/**
 * Carrega histórico de matches do utilizador
 */
async function loadMatchHistory(limit = 20, status = null) {
  if (!currentUser || !db) return [];
  
  try {
    let query = db.collection("quest4you_match_history")
      .where("userId", "==", currentUser.uid)
      .orderBy("createdAt", "desc")
      .limit(limit);
    
    if (status) {
      query = query.where("status", "==", status);
    }
    
    const snapshot = await query.get();
    const history = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Verificar se já são amigos
      const isFriend = await checkIfFriends(data.matchedUserId);
      
      history.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        isFriend: isFriend
      });
    }
    
    return history;
    
  } catch (error) {
    console.error('Error loading match history:', error);
    return [];
  }
}

/**
 * Verifica se já é amigo
 */
async function checkIfFriends(userId) {
  if (!currentUser || !db) return false;
  
  try {
    const friendshipSnapshot = await db.collection("quest4you_friendships")
      .where("status", "==", "accepted")
      .where("participants", "array-contains", currentUser.uid)
      .get();
    
    for (const doc of friendshipSnapshot.docs) {
      const participants = doc.data().participants;
      if (participants.includes(userId)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Atualiza status do match
 */
async function updateMatchStatus(matchId, status) {
  if (!matchId || !db) return false;
  
  try {
    await db.collection("quest4you_match_history").doc(matchId).update({
      status: status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating match status:', error);
    return false;
  }
}

/**
 * Elimina match do histórico
 */
async function deleteMatchFromHistory(matchId) {
  if (!matchId || !db) return false;
  
  try {
    await db.collection("quest4you_match_history").doc(matchId).delete();
    showToast(t('matchHistory.matchRemoved'), 'info');
    return true;
  } catch (error) {
    console.error('Error deleting match:', error);
    showToast(t('matchHistory.removeError'), 'error');
    return false;
  }
}

/**
 * Obtém estatísticas do histórico de matches
 */
async function getMatchStatistics() {
  if (!currentUser || !db) return null;
  
  try {
    const snapshot = await db.collection("quest4you_match_history")
      .where("userId", "==", currentUser.uid)
      .get();
    
    const stats = {
      total: snapshot.size,
      pending: 0,
      accepted: 0,
      rejected: 0,
      avgCompatibility: 0,
      highestCompatibility: 0,
      lowestCompatibility: 100
    };
    
    let totalCompatibility = 0;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Contar por status
      switch (data.status) {
        case 'pending': stats.pending++; break;
        case 'accepted': stats.accepted++; break;
        case 'rejected': stats.rejected++; break;
      }
      
      // Compatibilidade
      const compat = data.compatibilityScore || 0;
      totalCompatibility += compat;
      if (compat > stats.highestCompatibility) stats.highestCompatibility = compat;
      if (compat < stats.lowestCompatibility) stats.lowestCompatibility = compat;
    });
    
    if (stats.total > 0) {
      stats.avgCompatibility = Math.round(totalCompatibility / stats.total);
    }
    
    return stats;
    
  } catch (error) {
    console.error('Error getting match statistics:', error);
    return null;
  }
}

/**
 * Renderiza histórico de matches
 */
function renderMatchHistory(matches, containerId = 'matchHistoryList') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (matches.length === 0) {
    container.innerHTML = `
      <div class="empty-history">
        <span class="empty-icon">💫</span>
        <h4>${t('matchHistory.noMatches')}</h4>
        <p>${t('matchHistory.useSmartMatch')}</p>
        <a href="./smart-match.html" class="btn btn-primary">💕 ${t('matchHistory.goToSmartMatch')}</a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = matches.map(match => `
    <div class="match-history-item" data-match-id="${match.id}">
      <div class="match-history-avatar">
        ${match.matchedUserPhoto 
          ? `<img src="${match.matchedUserPhoto}" alt="${match.matchedUserName}">`
          : `<span class="avatar-placeholder">${match.matchedUserName?.charAt(0) || '?'}</span>`
        }
      </div>
      <div class="match-history-info">
        <div class="match-history-header">
          <span class="match-name">${escapeHtml(match.matchedUserName || t('profile.defaultUserName'))}</span>
          ${match.matchedUserNickname ? `<span class="match-nickname">${escapeHtml(match.matchedUserNickname)}</span>` : ''}
        </div>
        <div class="match-compatibility">
          <span class="compatibility-score">${match.compatibilityScore}%</span>
          <span class="compatibility-bar">
            <span class="compatibility-fill" style="width: ${match.compatibilityScore}%"></span>
          </span>
        </div>
        <div class="match-date">
          ${formatMatchDate(match.createdAt)}
        </div>
      </div>
      <div class="match-history-actions">
        ${match.isFriend 
          ? `<span class="friend-badge">👥 ${t('matchHistory.friends')}</span>`
          : `<button class="btn btn-sm btn-primary" onclick="sendFriendRequestFromHistory('${match.matchedUserId}', '${match.id}')">
               ➕ ${t('matchHistory.add')}
             </button>`
        }
        <button class="btn btn-sm btn-icon" onclick="showMatchDetails('${match.id}')" title="${t('matchHistory.viewDetails')}">
          ℹ️
        </button>
        <button class="btn btn-sm btn-icon" onclick="confirmDeleteMatch('${match.id}')" title="${t('matchHistory.remove')}">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Formata data do match
 */
function formatMatchDate(date) {
  if (!date) return '';
  
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return t('matchHistory.today');
  if (days === 1) return t('matchHistory.yesterday');
  if (days < 7) return t('matchHistory.daysAgo', {days: days});
  if (days < 30) return t('matchHistory.weeksAgo', {weeks: Math.floor(days / 7)});
  
  return date.toLocaleDateString(I18n.getCurrentLang(), { day: 'numeric', month: 'short' });
}

/**
 * Envia pedido de amizade a partir do histórico
 */
async function sendFriendRequestFromHistory(userId, matchId) {
  // Usar função existente de amizades se disponível
  if (typeof sendFriendRequest === 'function') {
    const success = await sendFriendRequest(userId);
    if (success) {
      // Atualizar status do match
      await updateMatchStatus(matchId, 'accepted');
      
      // Re-render
      const history = await loadMatchHistory();
      renderMatchHistory(history);
    }
  } else {
    showToast(t('matchHistory.friendsNotAvailable'), 'warning');
  }
}

/**
 * Mostra detalhes do match
 */
async function showMatchDetails(matchId) {
  try {
    const doc = await db.collection("quest4you_match_history").doc(matchId).get();
    if (!doc.exists) {
      showToast(t('matchHistory.matchNotFound'), 'error');
      return;
    }
    
    const match = doc.data();
    
    let modal = document.getElementById('matchDetailsModal');
    if (modal) modal.remove();
    
    modal = document.createElement('div');
    modal.id = 'matchDetailsModal';
    modal.className = 'modal';
    
    const details = match.compatibilityDetails || {};
    
    modal.innerHTML = `
      <div class="modal-overlay" onclick="closeMatchDetailsModal()"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>💕 ${t('matchHistory.matchDetails')}</h3>
          <button class="modal-close" onclick="closeMatchDetailsModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="match-detail-profile">
            <div class="match-detail-avatar">
              ${match.matchedUserPhoto 
                ? `<img src="${match.matchedUserPhoto}" alt="">`
                : `<span class="avatar-placeholder">${match.matchedUserName?.charAt(0) || '?'}</span>`
              }
            </div>
            <h4>${escapeHtml(match.matchedUserName || t('profile.defaultUserName'))}</h4>
            ${match.matchedUserNickname ? `<p>${escapeHtml(match.matchedUserNickname)}</p>` : ''}
          </div>
          
          <div class="match-detail-score">
            <div class="big-score">${match.compatibilityScore || 0}%</div>
            <span>${t('matchHistory.compatibility')}</span>
          </div>
          
          ${details && Object.keys(details).length > 0 ? `
            <div class="match-detail-breakdown">
              <h5>${t('matchHistory.detailedAnalysis')}</h5>
              ${Object.entries(details).map(([key, value]) => `
                <div class="breakdown-item">
                  <span class="breakdown-label">${formatBreakdownLabel(key)}</span>
                  <span class="breakdown-value">${typeof value === 'number' ? value + '%' : value}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="match-detail-date">
            ${t('matchHistory.matchFoundOn', {date: match.createdAt?.toDate()?.toLocaleDateString(I18n.getCurrentLang()) || t('matchHistory.unknownDate')})}
          </div>
        </div>
        <div class="modal-footer">
          ${match.status !== 'accepted' ? `
            <button class="btn btn-primary" onclick="sendFriendRequestFromHistory('${match.matchedUserId}', '${matchId}'); closeMatchDetailsModal();">
              ➕ ${t('matchHistory.addFriend')}
            </button>
          ` : ''}
          <button class="btn btn-secondary" onclick="closeMatchDetailsModal()">${t('matchHistory.close')}</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
  } catch (error) {
    console.error('Error showing match details:', error);
    showToast(t('matchHistory.loadDetailsError'), 'error');
  }
}

function closeMatchDetailsModal() {
  const modal = document.getElementById('matchDetailsModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

function formatBreakdownLabel(key) {
  const labels = {
    personality: '🧠 ' + t('matchHistory.labelPersonality'),
    values: '💎 ' + t('matchHistory.labelValues'),
    interests: '🎯 ' + t('matchHistory.labelInterests'),
    communication: '💬 ' + t('matchHistory.labelCommunication'),
    lifestyle: '🏠 ' + t('matchHistory.labelLifestyle')
  };
  return labels[key] || key;
}

/**
 * Confirma eliminação de match
 */
function confirmDeleteMatch(matchId) {
  if (confirm(t('matchHistory.deleteConfirm'))) {
    deleteMatchFromHistory(matchId).then(() => {
      document.querySelector(`[data-match-id="${matchId}"]`)?.remove();
    });
  }
}

/**
 * Mostra página de histórico de matches
 */
async function showMatchHistoryPage() {
  let modal = document.getElementById('matchHistoryModal');
  if (modal) modal.remove();
  
  modal = document.createElement('div');
  modal.id = 'matchHistoryModal';
  modal.className = 'modal fullscreen-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeMatchHistoryModal()"></div>
    <div class="modal-content fullscreen-content">
      <div class="modal-header">
        <h3>📜 ${t('matchHistory.historyTitle')}</h3>
        <button class="modal-close" onclick="closeMatchHistoryModal()">×</button>
      </div>
      <div class="modal-body">
        <div id="matchHistoryStats" class="match-stats-summary"></div>
        <div class="match-history-filters">
          <button class="filter-btn active" data-filter="all">${t('matchHistory.filterAll')}</button>
          <button class="filter-btn" data-filter="pending">${t('matchHistory.filterPending')}</button>
          <button class="filter-btn" data-filter="accepted">${t('matchHistory.filterAccepted')}</button>
        </div>
        <div id="matchHistoryList" class="match-history-list">
          <div class="loading-spinner">⏳ ${t('matchHistory.loading')}</div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
  
  // Carregar estatísticas
  const stats = await getMatchStatistics();
  if (stats) {
    document.getElementById('matchHistoryStats').innerHTML = `
      <div class="stat-item">
        <span class="stat-value">${stats.total}</span>
        <span class="stat-label">${t('matchHistory.statTotal')}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${stats.avgCompatibility}%</span>
        <span class="stat-label">${t('matchHistory.statAvgCompat')}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${stats.highestCompatibility}%</span>
        <span class="stat-label">${t('matchHistory.statHighest')}</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${stats.accepted}</span>
        <span class="stat-label">${t('matchHistory.statFriends')}</span>
      </div>
    `;
  }
  
  // Carregar histórico
  const history = await loadMatchHistory();
  renderMatchHistory(history);
  
  // Setup filtros
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const filter = e.target.dataset.filter;
      const filteredHistory = filter === 'all' 
        ? await loadMatchHistory() 
        : await loadMatchHistory(20, filter);
      renderMatchHistory(filteredHistory);
    });
  });
}

function closeMatchHistoryModal() {
  const modal = document.getElementById('matchHistoryModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

// ================================
// CSS Injection for match history
// ================================
const matchHistoryStyles = `
.match-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.match-history-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: var(--bg-card, #fff);
  border: 1px solid var(--border-color, #e9ecef);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.match-history-item:hover {
  border-color: #6a11cb;
  box-shadow: 0 4px 15px var(--shadow-light, rgba(0,0,0,0.08));
}

.match-history-avatar {
  width: 55px;
  height: 55px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.match-history-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.match-history-info {
  flex: 1;
  min-width: 0;
}

.match-history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.match-name {
  font-weight: 600;
  color: var(--text-primary, #1a1a2e);
}

.match-nickname {
  font-size: 0.85rem;
  color: var(--text-muted, #6c757d);
}

.match-compatibility {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.compatibility-score {
  font-weight: 700;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.compatibility-bar {
  flex: 1;
  max-width: 100px;
  height: 6px;
  background: var(--bg-tertiary, #f1f3f5);
  border-radius: 3px;
  overflow: hidden;
}

.compatibility-fill {
  height: 100%;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 3px;
}

.match-date {
  font-size: 0.8rem;
  color: var(--text-muted, #6c757d);
}

.match-history-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.friend-badge {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.empty-history {
  text-align: center;
  padding: 50px 20px;
  color: var(--text-muted, #6c757d);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 15px;
}

.empty-history h4 {
  color: var(--text-primary, #1a1a2e);
  margin-bottom: 10px;
}

.empty-history p {
  margin-bottom: 20px;
}

.match-stats-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: var(--bg-secondary, #f8f9fa);
  border-radius: 12px;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted, #6c757d);
}

.match-history-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid var(--border-color, #e9ecef);
  background: var(--bg-card, #fff);
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  color: var(--text-secondary, #4a4a5a);
  transition: all 0.2s ease;
}

.filter-btn:hover {
  border-color: #6a11cb;
}

.filter-btn.active {
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border-color: transparent;
}

.match-detail-profile {
  text-align: center;
  margin-bottom: 20px;
}

.match-detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 15px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.match-detail-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.match-detail-score {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.1) 0%, rgba(37, 117, 252, 0.1) 100%);
  border-radius: 12px;
  margin-bottom: 20px;
}

.big-score {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.match-detail-breakdown {
  margin-bottom: 20px;
}

.match-detail-breakdown h5 {
  margin-bottom: 15px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-light, #f1f3f5);
}

.breakdown-label {
  color: var(--text-secondary, #4a4a5a);
}

.breakdown-value {
  font-weight: 600;
  color: #6a11cb;
}

.match-detail-date {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-muted, #6c757d);
  padding-top: 15px;
  border-top: 1px solid var(--border-color, #e9ecef);
}

.fullscreen-modal .modal-content.fullscreen-content {
  max-width: 700px;
  max-height: 90vh;
}

@media (max-width: 768px) {
  .match-stats-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .match-history-item {
    flex-wrap: wrap;
  }
  
  .match-history-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--border-light, #f1f3f5);
  }
}
`;

// Inject styles
if (!document.getElementById('matchHistoryStyles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'matchHistoryStyles';
  styleSheet.textContent = matchHistoryStyles;
  document.head.appendChild(styleSheet);
}

// ================================
// EXPORTS
// ================================
window.saveMatchToHistory = saveMatchToHistory;
window.loadMatchHistory = loadMatchHistory;
window.updateMatchStatus = updateMatchStatus;
window.deleteMatchFromHistory = deleteMatchFromHistory;
window.getMatchStatistics = getMatchStatistics;
window.renderMatchHistory = renderMatchHistory;
window.sendFriendRequestFromHistory = sendFriendRequestFromHistory;
window.showMatchDetails = showMatchDetails;
window.closeMatchDetailsModal = closeMatchDetailsModal;
window.confirmDeleteMatch = confirmDeleteMatch;
window.showMatchHistoryPage = showMatchHistoryPage;
window.closeMatchHistoryModal = closeMatchHistoryModal;
