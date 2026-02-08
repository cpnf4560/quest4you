/**
 * Quest4You - Block & Report System
 * Sistema de bloqueio e denúncia de utilizadores
 */

// ================================
// STATE
// ================================
let blockedUsers = new Set();
let blocksUnsubscribe = null;

// ================================
// INITIALIZATION
// ================================
function initBlockSystem(userId) {
  if (!userId || !db) {
    console.warn("Block system: userId or db not available");
    return;
  }

  console.log("🚫 Initializing block system for:", userId);

  // Real-time listener for blocked users
  blocksUnsubscribe = db.collection("quest4you_blocks")
    .where("blockerId", "==", userId)
    .onSnapshot((snapshot) => {
      blockedUsers.clear();
      snapshot.forEach((doc) => {
        const data = doc.data();
        blockedUsers.add(data.blockedId);
      });
      console.log("Blocked users loaded:", blockedUsers.size);
    }, (error) => {
      console.error("Error loading blocked users:", error);
    });
}

// ================================
// CHECK BLOCKED
// ================================
function isUserBlocked(userId) {
  return blockedUsers.has(userId);
}

function isBlockedByUser(userId) {
  // This would require checking if the other user blocked current user
  // For privacy, we might not expose this directly
  return false;
}

// ================================
// BLOCK USER
// ================================
async function blockUser(userId, reason = '') {
  if (!db || !auth.currentUser) {
    alert(t('blocks.authError'));
    return false;
  }

  const currentUserId = auth.currentUser.uid;
  
  if (userId === currentUserId) {
    alert(t('blocks.cantBlockSelf'));
    return false;
  }

  // Check if admin - can't block admin
  if (typeof ADMIN_CONFIG !== 'undefined' && userId === ADMIN_CONFIG.uid) {
    alert(t('blocks.cantBlockAdmin'));
    return false;
  }

  try {
    // Check if already blocked
    const existingBlock = await db.collection("quest4you_blocks")
      .where("blockerId", "==", currentUserId)
      .where("blockedId", "==", userId)
      .get();

    if (!existingBlock.empty) {
      alert(t('blocks.alreadyBlocked'));
      return false;
    }

    // Create block
    await db.collection("quest4you_blocks").add({
      blockerId: currentUserId,
      blockedId: userId,
      reason: reason,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Also remove friendship if exists
    await removeFriendshipAfterBlock(currentUserId, userId);

    console.log("✅ User blocked:", userId);
    return true;
  } catch (error) {
    console.error("Error blocking user:", error);
    alert(t('blocks.blockError'));
    return false;
  }
}

// ================================
// UNBLOCK USER
// ================================
async function unblockUser(userId) {
  if (!db || !auth.currentUser) {
    alert(t('blocks.authError'));
    return false;
  }

  const currentUserId = auth.currentUser.uid;

  try {
    const blockQuery = await db.collection("quest4you_blocks")
      .where("blockerId", "==", currentUserId)
      .where("blockedId", "==", userId)
      .get();

    if (blockQuery.empty) {
      console.log("User not blocked");
      return false;
    }

    // Delete all blocks (should be only one)
    const batch = db.batch();
    blockQuery.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    console.log("✅ User unblocked:", userId);
    return true;
  } catch (error) {
    console.error("Error unblocking user:", error);
    alert(t('blocks.unblockError'));
    return false;
  }
}

// ================================
// REMOVE FRIENDSHIP AFTER BLOCK
// ================================
async function removeFriendshipAfterBlock(userId1, userId2) {
  try {
    // Find and delete any friendship between these users
    const sentQuery = await db.collection("quest4you_friendships")
      .where("senderId", "==", userId1)
      .where("receiverId", "==", userId2)
      .get();

    const receivedQuery = await db.collection("quest4you_friendships")
      .where("senderId", "==", userId2)
      .where("receiverId", "==", userId1)
      .get();

    const batch = db.batch();
    
    sentQuery.docs.forEach(doc => batch.delete(doc.ref));
    receivedQuery.docs.forEach(doc => batch.delete(doc.ref));
    
    if (!sentQuery.empty || !receivedQuery.empty) {
      await batch.commit();
      console.log("Friendship removed after block");
    }
  } catch (error) {
    console.error("Error removing friendship:", error);
  }
}

// ================================
// REPORT USER
// ================================
async function reportUser(userId, reason, details = '') {
  if (!db || !auth.currentUser) {
    alert(t('blocks.authError'));
    return false;
  }

  const currentUserId = auth.currentUser.uid;

  if (userId === currentUserId) {
    alert(t('blocks.cantReportSelf'));
    return false;
  }

  try {
    // Get reported user info
    const userDoc = await db.collection("quest4you_users").doc(userId).get();
    const reportedUserData = userDoc.exists ? userDoc.data() : {};

    // Get reporter info
    const reporterDoc = await db.collection("quest4you_users").doc(currentUserId).get();
    const reporterData = reporterDoc.exists ? reporterDoc.data() : {};

    await db.collection("quest4you_reports").add({
      reporterId: currentUserId,
      reporterName: reporterData.displayName || reporterData.nickname || t('blocks.anonymous'),
      reporterEmail: auth.currentUser.email,
      reportedId: userId,
      reportedName: reportedUserData.displayName || reportedUserData.nickname || t('blocks.unknown'),
      reportedEmail: reportedUserData.email || '',
      reason: reason,
      details: details,
      status: 'pending', // pending, reviewing, resolved, dismissed
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log("✅ Report submitted for:", userId);
    return true;
  } catch (error) {
    console.error("Error reporting user:", error);
    alert(t('blocks.reportError'));
    return false;
  }
}

// ================================
// GET BLOCKED USERS LIST
// ================================
async function getBlockedUsersList() {
  if (!db || !auth.currentUser) return [];

  try {
    const blocksQuery = await db.collection("quest4you_blocks")
      .where("blockerId", "==", auth.currentUser.uid)
      .orderBy("createdAt", "desc")
      .get();

    const blockedList = [];
    
    for (const doc of blocksQuery.docs) {
      const data = doc.data();
      
      // Get blocked user info
      const userDoc = await db.collection("quest4you_users").doc(data.blockedId).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      
      blockedList.push({
        blockId: doc.id,
        blockedId: data.blockedId,
        blockedName: userData.displayName || userData.nickname || t('profile.defaultUserName'),
        blockedPhoto: userData.photos?.public || null,
        reason: data.reason,
        createdAt: data.createdAt
      });
    }
    
    return blockedList;
  } catch (error) {
    console.error("Error getting blocked list:", error);
    return [];
  }
}

// ================================
// BLOCK/REPORT MODAL
// ================================
function showBlockReportModal(userId, userName) {
  // Remove existing modal if any
  const existingModal = document.getElementById('blockReportModal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'blockReportModal';
  modal.className = 'modal';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="modal-close" onclick="closeBlockReportModal()">×</button>
      <h2>⚠️ ${t('blocks.blockOrReport')}</h2>
      <p class="modal-desc">${t('blocks.whatToDo', {name: userName})}</p>
      
      <div class="block-report-options">
        <div class="option-card" onclick="selectBlockOption('block')">
          <div class="option-icon">🚫</div>
          <div class="option-info">
            <h4>${t('blocks.block')}</h4>
            <p>${t('blocks.blockDesc')}</p>
          </div>
        </div>
        
        <div class="option-card" onclick="selectBlockOption('report')">
          <div class="option-icon">⚠️</div>
          <div class="option-info">
            <h4>${t('blocks.report')}</h4>
            <p>${t('blocks.reportDesc')}</p>
          </div>
        </div>
        
        <div class="option-card" onclick="selectBlockOption('both')">
          <div class="option-icon">🛡️</div>
          <div class="option-info">
            <h4>${t('blocks.blockAndReport')}</h4>
            <p>${t('blocks.blockAndReportDesc')}</p>
          </div>
        </div>
      </div>
      
      <div class="block-report-form" id="blockReportForm" style="display: none;">
        <div class="form-group">
          <label class="form-label">${t('blocks.reason')}</label>
          <select id="reportReason" class="form-select">
            <option value="">${t('blocks.selectReason')}</option>
            <option value="harassment">${t('blocks.reasonHarassment')}</option>
            <option value="spam">${t('blocks.reasonSpam')}</option>
            <option value="fake">${t('blocks.reasonFake')}</option>
            <option value="inappropriate">${t('blocks.reasonInappropriate')}</option>
            <option value="threat">${t('blocks.reasonThreat')}</option>
            <option value="underage">${t('blocks.reasonUnderage')}</option>
            <option value="other">${t('blocks.reasonOther')}</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">${t('blocks.detailsLabel')}</label>
          <textarea id="reportDetails" class="form-textarea" rows="3" placeholder="${t('blocks.detailsPlaceholder')}"></textarea>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-outline" onclick="closeBlockReportModal()">${t('blocks.cancel')}</button>
          <button class="btn btn-danger" id="confirmBlockReport" onclick="confirmBlockReport('${userId}')">
            ${t('blocks.confirm')}
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  // Store selected option
  modal.dataset.selectedOption = '';
  modal.dataset.userId = userId;
  modal.dataset.userName = userName;
}

function selectBlockOption(option) {
  const modal = document.getElementById('blockReportModal');
  const form = document.getElementById('blockReportForm');
  
  if (!modal || !form) return;
  
  modal.dataset.selectedOption = option;
  
  // Highlight selected option
  document.querySelectorAll('.option-card').forEach(card => {
    card.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
  
  // Show form for report options
  if (option === 'report' || option === 'both') {
    form.style.display = 'block';
  } else {
    form.style.display = 'block';
    // For block only, reason is optional
  }
}

async function confirmBlockReport(userId) {
  const modal = document.getElementById('blockReportModal');
  if (!modal) return;
  
  const option = modal.dataset.selectedOption;
  const reason = document.getElementById('reportReason')?.value || '';
  const details = document.getElementById('reportDetails')?.value || '';
  
  if (!option) {
    alert(t('blocks.selectOption'));
    return;
  }
  
  if ((option === 'report' || option === 'both') && !reason) {
    alert(t('blocks.selectReasonAlert'));
    return;
  }
  
  // Disable button
  const btn = document.getElementById('confirmBlockReport');
  if (btn) {
    btn.disabled = true;
    btn.textContent = t('blocks.processing');
  }
  
  let success = true;
  
  if (option === 'block' || option === 'both') {
    success = await blockUser(userId, reason);
  }
  
  if (success && (option === 'report' || option === 'both')) {
    success = await reportUser(userId, reason, details);
  }
  
  closeBlockReportModal();
  
  if (success) {
    // Show success message
    if (typeof showNotificationToast === 'function') {
      showNotificationToast({
        type: 'system',
        message: option === 'block' ? t('blocks.userBlocked') : 
                 option === 'report' ? t('blocks.reportSent') :
                 t('blocks.blockedAndReported')
      });
    } else {
      alert(option === 'block' ? t('blocks.userBlocked') : 
            option === 'report' ? t('blocks.reportSent') :
            t('blocks.blockedAndReported'));
    }
    
    // Refresh friends list if on profile page
    if (typeof loadFriends === 'function') {
      loadFriends();
    }
  }
}

function closeBlockReportModal() {
  const modal = document.getElementById('blockReportModal');
  if (modal) modal.remove();
}

// ================================
// CLEANUP
// ================================
function destroyBlockSystem() {
  if (blocksUnsubscribe) {
    blocksUnsubscribe();
    blocksUnsubscribe = null;
  }
  blockedUsers.clear();
}

// ================================
// EXPORTS
// ================================
window.initBlockSystem = initBlockSystem;
window.destroyBlockSystem = destroyBlockSystem;
window.isUserBlocked = isUserBlocked;
window.blockUser = blockUser;
window.unblockUser = unblockUser;
window.reportUser = reportUser;
window.getBlockedUsersList = getBlockedUsersList;
window.showBlockReportModal = showBlockReportModal;
window.selectBlockOption = selectBlockOption;
window.confirmBlockReport = confirmBlockReport;
window.closeBlockReportModal = closeBlockReportModal;
