/**
 * Quest4You - Quiz Logic v2.1
 * Dynamic options from JSON, tag-based scoring (0-100)
 * Supports: spectrum, tags result types
 */

// ================================
// STATE
// ================================
let quizData = null;
let filteredQuestions = [];
let currentQuestion = 0;
let answers = {};        // { questionId: { optionIndex, score, tags } }
let quizId = null;
let currentUser = null;
let userGender = null;
let isEditMode = false;
let quizLoaded = false;

// ================================
// INITIALIZATION
// ================================
document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  quizId = urlParams.get("id");
  isEditMode = urlParams.get("mode") === "edit";
  if (!quizId) {
    alert(t('quiz.notSpecified'));
    window.location.href = "../";
    return;
  }

  console.log("Loading quiz:", quizId, isEditMode ? "(edit mode)" : "");

  // Setup offline detection
  setupOfflineDetection();

  if (typeof firebase !== 'undefined' && window.firebaseAuth) {
    window.firebaseAuth.onAuthStateChanged(function(user) {
      currentUser = user;
      if (user) {
        console.log("Utilizador autenticado:", user.email);
        updateUserUI(user);
      }
      loadQuiz(quizId);
    });  } else {
    loadQuiz(quizId);
  }

  // Re-render when language changes
  window.addEventListener('languageChanged', function() {
    // Clear translation cache when language changes
    clearTranslationCache();
    
    if (quizData && filteredQuestions.length > 0) {
      initQuizUI(); // Re-init to update title/description
      renderQuestion();
      renderQuickNav();
      updateNavButtons();
    }
  });
});

/**
 * Setup offline/online detection with user notification
 */
function setupOfflineDetection() {
  let offlineBanner = null;
  
  function showOfflineBanner() {
    if (offlineBanner) return;
    
    offlineBanner = document.createElement('div');
    offlineBanner.id = 'offlineBanner';
    offlineBanner.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #ff9800; color: #000; padding: 10px 20px; text-align: center; z-index: 10000; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px;';
    offlineBanner.innerHTML = `
      <span>📶</span>
      <span>${typeof t === 'function' ? t('common.offline') : 'Estás offline. As respostas serão guardadas quando a conexão voltar.'}</span>
    `;
    document.body.prepend(offlineBanner);
    
    // Adjust body padding
    document.body.style.paddingTop = '40px';
  }
  
  function hideOfflineBanner() {
    if (offlineBanner) {
      offlineBanner.remove();
      offlineBanner = null;
      document.body.style.paddingTop = '';
    }
  }
  
  window.addEventListener('online', function() {
    hideOfflineBanner();
    // Try to sync any pending data
    if (currentUser && window.CloudSync && Object.keys(answers).length > 0) {
      saveProgressToCloud();
    }
  });
  
  window.addEventListener('offline', showOfflineBanner);
  
  // Check initial state
  if (!navigator.onLine) {
    showOfflineBanner();
  }
}

// ================================
// UPDATE USER UI
// ================================
function updateUserUI(user) {
  const nav = document.querySelector('.nav');
  if (nav && !document.getElementById('userIndicator')) {
    const userDiv = document.createElement('span');
    userDiv.id = 'userIndicator';
    userDiv.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; color: #666; font-size: 0.85rem;';
    userDiv.innerHTML = '<span></span> ' + (user.displayName || user.email.split('@')[0]);
    nav.insertBefore(userDiv, nav.firstChild);
  }
}

// ================================
// LOAD QUIZ DATA
// ================================
async function loadQuiz(id) {
  if (quizLoaded) return;
  quizLoaded = true;

  // Show loading state
  showLoadingState(true);

  try {
    const response = await fetch('../data/quizzes/' + id + '.json');
    if (!response.ok) {
      throw new Error(response.status === 404 ? 'Quiz not found' : 'Network error');
    }

    quizData = await response.json();
    
    // Validate quiz data structure
    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      throw new Error('Invalid quiz data: no questions found');
    }
    
    console.log("Quiz loaded:", quizData.name, "with", quizData.questions.length, "questions (v" + quizData.quizVersion + ")");

    // Check if quiz requires gender
    if (quizData.requiresGender) {
      userGender = await getUserGender();
      if (!userGender) {
        showLoadingState(false);
        showGenderModal();
        return;
      }
    }

    filterQuestionsByGender();
    
    // Pre-load category translations for better performance
    preloadCategoryTranslations();

    // Load saved answers from cloud
    if (currentUser && window.CloudSync) {
      try {
        if (isEditMode) {
          const savedResult = await window.CloudSync.getQuizResult(currentUser.uid, id);
          if (savedResult && savedResult.answers) {
            answers = savedResult.answers;
            console.log("📝 Edit mode: Loaded", Object.keys(answers).length, "saved answers");
            setTimeout(showEditModeMessage, 500);
          }
        } else {
          const progress = await window.CloudSync.getQuizProgress(currentUser.uid, id);
          if (progress && progress.answers) {
            answers = progress.answers;
            for (let i = 0; i < filteredQuestions.length; i++) {
              if (!answers[filteredQuestions[i].id]) {
                currentQuestion = i;
                break;
              }
            }
            console.log("Progress loaded:", Object.keys(answers).length, "answers");
          }
        }
      } catch (error) {
        console.error("Error loading answers:", error);
        // Non-fatal error, continue with quiz
      }
    }

    showLoadingState(false);
    initQuizUI();
    renderQuestion();
    renderQuickNav();
  } catch (error) {
    console.error("Error loading quiz:", error);
    quizLoaded = false;
    showLoadingState(false);
    showErrorState(error.message);
  }
}

/**
 * Shows/hides loading overlay
 */
function showLoadingState(show) {
  let loader = document.getElementById('quizLoader');
  
  if (show) {
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'quizLoader';
      loader.className = 'quiz-loader';
      loader.innerHTML = `
        <div class="loader-content">
          <div class="loader-spinner"></div>
          <p>${typeof t === 'function' ? t('quiz.loading') : 'Carregando...'}</p>
        </div>
      `;
      loader.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.95); display: flex; align-items: center; justify-content: center; z-index: 9999;';
      
      // Add spinner styles if not present
      if (!document.getElementById('loaderStyles')) {
        const style = document.createElement('style');
        style.id = 'loaderStyles';
        style.textContent = `
          .loader-content { text-align: center; }
          .loader-spinner { width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-color, #8b4a5e); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .loader-content p { color: #666; font-size: 1rem; }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
  } else if (loader) {
    loader.style.display = 'none';
  }
}

/**
 * Shows error state with retry option
 */
function showErrorState(message) {
  const errorHtml = `
    <div class="quiz-error" style="text-align: center; padding: 60px 20px;">
      <div style="font-size: 4rem; margin-bottom: 20px;">😵</div>
      <h2 style="color: #e53935; margin-bottom: 16px;">${typeof t === 'function' ? t('quiz.loadError') : 'Erro ao carregar'}</h2>
      <p style="color: #666; margin-bottom: 24px;">${message}</p>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <button class="btn-primary" onclick="location.reload()" style="padding: 12px 24px; border-radius: 8px; cursor: pointer;">
          🔄 ${typeof t === 'function' ? t('common.retry') : 'Tentar novamente'}
        </button>
        <button class="btn-secondary" onclick="window.location.href='../'" style="padding: 12px 24px; border-radius: 8px; cursor: pointer; background: #f5f5f5; border: 1px solid #ddd;">
          🏠 ${typeof t === 'function' ? t('nav.home') : 'Voltar ao início'}
        </button>
      </div>
    </div>
  `;
  
  const container = document.querySelector('.quiz-container') || document.body;
  container.innerHTML = errorHtml;
}

// ================================
// GET USER GENDER
// ================================
async function getUserGender() {
  if (currentUser && window.CloudSync) {
    try {
      const gender = await window.CloudSync.getUserGender(currentUser.uid);
      if (gender) return gender;
    } catch (error) {
      console.error("Error fetching user gender:", error);
    }
  }

  const localGender = localStorage.getItem("q4y_user_gender");
  if (localGender) {
    if (currentUser && window.CloudSync) {
      try {
        await window.CloudSync.saveUserGender(currentUser.uid, localGender);
        localStorage.removeItem("q4y_user_gender");
      } catch (e) { /* ignore */ }
    }
    return localGender;
  }

  return null;
}

// ================================
// SHOW GENDER MODAL
// ================================
function showGenderModal() {
  if (!document.getElementById('genderModal')) {
    const modalTitle = typeof t === 'function' ? t('quiz.genderModalTitle') : 'Antes de começar...';
    const modalDesc = typeof t === 'function' ? t('quiz.genderModalDesc') : 'Este questionário adapta algumas perguntas ao teu género.';
    const genderMale = typeof t === 'function' ? t('quiz.genderMale') : '👨 Masculino';
    const genderFemale = typeof t === 'function' ? t('quiz.genderFemale') : '👩 Feminino';
    const genderNonBinary = typeof t === 'function' ? t('quiz.genderNonBinary') : '🌈 Não-binário';
    const genderOther = typeof t === 'function' ? t('quiz.genderOther') : '🤷 Outro / Prefiro não dizer';
    
    const modal = document.createElement('div');
    modal.id = 'genderModal';
    modal.className = 'result-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="result-content" style="max-width: 400px;">
        <div class="result-header" style="background: linear-gradient(135deg, ${quizData.color} 0%, ${adjustColor(quizData.color, -20)} 100%);">
          <span class="result-emoji">⚧</span>
          <h2>${modalTitle}</h2>
        </div>
        <div class="result-body" style="padding: 30px;">
          <p style="text-align: center; margin-bottom: 20px; color: #666;">
            ${modalDesc}
          </p>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="option-btn" onclick="selectGender('masculino')">${genderMale}</button>
            <button class="option-btn" onclick="selectGender('feminino')">${genderFemale}</button>
            <button class="option-btn" onclick="selectGender('nao-binario')">${genderNonBinary}</button>
            <button class="option-btn" onclick="selectGender('outro')">${genderOther}</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    document.getElementById('genderModal').style.display = 'flex';
  }
}

// ================================
// SELECT GENDER
// ================================
async function selectGender(gender) {
  userGender = gender;

  if (currentUser && window.CloudSync) {
    try {
      await window.CloudSync.saveUserGender(currentUser.uid, gender);
    } catch (error) {
      console.error("Error saving gender:", error);
    }
  }

  document.getElementById('genderModal').style.display = 'none';
  filterQuestionsByGender();

  if (currentUser && window.CloudSync) {
    try {
      const progress = await window.CloudSync.getQuizProgress(currentUser.uid, quizId);
      if (progress && progress.answers) {
        answers = progress.answers;
        currentQuestion = progress.currentQuestion || 0;
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  }

  initQuizUI();
  renderQuestion();
  renderQuickNav();
}

// ================================
// FILTER QUESTIONS BY GENDER
// ================================
function filterQuestionsByGender() {
  if (!quizData.requiresGender || !userGender) {
    filteredQuestions = quizData.questions;
    return;
  }

  filteredQuestions = quizData.questions.filter(function(question) {
    if (!question.forGender) return true;
    return question.forGender.includes(userGender) || question.forGender.includes('all');
  });

  console.log("Filtered for " + userGender + ":", filteredQuestions.length, "of", quizData.questions.length);
}

// ================================
// QUIZ CONTENT TRANSLATION HELPERS
// ================================

/**
 * Translation cache with TTL support
 * Each cache entry stores: { value, timestamp }
 */
const translationCache = new Map();

/**
 * Cache TTL in milliseconds (30 minutes default)
 * After this time, cached translations will be refreshed
 */
const CACHE_TTL = 30 * 60 * 1000;

/**
 * Maximum cache size to prevent memory issues
 */
const CACHE_MAX_SIZE = 500;

/**
 * Clears translation cache - call when language changes
 */
function clearTranslationCache() {
  translationCache.clear();
  console.log('🌐 Translation cache cleared');
}

/**
 * Prunes expired entries from cache
 */
function pruneTranslationCache() {
  const now = Date.now();
  let pruned = 0;
  
  for (const [key, entry] of translationCache) {
    if (now - entry.timestamp > CACHE_TTL) {
      translationCache.delete(key);
      pruned++;
    }
  }
  
  if (pruned > 0) {
    console.log(`🧹 Pruned ${pruned} expired cache entries`);
  }
}

/**
 * Ensures cache doesn't exceed max size by removing oldest entries
 */
function ensureCacheSize() {
  if (translationCache.size <= CACHE_MAX_SIZE) return;
  
  // Convert to array and sort by timestamp (oldest first)
  const entries = Array.from(translationCache.entries())
    .sort((a, b) => a[1].timestamp - b[1].timestamp);
  
  // Remove oldest 20% of entries
  const toRemove = Math.ceil(entries.length * 0.2);
  for (let i = 0; i < toRemove; i++) {
    translationCache.delete(entries[i][0]);
  }
  
  console.log(`🧹 Removed ${toRemove} oldest cache entries`);
}

/**
 * Gets a value from cache if valid
 * @param {string} key - Cache key
 * @returns {string|null} Cached value or null if expired/missing
 */
function getCachedValue(key) {
  const entry = translationCache.get(key);
  if (!entry) return null;
  
  // Check if expired
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    translationCache.delete(key);
    return null;
  }
  
  return entry.value;
}

/**
 * Sets a value in cache with timestamp
 * @param {string} key - Cache key
 * @param {string} value - Value to cache
 */
function setCachedValue(key, value) {
  ensureCacheSize();
  translationCache.set(key, {
    value,
    timestamp: Date.now()
  });
}

/**
 * Gets translated quiz text (question/option) if available in i18n
 * Falls back to original Portuguese text from JSON if no translation exists
 * Uses caching with TTL for performance optimization
 * 
 * Keys: quizContent.{quizId}.q{questionId} for questions
 *       quizContent.{quizId}.q{questionId}_o{optionIndex} for options
 *       quizContent.{quizId}.cat_{categoryIndex} for category labels
 *       quizContent.{quizId}.cat_{categoryIndex}_desc for category descriptions
 */
function getQuizText(type, questionId, optionIndex, fallback) {
  if (typeof t !== 'function') return fallback;
  
  // Build cache key
  const cacheKey = `${quizId}_${type}_${questionId}_${optionIndex}`;
  
  // Return cached value if exists and valid
  const cachedValue = getCachedValue(cacheKey);
  if (cachedValue !== null) {
    return cachedValue;
  }
  
  let key;
  if (type === 'question') {
    key = `quizContent.${quizId}.q${questionId}`;
  } else if (type === 'option') {
    key = `quizContent.${quizId}.q${questionId}_o${optionIndex}`;
  } else if (type === 'category') {
    key = `quizContent.${quizId}.cat_${questionId}`; // questionId is actually category index here
  } else if (type === 'categoryDesc') {
    key = `quizContent.${quizId}.cat_${questionId}_desc`;
  }
  
  const translated = t(key);
  // If t() returns the key itself, no translation exists - use fallback
  const result = (translated && translated !== key) ? translated : fallback;
  
  // Cache the result with TTL
  setCachedValue(cacheKey, result);
  
  return result;
}

/**
 * Gets translated quiz name from i18n
 * Priority: quizContent.{id}.name > quizNames.{id} > JSON fallback
 */
function getQuizName() {
  if (typeof t !== 'function' || !quizData) return quizData?.name || '';
  
  const cacheKey = `${quizId}_name`;
  const cachedValue = getCachedValue(cacheKey);
  if (cachedValue !== null) {
    return cachedValue;
  }
  
  // Try quizContent.{id}.name first (new structure)
  let translated = t(`quizContent.${quizId}.name`);
  if (translated && translated !== `quizContent.${quizId}.name`) {
    setCachedValue(cacheKey, translated);
    return translated;
  }
  
  // Fallback to quizNames.{id} (legacy structure)
  translated = t(`quizNames.${quizId}`);
  const result = (translated && translated !== `quizNames.${quizId}`) ? translated : quizData.name;
  
  setCachedValue(cacheKey, result);
  return result;
}

/**
 * Gets translated quiz description from i18n
 * Priority: quizContent.{id}.description > quizDescriptions.{id} > JSON fallback
 */
function getQuizDescription() {
  if (typeof t !== 'function' || !quizData) return quizData?.description || '';
  
  const cacheKey = `${quizId}_description`;
  const cachedValue = getCachedValue(cacheKey);
  if (cachedValue !== null) {
    return cachedValue;
  }
  
  // Try quizContent.{id}.description first (new structure)
  let translated = t(`quizContent.${quizId}.description`);
  if (translated && translated !== `quizContent.${quizId}.description`) {
    setCachedValue(cacheKey, translated);
    return translated;
  }
  
  // Fallback to quizDescriptions.{id} (legacy structure)
  translated = t(`quizDescriptions.${quizId}`);
  const result = (translated && translated !== `quizDescriptions.${quizId}`) ? translated : quizData.description;
  
  setCachedValue(cacheKey, result);
  return result;
}

/**
 * Gets translated category (for results) with caching
 */
function getTranslatedCategory(category, index) {
  if (!category) return null;
  
  const cacheKey = `${quizId}_cat_full_${index}`;
  const cachedValue = getCachedValue(cacheKey);
  if (cachedValue !== null) {
    return cachedValue;
  }
  
  const translated = {
    ...category,
    label: getQuizText('category', index, null, category.label),
    description: getQuizText('categoryDesc', index, null, category.description)
  };
  
  setCachedValue(cacheKey, translated);
  return translated;
}

/**
 * Pre-loads all category translations for better performance
 */
function preloadCategoryTranslations() {
  if (!quizData?.categories) return;
  
  quizData.categories.forEach((cat, index) => {
    getTranslatedCategory(cat, index);
  });
}

// ================================
// INITIALIZE UI
// ================================
function initQuizUI() {
  document.getElementById("quizIcon").textContent = quizData.icon;
  document.getElementById("quizTitle").textContent = getQuizName();
  document.getElementById("quizDescription").textContent = getQuizDescription();
  document.title = getQuizName() + ' - Quest4You';

  document.documentElement.style.setProperty("--primary-color", quizData.color);

  const header = document.getElementById("quizHeader");
  if (header) {
    header.style.background = 'linear-gradient(135deg, ' + quizData.color + ' 0%, ' + adjustColor(quizData.color, -20) + ' 100%)';
  }
}

// ================================
// RENDER QUESTION (v2.1 dynamic options)
// ================================
function renderQuestion() {
  const question = filteredQuestions[currentQuestion];

  document.getElementById("questionNumber").textContent = currentQuestion + 1;
  document.getElementById("questionText").textContent = getQuizText('question', question.id, null, question.text);

  // Update progress
  const totalQuestions = filteredQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const percent = Math.round((answeredCount / totalQuestions) * 100);
  document.getElementById("progressText").textContent = t('quiz.questionOf', { current: currentQuestion + 1, total: totalQuestions });
  document.getElementById("progressPercent").textContent = percent + '%';
  document.getElementById("progressBar").style.width = percent + '%';
  
  // Accessibility: Update ARIA attributes
  const progressBar = document.getElementById("progressBar");
  if (progressBar) {
    progressBar.setAttribute('aria-valuenow', percent);
    progressBar.setAttribute('aria-valuemin', '0');
    progressBar.setAttribute('aria-valuemax', '100');
  }

  // Render dynamic options from JSON
  const container = document.getElementById("optionsContainer");
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  let html = '';

  question.options.forEach(function(option, index) {
    const isSelected = answers[question.id] && answers[question.id].optionIndex === index;
    const optionText = getQuizText('option', question.id, index, option.text);
    html += '<button class="option-btn' + (isSelected ? ' selected' : '') + '" ';
    html += 'data-index="' + index + '" ';
    html += 'onclick="selectAnswer(' + index + ')" ';
    html += 'role="radio" ';
    html += 'aria-checked="' + (isSelected ? 'true' : 'false') + '" ';
    html += 'aria-label="' + letters[index] + ': ' + optionText.replace(/"/g, '&quot;') + '">';
    html += '<span class="option-letter" aria-hidden="true">' + (letters[index] || (index + 1)) + '</span>';
    html += '<span class="option-text">' + optionText + '</span>';
    html += '</button>';
  });

  container.innerHTML = html;
  container.setAttribute('role', 'radiogroup');
  container.setAttribute('aria-label', getQuizText('question', question.id, null, question.text));

  updateNavButtons();
  updateQuickNav();

  // Slide animation
  const card = document.getElementById("questionCard");
  card.style.animation = "none";
  card.offsetHeight;
  card.style.animation = "slideIn 0.3s ease";
  
  // Focus management for keyboard navigation
  if (document.activeElement && document.activeElement.classList.contains('option-btn')) {
    const firstOption = container.querySelector('.option-btn');
    if (firstOption) firstOption.focus();
  }
}

// ================================
// SELECT ANSWER (v2.1 - stores score + tags)
// ================================
function selectAnswer(optionIndex) {
  const question = filteredQuestions[currentQuestion];
  const option = question.options[optionIndex];

  // Haptic feedback on mobile devices
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }

  // Store answer with score and tags
  answers[question.id] = {
    optionIndex: optionIndex,
    score: option.score,
    tags: option.tags || []
  };

  // Update button states with animation
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(function(btn) {
    btn.classList.remove("selected");
    btn.setAttribute('aria-checked', 'false');
    if (parseInt(btn.dataset.index) === optionIndex) {
      btn.classList.add("selected");
      btn.setAttribute('aria-checked', 'true');
      // Add selection pulse animation
      btn.style.animation = 'none';
      btn.offsetHeight; // Trigger reflow
      btn.style.animation = 'selectPulse 0.3s ease';
    }
  });

  // Save progress
  saveProgressToCloud();

  updateNavButtons();
  updateQuickNav();

  // Update progress bar with smooth transition
  const totalQuestions = filteredQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const percent = Math.round((answeredCount / totalQuestions) * 100);
  
  const progressBar = document.getElementById("progressBar");
  const progressPercent = document.getElementById("progressPercent");
  progressPercent.textContent = percent + '%';
  progressBar.style.width = percent + '%';
  progressBar.setAttribute('aria-valuenow', percent);

  // Auto-advance after short delay
  setTimeout(function() {
    if (currentQuestion < filteredQuestions.length - 1) {
      nextQuestion();
    }
  }, 350);
}

// Add selection animation styles
(function() {
  if (!document.getElementById('selectionStyles')) {
    const style = document.createElement('style');
    style.id = 'selectionStyles';
    style.textContent = `
      @keyframes selectPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }
      .option-btn { transition: all 0.2s ease; }
      .option-btn:hover { transform: translateY(-2px); }
      .option-btn:active { transform: scale(0.98); }
      .option-btn.selected { transform: scale(1); }
    `;
    document.head.appendChild(style);
  }
})();

// ================================
// NAVIGATION
// ================================
function previousQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
}

function nextQuestion() {
  if (currentQuestion < filteredQuestions.length - 1) {
    currentQuestion++;
    renderQuestion();
  }
}

function goToQuestion(index) {
  if (index >= 0 && index < filteredQuestions.length) {
    currentQuestion = index;
    renderQuestion();
  }
}

function updateNavButtons() {
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const btnFinish = document.getElementById("btnFinish");

  btnPrev.disabled = currentQuestion === 0;

  const allAnswered = Object.keys(answers).length === filteredQuestions.length;
  const isLastQuestion = currentQuestion === filteredQuestions.length - 1;

  if (isLastQuestion && allAnswered) {
    btnNext.style.display = "none";
    btnFinish.style.display = "inline-flex";
  } else {
    btnNext.style.display = "inline-flex";
    btnFinish.style.display = "none";
    btnNext.disabled = !answers[filteredQuestions[currentQuestion].id];
  }
}

// ================================
// QUICK NAVIGATION
// ================================
function renderQuickNav() {
  const container = document.getElementById("quickNavDots");
  let html = "";
  for (let i = 0; i < filteredQuestions.length; i++) {
    html += '<button class="quick-nav-dot" data-index="' + i + '" onclick="goToQuestion(' + i + ')" title="' + t('quiz.questionTitle', {number: i + 1}) + '"></button>';
  }
  container.innerHTML = html;
  updateQuickNav();
}

function updateQuickNav() {
  const dots = document.querySelectorAll(".quick-nav-dot");
  dots.forEach(function(dot, index) {
    dot.classList.remove("answered", "current");
    const question = filteredQuestions[index];
    if (answers[question.id]) {
      dot.classList.add("answered");
    }
    if (index === currentQuestion) {
      dot.classList.add("current");
    }
  });
}

// ================================
// CALCULATE RESULTS (v2.1)
// ================================
function calculateResults() {
  // Collect all scores and tags
  let totalScore = 0;
  let answeredCount = 0;
  const allTags = [];
  const tagCounts = {};

  filteredQuestions.forEach(function(question) {
    const answer = answers[question.id];
    if (answer) {
      totalScore += answer.score;
      answeredCount++;

      // Collect tags
      if (answer.tags && answer.tags.length > 0) {
        answer.tags.forEach(function(tag) {
          allTags.push(tag);
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    }
  });

  // Average score (0-100 scale)
  const averageScore = answeredCount > 0 ? Math.round(totalScore / answeredCount) : 0;
  // Find matching category
  let resultCategory = null;
  let categoryIndex = -1;
  if (quizData.categories) {
    for (let i = 0; i < quizData.categories.length; i++) {
      const cat = quizData.categories[i];
      if (averageScore >= cat.min && averageScore <= cat.max) {
        resultCategory = cat;
        categoryIndex = i;
        break;
      }
    }
  }

  // Sort tags by frequency (top tags)
  const sortedTags = Object.entries(tagCounts)
    .sort(function(a, b) { return b[1] - a[1]; })
    .map(function(entry) { return entry[0]; });

  // Unique tags
  const uniqueTags = [...new Set(allTags)];

  return {
    score: averageScore,
    totalPoints: Math.round(totalScore),
    maxPoints: answeredCount * 100,
    answeredCount: answeredCount,
    category: resultCategory,
    categoryIndex: categoryIndex,
    tags: uniqueTags,
    topTags: sortedTags.slice(0, 10),
    tagCounts: tagCounts
  };
}

// ================================
// FINISH QUIZ
// ================================
function finishQuiz() {
  const allAnswered = Object.keys(answers).length === filteredQuestions.length;
  if (!allAnswered) {
    const unanswered = filteredQuestions.length - Object.keys(answers).length;
    if (!confirm(t('quiz.unansweredWarning', { count: unanswered }))) {
      return;
    }
  }
  
  const results = calculateResults();
  
  // Track quiz completion (analytics)
  trackEvent('quiz_completed', {
    quiz_id: quizId,
    quiz_name: quizData.name,
    score: results.score,
    category: results.category?.label || 'unknown',
    questions_answered: results.answeredCount,
    total_questions: filteredQuestions.length,
    completion_rate: Math.round((results.answeredCount / filteredQuestions.length) * 100)
  });
  
  showResults(results);
}

/**
 * Track analytics event (if analytics available)
 */
function trackEvent(eventName, params) {
  // Google Analytics 4
  if (typeof gtag === 'function') {
    gtag('event', eventName, params);
  }
  
  // Firebase Analytics
  if (typeof firebase !== 'undefined' && firebase.analytics) {
    try {
      firebase.analytics().logEvent(eventName, params);
    } catch (e) {
      // Analytics not available
    }
  }
  
  // Console log for development
  console.log('📊 Event:', eventName, params);
}

// ================================
// SHOW RESULTS
// ================================
function showResults(results) {
  const modal = document.getElementById("resultModal");

  document.getElementById("resultScore").textContent = results.score;

  if (results.category) {
    // Get translated category if available
    const translatedCategory = getTranslatedCategory(results.category, results.categoryIndex);
    
    document.getElementById("resultCategoryEmoji").textContent = translatedCategory.emoji;
    document.getElementById("resultCategoryLabel").textContent = translatedCategory.label;
    document.getElementById("resultDescription").textContent = translatedCategory.description;
    document.getElementById("resultEmoji").textContent = translatedCategory.emoji;

    const header = document.getElementById("resultHeader");
    header.style.background = 'linear-gradient(135deg, ' + quizData.color + ' 0%, ' + adjustColor(quizData.color, -20) + ' 100%)';
  }

  // Build breakdown
  let breakdownHtml = buildTagBreakdown(results);
  document.getElementById("resultBreakdown").innerHTML = breakdownHtml;
  saveResult(results);
  modal.style.display = "flex";
  celebrateResult();
  showNextQuizSuggestion();
}

// ================================
// NEXT QUIZ SUGGESTION
// ================================
async function showNextQuizSuggestion() {
  const container = document.getElementById("resultNextQuiz");
  const btn = document.getElementById("nextQuizBtn");
  if (!container || !btn) return;

  // Get all quiz IDs from QUIZZES_CONFIG (available from app.js via window)
  const config = window.QUIZZES_CONFIG;
  if (!config || !config.length) return;

  // Find completed quizzes from cloud
  let completedIds = [quizId]; // current quiz is just completed
  if (currentUser && window.CloudSync) {
    try {
      const cloudResults = await window.CloudSync.getQuizResults(currentUser.uid);
      if (cloudResults) {
        completedIds = Object.keys(cloudResults).filter(function(id) {
          return cloudResults[id] && cloudResults[id].score !== undefined;
        });
        // Ensure current quiz is included
        if (completedIds.indexOf(quizId) === -1) completedIds.push(quizId);
      }
    } catch (e) {
      console.warn("Could not load results for next quiz suggestion", e);
    }
  }

  // Find next uncompleted quiz in config order
  let nextQuiz = null;
  for (let i = 0; i < config.length; i++) {
    if (completedIds.indexOf(config[i].id) === -1) {
      nextQuiz = config[i];
      break;
    }
  }

  if (nextQuiz) {
    const name = (typeof t === 'function' && nextQuiz.nameKey) ? t(nextQuiz.nameKey) : nextQuiz.id;
    btn.textContent = t('quizNext.nextQuiz') + ': ' + nextQuiz.icon + ' ' + name;
    btn.setAttribute('data-next-quiz', nextQuiz.id);
    container.style.display = "block";
  } else {
    // All completed
    btn.textContent = t('quizNext.allCompleted');
    btn.disabled = true;
    btn.onclick = null;
    container.style.display = "block";
  }
}

function goToNextQuiz() {
  const btn = document.getElementById("nextQuizBtn");
  if (!btn) return;
  const nextId = btn.getAttribute('data-next-quiz');
  if (nextId) {
    window.location.href = 'quiz.html?id=' + nextId;
  }
}

// ================================
// BUILD TAG BREAKDOWN
// ================================
function buildTagBreakdown(results) {
  let html = '';

  // Show top tags as badges
  if (results.topTags && results.topTags.length > 0) {
    html += '<p class="result-breakdown-heading">' + t('quiz.topTags') + '</p>';
    html += '<div class="result-tag-list">';
    results.topTags.forEach(function(tag) {
      const count = results.tagCounts[tag] || 1;
      const intensity = Math.min(count / 3, 1);
      const opacity = 0.1 + intensity * 0.2;
      html += '<span class="result-tag-badge" style="background: rgba(139, 74, 94, ' + opacity + '); border: 1px solid rgba(139, 74, 94, 0.2);">';
      html += formatTagLabel(tag);
      if (count > 1) html += ' <small style="opacity: 0.7;">×' + count + '</small>';
      html += '</span>';
    });
    html += '</div>';
  }

  // Show score bar
  html += '<p class="result-breakdown-heading">' + t('quiz.score') + '</p>';
  html += '<div class="result-breakdown-item">';
  html += '<span class="result-breakdown-label">' + t('quiz.overallScore') + '</span>';
  html += '<div class="result-breakdown-bar"><div class="result-breakdown-fill" style="width: ' + results.score + '%"></div></div>';
  html += '<span class="result-breakdown-value">' + results.score + '</span>';
  html += '</div>';

  return html;
}

function formatTagLabel(tag) {
  return tag.split('-').map(function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

// ================================
// SAVE PROGRESS TO CLOUD (debounced)
// ================================
let saveProgressTimeout = null;

function saveProgressToCloud() {
  if (saveProgressTimeout) clearTimeout(saveProgressTimeout);

  // Always save to localStorage as backup
  saveProgressToLocalStorage();

  saveProgressTimeout = setTimeout(async function() {
    if (currentUser && window.CloudSync) {
      try {
        await window.CloudSync.saveQuizProgress(currentUser.uid, quizId, answers, currentQuestion);
        console.log("💾 Progress saved to cloud");
        // Clear local backup after successful cloud save
        clearLocalStorageBackup();
      } catch (error) {
        console.error("Error saving progress:", error);
        // Keep local backup if cloud save fails
      }
    }
  }, 2000);
}

/**
 * Save progress to localStorage as backup
 */
function saveProgressToLocalStorage() {
  try {
    const backupData = {
      quizId: quizId,
      answers: answers,
      currentQuestion: currentQuestion,
      timestamp: Date.now()
    };
    localStorage.setItem('q4y_quiz_backup_' + quizId, JSON.stringify(backupData));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }
}

/**
 * Clear localStorage backup
 */
function clearLocalStorageBackup() {
  try {
    localStorage.removeItem('q4y_quiz_backup_' + quizId);
  } catch (e) {
    // Ignore
  }
}

/**
 * Restore progress from localStorage backup
 */
function restoreFromLocalStorage() {
  try {
    const backup = localStorage.getItem('q4y_quiz_backup_' + quizId);
    if (backup) {
      const data = JSON.parse(backup);
      // Only restore if backup is less than 24 hours old
      if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
        return data;
      } else {
        clearLocalStorageBackup();
      }
    }
  } catch (e) {
    console.warn('Could not restore from localStorage:', e);
  }
  return null;
}

// ================================
// SAVE RESULT (v2.1 - includes tags)
// ================================
async function saveResult(results) {
  const resultData = {
    score: results.score,
    category: results.category ? results.category.label : null,
    categoryEmoji: results.category ? results.category.emoji : null,
    categoryDescription: results.category ? results.category.description : null,
    tags: results.tags || [],
    topTags: results.topTags || [],
    tagCounts: results.tagCounts || {},
    date: new Date().toISOString(),
    answers: answers,
    quizVersion: quizData.quizVersion || '2.1'
  };

  if (currentUser && window.CloudSync) {
    try {
      await window.CloudSync.saveQuizResult(currentUser.uid, quizId, resultData);
      await window.CloudSync.clearQuizProgress(currentUser.uid, quizId);
      console.log("✅ Resultado guardado na cloud!");
      showCloudSyncIndicator(true);
    } catch (error) {
      console.error("Erro ao guardar na cloud:", error);
      showCloudSyncIndicator(false);
    }
  } else {
    console.warn("User not logged in, result not saved");
    showCloudSyncIndicator(false);
  }
}

function showCloudSyncIndicator(success) {
  const existing = document.getElementById('cloudSyncIndicator');
  if (existing) existing.remove();

  const indicator = document.createElement('div');
  indicator.id = 'cloudSyncIndicator';
  indicator.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: ' + (success ? '#4caf50' : '#f44336') + '; color: white; padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 1000; animation: slideInRight 0.3s ease;';
  indicator.innerHTML = success ? t('quiz.savedCloud') : t('quiz.notSaved');
  document.body.appendChild(indicator);

  setTimeout(function() {
    indicator.style.opacity = '0';
    setTimeout(function() { indicator.remove(); }, 300);
  }, 3000);
}

// ================================
// RESULT ACTIONS
// ================================
function closeResult() {
  document.getElementById("resultModal").style.display = "none";
}

async function shareResult() {
  let result = null;
  if (currentUser && window.CloudSync) {
    result = await window.CloudSync.getQuizResult(currentUser.uid, quizId);
  }

  if (!result) {
    alert(t('common.error'));
    return;
  }

  const quizName = quizData.name;
  const text = t('quiz.shareText') !== 'quiz.shareText'
    ? t('quiz.shareText', { name: quizName, result: result.score + '/100 - ' + (result.category || '') })
    : 'Fiz o questionário "' + quizName + '" no Quest4You!\n\nO meu resultado: ' + result.score + '/100 - ' + (result.category || '') + '\n\nDescobre o teu também em quest4you.pt';

  if (navigator.share) {
    navigator.share({
      title: 'Quest4You - ' + quizName,
      text: text,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(text).then(function() {
      alert(t('common.success') + '!');
    });
  }
}

async function retakeQuiz() {
  if (confirm(t('quiz.retakeConfirm') !== 'quiz.retakeConfirm' ? t('quiz.retakeConfirm') : "Tens a certeza que queres refazer o questionário? As tuas respostas serão apagadas.")) {
    answers = {};
    currentQuestion = 0;

    if (currentUser && window.CloudSync) {
      try {
        await window.CloudSync.deleteQuizResult(currentUser.uid, quizId);
        await window.CloudSync.clearQuizProgress(currentUser.uid, quizId);
      } catch (error) {
        console.error("Error deleting from cloud:", error);
      }
    }

    closeResult();
    renderQuestion();
    renderQuickNav();
  }
}

// ================================
// EDIT ANSWERS
// ================================
function editAnswers() {
  closeResult();
  currentQuestion = 0;
  renderQuestion();
  renderQuickNav();
  showEditModeMessage();
}

function showEditModeMessage() {
  const editTitle = t('quiz.editModeTitle') !== 'quiz.editModeTitle' ? t('quiz.editModeTitle') : '✏️ Modo de edição ativo';
  const editDesc = t('quiz.editModeDesc') !== 'quiz.editModeDesc' ? t('quiz.editModeDesc') : 'Navega pelas perguntas e altera as que quiseres. Clica em "Ver Resultado" quando terminares.';
  const toast = document.createElement('div');
  toast.className = 'edit-mode-toast';
  toast.innerHTML = '<span>' + editTitle + '</span><p>' + editDesc + '</p>';
  toast.style.cssText = 'position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4); z-index: 10000; text-align: center; animation: slideUp 0.3s ease-out; max-width: 90%; width: 400px;';
  toast.querySelector('span').style.cssText = 'font-weight: 600; font-size: 1.1rem; display: block; margin-bottom: 8px;';
  toast.querySelector('p').style.cssText = 'margin: 0; font-size: 0.9rem; opacity: 0.9;';

  if (!document.getElementById('editModeStyle')) {
    const style = document.createElement('style');
    style.id = 'editModeStyle';
    style.textContent = '@keyframes slideUp { from { transform: translateX(-50%) translateY(100px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } } @keyframes slideDown { from { transform: translateX(-50%) translateY(0); opacity: 1; } to { transform: translateX(-50%) translateY(100px); opacity: 0; } }';
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  setTimeout(function() {
    toast.style.animation = 'slideDown 0.3s ease-in forwards';
    setTimeout(function() { toast.remove(); }, 300);
  }, 4000);
}

// ================================
// CELEBRATION EFFECT
// ================================
function celebrateResult() {
  const container = document.querySelector(".result-content");
  const colors = ["#e53935", "#c2185b", "#ff9800", "#fdd835", "#4caf50"];

  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement("div");
    confetti.style.cssText = 'position: absolute; width: 10px; height: 10px; background: ' + colors[Math.floor(Math.random() * colors.length)] + '; left: ' + (Math.random() * 100) + '%; top: -10px; border-radius: 50%; animation: confettiFall ' + (2 + Math.random() * 2) + 's ease-out forwards; pointer-events: none;';
    container.appendChild(confetti);
    setTimeout(function() { confetti.remove(); }, 4000);
  }

  if (!document.getElementById("confettiStyle")) {
    const style = document.createElement("style");
    style.id = "confettiStyle";
    style.textContent = '@keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(500px) rotate(720deg); opacity: 0; } } @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
    document.head.appendChild(style);
  }
}

// ================================
// UTILITIES
// ================================
function adjustColor(color, amount) {
  const hex = color.replace("#", "");
  const num = parseInt(hex, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

// Export for global access
window.selectAnswer = selectAnswer;
window.previousQuestion = previousQuestion;
window.nextQuestion = nextQuestion;
window.goToQuestion = goToQuestion;
window.finishQuiz = finishQuiz;
window.closeResult = closeResult;
window.shareResult = shareResult;
window.retakeQuiz = retakeQuiz;
window.editAnswers = editAnswers;
window.selectGender = selectGender;
window.goToNextQuiz = goToNextQuiz;

// ================================
// KEYBOARD NAVIGATION
// ================================
document.addEventListener('keydown', function(e) {
  // Ignore if modal is open or user is typing
  if (document.querySelector('.result-modal[style*="display: flex"]') || 
      e.target.tagName === 'INPUT' || 
      e.target.tagName === 'TEXTAREA') {
    return;
  }
  
  switch(e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      previousQuestion();
      break;
    case 'ArrowRight':
      e.preventDefault();
      if (answers[filteredQuestions[currentQuestion]?.id]) {
        nextQuestion();
      }
      break;
    case '1': case '2': case '3': case '4': case '5': case '6':
      const optionIndex = parseInt(e.key) - 1;
      const question = filteredQuestions[currentQuestion];
      if (question && question.options[optionIndex]) {
        e.preventDefault();
        selectAnswer(optionIndex);
      }
      break;
    case 'a': case 'A':
      e.preventDefault();
      selectAnswer(0);
      break;
    case 'b': case 'B':
      if (filteredQuestions[currentQuestion]?.options[1]) {
        e.preventDefault();
        selectAnswer(1);
      }
      break;
    case 'c': case 'C':
      if (filteredQuestions[currentQuestion]?.options[2]) {
        e.preventDefault();
        selectAnswer(2);
      }
      break;
    case 'd': case 'D':
      if (filteredQuestions[currentQuestion]?.options[3]) {
        e.preventDefault();
        selectAnswer(3);
      }
      break;
    case 'e': case 'E':
      if (filteredQuestions[currentQuestion]?.options[4]) {
        e.preventDefault();
        selectAnswer(4);
      }
      break;
    case 'Enter':
      // Finish quiz if all answered and on last question
      const allAnswered = Object.keys(answers).length === filteredQuestions.length;
      const isLastQuestion = currentQuestion === filteredQuestions.length - 1;
      if (allAnswered && isLastQuestion) {
        e.preventDefault();
        finishQuiz();
      }
      break;
  }
});
