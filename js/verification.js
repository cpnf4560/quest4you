/**
 * Quest4You - Verified Profile System
 * Sistema de badges de verificação para perfis
 */

// ================================
// VERIFICAÇÃO
// ================================

/**
 * Tipos de verificação disponíveis
 */
const VERIFICATION_TYPES = {
  email: {
    icon: '✉️',
    labelKey: 'verification.emailVerified',
    color: '#1da1f2',
    requirementKey: 'verification.reqEmail'
  },
  phone: {
    icon: '📱',
    labelKey: 'verification.phoneVerified',
    color: '#25D366',
    requirementKey: 'verification.reqPhone'
  },
  identity: {
    icon: '🪪',
    labelKey: 'verification.identityVerified',
    color: '#6a11cb',
    requirementKey: 'verification.reqIdentity'
  },
  premium: {
    icon: '⭐',
    labelKey: 'verification.premiumMember',
    color: '#ffc107',
    requirementKey: 'verification.reqPremium'
  },
  official: {
    icon: '✓',
    labelKey: 'verification.officialAccount',
    color: '#1da1f2',
    requirementKey: 'verification.reqOfficial'
  }
};

/**
 * Verifica se utilizador tem badge de verificação
 */
async function isUserVerified(userId) {
  if (!userId || !db) return false;
  
  try {
    const userDoc = await db.collection("quest4you_users").doc(userId).get();
    if (!userDoc.exists) return false;
    
    const data = userDoc.data();
    return data.verified === true || data.verificationStatus === 'verified';
  } catch (error) {
    console.error('Error checking verification:', error);
    return false;
  }
}

/**
 * Obtém detalhes de verificação do utilizador
 */
async function getUserVerification(userId) {
  if (!userId || !db) return null;
  
  try {
    const userDoc = await db.collection("quest4you_users").doc(userId).get();
    if (!userDoc.exists) return null;
    
    const data = userDoc.data();
    
    return {
      isVerified: data.verified === true,
      verificationLevel: data.verificationLevel || 'none', // none, basic, full, premium, official
      verifications: data.verifications || [],
      verifiedAt: data.verifiedAt?.toDate() || null,
      badges: data.badges || []
    };
  } catch (error) {
    console.error('Error getting verification:', error);
    return null;
  }
}

/**
 * Renderiza badge de verificação
 */
function renderVerificationBadge(verification, size = 'normal') {
  if (!verification || !verification.isVerified) return '';
  
  const sizeClass = size === 'large' ? 'verified-badge-large' : '';
  const level = verification.verificationLevel || 'basic';
    let badgeIcon = '✓';
  let badgeColor = '#1da1f2';
  let badgeTitle = t('verification.profileVerified');
  
  switch (level) {
    case 'premium':
      badgeIcon = '⭐';
      badgeColor = '#ffc107';
      badgeTitle = t('verification.premiumVerified');
      break;
    case 'official':
      badgeIcon = '✓';
      badgeColor = '#1da1f2';
      badgeTitle = t('verification.officialVerified');
      break;
    case 'full':
      badgeIcon = '✓✓';
      badgeColor = '#6a11cb';
      badgeTitle = t('verification.fullyVerified');
      break;
    default:
      badgeIcon = '✓';
      badgeColor = '#1da1f2';
      badgeTitle = t('verification.profileVerified');
  }
  
  return `
    <span class="verified-badge ${sizeClass}" 
          title="${badgeTitle}" 
          style="background: ${badgeColor};"
          data-level="${level}">
      ${badgeIcon}
    </span>
  `;
}

/**
 * Adiciona badge de verificação a elemento
 */
function addVerificationBadge(element, verification, size = 'normal') {
  if (!element || !verification?.isVerified) return;
  
  const badge = document.createElement('span');
  badge.innerHTML = renderVerificationBadge(verification, size);
  element.appendChild(badge.firstElementChild);
}

/**
 * Solicita verificação do perfil
 */
async function requestVerification(type = 'email') {
  if (!currentUser) {
    showToast(t('verification.loginFirst'), 'warning');
    return false;
  }
  
  const verType = VERIFICATION_TYPES[type];
  if (!verType) {
    console.error('Unknown verification type:', type);
    return false;
  }
  
  try {
    // Criar pedido de verificação
    await db.collection("quest4you_verification_requests").add({
      userId: currentUser.uid,
      type: type,
      status: 'pending',
      requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
      userEmail: currentUser.email
    });
    
    showToast(`Pedido de verificação (${t(verType.labelKey)}) enviado!`, 'success');
    return true;
    
  } catch (error) {
    console.error('Error requesting verification:', error);
    showToast(t('verification.requestError'), 'error');
    return false;
  }
}

/**
 * ADMIN: Aprovar verificação de utilizador
 */
async function approveVerification(userId, type = 'basic', adminId) {
  if (!userId || !db) return false;
  
  try {
    const verificationData = {
      verified: true,
      verificationLevel: type,
      verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
      verifiedBy: adminId,
      verifications: firebase.firestore.FieldValue.arrayUnion({
        type: type,
        verifiedAt: new Date().toISOString(),
        verifiedBy: adminId
      })
    };
    
    await db.collection("quest4you_users").doc(userId).update(verificationData);
    
    // Notificar utilizador
    await db.collection("quest4you_notifications").add({
      userId: userId,
      type: 'verification_approved',
      title: '✅ Perfil Verificado!',
      message: 'O teu perfil foi verificado com sucesso! Agora tens um badge de verificação.',
      icon: '✓',
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
    
  } catch (error) {
    console.error('Error approving verification:', error);
    return false;
  }
}

/**
 * ADMIN: Revogar verificação
 */
async function revokeVerification(userId, reason, adminId) {
  if (!userId || !db) return false;
  
  try {
    await db.collection("quest4you_users").doc(userId).update({
      verified: false,
      verificationLevel: 'none',
      verificationRevokedAt: firebase.firestore.FieldValue.serverTimestamp(),
      verificationRevokedBy: adminId,
      verificationRevokeReason: reason
    });
    
    // Notificar utilizador
    await db.collection("quest4you_notifications").add({
      userId: userId,
      type: 'verification_revoked',
      title: '⚠️ Verificação Removida',
      message: `A verificação do teu perfil foi removida. Motivo: ${reason}`,
      icon: '⚠️',
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
    
  } catch (error) {
    console.error('Error revoking verification:', error);
    return false;
  }
}

/**
 * Mostra modal de verificação
 */
function showVerificationModal() {
  let modal = document.getElementById('verificationModal');
  if (modal) {
    modal.classList.add('active');
    return;
  }
  
  modal = document.createElement('div');
  modal.id = 'verificationModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeVerificationModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>✓ Verificar Perfil</h3>
        <button class="modal-close" onclick="closeVerificationModal()">×</button>
      </div>
      <div class="modal-body">
        <p class="verification-intro">
          A verificação do perfil aumenta a confiança e credibilidade junto de outros utilizadores.
        </p>
        
        <div class="verification-options">
          <div class="verification-option" onclick="startVerification('email')">
            <span class="ver-icon">✉️</span>
            <div class="ver-info">
              <strong>Verificar Email</strong>
              <span>Confirma que o teu email é válido</span>
            </div>
            <span class="ver-arrow">→</span>
          </div>
          
          <div class="verification-option" onclick="startVerification('identity')">
            <span class="ver-icon">🪪</span>
            <div class="ver-info">
              <strong>Verificar Identidade</strong>
              <span>Submete documento de identificação</span>
            </div>
            <span class="ver-arrow">→</span>
          </div>
          
          <div class="verification-option premium" onclick="showPremiumInfo()">
            <span class="ver-icon">⭐</span>
            <div class="ver-info">
              <strong>Tornar-se Premium</strong>
              <span>Badge premium + funcionalidades extra</span>
            </div>
            <span class="ver-arrow">→</span>
          </div>
        </div>
        
        <div class="verification-benefits">
          <h4>Benefícios da verificação:</h4>
          <ul>
            <li>✓ Badge de confiança no perfil</li>
            <li>✓ Prioridade nos resultados Smart Match</li>
            <li>✓ Maior credibilidade junto de outros</li>
            <li>✓ Acesso a funcionalidades exclusivas</li>
          </ul>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

function closeVerificationModal() {
  const modal = document.getElementById('verificationModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

/**
 * Inicia processo de verificação
 */
async function startVerification(type) {
  closeVerificationModal();
  
  switch (type) {
    case 'email':
      await verifyEmail();
      break;
    case 'identity':
      showIdentityVerificationForm();
      break;
    default:
      showToast(t('verification.typeNotAvailable'), 'warning');
  }
}

/**
 * Verifica email do utilizador
 */
async function verifyEmail() {
  if (!currentUser) {
    showToast(t('verification.loginFirst'), 'warning');
    return;
  }
  
  if (currentUser.emailVerified) {
    // Já verificado - atualizar Firestore
    await db.collection("quest4you_users").doc(currentUser.uid).update({
      emailVerified: true,
      verifications: firebase.firestore.FieldValue.arrayUnion({
        type: 'email',
        verifiedAt: new Date().toISOString()
      })
    });
    showToast(t('verification.emailAlreadyVerified'), 'success');
    return;
  }
  
  try {
    await currentUser.sendEmailVerification();
    showToast(t('verification.emailSent'), 'success');
  } catch (error) {
    console.error('Error sending verification email:', error);
    showToast(t('verification.emailSendError'), 'error');
  }
}

/**
 * Mostra formulário de verificação de identidade
 */
function showIdentityVerificationForm() {
  let modal = document.getElementById('identityVerificationModal');
  if (modal) modal.remove();
  
  modal = document.createElement('div');
  modal.id = 'identityVerificationModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeIdentityModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>🪪 Verificação de Identidade</h3>
        <button class="modal-close" onclick="closeIdentityModal()">×</button>
      </div>
      <div class="modal-body">
        <p>Para verificar a tua identidade, precisamos de:</p>
        
        <div class="id-upload-section">
          <div class="upload-box" onclick="document.getElementById('idDocInput').click()">
            <span class="upload-icon">📄</span>
            <span class="upload-text">Carregar documento de identificação</span>
            <span class="upload-hint">CC, Passaporte ou Carta de Condução</span>
            <input type="file" id="idDocInput" accept="image/*" style="display:none" onchange="previewIdDoc(this)">
          </div>
          <div id="idDocPreview" class="upload-preview" style="display:none">
            <img src="" alt="Preview" id="idDocImg">
            <button class="remove-preview" onclick="removeIdPreview()">×</button>
          </div>
        </div>
        
        <div class="upload-box selfie-box" onclick="document.getElementById('selfieInput').click()">
          <span class="upload-icon">🤳</span>
          <span class="upload-text">Tirar selfie para comparação</span>
          <span class="upload-hint">A segurar o documento junto ao rosto</span>
          <input type="file" id="selfieInput" accept="image/*" capture="user" style="display:none" onchange="previewSelfie(this)">
        </div>
        <div id="selfiePreview" class="upload-preview" style="display:none">
          <img src="" alt="Selfie Preview" id="selfieImg">
          <button class="remove-preview" onclick="removeSelfiePreview()">×</button>
        </div>
        
        <p class="privacy-notice">
          🔒 Os teus documentos são tratados de forma segura e eliminados após verificação.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeIdentityModal()">Cancelar</button>
        <button class="btn btn-primary" id="submitIdVerification" onclick="submitIdentityVerification()">
          Submeter Verificação
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

function closeIdentityModal() {
  const modal = document.getElementById('identityVerificationModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

function previewIdDoc(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('idDocImg').src = e.target.result;
      document.getElementById('idDocPreview').style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function removeIdPreview() {
  document.getElementById('idDocInput').value = '';
  document.getElementById('idDocPreview').style.display = 'none';
}

function previewSelfie(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('selfieImg').src = e.target.result;
      document.getElementById('selfiePreview').style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function removeSelfiePreview() {
  document.getElementById('selfieInput').value = '';
  document.getElementById('selfiePreview').style.display = 'none';
}

async function submitIdentityVerification() {
  const idDoc = document.getElementById('idDocInput')?.files?.[0];
  const selfie = document.getElementById('selfieInput')?.files?.[0];
  
  if (!idDoc) {
    showToast(t('verification.uploadDoc'), 'warning');
    return;
  }
  
  if (!selfie) {
    showToast(t('verification.takeSelfie'), 'warning');
    return;
  }
  
  const btn = document.getElementById('submitIdVerification');
  btn.disabled = true;
  btn.innerHTML = '⏳ A submeter...';
  
  try {
    // Upload documentos
    const storageRef = firebase.storage().ref();
    const timestamp = Date.now();
    
    const idDocRef = storageRef.child(`verification/${currentUser.uid}/${timestamp}_id_doc.jpg`);
    const selfieRef = storageRef.child(`verification/${currentUser.uid}/${timestamp}_selfie.jpg`);
    
    const [idDocSnapshot, selfieSnapshot] = await Promise.all([
      idDocRef.put(idDoc),
      selfieRef.put(selfie)
    ]);
    
    const [idDocUrl, selfieUrl] = await Promise.all([
      idDocSnapshot.ref.getDownloadURL(),
      selfieSnapshot.ref.getDownloadURL()
    ]);
    
    // Criar pedido de verificação
    await db.collection("quest4you_verification_requests").add({
      userId: currentUser.uid,
      type: 'identity',
      status: 'pending',
      idDocUrl: idDocUrl,
      selfieUrl: selfieUrl,
      requestedAt: firebase.firestore.FieldValue.serverTimestamp(),
      userEmail: currentUser.email
    });
    
    closeIdentityModal();
    showToast(t('verification.requestSubmitted'), 'success');
    
  } catch (error) {
    console.error('Error submitting verification:', error);
    showToast(t('verification.submitError'), 'error');
    btn.disabled = false;
    btn.innerHTML = 'Submeter Verificação';
  }
}

// ================================
// CSS Injection for verification modal
// ================================
const verificationStyles = `
.verification-intro {
  color: var(--text-secondary, #4a4a5a);
  margin-bottom: 20px;
  text-align: center;
}

.verification-options {
  margin-bottom: 25px;
}

.verification-option {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid var(--border-color, #e9ecef);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 10px;
}

.verification-option:hover {
  border-color: #6a11cb;
  background: rgba(106, 17, 203, 0.05);
}

.verification-option.premium {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
  border-color: #ffc107;
}

.ver-icon {
  font-size: 1.5rem;
}

.ver-info {
  flex: 1;
}

.ver-info strong {
  display: block;
  color: var(--text-primary, #1a1a2e);
  margin-bottom: 2px;
}

.ver-info span {
  font-size: 0.85rem;
  color: var(--text-muted, #6c757d);
}

.ver-arrow {
  color: var(--text-muted, #6c757d);
}

.verification-benefits {
  background: var(--bg-secondary, #f8f9fa);
  padding: 20px;
  border-radius: 12px;
}

.verification-benefits h4 {
  margin-bottom: 12px;
  color: var(--text-primary, #1a1a2e);
}

.verification-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.verification-benefits li {
  padding: 6px 0;
  color: var(--text-secondary, #4a4a5a);
}

.id-upload-section {
  margin-bottom: 15px;
}

.upload-box {
  border: 2px dashed var(--border-color, #e9ecef);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 15px;
}

.upload-box:hover {
  border-color: #6a11cb;
  background: rgba(106, 17, 203, 0.05);
}

.upload-icon {
  display: block;
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.upload-text {
  display: block;
  font-weight: 500;
  color: var(--text-primary, #1a1a2e);
  margin-bottom: 5px;
}

.upload-hint {
  font-size: 0.85rem;
  color: var(--text-muted, #6c757d);
}

.upload-preview {
  position: relative;
  max-width: 200px;
  margin: 0 auto 15px;
}

.upload-preview img {
  width: 100%;
  border-radius: 8px;
  border: 2px solid var(--border-color, #e9ecef);
}

.remove-preview {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
}

.privacy-notice {
  font-size: 0.85rem;
  color: var(--text-muted, #6c757d);
  text-align: center;
  margin-top: 15px;
  padding: 10px;
  background: var(--bg-secondary, #f8f9fa);
  border-radius: 8px;
}
`;

// Inject styles
if (!document.getElementById('verificationStyles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'verificationStyles';
  styleSheet.textContent = verificationStyles;
  document.head.appendChild(styleSheet);
}

// ================================
// EXPORTS
// ================================
window.isUserVerified = isUserVerified;
window.getUserVerification = getUserVerification;
window.renderVerificationBadge = renderVerificationBadge;
window.addVerificationBadge = addVerificationBadge;
window.requestVerification = requestVerification;
window.approveVerification = approveVerification;
window.revokeVerification = revokeVerification;
window.showVerificationModal = showVerificationModal;
window.closeVerificationModal = closeVerificationModal;
window.startVerification = startVerification;
window.verifyEmail = verifyEmail;
window.showIdentityVerificationForm = showIdentityVerificationForm;
window.closeIdentityModal = closeIdentityModal;
window.previewIdDoc = previewIdDoc;
window.removeIdPreview = removeIdPreview;
window.previewSelfie = previewSelfie;
window.removeSelfiePreview = removeSelfiePreview;
window.submitIdentityVerification = submitIdentityVerification;
