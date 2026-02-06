/**
 * Quest4You - Admin Dashboard
 * Gestão de denúncias, estatísticas em tempo real, broadcast messages
 */

// ================================
// STATE
// ================================
let adminListeners = [];
let realtimeStats = {};

// ================================
// INITIALIZATION
// ================================

/**
 * Inicializa o dashboard de admin
 */
async function initAdminDashboard() {
  if (!currentUser || !db) {
    console.error('User not authenticated');
    return;
  }
  
  // Verificar se é admin
  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    showToast('Acesso negado. Apenas administradores podem aceder.', 'error');
    window.location.href = './profile.html';
    return;
  }
  
  console.log('🔧 Admin Dashboard initialized');
  
  // Iniciar listeners em tempo real
  initRealtimeStats();
  loadReports();
  loadRecentUsers();
  loadBroadcastHistory();
}

/**
 * Verifica se utilizador é admin
 */
async function checkIsAdmin() {
  if (!currentUser) return false;
  
  // Verificar se é o admin configurado
  if (typeof ADMIN_CONFIG !== 'undefined' && currentUser.uid === ADMIN_CONFIG.uid) {
    return true;
  }
  
  // Verificar no Firestore
  try {
    const userDoc = await db.collection("quest4you_users").doc(currentUser.uid).get();
    return userDoc.exists && userDoc.data().isAdmin === true;
  } catch (error) {
    return false;
  }
}

// ================================
// REAL-TIME STATISTICS
// ================================

/**
 * Inicializa estatísticas em tempo real
 */
function initRealtimeStats() {
  // Listener para utilizadores
  const usersListener = db.collection("quest4you_users")
    .onSnapshot(snapshot => {
      realtimeStats.totalUsers = snapshot.size;
      
      let activeToday = 0;
      let newToday = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const lastActive = data.lastActiveAt?.toDate();
        const createdAt = data.createdAt?.toDate();
        
        if (lastActive && lastActive >= today) activeToday++;
        if (createdAt && createdAt >= today) newToday++;
      });
      
      realtimeStats.activeToday = activeToday;
      realtimeStats.newToday = newToday;
      
      updateStatsUI();
    });
  
  adminListeners.push(usersListener);
  
  // Listener para mensagens (últimas 24h)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const messagesListener = db.collection("quest4you_messages")
    .where("createdAt", ">=", yesterday)
    .onSnapshot(snapshot => {
      realtimeStats.messagesLast24h = snapshot.size;
      updateStatsUI();
    });
  
  adminListeners.push(messagesListener);
  
  // Listener para matches
  const matchesListener = db.collection("quest4you_match_history")
    .where("createdAt", ">=", yesterday)
    .onSnapshot(snapshot => {
      realtimeStats.matchesLast24h = snapshot.size;
      updateStatsUI();
    });
  
  adminListeners.push(matchesListener);
  
  // Listener para denúncias pendentes
  const reportsListener = db.collection("quest4you_reports")
    .where("status", "==", "pending")
    .onSnapshot(snapshot => {
      realtimeStats.pendingReports = snapshot.size;
      updateStatsUI();
    });
  
  adminListeners.push(reportsListener);
}

/**
 * Atualiza UI das estatísticas
 */
function updateStatsUI() {
  const statsContainer = document.getElementById('adminStats');
  if (!statsContainer) return;
  
  statsContainer.innerHTML = `
    <div class="admin-stat-card">
      <div class="stat-icon">👥</div>
      <div class="stat-details">
        <span class="stat-value">${realtimeStats.totalUsers || 0}</span>
        <span class="stat-label">Utilizadores Total</span>
      </div>
    </div>
    
    <div class="admin-stat-card highlight">
      <div class="stat-icon">🟢</div>
      <div class="stat-details">
        <span class="stat-value">${realtimeStats.activeToday || 0}</span>
        <span class="stat-label">Ativos Hoje</span>
      </div>
    </div>
    
    <div class="admin-stat-card success">
      <div class="stat-icon">✨</div>
      <div class="stat-details">
        <span class="stat-value">${realtimeStats.newToday || 0}</span>
        <span class="stat-label">Novos Hoje</span>
      </div>
    </div>
    
    <div class="admin-stat-card">
      <div class="stat-icon">💬</div>
      <div class="stat-details">
        <span class="stat-value">${realtimeStats.messagesLast24h || 0}</span>
        <span class="stat-label">Mensagens (24h)</span>
      </div>
    </div>
    
    <div class="admin-stat-card">
      <div class="stat-icon">💕</div>
      <div class="stat-details">
        <span class="stat-value">${realtimeStats.matchesLast24h || 0}</span>
        <span class="stat-label">Matches (24h)</span>
      </div>
    </div>
    
    <div class="admin-stat-card ${realtimeStats.pendingReports > 0 ? 'danger' : ''}">
      <div class="stat-icon">⚠️</div>
      <div class="stat-details">
        <span class="stat-value">${realtimeStats.pendingReports || 0}</span>
        <span class="stat-label">Denúncias Pendentes</span>
      </div>
    </div>
  `;
}

// ================================
// REPORTS MANAGEMENT
// ================================

/**
 * Carrega denúncias
 */
function loadReports(status = 'all') {
  let query = db.collection("quest4you_reports")
    .orderBy("createdAt", "desc")
    .limit(50);
  
  if (status !== 'all') {
    query = query.where("status", "==", status);
  }
  
  const listener = query.onSnapshot(async snapshot => {
    const reports = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      // Obter informações do utilizador reportado e do reporter
      const [reportedUser, reporter] = await Promise.all([
        getUserBasicInfo(data.reportedUserId),
        getUserBasicInfo(data.reporterId)
      ]);
      
      reports.push({
        id: doc.id,
        ...data,
        reportedUser,
        reporter,
        createdAt: data.createdAt?.toDate() || new Date()
      });
    }
    
    renderReports(reports);
  });
  
  adminListeners.push(listener);
}

/**
 * Obtém informações básicas de utilizador
 */
async function getUserBasicInfo(userId) {
  if (!userId) return { name: 'Desconhecido', photo: null };
  
  try {
    const doc = await db.collection("quest4you_users").doc(userId).get();
    if (!doc.exists) return { name: 'Utilizador Eliminado', photo: null };
    
    const data = doc.data();
    return {
      id: userId,
      name: data.displayName || data.nickname || 'Utilizador',
      photo: data.photos?.public || null,
      email: data.email
    };
  } catch (error) {
    return { name: 'Erro', photo: null };
  }
}

/**
 * Renderiza lista de denúncias
 */
function renderReports(reports) {
  const container = document.getElementById('reportsList');
  if (!container) return;
  
  if (reports.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">✅</span>
        <p>Nenhuma denúncia encontrada</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = reports.map(report => `
    <div class="report-item ${report.status}" data-report-id="${report.id}">
      <div class="report-header">
        <div class="report-users">
          <div class="report-user reported">
            <div class="user-mini-avatar">
              ${report.reportedUser?.photo 
                ? `<img src="${report.reportedUser.photo}" alt="">`
                : `<span>${report.reportedUser?.name?.charAt(0) || '?'}</span>`
              }
            </div>
            <div class="user-info">
              <span class="user-name">${escapeHtml(report.reportedUser?.name || 'N/A')}</span>
              <span class="user-role">Reportado</span>
            </div>
          </div>
          <span class="report-arrow">⚠️</span>
          <div class="report-user reporter">
            <div class="user-mini-avatar">
              ${report.reporter?.photo 
                ? `<img src="${report.reporter.photo}" alt="">`
                : `<span>${report.reporter?.name?.charAt(0) || '?'}</span>`
              }
            </div>
            <div class="user-info">
              <span class="user-name">${escapeHtml(report.reporter?.name || 'N/A')}</span>
              <span class="user-role">Reporter</span>
            </div>
          </div>
        </div>
        <div class="report-status-badge ${report.status}">${getStatusLabel(report.status)}</div>
      </div>
      
      <div class="report-body">
        <div class="report-reason">
          <strong>Motivo:</strong> ${escapeHtml(report.reason || 'Não especificado')}
        </div>
        ${report.details ? `
          <div class="report-details">
            <strong>Detalhes:</strong> ${escapeHtml(report.details)}
          </div>
        ` : ''}
        <div class="report-date">
          Reportado em ${report.createdAt.toLocaleString('pt-PT')}
        </div>
      </div>
      
      ${report.status === 'pending' ? `
        <div class="report-actions">
          <button class="btn btn-sm btn-warning" onclick="warnUser('${report.reportedUser?.id}', '${report.id}')">
            ⚠️ Avisar
          </button>
          <button class="btn btn-sm btn-danger" onclick="banUser('${report.reportedUser?.id}', '${report.id}')">
            🚫 Banir
          </button>
          <button class="btn btn-sm btn-secondary" onclick="dismissReport('${report.id}')">
            ❌ Ignorar
          </button>
        </div>
      ` : `
        <div class="report-resolution">
          Resolvido: ${report.resolution || 'N/A'} em ${report.resolvedAt?.toDate()?.toLocaleString('pt-PT') || 'N/A'}
        </div>
      `}
    </div>
  `).join('');
}

function getStatusLabel(status) {
  const labels = {
    pending: '⏳ Pendente',
    resolved: '✅ Resolvido',
    dismissed: '❌ Ignorado',
    warned: '⚠️ Avisado',
    banned: '🚫 Banido'
  };
  return labels[status] || status;
}

/**
 * Avisa utilizador
 */
async function warnUser(userId, reportId) {
  if (!userId) return;
  
  const reason = prompt('Motivo do aviso:');
  if (!reason) return;
  
  try {
    // Enviar notificação de aviso
    await db.collection("quest4you_notifications").add({
      userId: userId,
      type: 'warning',
      title: '⚠️ Aviso da Administração',
      message: `Recebeste um aviso: ${reason}. Por favor, revê o teu comportamento.`,
      icon: '⚠️',
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Incrementar contador de avisos
    await db.collection("quest4you_users").doc(userId).update({
      warningCount: firebase.firestore.FieldValue.increment(1),
      lastWarningAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastWarningReason: reason
    });
    
    // Atualizar denúncia
    await db.collection("quest4you_reports").doc(reportId).update({
      status: 'warned',
      resolution: `Utilizador avisado: ${reason}`,
      resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
      resolvedBy: currentUser.uid
    });
    
    showToast('Aviso enviado com sucesso', 'success');
    
  } catch (error) {
    console.error('Error warning user:', error);
    showToast('Erro ao enviar aviso', 'error');
  }
}

/**
 * Bane utilizador
 */
async function banUser(userId, reportId) {
  if (!userId) return;
  
  if (!confirm('Tens a certeza que queres banir este utilizador? Esta ação é grave.')) return;
  
  const reason = prompt('Motivo do ban:');
  if (!reason) return;
  
  try {
    // Marcar utilizador como banido
    await db.collection("quest4you_users").doc(userId).update({
      isBanned: true,
      bannedAt: firebase.firestore.FieldValue.serverTimestamp(),
      bannedBy: currentUser.uid,
      banReason: reason
    });
    
    // Atualizar denúncia
    await db.collection("quest4you_reports").doc(reportId).update({
      status: 'banned',
      resolution: `Utilizador banido: ${reason}`,
      resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
      resolvedBy: currentUser.uid
    });
    
    showToast('Utilizador banido', 'success');
    
  } catch (error) {
    console.error('Error banning user:', error);
    showToast('Erro ao banir utilizador', 'error');
  }
}

/**
 * Ignora denúncia
 */
async function dismissReport(reportId) {
  if (!confirm('Ignorar esta denúncia?')) return;
  
  try {
    await db.collection("quest4you_reports").doc(reportId).update({
      status: 'dismissed',
      resolution: 'Denúncia ignorada - sem ação necessária',
      resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
      resolvedBy: currentUser.uid
    });
    
    showToast('Denúncia ignorada', 'info');
    
  } catch (error) {
    console.error('Error dismissing report:', error);
    showToast('Erro ao ignorar denúncia', 'error');
  }
}

// ================================
// BROADCAST MESSAGES
// ================================

/**
 * Mostra modal de broadcast
 */
function showBroadcastModal() {
  let modal = document.getElementById('broadcastModal');
  if (modal) {
    modal.classList.add('active');
    return;
  }
  
  modal = document.createElement('div');
  modal.id = 'broadcastModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeBroadcastModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>📢 Enviar Broadcast</h3>
        <button class="modal-close" onclick="closeBroadcastModal()">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Tipo de Mensagem</label>
          <select id="broadcastType">
            <option value="info">ℹ️ Informação</option>
            <option value="update">✨ Atualização</option>
            <option value="warning">⚠️ Aviso</option>
            <option value="promo">🎁 Promoção</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Título *</label>
          <input type="text" id="broadcastTitle" placeholder="Título da mensagem" maxlength="100">
        </div>
        
        <div class="form-group">
          <label>Mensagem *</label>
          <textarea id="broadcastMessage" placeholder="Conteúdo da mensagem..." rows="4" maxlength="500"></textarea>
        </div>
        
        <div class="form-group">
          <label>Destinatários</label>
          <select id="broadcastTarget">
            <option value="all">👥 Todos os utilizadores</option>
            <option value="active">🟢 Utilizadores ativos (últimos 7 dias)</option>
            <option value="new">✨ Novos utilizadores (últimos 30 dias)</option>
            <option value="verified">✓ Utilizadores verificados</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" id="broadcastPush"> Enviar também como Push Notification
          </label>
        </div>
        
        <div class="broadcast-preview">
          <h5>Pré-visualização:</h5>
          <div class="preview-notification" id="broadcastPreview">
            <span class="preview-icon">ℹ️</span>
            <div class="preview-content">
              <strong>Título</strong>
              <p>Mensagem...</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeBroadcastModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="sendBroadcast()">📤 Enviar Broadcast</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
  
  // Setup preview update
  document.getElementById('broadcastTitle')?.addEventListener('input', updateBroadcastPreview);
  document.getElementById('broadcastMessage')?.addEventListener('input', updateBroadcastPreview);
  document.getElementById('broadcastType')?.addEventListener('change', updateBroadcastPreview);
}

function closeBroadcastModal() {
  const modal = document.getElementById('broadcastModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

/**
 * Atualiza preview do broadcast
 */
function updateBroadcastPreview() {
  const title = document.getElementById('broadcastTitle')?.value || 'Título';
  const message = document.getElementById('broadcastMessage')?.value || 'Mensagem...';
  const type = document.getElementById('broadcastType')?.value || 'info';
  
  const icons = { info: 'ℹ️', update: '✨', warning: '⚠️', promo: '🎁' };
  
  const preview = document.getElementById('broadcastPreview');
  if (preview) {
    preview.innerHTML = `
      <span class="preview-icon">${icons[type]}</span>
      <div class="preview-content">
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }
}

/**
 * Envia broadcast para utilizadores
 */
async function sendBroadcast() {
  const title = document.getElementById('broadcastTitle')?.value?.trim();
  const message = document.getElementById('broadcastMessage')?.value?.trim();
  const type = document.getElementById('broadcastType')?.value || 'info';
  const target = document.getElementById('broadcastTarget')?.value || 'all';
  const sendPush = document.getElementById('broadcastPush')?.checked || false;
  
  if (!title || !message) {
    showToast('Preenche o título e a mensagem', 'warning');
    return;
  }
  
  const icons = { info: 'ℹ️', update: '✨', warning: '⚠️', promo: '🎁' };
  
  try {
    // Obter utilizadores alvo
    let usersQuery = db.collection("quest4you_users");
    
    if (target === 'active') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      usersQuery = usersQuery.where("lastActiveAt", ">=", weekAgo);
    } else if (target === 'new') {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      usersQuery = usersQuery.where("createdAt", ">=", monthAgo);
    } else if (target === 'verified') {
      usersQuery = usersQuery.where("verified", "==", true);
    }
    
    const usersSnapshot = await usersQuery.get();
    
    if (usersSnapshot.empty) {
      showToast('Nenhum utilizador encontrado para enviar', 'warning');
      return;
    }
    
    // Enviar notificação para cada utilizador
    const batch = db.batch();
    let count = 0;
    
    usersSnapshot.docs.forEach(doc => {
      const notifRef = db.collection("quest4you_notifications").doc();
      batch.set(notifRef, {
        userId: doc.id,
        type: `broadcast_${type}`,
        title: title,
        message: message,
        icon: icons[type],
        read: false,
        isBroadcast: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      count++;
    });
    
    await batch.commit();
    
    // Guardar histórico do broadcast
    await db.collection("quest4you_broadcasts").add({
      title,
      message,
      type,
      target,
      recipientCount: count,
      sentBy: currentUser.uid,
      sentAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    closeBroadcastModal();
    showToast(`Broadcast enviado para ${count} utilizadores!`, 'success');
    
    // Recarregar histórico
    loadBroadcastHistory();
    
  } catch (error) {
    console.error('Error sending broadcast:', error);
    showToast('Erro ao enviar broadcast', 'error');
  }
}

/**
 * Carrega histórico de broadcasts
 */
async function loadBroadcastHistory() {
  const container = document.getElementById('broadcastHistory');
  if (!container) return;
  
  try {
    const snapshot = await db.collection("quest4you_broadcasts")
      .orderBy("sentAt", "desc")
      .limit(10)
      .get();
    
    if (snapshot.empty) {
      container.innerHTML = '<p class="empty-text">Nenhum broadcast enviado ainda.</p>';
      return;
    }
    
    const icons = { info: 'ℹ️', update: '✨', warning: '⚠️', promo: '🎁' };
    
    container.innerHTML = snapshot.docs.map(doc => {
      const data = doc.data();
      return `
        <div class="broadcast-history-item">
          <span class="broadcast-icon">${icons[data.type] || 'ℹ️'}</span>
          <div class="broadcast-info">
            <strong>${escapeHtml(data.title)}</strong>
            <p>${escapeHtml(data.message?.substring(0, 80))}${data.message?.length > 80 ? '...' : ''}</p>
            <span class="broadcast-meta">
              ${data.recipientCount} destinatários • ${data.sentAt?.toDate()?.toLocaleString('pt-PT') || 'N/A'}
            </span>
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading broadcast history:', error);
    container.innerHTML = '<p class="error-text">Erro ao carregar histórico</p>';
  }
}

// ================================
// RECENT USERS
// ================================

/**
 * Carrega utilizadores recentes
 */
async function loadRecentUsers() {
  const container = document.getElementById('recentUsersList');
  if (!container) return;
  
  try {
    const snapshot = await db.collection("quest4you_users")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();
    
    if (snapshot.empty) {
      container.innerHTML = '<p class="empty-text">Nenhum utilizador ainda.</p>';
      return;
    }
    
    container.innerHTML = snapshot.docs.map(doc => {
      const data = doc.data();
      return `
        <div class="recent-user-item">
          <div class="user-mini-avatar">
            ${data.photos?.public 
              ? `<img src="${data.photos.public}" alt="">`
              : `<span>${data.displayName?.charAt(0) || data.nickname?.charAt(0) || '?'}</span>`
            }
          </div>
          <div class="user-info">
            <span class="user-name">${escapeHtml(data.displayName || data.nickname || 'Utilizador')}</span>
            <span class="user-email">${escapeHtml(data.email || '')}</span>
          </div>
          <div class="user-meta">
            <span class="user-date">${data.createdAt?.toDate()?.toLocaleDateString('pt-PT') || 'N/A'}</span>
            ${data.verified ? '<span class="verified-mini">✓</span>' : ''}
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading recent users:', error);
    container.innerHTML = '<p class="error-text">Erro ao carregar utilizadores</p>';
  }
}

// ================================
// VERIFICATION REQUESTS (ADMIN)
// ================================

/**
 * Carrega pedidos de verificação pendentes
 */
async function loadVerificationRequests() {
  const container = document.getElementById('verificationRequestsList');
  if (!container) return;
  
  try {
    const snapshot = await db.collection("quest4you_verification_requests")
      .where("status", "==", "pending")
      .orderBy("requestedAt", "desc")
      .limit(20)
      .get();
    
    if (snapshot.empty) {
      container.innerHTML = '<p class="empty-text">Nenhum pedido de verificação pendente.</p>';
      return;
    }
    
    const requests = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const user = await getUserBasicInfo(data.userId);
      requests.push({ id: doc.id, ...data, user });
    }
    
    container.innerHTML = requests.map(req => `
      <div class="verification-request-item">
        <div class="request-user">
          <div class="user-mini-avatar">
            ${req.user?.photo 
              ? `<img src="${req.user.photo}" alt="">`
              : `<span>${req.user?.name?.charAt(0) || '?'}</span>`
            }
          </div>
          <div class="user-info">
            <span class="user-name">${escapeHtml(req.user?.name || 'Utilizador')}</span>
            <span class="request-type">${req.type === 'identity' ? '🪪 Identidade' : '✉️ Email'}</span>
          </div>
        </div>
        
        ${req.idDocUrl ? `
          <div class="request-docs">
            <a href="${req.idDocUrl}" target="_blank" class="doc-link">📄 Documento</a>
            ${req.selfieUrl ? `<a href="${req.selfieUrl}" target="_blank" class="doc-link">🤳 Selfie</a>` : ''}
          </div>
        ` : ''}
        
        <div class="request-actions">
          <button class="btn btn-sm btn-success" onclick="approveVerificationRequest('${req.id}', '${req.userId}')">
            ✅ Aprovar
          </button>
          <button class="btn btn-sm btn-danger" onclick="rejectVerificationRequest('${req.id}', '${req.userId}')">
            ❌ Rejeitar
          </button>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading verification requests:', error);
    container.innerHTML = '<p class="error-text">Erro ao carregar pedidos</p>';
  }
}

/**
 * Aprova pedido de verificação
 */
async function approveVerificationRequest(requestId, userId) {
  try {
    // Aprovar verificação do utilizador
    if (typeof approveVerification === 'function') {
      await approveVerification(userId, 'full', currentUser.uid);
    } else {
      await db.collection("quest4you_users").doc(userId).update({
        verified: true,
        verificationLevel: 'full',
        verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
        verifiedBy: currentUser.uid
      });
    }
    
    // Atualizar pedido
    await db.collection("quest4you_verification_requests").doc(requestId).update({
      status: 'approved',
      processedAt: firebase.firestore.FieldValue.serverTimestamp(),
      processedBy: currentUser.uid
    });
    
    showToast('Verificação aprovada!', 'success');
    loadVerificationRequests();
    
  } catch (error) {
    console.error('Error approving verification:', error);
    showToast('Erro ao aprovar verificação', 'error');
  }
}

/**
 * Rejeita pedido de verificação
 */
async function rejectVerificationRequest(requestId, userId) {
  const reason = prompt('Motivo da rejeição:');
  if (!reason) return;
  
  try {
    // Atualizar pedido
    await db.collection("quest4you_verification_requests").doc(requestId).update({
      status: 'rejected',
      rejectionReason: reason,
      processedAt: firebase.firestore.FieldValue.serverTimestamp(),
      processedBy: currentUser.uid
    });
    
    // Notificar utilizador
    await db.collection("quest4you_notifications").add({
      userId: userId,
      type: 'verification_rejected',
      title: '❌ Verificação Rejeitada',
      message: `O teu pedido de verificação foi rejeitado. Motivo: ${reason}`,
      icon: '❌',
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    showToast('Verificação rejeitada', 'info');
    loadVerificationRequests();
    
  } catch (error) {
    console.error('Error rejecting verification:', error);
    showToast('Erro ao rejeitar verificação', 'error');
  }
}

// ================================
// CLEANUP
// ================================

function cleanupAdminListeners() {
  adminListeners.forEach(unsub => {
    if (typeof unsub === 'function') unsub();
  });
  adminListeners = [];
}

// ================================
// EXPORTS
// ================================
window.initAdminDashboard = initAdminDashboard;
window.checkIsAdmin = checkIsAdmin;
window.loadReports = loadReports;
window.warnUser = warnUser;
window.banUser = banUser;
window.dismissReport = dismissReport;
window.showBroadcastModal = showBroadcastModal;
window.closeBroadcastModal = closeBroadcastModal;
window.sendBroadcast = sendBroadcast;
window.loadBroadcastHistory = loadBroadcastHistory;
window.loadRecentUsers = loadRecentUsers;
window.loadVerificationRequests = loadVerificationRequests;
window.approveVerificationRequest = approveVerificationRequest;
window.rejectVerificationRequest = rejectVerificationRequest;
window.cleanupAdminListeners = cleanupAdminListeners;
