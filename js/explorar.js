/**
 * Quest4You - Explorar Page
 * Fórum, Chat Público, Mensagens Privadas
 * (Artigos foram movidos para Quest4Couple)
 */

// ================================
// FIRESTORE COLLECTIONS
// ================================
const COLLECTION_TOPICS = "quest4you_topics";
const COLLECTION_REPLIES = "quest4you_replies";
const COLLECTION_CHAT = "quest4you_chat";
const COLLECTION_MESSAGES = "quest4you_messages";
const COLLECTION_CONVERSATIONS = "quest4you_conversations";

// ================================
// STATE
// ================================
let currentUser = null;
let currentUserNickname = null; // User's public nickname
let currentUserEmoji = '👤'; // User's emoji avatar
let currentTab = 'forum';
let currentRoom = 'geral';
let currentForumCategory = 'geral';
let currentTopicId = null;
let currentConversationId = null;
let chatUnsubscribe = null;
let messagesUnsubscribe = null;
let conversationsUnsubscribe = null;
let isAdmin = false;

// ================================
// INITIALIZATION
// ================================
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initTabs();
  initFilters();
  loadTopics(); // Forum é a tab inicial agora
});

function initAuth() {
  firebase.auth().onAuthStateChanged(async (user) => {
    currentUser = user;
    
    // Check admin status and load user profile (nickname)
    if (user) {
      await checkAdminStatus(user.uid);
      await loadUserNickname(user.uid);
    } else {
      isAdmin = false;
      currentUserNickname = null;
      currentUserEmoji = '👤';
    }
    
    updateAuthUI();
    updateAdminUI();
    
    if (user) {
      // Enable chat and messages
      if (currentTab === 'chat') {
        enableChatInput();
        subscribeToChat(currentRoom);
      }
      if (currentTab === 'mensagens') {
        loadConversations();
      }
    }
  });
}

// Load user's nickname from Firestore
async function loadUserNickname(userId) {
  if (!db) return;
  
  try {
    const userDoc = await db.collection('quest4you_users').doc(userId).get();
    if (userDoc.exists) {
      const data = userDoc.data();
      currentUserNickname = data.nickname || null;
      currentUserEmoji = data.nicknameEmoji || '👤';
      console.log('Loaded nickname:', currentUserEmoji, currentUserNickname);
    }
  } catch (e) {
    console.log('Error loading nickname:', e);
    currentUserNickname = null;
    currentUserEmoji = '👤';
  }
}

// Get the display name to use (nickname > displayName > 'Anónimo')
function getDisplayName() {
  if (currentUserNickname) {
    return currentUserNickname;
  }
  if (currentUser && currentUser.displayName) {
    return currentUser.displayName;
  }
  return 'Anónimo';
}

async function checkAdminStatus(userId) {
  if (!db) {
    console.log('❌ Firestore não disponível');
    isAdmin = false;
    return;
  }
  
  try {
    const userDoc = await db.collection('quest4you_users').doc(userId).get();
    console.log('🔍 A verificar admin status para:', userId);
    
    if (userDoc.exists) {
      const data = userDoc.data();
      console.log('📄 Dados do utilizador:', data);
      
      isAdmin = data.role === 'admin' || data.role === 'superadmin' || data.isAdmin === true;
      console.log('🛡️ É admin?', isAdmin, '| role:', data.role, '| isAdmin:', data.isAdmin);
    } else {
      console.log('⚠️ Documento do utilizador não existe');
      isAdmin = false;
    }
  } catch (e) {
    console.error('❌ Erro ao verificar admin status:', e);
    isAdmin = false;
  }
}

function updateAdminUI() {
  // Admin UI agora simplificada - sem artigos
  console.log('🎨 A atualizar UI admin. isAdmin =', isAdmin);
}

function updateAuthUI() {
  const authLink = document.getElementById('authLink');
  const chatLoginRequired = document.getElementById('chatLoginRequired');
  const chatInputWrapper = document.getElementById('chatInputWrapper');
  const messagesLoginRequired = document.getElementById('messagesLoginRequired');
  const messagesContainer = document.querySelector('.messages-container');
  
  if (currentUser) {
    if (authLink) {
      authLink.textContent = '👤 Perfil';
      authLink.href = 'profile.html';
    }
    // Show chat link for authenticated users
    const chatLinks = document.querySelectorAll('.nav-link-auth');
    chatLinks.forEach(link => {
      link.style.display = 'inline-flex';
    });
    // Initialize notifications
    if (typeof initNotifications === 'function') {
      initNotifications(currentUser.uid);
    }
    if (chatLoginRequired) chatLoginRequired.style.display = 'none';
    if (chatInputWrapper) chatInputWrapper.style.display = 'flex';
    if (messagesLoginRequired) messagesLoginRequired.style.display = 'none';
    if (messagesContainer) messagesContainer.style.display = 'grid';
  } else {
    if (chatLoginRequired) chatLoginRequired.style.display = 'block';
    if (chatInputWrapper) chatInputWrapper.style.display = 'none';
    if (messagesLoginRequired) messagesLoginRequired.style.display = 'block';
    if (messagesContainer) messagesContainer.style.display = 'none';
  }
}

// ================================
// TABS
// ================================
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  currentTab = tab;
  
  // Update buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tab}Tab`).classList.add('active');
  
  // Tab-specific actions
  if (tab === 'forum') {
    loadTopics();
  } else if (tab === 'chat') {
    if (currentUser) {
      enableChatInput();
      subscribeToChat(currentRoom);
    }
  } else if (tab === 'mensagens') {
    if (currentUser) {
      loadConversations();
    }
  }
}

// ================================
// FORUM & FILTERS
// ================================
function initFilters() {
  // Forum filters
  const forumBtns = document.querySelectorAll('.forum-cat-btn');
  forumBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.forum;
      filterTopics(category);
    });
  });
  
  // Chat rooms
  const roomBtns = document.querySelectorAll('.room-btn');
  roomBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const room = btn.dataset.room;
      switchRoom(room);
    });
  });
}

// ================================
// FORUM
// ================================
async function loadTopics() {
  const container = document.getElementById('forumTopics');
  if (!container || !db) return;
  
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>A carregar tópicos...</p></div>';
  
  try {
    // Buscar todos os tópicos e filtrar/ordenar no cliente para evitar índices compostos
    let query = db.collection(COLLECTION_TOPICS).limit(200);
    
    const snapshot = await query.get();
    
    // Filtrar por categoria no cliente
    let topics = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (currentForumCategory !== 'geral') {
      topics = topics.filter(t => t.category === currentForumCategory);
    }
    
    // Ordenar por lastActivity (mais recente primeiro)
    topics.sort((a, b) => {
      const dateA = a.lastActivity?.toDate?.() || new Date(0);
      const dateB = b.lastActivity?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    // Limitar a 50 resultados
    topics = topics.slice(0, 50);
    
    if (topics.length === 0) {
      container.innerHTML = `
        <div class="no-topics">
          <p>Ainda não há tópicos nesta categoria.</p>
          <p>Sê o primeiro a criar um!</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = topics.map(data => {
      const date = data.lastActivity?.toDate?.() || new Date();
      const categoryIcons = {
        'geral': '🌐',
        'experiencias': '💭',
        'duvidas': '❓',
        'sugestoes': '💡',
        'off-topic': '🎲'
      };
      
      return `
        <div class="topic-card" onclick="openTopic('${data.id}')">
          <div class="topic-avatar">${data.userEmoji || '👤'}</div>
          <div class="topic-content">
            <div class="topic-header">
              <h3 class="topic-title">${escapeHtml(data.title)}</h3>
              <span class="topic-category-badge">${categoryIcons[data.category] || '🌐'} ${data.category}</span>
            </div>
            <p class="topic-preview">${escapeHtml((data.content || '').substring(0, 150))}...</p>
            <div class="topic-meta">
              <span>👤 ${data.userName || 'Anónimo'}</span>
              <span>🕐 ${formatTime(date)}</span>
            </div>
          </div>
          <div class="topic-stats">
            <div class="topic-stat">
              <span class="topic-stat-value">${data.replyCount || 0}</span>
              <span class="topic-stat-label">respostas</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Error loading topics:', e);
    container.innerHTML = '<p class="error">Erro ao carregar tópicos.</p>';
  }
}

function filterTopics(category) {
  currentForumCategory = category;
  
  document.querySelectorAll('.forum-cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.forum === category);
  });
  
  loadTopics();
}

function showNewTopicModal() {
  if (!currentUser) {
    alert('Faz login para criar um tópico.');
    return;
  }
  document.getElementById('newTopicModal').classList.add('active');
}

function closeNewTopicModal() {
  document.getElementById('newTopicModal').classList.remove('active');
  document.getElementById('newTopicForm').reset();
}

async function createTopic(event) {
  event.preventDefault();
  
  if (!currentUser) {
    alert('Faz login para criar um tópico.');
    return;
  }
  
  const category = document.getElementById('topicCategory').value;
  const title = document.getElementById('topicTitle').value.trim();
  const content = document.getElementById('topicContent').value.trim();
  
  if (!title || !content) return;
  
  try {
    await db.collection(COLLECTION_TOPICS).add({
      category: category,
      title: title,
      content: content,
      userId: currentUser.uid,
      userName: getDisplayName(),
      userEmoji: currentUserEmoji,
      replyCount: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastActivity: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    closeNewTopicModal();
    loadTopics();
  } catch (e) {
    console.error('Error creating topic:', e);
    alert('Erro ao criar tópico.');
  }
}

async function openTopic(topicId) {
  currentTopicId = topicId;
  
  try {
    const doc = await db.collection(COLLECTION_TOPICS).doc(topicId).get();
    
    if (!doc.exists) {
      alert('Tópico não encontrado.');
      return;
    }
    
    const data = doc.data();
    
    document.getElementById('topicModalTitle').textContent = data.title;
    document.getElementById('topicModalBody').innerHTML = `
      <div class="topic-full">
        <div class="topic-author">
          <span class="author-avatar">${data.userEmoji || '👤'}</span>
          <span class="author-name">${data.userName || 'Anónimo'}</span>
          <span class="topic-date">• ${formatTime(data.createdAt?.toDate() || new Date())}</span>
        </div>
        <div class="topic-text">${escapeHtml(data.content).replace(/\n/g, '<br>')}</div>
      </div>
    `;
    
    document.getElementById('topicModal').classList.add('active');
    loadReplies(topicId);
  } catch (e) {
    console.error('Error opening topic:', e);
    alert('Erro ao abrir tópico.');
  }
}

function closeTopicModal() {
  document.getElementById('topicModal').classList.remove('active');
  currentTopicId = null;
}

async function loadReplies(topicId) {
  const list = document.getElementById('repliesList');
  if (!list || !db) return;
  
  list.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';
  
  try {
    // Buscar respostas sem orderBy para evitar índices compostos
    const snapshot = await db.collection(COLLECTION_REPLIES)
      .where('topicId', '==', topicId)
      .get();
    
    if (snapshot.empty) {
      list.innerHTML = '<p class="no-replies">Ainda não há respostas. Sê o primeiro!</p>';
      return;
    }
    
    // Ordenar no cliente por createdAt (mais antigo primeiro)
    const replies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    replies.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateA - dateB;
    });
    
    list.innerHTML = replies.map(data => {
      const date = data.createdAt?.toDate?.() || new Date();
      return `
        <div class="reply">
          <div class="reply-avatar">${data.userEmoji || '👤'}</div>
          <div class="reply-content">
            <div class="reply-header">
              <span class="reply-author">${data.userName || 'Anónimo'}</span>
              <span class="reply-time">${formatTime(date)}</span>
            </div>
            <p class="reply-text">${escapeHtml(data.text).replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Error loading replies:', e);
    list.innerHTML = '<p class="error">Erro ao carregar respostas.</p>';
  }
}

async function submitReply() {
  if (!currentUser || !currentTopicId) {
    alert('Faz login para responder.');
    return;
  }
  
  const textarea = document.getElementById('replyText');
  const text = textarea.value.trim();
  
  if (!text) return;
  if (text.length > 2000) {
    alert('Resposta demasiado longa (máx. 2000 caracteres)');
    return;
  }
  
  try {
    // Add reply
    await db.collection(COLLECTION_REPLIES).add({
      topicId: currentTopicId,
      userId: currentUser.uid,
      userName: getDisplayName(),
      userEmoji: currentUserEmoji,
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update topic
    await db.collection(COLLECTION_TOPICS).doc(currentTopicId).update({
      replyCount: firebase.firestore.FieldValue.increment(1),
      lastActivity: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    textarea.value = '';
    loadReplies(currentTopicId);
  } catch (e) {
    console.error('Error submitting reply:', e);
    alert('Erro ao enviar resposta.');
  }
}

// ================================
// PUBLIC CHAT
// ================================
function switchRoom(room) {
  currentRoom = room;
  
  // Update buttons
  document.querySelectorAll('.room-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.room === room);
  });
  
  // Update header
  const roomNames = {
    'geral': '🌐 Sala Geral',
    'apresentacoes': '👋 Apresentações',
    'dicas': '💡 Dicas & Truques',
    'encontros': '💕 Encontros'
  };
  document.getElementById('currentRoomName').textContent = roomNames[room] || room;
  
  // Unsubscribe from previous room
  if (chatUnsubscribe) {
    chatUnsubscribe();
  }
  
  // Subscribe to new room
  if (currentUser) {
    subscribeToChat(room);
  }
}

function enableChatInput() {
  const loginRequired = document.getElementById('chatLoginRequired');
  const inputWrapper = document.getElementById('chatInputWrapper');
  
  if (loginRequired) loginRequired.style.display = 'none';
  if (inputWrapper) inputWrapper.style.display = 'flex';
}

function subscribeToChat(room) {
  if (!db) return;
  
  const messagesContainer = document.getElementById('chatMessages');
  if (!messagesContainer) return;
  
  // Clear existing messages
  messagesContainer.innerHTML = `
    <div class="chat-welcome">
      <p>👋 Bem-vindo à sala! Sê respeitoso e diverte-te.</p>
    </div>
  `;
  
  // Subscribe to realtime updates - sem orderBy para evitar índices compostos
  chatUnsubscribe = db.collection(COLLECTION_CHAT)
    .where('room', '==', room)
    .limit(100)
    .onSnapshot(snapshot => {
      const messages = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      
      // Ordenar no cliente por createdAt (mais antigo primeiro para exibir em ordem)
      messages.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateA - dateB;
      });
      
      // Mostrar apenas as últimas 100 mensagens
      const recentMessages = messages.slice(-100);
      
      renderChatMessages(recentMessages);
    }, error => {
      console.error('Chat subscription error:', error);
      messagesContainer.innerHTML = `
        <div class="chat-welcome">
          <p>⚠️ Erro ao carregar mensagens. Tenta recarregar a página.</p>
        </div>
      `;
    });
}

function renderChatMessages(messages) {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  
  if (messages.length === 0) {
    container.innerHTML = `
      <div class="chat-welcome">
        <p>👋 Bem-vindo à sala! Sê o primeiro a enviar uma mensagem.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = messages.map(msg => {
    const isOwn = currentUser && msg.userId === currentUser.uid;
    const time = msg.createdAt?.toDate() || new Date();
    
    return `
      <div class="chat-message ${isOwn ? 'own' : ''}">
        <div class="chat-message-avatar">${msg.userEmoji || '👤'}</div>
        <div class="chat-message-content">
          <div class="chat-message-header">
            <span class="chat-message-name">${msg.userName || 'Anónimo'}</span>
            <span class="chat-message-time">${formatTime(time)}</span>
          </div>
          <p class="chat-message-text">${escapeHtml(msg.text)}</p>
        </div>
      </div>
    `;
  }).join('');
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
  if (!currentUser) {
    alert('Faz login para enviar mensagens.');
    return;
  }
  
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  
  if (!text) return;
  if (text.length > 500) {
    alert('Mensagem demasiado longa (máx. 500 caracteres)');
    return;
  }
  
  try {
    await db.collection(COLLECTION_CHAT).add({
      room: currentRoom,
      userId: currentUser.uid,
      userName: getDisplayName(),
      userEmoji: currentUserEmoji,
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    input.value = '';
  } catch (e) {
    console.error('Error sending message:', e);
    alert('Erro ao enviar mensagem.');
  }
}

// Handle Enter key in chat
document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
      }
    });
  }
});

// ================================
// PRIVATE MESSAGES
// ================================
async function loadConversations() {
  if (!currentUser || !db) return;
  
  const list = document.getElementById('conversationsList');
  const noConversations = document.getElementById('noConversations');
  
  if (!list) return;
  
  // Subscribe to conversations
  if (conversationsUnsubscribe) {
    conversationsUnsubscribe();
  }
  
  conversationsUnsubscribe = db.collection(COLLECTION_CONVERSATIONS)
    .where('participants', 'array-contains', currentUser.uid)
    .onSnapshot(snapshot => {
      if (snapshot.empty) {
        if (noConversations) noConversations.style.display = 'block';
        list.innerHTML = '';
        return;
      }
      
      if (noConversations) noConversations.style.display = 'none';
      
      // Ordenar no cliente por lastMessage.createdAt (mais recente primeiro)
      const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      conversations.sort((a, b) => {
        const dateA = a.lastMessage?.createdAt?.toDate?.() || new Date(0);
        const dateB = b.lastMessage?.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      list.innerHTML = conversations.map(data => {
        const otherUserId = data.participants.find(p => p !== currentUser.uid);
        const otherUser = data.participantInfo?.[otherUserId] || {};
        const lastMsg = data.lastMessage || {};
        const time = lastMsg.createdAt?.toDate?.() || new Date();
        const unread = data.unreadCount?.[currentUser.uid] || 0;
        
        return `
          <div class="conversation-item ${currentConversationId === data.id ? 'active' : ''}" 
               onclick="openConversation('${data.id}')">
            <div class="conversation-avatar">${otherUser.emoji || '👤'}</div>
            <div class="conversation-info">
              <div class="conversation-name">${otherUser.name || 'Utilizador'}</div>
              <div class="conversation-preview">${lastMsg.text || 'Nova conversa'}</div>
            </div>
            <div class="conversation-meta">
              <span>${formatTime(time)}</span>
              ${unread > 0 ? `<span class="conversation-unread">${unread}</span>` : ''}
            </div>
          </div>
        `;
      }).join('');
    }, error => {
      console.error('Conversations subscription error:', error);
    });
}

async function openConversation(conversationId) {
  if (!currentUser || !db) return;
  
  currentConversationId = conversationId;
  
  // Update active state
  document.querySelectorAll('.conversation-item').forEach(item => {
    item.classList.remove('active');
  });
  event.currentTarget?.classList.add('active');
  
  const mainArea = document.getElementById('messagesMain');
  if (!mainArea) return;
  
  try {
    const convDoc = await db.collection(COLLECTION_CONVERSATIONS).doc(conversationId).get();
    
    if (!convDoc.exists) return;
    
    const convData = convDoc.data();
    const otherUserId = convData.participants.find(p => p !== currentUser.uid);
    const otherUser = convData.participantInfo?.[otherUserId] || {};
    
    mainArea.innerHTML = `
      <div class="messages-header">
        <div class="messages-user">
          <div class="messages-user-avatar">${otherUser.emoji || '👤'}</div>
          <div class="messages-user-info">
            <span class="messages-user-name">${otherUser.name || 'Utilizador'}</span>
          </div>
        </div>
      </div>
      <div class="private-messages-list" id="privateMessagesList">
        <div class="loading-spinner"><div class="spinner"></div></div>
      </div>
      <div class="private-message-input">
        <input type="text" id="privateMessageInput" placeholder="Escreve uma mensagem...">
        <button class="btn btn-primary" onclick="sendPrivateMessage()">Enviar</button>
      </div>
    `;
    
    // Subscribe to messages
    subscribeToPrivateMessages(conversationId);
    
    // Mark as read
    await db.collection(COLLECTION_CONVERSATIONS).doc(conversationId).update({
      [`unreadCount.${currentUser.uid}`]: 0
    });
    
    // Handle Enter key
    const input = document.getElementById('privateMessageInput');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendPrivateMessage();
        }
      });
      input.focus();
    }
  } catch (e) {
    console.error('Error opening conversation:', e);
  }
}

function subscribeToPrivateMessages(conversationId) {
  if (messagesUnsubscribe) {
    messagesUnsubscribe();
  }
  
  const list = document.getElementById('privateMessagesList');
  if (!list || !db) return;
  
  // Sem orderBy para evitar índices compostos - ordenar no cliente
  messagesUnsubscribe = db.collection(COLLECTION_MESSAGES)
    .where('conversationId', '==', conversationId)
    .onSnapshot(snapshot => {
      const messages = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      
      // Ordenar no cliente por createdAt (mais antigo primeiro)
      messages.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateA - dateB;
      });
      
      renderPrivateMessages(messages);
    }, error => {
      console.error('Messages subscription error:', error);
      list.innerHTML = '<p class="error">Erro ao carregar mensagens.</p>';
    });
}

function renderPrivateMessages(messages) {
  const list = document.getElementById('privateMessagesList');
  if (!list) return;
  
  if (messages.length === 0) {
    list.innerHTML = '<p class="no-messages">Começa a conversa!</p>';
    return;
  }
  
  list.innerHTML = messages.map(msg => {
    const isOwn = currentUser && msg.senderId === currentUser.uid;
    const time = msg.createdAt?.toDate() || new Date();
    
    return `
      <div class="private-message ${isOwn ? 'own' : ''}">
        <div class="private-message-content">
          <p>${escapeHtml(msg.text)}</p>
          <span class="private-message-time">${formatTime(time)}</span>
        </div>
      </div>
    `;
  }).join('');
  
  // Scroll to bottom
  list.scrollTop = list.scrollHeight;
}

async function sendPrivateMessage() {
  if (!currentUser || !currentConversationId) return;
  
  const input = document.getElementById('privateMessageInput');
  const text = input.value.trim();
  
  if (!text) return;
  
  try {
    const convDoc = await db.collection(COLLECTION_CONVERSATIONS).doc(currentConversationId).get();
    const convData = convDoc.data();
    const otherUserId = convData.participants.find(p => p !== currentUser.uid);
    
    // Add message
    await db.collection(COLLECTION_MESSAGES).add({
      conversationId: currentConversationId,
      senderId: currentUser.uid,
      senderName: getDisplayName(),
      senderEmoji: currentUserEmoji,
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update conversation
    await db.collection(COLLECTION_CONVERSATIONS).doc(currentConversationId).update({
      lastMessage: {
        text: text,
        senderId: currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      },
      [`unreadCount.${otherUserId}`]: firebase.firestore.FieldValue.increment(1)
    });
    
    input.value = '';
  } catch (e) {
    console.error('Error sending private message:', e);
    alert('Erro ao enviar mensagem.');
  }
}

// Function to start a new conversation (called from Smart Match)
async function startConversation(otherUserId, otherUserName, otherUserEmoji) {
  if (!currentUser || !db) return null;
  
  try {
    // Check if conversation already exists
    const existing = await db.collection(COLLECTION_CONVERSATIONS)
      .where('participants', 'array-contains', currentUser.uid)
      .get();
    
    for (const doc of existing.docs) {
      if (doc.data().participants.includes(otherUserId)) {
        return doc.id; // Return existing conversation
      }
    }
    
    // Create new conversation
    const convRef = await db.collection(COLLECTION_CONVERSATIONS).add({
      participants: [currentUser.uid, otherUserId],
      participantInfo: {
        [currentUser.uid]: {
          name: getDisplayName(),
          emoji: currentUserEmoji
        },
        [otherUserId]: {
          name: otherUserName || 'Utilizador',
          emoji: otherUserEmoji || '👤'
        }
      },
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessage: null,
      unreadCount: {
        [currentUser.uid]: 0,
        [otherUserId]: 0
      }
    });
    
    return convRef.id;
  } catch (e) {
    console.error('Error starting conversation:', e);
    return null;
  }
}

// ================================
// UTILITIES
// ================================
function formatTime(date) {
  if (!date) return '';
  
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) return 'agora';
  
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins}m`;
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h`;
  }
  
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}d`;
  }
  
  // Format as date
  return date.toLocaleDateString('pt-PT', { 
    day: 'numeric', 
    month: 'short' 
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ================================
// MODAL CLOSE ON CLICK OUTSIDE
// ================================
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// Close modals on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }
});
