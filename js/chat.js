/**
 * Quest4You - Chat System
 * Mensagens privadas entre amigos
 */

// ================================
// STATE
// ================================
let currentUser = null;
let currentConversation = null;
let currentFriend = null;
let conversations = [];
let messagesUnsubscribe = null;
let conversationsUnsubscribe = null;
let typingUnsubscribe = null;
let typingTimeout = null;
let isTyping = false;
let conversationsLoadedResolve = null;
let conversationsLoaded = new Promise(resolve => { conversationsLoadedResolve = resolve; });
let openingFriendConversation = false;

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

  // Logout button  document.getElementById("logoutBtn")?.addEventListener("click", logout);

  // Check for friend ID in URL (supports both 'friend' and 'userId' params)
  const urlParams = new URLSearchParams(window.location.search);
  const friendId = urlParams.get('friend') || urlParams.get('userId');
  if (friendId) {
    // Will open conversation after auth
    window.pendingFriendId = friendId;
  }

  // Close emoji picker on click outside
  document.addEventListener('click', function(e) {
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiBtn = document.querySelector('.btn-emoji');
    if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
      emojiPicker.style.display = 'none';
    }
  });
});

// ================================
// AUTH
// ================================
function handleAuthChange(user) {
  if (user) {
    currentUser = user;
    console.log("User logged in:", user.email);
    
    // Initialize notifications
    if (typeof initNotifications === "function") {
      initNotifications(user.uid);
    }
    
    // Hide empty state while loading if we have a pending friend
    if (window.pendingFriendId) {
      const empty = document.getElementById("emptyConversations");
      if (empty) empty.style.display = 'none';
    }
    
    loadConversations();
    
    // Open pending conversation after conversations are loaded
    if (window.pendingFriendId) {
      const friendId = window.pendingFriendId;
      delete window.pendingFriendId;
      openingFriendConversation = true;
      conversationsLoaded.then(() => {
        openConversationWithFriend(friendId).finally(() => {
          openingFriendConversation = false;
        });
      });
    }
  } else {
    console.log("User not logged in, redirecting...");
    window.location.href = "auth.html?redirect=" + encodeURIComponent(window.location.href);
  }
}

async function logout() {
  try {
    // Unsubscribe from listeners
    if (messagesUnsubscribe) messagesUnsubscribe();
    if (conversationsUnsubscribe) conversationsUnsubscribe();
    if (typingUnsubscribe) typingUnsubscribe();
    
    await auth.signOut();
    window.location.href = "../index.html";
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// ================================
// CONVERSATIONS
// ================================
async function loadConversations() {
  if (!currentUser || !db) return;

  // Real-time listener for conversations
  conversationsUnsubscribe = db.collection("quest4you_conversations")
    .where("participants", "array-contains", currentUser.uid)
    .orderBy("lastMessageAt", "desc")
    .onSnapshot(async (snapshot) => {
      conversations = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const friendId = data.participants.find(p => p !== currentUser.uid);
        
        // Get friend info
        const friendDoc = await db.collection("quest4you_users").doc(friendId).get();
        const friendData = friendDoc.exists ? friendDoc.data() : {};
        
        conversations.push({
          id: doc.id,
          friendId: friendId,
          friendName: friendData.displayName || friendData.nickname || 'Utilizador',
          friendNickname: friendData.nickname ? `${friendData.nicknameEmoji || '👤'} ${friendData.nickname}` : null,
          friendPhoto: friendData.photos?.public || null,
          lastMessage: data.lastMessage || '',
          lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
          unreadCount: data.unreadCount?.[currentUser.uid] || 0
        });
      }
        renderConversations();
      updateTotalUnread();
      
      // Signal that conversations are loaded (first snapshot)
      if (conversationsLoadedResolve) {
        conversationsLoadedResolve();
        conversationsLoadedResolve = null;
      }
    }, (error) => {
      console.error("Error loading conversations:", error);
      // Resolve even on error so pending friend flow doesn't hang
      if (conversationsLoadedResolve) {
        conversationsLoadedResolve();
        conversationsLoadedResolve = null;
      }
    });
}

function renderConversations() {
  const list = document.getElementById("conversationsList");
  const empty = document.getElementById("emptyConversations");
  
  if (!list) return;
    if (conversations.length === 0) {
    list.innerHTML = '';
    // Don't show "Ver Amigos" redirect while actively opening a friend conversation
    if (!openingFriendConversation) {
      list.appendChild(empty);
      empty.style.display = 'block';
    }
    return;
  }
  
  empty.style.display = 'none';
  
  list.innerHTML = conversations.map(conv => `
    <div class="conversation-item ${conv.id === currentConversation?.id ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}" 
         onclick="openConversation('${conv.id}')">
      <div class="conversation-avatar">
        ${conv.friendPhoto 
          ? `<img src="${conv.friendPhoto}" alt="${conv.friendName}">`
          : conv.friendName.charAt(0).toUpperCase()
        }
      </div>
      <div class="conversation-info">
        <div class="conversation-header">
          <span class="conversation-name">${conv.friendName}</span>
          <span class="conversation-time">${formatMessageTime(conv.lastMessageAt)}</span>
        </div>
        <div class="conversation-preview">${conv.lastMessage || 'Nova conversa'}</div>
      </div>
      ${conv.unreadCount > 0 ? `<span class="conversation-unread-count">${conv.unreadCount}</span>` : ''}
    </div>
  `).join('');
}

function filterConversations(query) {
  query = query.toLowerCase().trim();
  const items = document.querySelectorAll('.conversation-item');
  
  items.forEach(item => {
    const name = item.querySelector('.conversation-name')?.textContent.toLowerCase() || '';
    item.style.display = name.includes(query) ? 'flex' : 'none';
  });
}

function updateTotalUnread() {
  const total = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
  const badge = document.getElementById('totalUnreadBadge');
  
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? 'inline' : 'none';
  }
  
  // Update page title
  document.title = total > 0 ? `(${total}) Chat - Quest4You` : 'Chat - Quest4You';
}

// ================================
// OPEN CONVERSATION
// ================================
async function openConversation(conversationId) {
  const conv = conversations.find(c => c.id === conversationId);
  if (!conv) return;
  
  currentConversation = conv;
  currentFriend = {
    id: conv.friendId,
    name: conv.friendName,
    nickname: conv.friendNickname,
    photo: conv.friendPhoto
  };
  
  // Update UI
  document.getElementById('noConversation').style.display = 'none';
  document.getElementById('activeChat').style.display = 'flex';
  
  // Update header
  updateChatHeader();
  
  // Mark as active in list
  document.querySelectorAll('.conversation-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[onclick="openConversation('${conversationId}')"]`)?.classList.add('active');
  
  // Load messages
  loadMessages(conversationId);
  
  // Mark as read
  markConversationAsRead(conversationId);
  
  // Mobile: show chat area
  document.getElementById('conversationsSidebar')?.classList.add('hidden');
}

async function openConversationWithFriend(friendId) {
  // Check if conversation exists
  let existingConv = conversations.find(c => c.friendId === friendId);
  
  if (existingConv) {
    openConversation(existingConv.id);
    return;
  }
  
  // Create new conversation
  try {
    const friendDoc = await db.collection("quest4you_users").doc(friendId).get();
    
    // Se não encontrar o utilizador mas for o admin do sistema, criar com dados do config
    let friendData = null;
    let isAdminConversation = false;
    
    if (friendDoc.exists) {
      friendData = friendDoc.data();
    } else if (typeof ADMIN_CONFIG !== 'undefined' && friendId === ADMIN_CONFIG.uid) {
      // É o admin do sistema - criar com dados do config
      isAdminConversation = true;
      friendData = {
        displayName: ADMIN_CONFIG.displayName,
        nickname: ADMIN_CONFIG.nickname,
        nicknameEmoji: ADMIN_CONFIG.nicknameEmoji,
        photos: { public: ADMIN_CONFIG.photo }
      };
    } else {
      alert("Utilizador não encontrado.");
      return;
    }
    
    // Verificar se é conversa com o admin
    if (typeof ADMIN_CONFIG !== 'undefined' && friendId === ADMIN_CONFIG.uid) {
      isAdminConversation = true;
    }
    
    const conversationRef = await db.collection("quest4you_conversations").add({
      participants: [currentUser.uid, friendId],
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessage: isAdminConversation ? 'Bem-vindo ao Quest4You!' : '',
      unreadCount: {
        [currentUser.uid]: isAdminConversation ? 1 : 0, // Se for admin, tem 1 mensagem de boas-vindas
        [friendId]: 0
      },
      isAdminConversation: isAdminConversation
    });
    
    // Se for conversa com o admin, enviar mensagem de boas-vindas automaticamente
    if (isAdminConversation && typeof WELCOME_MESSAGE !== 'undefined') {
      await sendWelcomeMessage(conversationRef.id, friendId);
    }
      // Wait for conversation to appear in list via snapshot, then open it
    const convId = conversationRef.id;
    const maxRetries = 20; // 20 x 250ms = 5 seconds max
    let retries = 0;
    const waitForConversation = () => {
      const found = conversations.find(c => c.id === convId);
      if (found) {
        openConversation(convId);
      } else if (retries < maxRetries) {
        retries++;
        setTimeout(waitForConversation, 250);
      } else {
        // Fallback: force open even if not in list yet
        console.warn("Conversation not found in list after retries, opening directly");
        openConversation(convId);
      }
    };
    waitForConversation();
    
  } catch (error) {
    console.error("Error creating conversation:", error);
    alert("Erro ao criar conversa. Tenta novamente.");
  }
}

function updateChatHeader() {
  if (!currentFriend) return;
  
  const avatar = document.getElementById('chatUserAvatar');
  const name = document.getElementById('chatUserName');
  
  if (avatar) {
    if (currentFriend.photo) {
      avatar.innerHTML = `<img src="${currentFriend.photo}" alt="${currentFriend.name}">`;
    } else {
      avatar.textContent = currentFriend.name.charAt(0).toUpperCase();
    }
  }
  
  if (name) {
    name.textContent = currentFriend.name;
  }
}

// ================================
// MESSAGES
// ================================
function loadMessages(conversationId) {
  if (messagesUnsubscribe) {
    messagesUnsubscribe();
  }
  if (typingUnsubscribe) {
    typingUnsubscribe();
  }
  
  const messagesList = document.getElementById('messagesList');
  if (!messagesList) return;
  
  // Real-time listener for messages
  messagesUnsubscribe = db.collection("quest4you_messages")
    .where("conversationId", "==", conversationId)
    .orderBy("createdAt", "asc")
    .onSnapshot((snapshot) => {
      const messages = [];
      let lastDate = null;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const messageDate = data.createdAt?.toDate() || new Date();
        const dateStr = formatDateSeparator(messageDate);
        
        // Add date separator if needed
        if (dateStr !== lastDate) {
          messages.push({ type: 'date', date: dateStr });
          lastDate = dateStr;
        }
        
        // Verifica se é mensagem do sistema (welcome message)
        const isSystemMessage = data.messageType === 'system_welcome' || data.isSystem === true;
        
        messages.push({
          type: 'message',
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          createdAt: messageDate,
          isSent: data.senderId === currentUser.uid,
          isSystem: isSystemMessage,
          messageType: data.messageType,
          readAt: data.readAt,
          readBy: data.readBy || []
        });
        
        // Mark message as read if it's from friend
        if (data.senderId !== currentUser.uid && !data.readBy?.includes(currentUser.uid)) {
          markMessageAsRead(doc.id);
        }
      });
      
      renderMessages(messages);
      scrollToBottom();
    }, (error) => {
      console.error("Error loading messages:", error);
    });
  
  // Listen for typing indicator
  listenForTyping(conversationId);
}

// ================================
// TYPING INDICATOR
// ================================
function listenForTyping(conversationId) {
  if (typingUnsubscribe) {
    typingUnsubscribe();
  }
  
  typingUnsubscribe = db.collection("quest4you_conversations")
    .doc(conversationId)
    .onSnapshot((doc) => {
      if (!doc.exists || !currentFriend) return;
      
      const data = doc.data();
      const typingUsers = data.typing || {};
      const friendTyping = typingUsers[currentFriend.id];
      
      // Show typing indicator if friend is typing (within last 3 seconds)
      if (friendTyping) {
        const typingTime = friendTyping.toDate ? friendTyping.toDate() : new Date(friendTyping);
        const now = new Date();
        const diffSeconds = (now - typingTime) / 1000;
        
        if (diffSeconds < 3) {
          showTypingIndicator(currentFriend.name);
        } else {
          hideTypingIndicator();
        }
      } else {
        hideTypingIndicator();
      }
    });
}

function showTypingIndicator(name) {
  let indicator = document.getElementById('typingIndicator');
  
  if (!indicator) {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    indicator = document.createElement('div');
    indicator.id = 'typingIndicator';
    indicator.className = 'typing-indicator-wrapper';
    indicator.innerHTML = `
      <div class="typing-indicator">
        <span class="typing-text"><strong>${name.split(' ')[0]}</strong> está a escrever</span>
        <span class="typing-dots">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </span>
      </div>
    `;
    
    messagesContainer.appendChild(indicator);
    scrollToBottom();
  }
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.remove();
  }
}

// Called when user is typing
function handleTyping() {
  if (!currentConversation || !currentUser) return;
  
  // Clear previous timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  
  // Update typing status if not already set
  if (!isTyping) {
    isTyping = true;
    updateTypingStatus(true);
  }
  
  // Stop typing after 2 seconds of inactivity
  typingTimeout = setTimeout(() => {
    isTyping = false;
    updateTypingStatus(false);
  }, 2000);
}

async function updateTypingStatus(typing) {
  if (!currentConversation || !currentUser) return;
  
  try {
    const updateData = {};
    if (typing) {
      updateData[`typing.${currentUser.uid}`] = firebase.firestore.FieldValue.serverTimestamp();
    } else {
      updateData[`typing.${currentUser.uid}`] = firebase.firestore.FieldValue.delete();
    }
    
    await db.collection("quest4you_conversations")
      .doc(currentConversation.id)
      .update(updateData);
  } catch (error) {
    // Ignore errors - typing indicator is not critical
  }
}

// ================================
// MESSAGE READ STATUS
// ================================
async function markMessageAsRead(messageId) {
  try {
    await db.collection("quest4you_messages").doc(messageId).update({
      readAt: firebase.firestore.FieldValue.serverTimestamp(),
      readBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
    });
  } catch (error) {
    // Ignore errors - read status is not critical
  }
}

function renderMessages(messages) {
  const messagesList = document.getElementById('messagesList');
  if (!messagesList) return;
  
  messagesList.innerHTML = messages.map(item => {
    if (item.type === 'date') {
      return `<div class="date-separator"><span>${item.date}</span></div>`;
    }
    
    // Mensagem do sistema (boas-vindas)
    if (item.isSystem) {
      return `
        <div class="message system-message">
          <div class="system-message-icon">🎯</div>
          <div class="message-bubble system-bubble">${formatSystemMessage(item.text)}</div>
        </div>
      `;
    }
    
    // Determine read status for sent messages
    const isRead = item.isSent && item.readBy && item.readBy.length > 0 && item.readBy.includes(currentFriend?.id);
    const readStatusIcon = item.isSent ? (isRead ? '✓✓' : '✓') : '';
    const readStatusClass = isRead ? 'read' : 'sent';
    
    return `
      <div class="message ${item.isSent ? 'sent' : 'received'}">
        <div class="message-bubble">${escapeHtml(item.text)}</div>
        <div class="message-meta">
          <span class="message-time">${formatMessageTime(item.createdAt)}</span>
          ${item.isSent ? `<span class="message-status ${readStatusClass}">${readStatusIcon}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Formata mensagem do sistema com markdown básico
function formatSystemMessage(text) {
  if (!text) return '';
  
  // Escape HTML primeiro
  let formatted = escapeHtml(text);
  
  // Converte **bold** para <strong>
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Converte quebras de linha para <br>
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
}

// Envia mensagem de boas-vindas automática do admin
async function sendWelcomeMessage(conversationId, adminId) {
  if (!WELCOME_MESSAGE || !WELCOME_MESSAGE.text) return;
  
  try {
    await db.collection("quest4you_messages").add({
      conversationId: conversationId,
      senderId: adminId, // Mensagem enviada "pelo admin"
      receiverId: currentUser.uid,
      text: WELCOME_MESSAGE.text,
      messageType: WELCOME_MESSAGE.type || 'system_welcome',
      isSystem: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log("Welcome message sent successfully");
  } catch (error) {
    console.error("Error sending welcome message:", error);
  }
}

async function sendMessage() {
  const input = document.getElementById('messageInput');
  const text = input.value.trim();
  
  if (!text || !currentConversation) return;
  
  try {
    // Add message
    await db.collection("quest4you_messages").add({
      conversationId: currentConversation.id,
      senderId: currentUser.uid,
      receiverId: currentFriend.id,
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update conversation
    await db.collection("quest4you_conversations").doc(currentConversation.id).update({
      lastMessage: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
      [`unreadCount.${currentFriend.id}`]: firebase.firestore.FieldValue.increment(1)
    });
    
    // Send notification to friend
    const senderName = currentUser.displayName || 'Alguém';
    if (typeof notifyNewMessage === "function") {
      await notifyNewMessage(currentFriend.id, senderName, currentConversation.id);
    }
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    // Close emoji picker
    document.getElementById('emojiPicker').style.display = 'none';
    
  } catch (error) {
    console.error("Error sending message:", error);
    alert("Erro ao enviar mensagem.");
  }
}

async function markConversationAsRead(conversationId) {
  try {
    await db.collection("quest4you_conversations").doc(conversationId).update({
      [`unreadCount.${currentUser.uid}`]: 0
    });
  } catch (error) {
    console.error("Error marking as read:", error);
  }
}

function handleMessageKeydown(event) {
  // Trigger typing indicator
  handleTyping();
  
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    // Clear typing status before sending
    isTyping = false;
    updateTypingStatus(false);
    sendMessage();
  }
}

function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  
  // Also trigger typing indicator
  handleTyping();
}

function scrollToBottom() {
  const container = document.getElementById('messagesContainer');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// ================================
// EMOJI PICKER
// ================================
function toggleEmojiPicker() {
  const picker = document.getElementById('emojiPicker');
  if (picker) {
    picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
  }
}

function insertEmoji(emoji) {
  const input = document.getElementById('messageInput');
  if (input) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    input.value = input.value.substring(0, start) + emoji + input.value.substring(end);
    input.selectionStart = input.selectionEnd = start + emoji.length;
    input.focus();
  }
}

// ================================
// COMPARE RESULTS
// ================================
async function compareResultsWithFriend() {
  if (!currentFriend) return;
  
  const modal = document.getElementById('compareResultsModal');
  const header = document.getElementById('compareHeader');
  const body = document.getElementById('compareBody');
  
  if (!modal || !header || !body) return;
  
  // Show modal with loading
  modal.style.display = 'flex';
  body.innerHTML = '<div class="loading-spinner">⏳ A carregar...</div>';
  
  try {
    // Get current user data
    const myDoc = await db.collection("quest4you_users").doc(currentUser.uid).get();
    const myData = myDoc.data() || {};
    
    // Get friend data
    const friendDoc = await db.collection("quest4you_users").doc(currentFriend.id).get();
    const friendData = friendDoc.data() || {};
    
    // Render header
    header.innerHTML = `
      <div class="compare-user">
        <div class="compare-avatar">
          ${myData.photos?.public 
            ? `<img src="${myData.photos.public}" alt="Tu">`
            : (myData.displayName || 'T').charAt(0).toUpperCase()
          }
        </div>
        <div class="compare-name">${myData.displayName || 'Tu'}</div>
      </div>
      <div class="compare-vs">VS</div>
      <div class="compare-user">
        <div class="compare-avatar">
          ${currentFriend.photo 
            ? `<img src="${currentFriend.photo}" alt="${currentFriend.name}">`
            : currentFriend.name.charAt(0).toUpperCase()
          }
        </div>
        <div class="compare-name">${currentFriend.name}</div>
      </div>
    `;
    
    // Find common quizzes
    const myResults = myData.quizResults || {};
    const friendResults = friendData.quizResults || {};
    
    const commonQuizzes = Object.keys(myResults).filter(q => friendResults[q]);
    
    if (commonQuizzes.length === 0) {
      body.innerHTML = `
        <div class="no-common-quizzes">
          <div class="empty-icon">📊</div>
          <p>Ainda não têm questionários em comum.</p>
          <p style="font-size: 0.9rem; color: var(--text-lighter);">Convida o teu amigo a fazer os mesmos questionários que tu!</p>
        </div>
      `;
      return;
    }
    
    // Render comparisons
    let totalCompatibility = 0;
    let quizCount = 0;
    
    const quizNames = {
      'vanilla': { name: '💕 Vanilla ou Kink', emoji: '💕' },
      'orientation': { name: '🌈 Orientação Sexual', emoji: '🌈' },
      'cuckold': { name: '👀 Stag/Cuckold', emoji: '👀' },
      'swing': { name: '💜 Swing/Poliamor', emoji: '💜' },
      'kinks': { name: '🔥 Fetiches & Kinks', emoji: '🔥' },
      'bdsm': { name: '⛓️ BDSM', emoji: '⛓️' },
      'fantasies': { name: '🌙 Fantasias', emoji: '🌙' },
      'adventure': { name: '🎪 Aventura', emoji: '🎪' },
      'exhibitionism': { name: '👁️ Exibicionismo', emoji: '👁️' }
    };
    
    let quizzesHtml = '';
    
    for (const quizId of commonQuizzes) {
      const myScore = myResults[quizId]?.score || 0;
      const friendScore = friendResults[quizId]?.score || 0;
      const quizInfo = quizNames[quizId] || { name: quizId, emoji: '📝' };
      
      // Calculate compatibility for this quiz (100 - difference)
      const compatibility = 100 - Math.abs(myScore - friendScore);
      totalCompatibility += compatibility;
      quizCount++;
      
      quizzesHtml += `
        <div class="compare-quiz">
          <div class="compare-quiz-title">${quizInfo.emoji} ${quizInfo.name}</div>
          <div class="compare-bars">
            <div class="compare-bar-row">
              <span class="compare-bar-label">Tu</span>
              <div class="compare-bar-container">
                <div class="compare-bar">
                  <div class="compare-bar-fill user1" style="width: ${myScore}%"></div>
                </div>
                <span class="compare-bar-value" style="color: var(--cardinal-red)">${myScore}%</span>
              </div>
            </div>
            <div class="compare-bar-row">
              <span class="compare-bar-label">${currentFriend.name.split(' ')[0]}</span>
              <div class="compare-bar-container">
                <div class="compare-bar">
                  <div class="compare-bar-fill user2" style="width: ${friendScore}%"></div>
                </div>
                <span class="compare-bar-value" style="color: var(--deep-purple)">${friendScore}%</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    // Calculate overall compatibility
    const overallCompatibility = Math.round(totalCompatibility / quizCount);
    
    body.innerHTML = quizzesHtml + `
      <div class="compare-compatibility">
        <div class="compatibility-score">${overallCompatibility}%</div>
        <div class="compatibility-label">Compatibilidade Global</div>
      </div>
    `;
    
  } catch (error) {
    console.error("Error comparing results:", error);
    body.innerHTML = `
      <div class="no-common-quizzes">
        <div class="empty-icon">❌</div>
        <p>Erro ao carregar resultados.</p>
      </div>
    `;
  }
}

function closeCompareModal() {
  const modal = document.getElementById('compareResultsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// ================================
// VIEW FRIEND PROFILE
// ================================
function viewFriendProfileFromChat() {
  if (currentFriend) {
    window.location.href = `profile.html?viewFriend=${currentFriend.id}`;
  }
}

// ================================
// MOBILE
// ================================
function closeChatMobile() {
  document.getElementById('conversationsSidebar')?.classList.remove('hidden');
  document.getElementById('noConversation').style.display = 'flex';
  document.getElementById('activeChat').style.display = 'none';
  currentConversation = null;
  currentFriend = null;
}

// ================================
// UTILITIES
// ================================
function formatMessageTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const diff = now - date;
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  } else if (isYesterday) {
    return 'Ontem';
  } else if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString('pt-PT', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
  }
}

function formatDateSeparator(date) {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now - 86400000).toDateString() === date.toDateString();
  
  if (isToday) return 'Hoje';
  if (isYesterday) return 'Ontem';
  
  return date.toLocaleDateString('pt-PT', { 
    day: '2-digit', 
    month: 'long',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ================================
// TAB SWITCHING (Conversations/Groups)
// ================================
function switchChatTab(tab, btn) {
  // Update active tab button
  document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
  btn?.classList.add('active');
  
  // Update active tab content
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  if (tab === 'groups') {
    document.getElementById('groupsTab')?.classList.add('active');
    // Load groups if function exists
    if (typeof loadUserGroups === 'function') {
      loadUserGroups();
    }
  } else {
    document.getElementById('conversationsTab')?.classList.add('active');
  }
}

// ================================
// EXPORTS
// ================================
window.openConversation = openConversation;
window.openConversationWithFriend = openConversationWithFriend;
window.filterConversations = filterConversations;
window.sendMessage = sendMessage;
window.handleMessageKeydown = handleMessageKeydown;
window.autoResizeTextarea = autoResizeTextarea;
window.toggleEmojiPicker = toggleEmojiPicker;
window.insertEmoji = insertEmoji;
window.compareResultsWithFriend = compareResultsWithFriend;
window.closeCompareModal = closeCompareModal;
window.viewFriendProfileFromChat = viewFriendProfileFromChat;
window.closeChatMobile = closeChatMobile;
window.handleTyping = handleTyping;
window.switchChatTab = switchChatTab;
