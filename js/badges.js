/**
 * Quest4You - Badge System
 * Sistema de conquistas e gamificação
 * @fileoverview Sistema de badges e achievements
 */

(function() {
  'use strict';
  
  // ================================
  // BADGE DEFINITIONS
  // ================================
  
  const BADGES = {
    // === QUIZZES ===
    first_quiz: {
      id: 'first_quiz',
      name: 'Primeiro Passo',
      description: 'Completaste o teu primeiro questionário',
      icon: '🎯',
      tier: 'bronze',
      criteria: { type: 'quizzes_completed', target: 1 }
    },
    quiz_explorer: {
      id: 'quiz_explorer',
      name: 'Explorador',
      description: 'Completaste 5 questionários diferentes',
      icon: '🧭',
      tier: 'silver',
      criteria: { type: 'quizzes_completed', target: 5 }
    },
    quiz_master: {
      id: 'quiz_master',
      name: 'Mestre dos Quizzes',
      description: 'Completaste todos os questionários disponíveis',
      icon: '👑',
      tier: 'gold',
      criteria: { type: 'quizzes_completed', target: 15 }
    },
    perfectionist: {
      id: 'perfectionist',
      name: 'Perfeccionista',
      description: 'Respondeste a todas as perguntas de um quiz',
      icon: '✨',
      tier: 'bronze',
      criteria: { type: 'quiz_all_answered', target: 1 }
    },
    
    // === SCORES ===
    high_scorer: {
      id: 'high_scorer',
      name: 'Alta Pontuação',
      description: 'Obtiveste uma pontuação acima de 80 num quiz',
      icon: '🏆',
      tier: 'silver',
      criteria: { type: 'score_above', target: 80 }
    },
    balanced: {
      id: 'balanced',
      name: 'Equilibrado',
      description: 'Obtiveste uma pontuação entre 45-55 num quiz',
      icon: '⚖️',
      tier: 'bronze',
      criteria: { type: 'score_range', min: 45, max: 55 }
    },
    
    // === ENGAGEMENT ===
    daily_visitor: {
      id: 'daily_visitor',
      name: 'Visitante Frequente',
      description: 'Visitaste o Quest4You 3 dias seguidos',
      icon: '📅',
      tier: 'bronze',
      criteria: { type: 'days_streak', target: 3 }
    },
    dedicated: {
      id: 'dedicated',
      name: 'Dedicado',
      description: 'Visitaste o Quest4You 7 dias seguidos',
      icon: '🔥',
      tier: 'silver',
      criteria: { type: 'days_streak', target: 7 }
    },
    loyal: {
      id: 'loyal',
      name: 'Leal',
      description: 'Visitaste o Quest4You 30 dias seguidos',
      icon: '💎',
      tier: 'gold',
      criteria: { type: 'days_streak', target: 30 }
    },
    
    // === SOCIAL ===
    first_match: {
      id: 'first_match',
      name: 'Primeira Conexão',
      description: 'Encontraste o teu primeiro match',
      icon: '💕',
      tier: 'bronze',
      criteria: { type: 'matches_found', target: 1 }
    },
    social_butterfly: {
      id: 'social_butterfly',
      name: 'Borboleta Social',
      description: 'Encontraste 10 matches',
      icon: '🦋',
      tier: 'silver',
      criteria: { type: 'matches_found', target: 10 }
    },
    connector: {
      id: 'connector',
      name: 'Conector',
      description: 'Iniciaste 5 conversas',
      icon: '💬',
      tier: 'silver',
      criteria: { type: 'conversations_started', target: 5 }
    },
    
    // === PROFILE ===
    profile_complete: {
      id: 'profile_complete',
      name: 'Perfil Completo',
      description: 'Preencheste todas as informações do perfil',
      icon: '📝',
      tier: 'bronze',
      criteria: { type: 'profile_complete', target: 100 }
    },
    verified: {
      id: 'verified',
      name: 'Verificado',
      description: 'Verificaste a tua conta',
      icon: '✅',
      tier: 'silver',
      criteria: { type: 'account_verified', target: true }
    },
    
    // === SPECIAL ===
    night_owl: {
      id: 'night_owl',
      name: 'Coruja Noturna',
      description: 'Completaste um quiz depois da meia-noite',
      icon: '🦉',
      tier: 'bronze',
      criteria: { type: 'quiz_time', after: 0, before: 5 }
    },
    early_bird: {
      id: 'early_bird',
      name: 'Madrugador',
      description: 'Completaste um quiz antes das 7h',
      icon: '🐦',
      tier: 'bronze',
      criteria: { type: 'quiz_time', after: 5, before: 7 }
    },
    weekend_warrior: {
      id: 'weekend_warrior',
      name: 'Guerreiro de Fim de Semana',
      description: 'Completaste 3 quizzes num fim de semana',
      icon: '⚔️',
      tier: 'silver',
      criteria: { type: 'weekend_quizzes', target: 3 }
    },
    
    // === CATEGORIES ===
    kink_explorer: {
      id: 'kink_explorer',
      name: 'Explorador Kinky',
      description: 'Completaste todos os quizzes de dinâmicas',
      icon: '🔗',
      tier: 'gold',
      criteria: { type: 'category_complete', category: 'dynamics' }
    },
    romantic: {
      id: 'romantic',
      name: 'Romântico',
      description: 'Completaste todos os quizzes de relacionamento',
      icon: '💖',
      tier: 'gold',
      criteria: { type: 'category_complete', category: 'relationship' }
    }
  };
  
  // Tier colors e pontos
  const TIER_INFO = {
    bronze: { color: '#cd7f32', points: 10, label: 'Bronze' },
    silver: { color: '#c0c0c0', points: 25, label: 'Prata' },
    gold: { color: '#ffd700', points: 50, label: 'Ouro' },
    platinum: { color: '#e5e4e2', points: 100, label: 'Platina' }
  };
  
  // ================================
  // STATE
  // ================================
  
  let userBadges = [];
  let badgeProgress = {};
  
  // ================================
  // INITIALIZATION
  // ================================
  
  /**
   * Inicializa o sistema de badges
   */
  async function initBadges() {
    // Carregar badges do utilizador
    await loadUserBadges();
    
    // Verificar streak diário
    updateDailyStreak();
    
    console.log('🏅 Badge system initialized');
  }
  
  /**
   * Carrega badges do utilizador da cloud
   */
  async function loadUserBadges() {
    const userId = window.firebaseAuth?.currentUser?.uid;
    if (!userId || !window.CloudSync) {
      // Carregar do localStorage como fallback
      userBadges = JSON.parse(localStorage.getItem('q4y_badges') || '[]');
      badgeProgress = JSON.parse(localStorage.getItem('q4y_badge_progress') || '{}');
      return;
    }
    
    try {
      const userData = await window.CloudSync.getUserProfile(userId);
      userBadges = userData?.badges || [];
      badgeProgress = userData?.badgeProgress || {};
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  }
  
  /**
   * Guarda badges na cloud
   */
  async function saveBadges() {
    const userId = window.firebaseAuth?.currentUser?.uid;
    
    // Sempre guardar localmente
    localStorage.setItem('q4y_badges', JSON.stringify(userBadges));
    localStorage.setItem('q4y_badge_progress', JSON.stringify(badgeProgress));
    
    if (!userId || !window.CloudSync) return;
    
    try {
      await window.CloudSync.updateUserProfile(userId, {
        badges: userBadges,
        badgeProgress: badgeProgress
      });
    } catch (error) {
      console.error('Error saving badges:', error);
    }
  }
  
  // ================================
  // BADGE CHECKING
  // ================================
  
  /**
   * Verifica e desbloqueia badges após uma ação
   * @param {string} action - Tipo de ação
   * @param {Object} data - Dados relevantes
   * @returns {Array} Badges desbloqueados
   */
  function checkBadges(action, data = {}) {
    const unlockedBadges = [];
    
    Object.values(BADGES).forEach(badge => {
      // Skip se já tem o badge
      if (hasBadge(badge.id)) return;
      
      // Verificar critérios
      if (checkBadgeCriteria(badge, action, data)) {
        unlockBadge(badge);
        unlockedBadges.push(badge);
      }
    });
    
    return unlockedBadges;
  }
  
  /**
   * Verifica se os critérios de um badge foram cumpridos
   */
  function checkBadgeCriteria(badge, action, data) {
    const criteria = badge.criteria;
    
    switch (criteria.type) {
      case 'quizzes_completed':
        if (action !== 'quiz_completed') return false;
        const completedCount = getCompletedQuizzesCount();
        return completedCount >= criteria.target;
      
      case 'score_above':
        if (action !== 'quiz_completed') return false;
        return data.score >= criteria.target;
      
      case 'score_range':
        if (action !== 'quiz_completed') return false;
        return data.score >= criteria.min && data.score <= criteria.max;
      
      case 'days_streak':
        if (action !== 'daily_visit') return false;
        return (badgeProgress.currentStreak || 0) >= criteria.target;
      
      case 'matches_found':
        if (action !== 'match_found') return false;
        return (badgeProgress.matchesFound || 0) >= criteria.target;
      
      case 'quiz_all_answered':
        if (action !== 'quiz_completed') return false;
        return data.allAnswered === true;
      
      case 'quiz_time':
        if (action !== 'quiz_completed') return false;
        const hour = new Date().getHours();
        return hour >= criteria.after && hour < criteria.before;
      
      case 'profile_complete':
        if (action !== 'profile_updated') return false;
        return data.completeness >= criteria.target;
      
      case 'account_verified':
        return action === 'account_verified';
      
      default:
        return false;
    }
  }
  
  /**
   * Desbloqueia um badge
   */
  function unlockBadge(badge) {
    const badgeData = {
      id: badge.id,
      unlockedAt: new Date().toISOString()
    };
    
    userBadges.push(badgeData);
    saveBadges();
    
    // Mostrar notificação
    showBadgeNotification(badge);
    
    // Disparar evento
    window.dispatchEvent(new CustomEvent('badgeUnlocked', { detail: badge }));
    
    console.log('🏅 Badge unlocked:', badge.name);
  }
  
  /**
   * Verifica se o utilizador tem um badge
   */
  function hasBadge(badgeId) {
    return userBadges.some(b => b.id === badgeId);
  }
  
  // ================================
  // PROGRESS TRACKING
  // ================================
  
  /**
   * Atualiza streak diário
   */
  function updateDailyStreak() {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('q4y_last_visit');
    const lastVisitDate = lastVisit ? new Date(lastVisit).toDateString() : null;
    
    if (lastVisitDate === today) {
      // Já visitou hoje
      return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastVisitDate === yesterday.toDateString()) {
      // Visita consecutiva
      badgeProgress.currentStreak = (badgeProgress.currentStreak || 0) + 1;
    } else {
      // Streak quebrado
      badgeProgress.currentStreak = 1;
    }
    
    badgeProgress.longestStreak = Math.max(
      badgeProgress.longestStreak || 0,
      badgeProgress.currentStreak
    );
    
    localStorage.setItem('q4y_last_visit', new Date().toISOString());
    saveBadges();
    
    // Verificar badges de streak
    checkBadges('daily_visit');
  }
  
  /**
   * Obtém contagem de quizzes completados
   */
  function getCompletedQuizzesCount() {
    // Tentar obter da cloud sync
    if (window.CloudSync && window.firebaseAuth?.currentUser) {
      // Será preenchido assincronamente
      return badgeProgress.quizzesCompleted || 0;
    }
    
    // Fallback: contar do localStorage
    const results = JSON.parse(localStorage.getItem('q4y_quiz_results') || '{}');
    return Object.keys(results).length;
  }
  
  // ================================
  // NOTIFICATIONS
  // ================================
  
  /**
   * Mostra notificação de badge desbloqueado
   */
  function showBadgeNotification(badge) {
    const tierInfo = TIER_INFO[badge.tier];
    
    // Usar toast system se disponível
    if (window.Toast) {
      window.Toast.show({
        message: `${badge.icon} ${badge.name}`,
        title: '🏅 Novo Badge!',
        type: 'success',
        duration: 6000,
        actions: [
          {
            label: 'Ver Badges',
            onClick: () => showBadgeModal()
          }
        ]
      });
    } else if (window.showToast) {
      window.showToast({
        message: `🏅 Novo Badge: ${badge.icon} ${badge.name}`,
        type: 'success',
        duration: 6000
      });
    }
    
    // Confetti effect
    if (typeof celebrateBadge === 'function') {
      celebrateBadge(badge);
    }
  }
  
  /**
   * Mostra modal com todos os badges
   */
  function showBadgeModal() {
    // Remover modal existente
    const existing = document.getElementById('badgeModal');
    if (existing) existing.remove();
    
    // Criar modal
    const modal = document.createElement('div');
    modal.id = 'badgeModal';
    modal.className = 'badge-modal';
    modal.innerHTML = createBadgeModalHTML();
    
    // Estilos
    if (!document.getElementById('badgeModalStyles')) {
      const style = document.createElement('style');
      style.id = 'badgeModalStyles';
      style.textContent = getBadgeModalStyles();
      document.head.appendChild(style);
    }
    
    document.body.appendChild(modal);
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeBadgeModal();
    });
    
    // Fechar com Escape
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeBadgeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
    
    // Animar entrada
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
  }
  
  function closeBadgeModal() {
    const modal = document.getElementById('badgeModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    }
  }
  
  function createBadgeModalHTML() {
    const allBadges = Object.values(BADGES);
    const unlockedIds = new Set(userBadges.map(b => b.id));
    
    let html = `
      <div class="badge-modal-content">
        <div class="badge-modal-header">
          <h2>🏅 As Tuas Conquistas</h2>
          <button class="badge-modal-close" onclick="closeBadgeModal()">×</button>
        </div>
        <div class="badge-modal-stats">
          <div class="badge-stat">
            <span class="badge-stat-value">${userBadges.length}</span>
            <span class="badge-stat-label">Desbloqueados</span>
          </div>
          <div class="badge-stat">
            <span class="badge-stat-value">${allBadges.length}</span>
            <span class="badge-stat-label">Total</span>
          </div>
          <div class="badge-stat">
            <span class="badge-stat-value">${calculateTotalPoints()}</span>
            <span class="badge-stat-label">Pontos</span>
          </div>
        </div>
        <div class="badge-grid">
    `;
    
    allBadges.forEach(badge => {
      const isUnlocked = unlockedIds.has(badge.id);
      const tierInfo = TIER_INFO[badge.tier];
      const unlockedData = userBadges.find(b => b.id === badge.id);
      
      html += `
        <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}" data-tier="${badge.tier}">
          <div class="badge-icon" style="border-color: ${tierInfo.color}">
            ${isUnlocked ? badge.icon : '🔒'}
          </div>
          <div class="badge-info">
            <div class="badge-name">${badge.name}</div>
            <div class="badge-description">${badge.description}</div>
            ${isUnlocked && unlockedData ? `
              <div class="badge-date">Desbloqueado em ${formatDate(unlockedData.unlockedAt)}</div>
            ` : ''}
          </div>
          <div class="badge-tier" style="background: ${tierInfo.color}">${tierInfo.label}</div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
    
    return html;
  }
  
  function getBadgeModalStyles() {
    return `
      .badge-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10003;
        opacity: 0;
        transition: opacity 0.3s ease;
        padding: 20px;
      }
      
      .badge-modal.active {
        opacity: 1;
      }
      
      .badge-modal-content {
        background: white;
        border-radius: 20px;
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }
      
      .badge-modal.active .badge-modal-content {
        transform: scale(1);
      }
      
      .badge-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #eee;
        position: sticky;
        top: 0;
        background: white;
        z-index: 1;
      }
      
      .badge-modal-header h2 {
        margin: 0;
        font-size: 1.4rem;
      }
      
      .badge-modal-close {
        background: none;
        border: none;
        font-size: 1.8rem;
        cursor: pointer;
        color: #666;
        line-height: 1;
        padding: 4px 8px;
      }
      
      .badge-modal-stats {
        display: flex;
        justify-content: center;
        gap: 40px;
        padding: 20px;
        background: #f9f9f9;
      }
      
      .badge-stat {
        text-align: center;
      }
      
      .badge-stat-value {
        display: block;
        font-size: 2rem;
        font-weight: 700;
        color: #C41E3A;
      }
      
      .badge-stat-label {
        font-size: 0.85rem;
        color: #666;
      }
      
      .badge-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
        padding: 20px;
      }
      
      .badge-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border-radius: 12px;
        border: 2px solid #eee;
        transition: all 0.2s ease;
        position: relative;
      }
      
      .badge-card.unlocked {
        border-color: #ddd;
        background: white;
      }
      
      .badge-card.locked {
        opacity: 0.5;
        filter: grayscale(1);
      }
      
      .badge-card.unlocked:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      
      .badge-icon {
        font-size: 2rem;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid;
        border-radius: 50%;
        flex-shrink: 0;
      }
      
      .badge-info {
        flex: 1;
        min-width: 0;
      }
      
      .badge-name {
        font-weight: 600;
        font-size: 0.95rem;
      }
      
      .badge-description {
        font-size: 0.8rem;
        color: #666;
        margin-top: 2px;
      }
      
      .badge-date {
        font-size: 0.75rem;
        color: #999;
        margin-top: 4px;
      }
      
      .badge-tier {
        position: absolute;
        top: 8px;
        right: 8px;
        font-size: 0.65rem;
        padding: 2px 8px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        text-transform: uppercase;
      }
      
      @media (max-width: 480px) {
        .badge-grid {
          grid-template-columns: 1fr;
        }
        
        .badge-modal-stats {
          gap: 20px;
        }
      }
    `;
  }
  
  function calculateTotalPoints() {
    return userBadges.reduce((total, userBadge) => {
      const badge = BADGES[userBadge.id];
      if (badge) {
        return total + (TIER_INFO[badge.tier]?.points || 0);
      }
      return total;
    }, 0);
  }
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  
  // ================================
  // PUBLIC API
  // ================================
  
  window.BadgeSystem = {
    init: initBadges,
    check: checkBadges,
    hasBadge,
    getUserBadges: () => [...userBadges],
    getAllBadges: () => Object.values(BADGES),
    showModal: showBadgeModal,
    closeModal: closeBadgeModal,
    getTotalPoints: calculateTotalPoints,
    getProgress: () => ({ ...badgeProgress })
  };
  
  // Aliases
  window.checkBadges = checkBadges;
  window.showBadgeModal = showBadgeModal;
  window.closeBadgeModal = closeBadgeModal;
  
  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBadges);
  } else {
    initBadges();
  }
  
})();
