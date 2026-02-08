/**
 * Quest4You - Notification System
 * Sistema de notificações em tempo real
 */

// ================================
// STATE
// ================================
let notificationsUnsubscribe = null;
let notificationsList = [];
let unreadCount = 0;
let previousNotificationIds = new Set();
let isFirstLoad = true;
let pushPermission = 'default';

// ================================
// INITIALIZATION
// ================================
function initNotifications(userId) {
  if (!userId || !db) {
    console.warn("Notifications: userId or db not available");
    return;
  }

  console.log("🔔 Initializing notifications for:", userId);

  // Create notification elements if they don't exist
  createNotificationElements();
  
  // Initialize Push Notifications
  initPushNotifications();

  // Real-time listener for notifications
  notificationsUnsubscribe = db.collection("quest4you_notifications")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(50)
    .onSnapshot((snapshot) => {
      const oldCount = unreadCount;
      notificationsList = [];
      unreadCount = 0;

      snapshot.forEach((doc) => {
        const notification = { id: doc.id, ...doc.data() };
        notificationsList.push(notification);
        if (!notification.read) {
          unreadCount++;
        }
        
        // Show toast for new notifications (not on first load)
        if (!isFirstLoad && !previousNotificationIds.has(doc.id) && !notification.read) {
          showNotificationToast(notification);
          // Send browser push notification if tab is not focused
          if (document.hidden && pushPermission === 'granted') {
            sendBrowserPushNotification(notification);
          }
        }
      });

      // Update previous IDs for next comparison
      previousNotificationIds = new Set(notificationsList.map(n => n.id));
      isFirstLoad = false;

      updateNotificationBadge();
      renderNotificationsList();
      
      // Animate bell if new unread notifications
      if (unreadCount > oldCount) {
        animateNotificationBell();
      }
    }, (error) => {
      console.error("Error loading notifications:", error);
    });
}

// ================================
// PUSH NOTIFICATIONS (Browser)
// ================================
async function initPushNotifications() {
  // Check if browser supports notifications
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return;
  }

  pushPermission = Notification.permission;
  
  // If permission is default, show the enable button
  if (pushPermission === 'default') {
    showPushNotificationPrompt();
  }
}

function showPushNotificationPrompt() {
  // Add a subtle prompt to enable notifications
  const existingPrompt = document.getElementById('pushNotifPrompt');
  if (existingPrompt) return;

  const prompt = document.createElement('div');
  prompt.id = 'pushNotifPrompt';
  prompt.className = 'push-notif-prompt';
  prompt.innerHTML = `
    <div class="push-prompt-content">
      <span class="push-prompt-icon">🔔</span>
      <div class="push-prompt-text">
        <strong>${t('notifications.enableTitle')}</strong>
        <p>${t('notifications.enableDesc')}</p>
      </div>
      <div class="push-prompt-actions">
        <button class="btn btn-primary btn-sm" onclick="requestPushPermission()">${t('notifications.enable')}</button>
        <button class="btn btn-outline btn-sm" onclick="dismissPushPrompt()">${t('notifications.notNow')}</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(prompt);
  
  // Auto dismiss after 10 seconds
  setTimeout(() => {
    dismissPushPrompt();
  }, 10000);
}

async function requestPushPermission() {
  try {
    const permission = await Notification.requestPermission();
    pushPermission = permission;
    
    if (permission === 'granted') {
      console.log('✅ Push notifications enabled');
      showNotificationToast({
        type: 'system',
        message: t('notifications.enabled')
      });
    }
    
    dismissPushPrompt();
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
}

function dismissPushPrompt() {
  const prompt = document.getElementById('pushNotifPrompt');
  if (prompt) {
    prompt.classList.add('hiding');
    setTimeout(() => prompt.remove(), 300);
  }
}

function sendBrowserPushNotification(notification) {
  if (pushPermission !== 'granted') return;

  try {
    const title = getNotificationTitle(notification.type);
    const options = {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id, // Prevents duplicate notifications
      requireInteraction: false,
      silent: false
    };

    const browserNotif = new Notification(title, options);

    // Handle click on notification
    browserNotif.onclick = () => {
      window.focus();
      if (notification.link) {
        window.location.href = notification.link;
      }
      browserNotif.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => browserNotif.close(), 5000);
  } catch (error) {
    console.error('Error sending browser notification:', error);
  }
}

// ================================
// UI ELEMENTS
// ================================
function createNotificationElements() {
  // Check if notification bell already exists
  if (document.getElementById("notificationBell")) return;

  // Find the nav element
  const nav = document.querySelector(".nav");
  if (!nav) return;

  // Create notification container
  const notifContainer = document.createElement("div");
  notifContainer.className = "notification-container";
  notifContainer.innerHTML = `
    <button class="notification-bell" id="notificationBell" onclick="toggleNotificationsPanel()" title="${t('notifications.title')}">
      🔔
      <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
    </button>
    <div class="notifications-panel" id="notificationsPanel" style="display: none;">
      <div class="notifications-header">
        <h3>🔔 ${t('notifications.title')}</h3>
        <button class="btn-mark-all-read" onclick="markAllAsRead()" title="${t('notifications.markAllRead')}">✓</button>
      </div>
      <div class="notifications-list" id="notificationsList">
        <div class="notification-empty">
          <span>🔕</span>
          <p>${t('notifications.empty')}</p>
        </div>
      </div>
    </div>
  `;

  // Insert before the auth link or at the end
  const authLink = document.getElementById("authLink") || document.getElementById("logoutBtn");
  if (authLink && authLink.parentNode === nav) {
    nav.insertBefore(notifContainer, authLink);
  } else {
    nav.appendChild(notifContainer);
  }

  // Close panel on click outside
  document.addEventListener("click", (e) => {
    const panel = document.getElementById("notificationsPanel");
    const bell = document.getElementById("notificationBell");
    if (panel && bell && !panel.contains(e.target) && !bell.contains(e.target)) {
      panel.style.display = "none";
    }
  });
}

// ================================
// RENDER FUNCTIONS
// ================================
function updateNotificationBadge() {
  const badge = document.getElementById("notificationBadge");
  if (!badge) return;

  if (unreadCount > 0) {
    badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
    badge.style.display = "flex";
  } else {
    badge.style.display = "none";
  }
}

function renderNotificationsList() {
  const container = document.getElementById("notificationsList");
  if (!container) return;

  if (notificationsList.length === 0) {
    container.innerHTML = `
      <div class="notification-empty">
        <span>🔕</span>
        <p>${t('notifications.empty')}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notificationsList.map(notif => `
    <div class="notification-item ${notif.read ? 'read' : 'unread'}" 
         onclick="handleNotificationClick('${notif.id}', '${notif.type}', '${notif.link || ''}')"
         data-id="${notif.id}">
      <div class="notification-icon">${getNotificationIcon(notif.type)}</div>
      <div class="notification-content">
        <p class="notification-message">${notif.message}</p>
        <span class="notification-time">${formatNotificationTime(notif.createdAt)}</span>
      </div>
      ${!notif.read ? '<span class="notification-dot"></span>' : ''}
    </div>
  `).join("");
}

function getNotificationIcon(type) {
  const icons = {
    'friend_request': '👋',
    'friend_accepted': '🤝',
    'new_message': '💬',
    'smart_match': '💕',
    'badge_earned': '🏆',
    'system': '📢'
  };
  return icons[type] || '🔔';
}

function formatNotificationTime(timestamp) {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('notifications.now');
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString(I18n.getCurrentLang());
}

// ================================
// ACTIONS
// ================================
function toggleNotificationsPanel() {
  const panel = document.getElementById("notificationsPanel");
  if (!panel) return;

  if (panel.style.display === "none") {
    panel.style.display = "block";
  } else {
    panel.style.display = "none";
  }
}

async function handleNotificationClick(notifId, type, link) {
  // Mark as read
  await markAsRead(notifId);

  // Navigate if there's a link
  if (link) {
    window.location.href = link;
  }
}

async function markAsRead(notifId) {
  if (!db) return;

  try {
    await db.collection("quest4you_notifications").doc(notifId).update({
      read: true,
      readAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

async function markAllAsRead() {
  if (!db) return;

  const unread = notificationsList.filter(n => !n.read);
  
  try {
    const batch = db.batch();
    unread.forEach(notif => {
      const ref = db.collection("quest4you_notifications").doc(notif.id);
      batch.update(ref, { 
        read: true, 
        readAt: firebase.firestore.FieldValue.serverTimestamp() 
      });
    });
    await batch.commit();
    console.log("✅ All notifications marked as read");
  } catch (error) {
    console.error("Error marking all as read:", error);
  }
}

async function deleteNotification(notifId) {
  if (!db) return;

  try {
    await db.collection("quest4you_notifications").doc(notifId).delete();
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
}

// ================================
// CREATE NOTIFICATIONS (Utility functions)
// ================================
async function createNotification(userId, type, message, link = null, data = {}) {
  if (!db) return;

  try {
    await db.collection("quest4you_notifications").add({
      userId: userId,
      type: type,
      message: message,
      link: link,
      data: data,
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("✅ Notification created for:", userId);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

// Helper functions for specific notification types
async function notifyFriendRequest(receiverId, senderName) {
  await createNotification(
    receiverId,
    'friend_request',
    t('notifications.friendRequestMsg', {name: senderName}),
    'profile.html#friendsSection',
    { type: 'friend_request' }
  );
}

async function notifyFriendAccepted(senderId, accepterName) {
  await createNotification(
    senderId,
    'friend_accepted',
    t('notifications.friendAcceptedMsg', {name: accepterName}),
    'profile.html#friendsSection',
    { type: 'friend_accepted' }
  );
}

async function notifyNewMessage(receiverId, senderName, conversationId) {
  await createNotification(
    receiverId,
    'new_message',
    t('notifications.newMessageMsg', {name: senderName}),
    `chat.html?conversation=${conversationId}`,
    { type: 'new_message', conversationId: conversationId }
  );
}

async function notifySmartMatch(userId, matchName, matchId) {
  await createNotification(
    userId,
    'smart_match',
    t('notifications.smartMatchMsg', {name: matchName}),
    'smart-match.html',
    { type: 'smart_match', matchId: matchId }
  );
}

async function notifyBadgeEarned(userId, badgeName) {
  await createNotification(
    userId,
    'badge_earned',
    t('notifications.badgeEarnedMsg', {name: badgeName}),
    'profile.html#badges',
    { type: 'badge_earned', badgeName: badgeName }
  );
}

// ================================
// TOAST NOTIFICATIONS
// ================================
function showNotificationToast(notification) {
  // Remove existing toasts if any (max 3)
  const existingToasts = document.querySelectorAll('.notification-toast');
  if (existingToasts.length >= 3) {
    existingToasts[0].remove();
  }

  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.setAttribute('data-type', notification.type);
  toast.innerHTML = `
    <span class="toast-icon">${getNotificationIcon(notification.type)}</span>
    <div class="toast-content">
      <div class="toast-title">${getNotificationTitle(notification.type)}</div>
      <div class="toast-message">${notification.message}</div>
    </div>
    <button class="toast-close" onclick="event.stopPropagation(); this.parentElement.remove()">×</button>
  `;

  // Click to go to notification link
  toast.addEventListener('click', (e) => {
    if (!e.target.classList.contains('toast-close')) {
      markAsRead(notification.id);
      if (notification.link) {
        window.location.href = notification.link;
      }
      toast.remove();
    }
  });

  document.body.appendChild(toast);

  // Play notification sound (optional)
  playNotificationSound();

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('toast-hiding');
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

function getNotificationTitle(type) {
  const titles = {
    'friend_request': t('notifications.titleFriendRequest'),
    'friend_accepted': t('notifications.titleFriendAccepted'),
    'new_message': t('notifications.titleNewMessage'),
    'smart_match': t('notifications.titleSmartMatch'),
    'badge_earned': t('notifications.titleBadgeEarned'),
    'system': t('notifications.titleSystem')
  };
  return titles[type] || t('notifications.title');
}

function animateNotificationBell() {
  const bell = document.getElementById('notificationBell');
  if (!bell) return;

  bell.classList.add('bell-ringing');
  setTimeout(() => {
    bell.classList.remove('bell-ringing');
  }, 1000);
}

function playNotificationSound() {
  // Create a simple notification sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    // Sound not supported or blocked
    console.log('Notification sound not available');
  }
}

// ================================
// CLEANUP
// ================================
function destroyNotifications() {
  if (notificationsUnsubscribe) {
    notificationsUnsubscribe();
    notificationsUnsubscribe = null;
  }
  notificationsList = [];
  unreadCount = 0;
}

// ================================
// EXPORTS
// ================================
window.initNotifications = initNotifications;
window.destroyNotifications = destroyNotifications;
window.toggleNotificationsPanel = toggleNotificationsPanel;
window.markAsRead = markAsRead;
window.markAllAsRead = markAllAsRead;
window.deleteNotification = deleteNotification;
window.handleNotificationClick = handleNotificationClick;

// Push notification functions
window.requestPushPermission = requestPushPermission;
window.dismissPushPrompt = dismissPushPrompt;

// Notification creation functions
window.createNotification = createNotification;
window.notifyFriendRequest = notifyFriendRequest;
window.notifyFriendAccepted = notifyFriendAccepted;
window.notifyNewMessage = notifyNewMessage;
window.notifySmartMatch = notifySmartMatch;
window.notifyBadgeEarned = notifyBadgeEarned;
