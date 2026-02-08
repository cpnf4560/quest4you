/**
 * Quest4You - Group Chat & Image Messages
 * Sistema de grupos de chat e envio de imagens
 */

// ================================
// STATE
// ================================
let currentGroup = null;
let groupsUnsubscribe = null;

// ================================
// GROUP CHAT FUNCTIONS
// ================================

/**
 * Cria um novo grupo de chat
 */
async function createGroupChat(name, memberIds, description = '') {
  if (!currentUser || !db) {
    console.error('User not authenticated');
    return null;
  }
  
  if (!name || !memberIds || memberIds.length < 1) {
    showToast(t('chatGroups.selectAtLeastOneMember'), 'error');
    return null;
  }
  
  // Inclui o criador nos participantes
  const participants = [currentUser.uid, ...memberIds.filter(id => id !== currentUser.uid)];
  
  try {
    const groupRef = await db.collection("quest4you_groups").add({
      name: name.trim(),
      description: description.trim(),
      participants: participants,
      admins: [currentUser.uid], // Criador é admin
      createdBy: currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastMessage: t('chatGroups.createdGroup', {name: currentUser.displayName || t('chatGroups.someone')}),
      photo: null,
      isGroup: true,
      unreadCount: participants.reduce((acc, id) => {
        acc[id] = id === currentUser.uid ? 0 : 1;
        return acc;
      }, {})
    });
    
    // Envia mensagem do sistema
    await db.collection("quest4you_messages").add({
      conversationId: groupRef.id,
      isGroupMessage: true,
      senderId: 'system',
      text: '🎉 ' + t('chatGroups.userCreatedGroup', {user: currentUser.displayName || t('profile.defaultUserName'), group: name}),
      messageType: 'system',
      isSystem: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Notifica membros
    for (const memberId of memberIds) {
      if (memberId !== currentUser.uid) {
        await notifyGroupInvite(memberId, name);
      }
    }
    
    showToast(t('chatGroups.groupCreated', {name: name}), 'success');
    closeCreateGroupModal();
    
    return groupRef.id;
  } catch (error) {
    console.error('Error creating group:', error);
    showToast(t('chatGroups.createError'), 'error');
    return null;
  }
}

/**
 * Carrega grupos do utilizador
 */
async function loadUserGroups() {
  if (!currentUser || !db) return [];
  
  if (groupsUnsubscribe) {
    groupsUnsubscribe();
  }
  
  return new Promise((resolve, reject) => {
    groupsUnsubscribe = db.collection("quest4you_groups")
      .where("participants", "array-contains", currentUser.uid)
      .orderBy("lastMessageAt", "desc")
      .onSnapshot(async (snapshot) => {
        const groups = [];
        
        for (const doc of snapshot.docs) {
          const data = doc.data();
          
          // Obter informações dos participantes
          const participantNames = [];
          for (const pid of data.participants.slice(0, 3)) {
            if (pid !== currentUser.uid) {
              const userDoc = await db.collection("quest4you_users").doc(pid).get();
              if (userDoc.exists) {
                participantNames.push(userDoc.data().displayName || userDoc.data().nickname || t('profile.defaultUserName'));
              }
            }
          }
          
          groups.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            participants: data.participants,
            participantNames: participantNames,
            participantCount: data.participants.length,
            photo: data.photo,
            lastMessage: data.lastMessage || '',
            lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
            unreadCount: data.unreadCount?.[currentUser.uid] || 0,
            isAdmin: data.admins?.includes(currentUser.uid),
            isGroup: true
          });
        }
        
        renderGroups(groups);
        resolve(groups);
      }, reject);
  });
}

/**
 * Renderiza lista de grupos na sidebar
 */
function renderGroups(groups) {
  const groupsList = document.getElementById('groupsList');
  if (!groupsList) return;
  
  if (groups.length === 0) {
    groupsList.innerHTML = `
      <div class="empty-groups">
        <p>👥 ${t('chatGroups.noGroups')}</p>
        <button class="btn btn-sm btn-primary" onclick="showCreateGroupModal()">${t('chatGroups.createGroup')}</button>
      </div>
    `;
    return;
  }
  
  groupsList.innerHTML = groups.map(group => `
    <div class="conversation-item group-item ${group.id === currentGroup?.id ? 'active' : ''} ${group.unreadCount > 0 ? 'unread' : ''}" 
         onclick="openGroupChat('${group.id}')">
      <div class="conversation-avatar group-avatar">
        ${group.photo 
          ? `<img src="${group.photo}" alt="${group.name}">`
          : `<span class="group-icon">👥</span>`
        }
        ${group.participantCount > 3 ? `<span class="group-count">+${group.participantCount - 3}</span>` : ''}
      </div>
      <div class="conversation-info">
        <div class="conversation-header">
          <span class="conversation-name">${escapeHtml(group.name)}</span>
          <span class="conversation-time">${formatMessageTime(group.lastMessageAt)}</span>
        </div>
        <div class="conversation-preview">
          ${group.participantCount} ${t('chatGroups.members')} • ${group.lastMessage || t('chatGroups.groupCreatedLabel')}
        </div>
      </div>
      ${group.unreadCount > 0 ? `<span class="conversation-unread-count">${group.unreadCount}</span>` : ''}
    </div>
  `).join('');
}

/**
 * Abre conversa de grupo
 */
async function openGroupChat(groupId) {
  try {
    const groupDoc = await db.collection("quest4you_groups").doc(groupId).get();
    if (!groupDoc.exists) {
      showToast(t('chatGroups.groupNotFound'), 'error');
      return;
    }
    
    const groupData = groupDoc.data();
    currentGroup = {
      id: groupId,
      ...groupData
    };
    
    // Limpar conversa atual
    currentConversation = null;
    currentFriend = null;
    
    // Atualizar UI
    document.getElementById('noConversation').style.display = 'none';
    document.getElementById('activeChat').style.display = 'flex';
    
    // Atualizar header para grupo
    updateGroupChatHeader(currentGroup);
    
    // Carregar mensagens do grupo
    loadGroupMessages(groupId);
    
    // Marcar como lido
    await db.collection("quest4you_groups").doc(groupId).update({
      [`unreadCount.${currentUser.uid}`]: 0
    });
    
    // Mobile: esconder sidebar
    document.getElementById('conversationsSidebar')?.classList.add('hidden');
    
  } catch (error) {
    console.error('Error opening group:', error);
    showToast(t('chatGroups.openError'), 'error');
  }
}

/**
 * Atualiza header do chat para grupo
 */
function updateGroupChatHeader(group) {
  const avatar = document.getElementById('chatUserAvatar');
  const name = document.getElementById('chatUserName');
  const status = document.getElementById('chatUserStatus');
  
  if (avatar) {
    avatar.innerHTML = group.photo 
      ? `<img src="${group.photo}" alt="${group.name}">`
      : `<span class="group-icon-large">👥</span>`;
    avatar.classList.add('group-avatar');
  }
  
  if (name) {
    name.textContent = group.name;
  }
  
  if (status) {
    status.textContent = `${group.participants?.length || 0} ${t('chatGroups.members')}`;
  }
  
  // Adicionar botão de info do grupo
  const headerActions = document.querySelector('.chat-header-actions');
  if (headerActions && !document.getElementById('groupInfoBtn')) {
    const infoBtn = document.createElement('button');
    infoBtn.id = 'groupInfoBtn';
    infoBtn.className = 'btn-icon';
    infoBtn.innerHTML = 'ℹ️';
    infoBtn.onclick = () => showGroupInfo(group.id);
    headerActions.prepend(infoBtn);
  }
}

/**
 * Carrega mensagens do grupo
 */
function loadGroupMessages(groupId) {
  if (messagesUnsubscribe) {
    messagesUnsubscribe();
  }
  
  const messagesList = document.getElementById('messagesList');
  if (!messagesList) return;
  
  messagesUnsubscribe = db.collection("quest4you_messages")
    .where("conversationId", "==", groupId)
    .where("isGroupMessage", "==", true)
    .orderBy("createdAt", "asc")
    .onSnapshot(async (snapshot) => {
      const messages = [];
      let lastDate = null;
      const senderCache = {};
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const messageDate = data.createdAt?.toDate() || new Date();
        const dateStr = formatDateSeparator(messageDate);
        
        // Separador de data
        if (dateStr !== lastDate) {
          messages.push({ type: 'date', date: dateStr });
          lastDate = dateStr;
        }
        
        // Obter nome do remetente
        let senderName = 'Sistema';
        if (data.senderId !== 'system' && data.senderId !== currentUser.uid) {
          if (!senderCache[data.senderId]) {
            const senderDoc = await db.collection("quest4you_users").doc(data.senderId).get();
            senderCache[data.senderId] = senderDoc.exists 
              ? (senderDoc.data().displayName || senderDoc.data().nickname || t('profile.defaultUserName'))
              : t('profile.defaultUserName');
          }
          senderName = senderCache[data.senderId];
        }
        
        messages.push({
          type: 'message',
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          senderName: senderName,
          createdAt: messageDate,
          isSent: data.senderId === currentUser.uid,
          isSystem: data.isSystem || data.senderId === 'system',
          imageUrl: data.imageUrl || null,
          imageThumb: data.imageThumb || null
        });
      }
      
      renderGroupMessages(messages);
      scrollToBottom();
    });
}

/**
 * Renderiza mensagens de grupo
 */
function renderGroupMessages(messages) {
  const messagesList = document.getElementById('messagesList');
  if (!messagesList) return;
  
  messagesList.innerHTML = messages.map(item => {
    if (item.type === 'date') {
      return `<div class="date-separator"><span>${item.date}</span></div>`;
    }
    
    // Mensagem do sistema
    if (item.isSystem) {
      return `
        <div class="message system-message">
          <div class="message-bubble system-bubble">${escapeHtml(item.text)}</div>
        </div>
      `;
    }
    
    // Mensagem com imagem
    const imageHtml = item.imageUrl ? `
      <div class="message-image" onclick="viewImage('${item.imageUrl}')">
        <img src="${item.imageThumb || item.imageUrl}" alt="Imagem" loading="lazy">
        <span class="image-zoom-icon">🔍</span>
      </div>
    ` : '';
    
    return `
      <div class="message ${item.isSent ? 'sent' : 'received'}">
        ${!item.isSent ? `<div class="message-sender">${escapeHtml(item.senderName)}</div>` : ''}
        ${imageHtml}
        ${item.text ? `<div class="message-bubble">${escapeHtml(item.text)}</div>` : ''}
        <div class="message-meta">
          <span class="message-time">${formatMessageTime(item.createdAt)}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Envia mensagem para grupo
 */
async function sendGroupMessage(text, imageUrl = null) {
  if (!currentGroup || !currentUser) return;
  if (!text?.trim() && !imageUrl) return;
  
  try {
    const messageData = {
      conversationId: currentGroup.id,
      isGroupMessage: true,
      senderId: currentUser.uid,
      text: text?.trim() || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (imageUrl) {
      messageData.imageUrl = imageUrl;
    }
    
    await db.collection("quest4you_messages").add(messageData);
    
    // Atualizar último message do grupo
    const unreadUpdates = {};
    currentGroup.participants.forEach(pid => {
      if (pid !== currentUser.uid) {
        unreadUpdates[`unreadCount.${pid}`] = firebase.firestore.FieldValue.increment(1);
      }
    });
    
    await db.collection("quest4you_groups").doc(currentGroup.id).update({
      lastMessage: text?.substring(0, 50) || '📷 Imagem',
      lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
      ...unreadUpdates
    });
    
    // Notificar membros
    for (const pid of currentGroup.participants) {
      if (pid !== currentUser.uid) {
        await notifyGroupMessage(pid, currentGroup.name, currentUser.displayName || 'Alguém');
      }
    }
    
  } catch (error) {
    console.error('Error sending group message:', error);
    showToast(t('chatGroups.sendError'), 'error');
  }
}

/**
 * Modal para criar grupo
 */
function showCreateGroupModal() {
  // Verificar se modal já existe
  let modal = document.getElementById('createGroupModal');
  if (modal) {
    modal.classList.add('active');
    loadFriendsForGroup();
    return;
  }
  
  // Criar modal
  modal = document.createElement('div');
  modal.id = 'createGroupModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeCreateGroupModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>👥 ${t('chatGroups.createGroup')}</h3>
        <button class="modal-close" onclick="closeCreateGroupModal()">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>${t('chatGroups.groupName')} *</label>
          <input type="text" id="groupNameInput" placeholder="${t('chatGroups.groupNamePlaceholder')}" maxlength="50">
        </div>
        <div class="form-group">
          <label>${t('chatGroups.descriptionOptional')}</label>
          <textarea id="groupDescInput" placeholder="${t('chatGroups.descriptionPlaceholder')}" maxlength="200" rows="2"></textarea>
        </div>
        <div class="form-group">
          <label>${t('chatGroups.addMembers')} *</label>
          <div class="friends-selector" id="friendsSelector">
            <p class="loading-text">${t('chatGroups.loadingFriends')}</p>
          </div>
        </div>
        <div class="selected-members" id="selectedMembers"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeCreateGroupModal()">${t('chatGroups.cancel')}</button>
        <button class="btn btn-primary" onclick="confirmCreateGroup()">${t('chatGroups.createGroup')}</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
  
  loadFriendsForGroup();
}

/**
 * Carrega amigos para seleção no grupo
 */
async function loadFriendsForGroup() {
  const selector = document.getElementById('friendsSelector');
  if (!selector) return;
  
  try {
    // Carregar amizades aceites
    const friendshipsSnapshot = await db.collection("quest4you_friendships")
      .where("status", "==", "accepted")
      .where("participants", "array-contains", currentUser.uid)
      .get();
    
    const friends = [];
    
    for (const doc of friendshipsSnapshot.docs) {
      const data = doc.data();
      const friendId = data.participants.find(p => p !== currentUser.uid);
      
      const friendDoc = await db.collection("quest4you_users").doc(friendId).get();
      if (friendDoc.exists) {
        const friendData = friendDoc.data();
        friends.push({
          id: friendId,
          name: friendData.displayName || friendData.nickname || t('profile.defaultUserName'),
          photo: friendData.photos?.public || null
        });
      }
    }
    
    if (friends.length === 0) {
      selector.innerHTML = `<p class="empty-text">${t('chatGroups.noFriendsToAdd')}</p>`;
      return;
    }
    
    selector.innerHTML = friends.map(friend => `
      <label class="friend-checkbox">
        <input type="checkbox" value="${friend.id}" onchange="updateSelectedMembers()">
        <span class="friend-checkbox-avatar">
          ${friend.photo ? `<img src="${friend.photo}" alt="">` : friend.name.charAt(0)}
        </span>
        <span class="friend-checkbox-name">${escapeHtml(friend.name)}</span>
      </label>
    `).join('');
    
  } catch (error) {
    console.error('Error loading friends:', error);
    selector.innerHTML = '<p class="error-text">' + t('chatGroups.loadFriendsError') + '</p>';
  }
}

/**
 * Atualiza lista de membros selecionados
 */
function updateSelectedMembers() {
  const container = document.getElementById('selectedMembers');
  const checkboxes = document.querySelectorAll('#friendsSelector input[type="checkbox"]:checked');
  
  if (!container) return;
  
  if (checkboxes.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = `<span class="selected-count">${t('chatGroups.membersSelected', {count: checkboxes.length})}</span>`;
}

/**
 * Confirma criação do grupo
 */
function confirmCreateGroup() {
  const name = document.getElementById('groupNameInput')?.value?.trim();
  const description = document.getElementById('groupDescInput')?.value?.trim();
  const checkboxes = document.querySelectorAll('#friendsSelector input[type="checkbox"]:checked');
  
  if (!name) {
    showToast(t('chatGroups.enterGroupName'), 'warning');
    return;
  }
  
  if (checkboxes.length === 0) {
    showToast(t('chatGroups.selectAtLeast1'), 'warning');
    return;
  }
  
  const memberIds = Array.from(checkboxes).map(cb => cb.value);
  createGroupChat(name, memberIds, description);
}

/**
 * Fecha modal de criar grupo
 */
function closeCreateGroupModal() {
  const modal = document.getElementById('createGroupModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

/**
 * Mostra informações do grupo
 */
async function showGroupInfo(groupId) {
  const groupDoc = await db.collection("quest4you_groups").doc(groupId).get();
  if (!groupDoc.exists) return;
  
  const group = groupDoc.data();
  
  // Carregar membros
  const members = [];
  for (const pid of group.participants) {
    const userDoc = await db.collection("quest4you_users").doc(pid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      members.push({
        id: pid,
        name: userData.displayName || userData.nickname || t('profile.defaultUserName'),
        photo: userData.photos?.public,
        isAdmin: group.admins?.includes(pid)
      });
    }
  }
  
  let modal = document.getElementById('groupInfoModal');
  if (modal) modal.remove();
  
  modal = document.createElement('div');
  modal.id = 'groupInfoModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeGroupInfoModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>👥 ${escapeHtml(group.name)}</h3>
        <button class="modal-close" onclick="closeGroupInfoModal()">×</button>
      </div>
      <div class="modal-body">
        ${group.description ? `<p class="group-description">${escapeHtml(group.description)}</p>` : ''}
        
        <div class="group-info-section">
          <h4>Membros (${members.length})</h4>
          <div class="group-members-list">
            ${members.map(m => `
              <div class="group-member-item">
                <div class="member-avatar">
                  ${m.photo ? `<img src="${m.photo}" alt="">` : m.name.charAt(0)}
                </div>
                <span class="member-name">${escapeHtml(m.name)}</span>
                ${m.isAdmin ? `<span class="admin-badge">Admin</span>` : ''}
                ${m.id === currentUser.uid ? `<span class="you-badge">${t('chatGroups.you')}</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        
        ${group.admins?.includes(currentUser.uid) ? `
          <div class="group-admin-actions">
            <button class="btn btn-secondary btn-sm" onclick="showAddMemberModal('${groupId}')">➕ ${t('chatGroups.addMember')}</button>
            <button class="btn btn-danger btn-sm" onclick="confirmDeleteGroup('${groupId}')">🗑️ ${t('chatGroups.deleteGroup')}</button>
          </div>
        ` : `
          <div class="group-actions">
            <button class="btn btn-danger btn-sm" onclick="confirmLeaveGroup('${groupId}')">🚪 ${t('chatGroups.leaveGroup')}</button>
          </div>
        `}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

function closeGroupInfoModal() {
  const modal = document.getElementById('groupInfoModal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

/**
 * Sai do grupo
 */
async function confirmLeaveGroup(groupId) {
  if (!confirm(t('chatGroups.leaveConfirm'))) return;
  
  try {
    await db.collection("quest4you_groups").doc(groupId).update({
      participants: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
    });
    
    // Mensagem do sistema
    await db.collection("quest4you_messages").add({
      conversationId: groupId,
      isGroupMessage: true,
      senderId: 'system',
      text: t('chatGroups.userLeftGroup', {name: currentUser.displayName || t('profile.defaultUserName')}),
      messageType: 'system',
      isSystem: true,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    showToast(t('chatGroups.leftGroup'), 'info');
    closeGroupInfoModal();
    currentGroup = null;
    document.getElementById('activeChat').style.display = 'none';
    document.getElementById('noConversation').style.display = 'flex';
    
  } catch (error) {
    console.error('Error leaving group:', error);
    showToast(t('chatGroups.leaveError'), 'error');
  }
}

// ================================
// IMAGE MESSAGES
// ================================

/**
 * Abre seletor de imagem
 */
function openImageSelector() {
  let input = document.getElementById('imageInput');
  if (!input) {
    input = document.createElement('input');
    input.type = 'file';
    input.id = 'imageInput';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.onchange = handleImageSelect;
    document.body.appendChild(input);
  }
  input.click();
}

/**
 * Processa seleção de imagem
 */
async function handleImageSelect(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  
  // Validar tipo
  if (!file.type.startsWith('image/')) {
    showToast(t('chatGroups.selectImage'), 'warning');
    return;
  }
  
  // Validar tamanho (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast(t('chatGroups.imageTooLarge'), 'warning');
    return;
  }
  
  // Mostrar preview
  showImagePreview(file);
}

/**
 * Mostra preview da imagem antes de enviar
 */
function showImagePreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    let preview = document.getElementById('imagePreviewModal');
    if (preview) preview.remove();
    
    preview = document.createElement('div');
    preview.id = 'imagePreviewModal';
    preview.className = 'modal';
    preview.innerHTML = `
      <div class="modal-overlay" onclick="closeImagePreview()"></div>
      <div class="modal-content image-preview-content">
        <div class="modal-header">
          <h3>📷 ${t('chatGroups.sendImage')}</h3>
          <button class="modal-close" onclick="closeImagePreview()">×</button>
        </div>
        <div class="modal-body">
          <div class="image-preview-container">
            <img src="${e.target.result}" alt="Preview" id="previewImage">
          </div>
          <div class="form-group">
            <input type="text" id="imageCaption" placeholder="${t('chatGroups.captionPlaceholder')}">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeImagePreview()">${t('chatGroups.cancel')}</button>
          <button class="btn btn-primary" onclick="sendImageMessage()">📤 ${t('chatGroups.send')}</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(preview);
    setTimeout(() => preview.classList.add('active'), 10);
    
    // Guardar ficheiro para envio
    window.pendingImageFile = file;
  };
  reader.readAsDataURL(file);
}

function closeImagePreview() {
  const preview = document.getElementById('imagePreviewModal');
  if (preview) {
    preview.classList.remove('active');
    setTimeout(() => preview.remove(), 300);
  }
  window.pendingImageFile = null;
  
  // Limpar input
  const input = document.getElementById('imageInput');
  if (input) input.value = '';
}

/**
 * Envia mensagem com imagem
 */
async function sendImageMessage() {
  if (!window.pendingImageFile) {
    showToast(t('chatGroups.noImageSelected'), 'error');
    return;
  }
  
  const caption = document.getElementById('imageCaption')?.value?.trim() || '';
  const file = window.pendingImageFile;
  
  // Mostrar loading
  const sendBtn = document.querySelector('#imagePreviewModal .btn-primary');
  if (sendBtn) {
    sendBtn.disabled = true;
    sendBtn.innerHTML = '⏳ ' + t('chatGroups.sending');
  }
  
  try {
    // Upload para Firebase Storage
    const storageRef = firebase.storage().ref();
    const timestamp = Date.now();
    const fileName = `chat_images/${currentUser.uid}/${timestamp}_${file.name}`;
    const fileRef = storageRef.child(fileName);
    
    const snapshot = await fileRef.put(file);
    const imageUrl = await snapshot.ref.getDownloadURL();
    
    // Enviar mensagem
    if (currentGroup) {
      await sendGroupMessage(caption, imageUrl);
    } else if (currentConversation) {
      await sendMessageWithImage(caption, imageUrl);
    }
    
    closeImagePreview();
    showToast(t('chatGroups.imageSent'), 'success');
    
  } catch (error) {
    console.error('Error uploading image:', error);
    showToast(t('chatGroups.imageError'), 'error');
    
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.innerHTML = '📤 ' + t('chatGroups.send');
    }
  }
}

/**
 * Envia mensagem privada com imagem
 */
async function sendMessageWithImage(text, imageUrl) {
  if (!currentConversation || !currentFriend) return;
  
  try {
    await db.collection("quest4you_messages").add({
      conversationId: currentConversation.id,
      senderId: currentUser.uid,
      receiverId: currentFriend.id,
      text: text || '',
      imageUrl: imageUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    await db.collection("quest4you_conversations").doc(currentConversation.id).update({
      lastMessage: text || '📷 Imagem',
      lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
      [`unreadCount.${currentFriend.id}`]: firebase.firestore.FieldValue.increment(1)
    });
    
    // Notificar amigo
    if (typeof notifyNewMessage === 'function') {
      await notifyNewMessage(currentFriend.id, currentUser.displayName || 'Alguém', currentConversation.id);
    }
    
  } catch (error) {
    console.error('Error sending image message:', error);
    throw error;
  }
}

/**
 * Visualiza imagem em tela cheia
 */
function viewImage(imageUrl) {
  let viewer = document.getElementById('imageViewer');
  if (viewer) viewer.remove();
  
  viewer = document.createElement('div');
  viewer.id = 'imageViewer';
  viewer.className = 'image-viewer-overlay';
  viewer.onclick = () => viewer.remove();
  viewer.innerHTML = `
    <div class="image-viewer-content">
      <img src="${imageUrl}" alt="Imagem" class="full-image">
      <button class="image-viewer-close" onclick="event.stopPropagation(); document.getElementById('imageViewer').remove()">×</button>
      <a href="${imageUrl}" download class="image-viewer-download" onclick="event.stopPropagation()">⬇️ Download</a>
    </div>
  `;
  
  document.body.appendChild(viewer);
  setTimeout(() => viewer.classList.add('active'), 10);
}

// ================================
// NOTIFICATIONS HELPERS
// ================================

async function notifyGroupInvite(userId, groupName) {
  try {
    await db.collection("quest4you_notifications").add({
      userId: userId,
      type: 'group_invite',
      title: t('chatGroups.newGroup'),
      message: t('chatGroups.addedToGroup', {group: groupName}),
      icon: '👥',
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

async function notifyGroupMessage(userId, groupName, senderName) {
  try {
    await db.collection("quest4you_notifications").add({
      userId: userId,
      type: 'group_message',
      title: groupName,
      message: t('chatGroups.sentMessage', {name: senderName}),
      icon: '👥',
      read: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// ================================
// EXPORTS
// ================================
window.createGroupChat = createGroupChat;
window.loadUserGroups = loadUserGroups;
window.openGroupChat = openGroupChat;
window.showCreateGroupModal = showCreateGroupModal;
window.closeCreateGroupModal = closeCreateGroupModal;
window.confirmCreateGroup = confirmCreateGroup;
window.updateSelectedMembers = updateSelectedMembers;
window.showGroupInfo = showGroupInfo;
window.closeGroupInfoModal = closeGroupInfoModal;
window.confirmLeaveGroup = confirmLeaveGroup;
window.openImageSelector = openImageSelector;
window.closeImagePreview = closeImagePreview;
window.sendImageMessage = sendImageMessage;
window.viewImage = viewImage;
