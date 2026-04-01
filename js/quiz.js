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
    if (quizData && filteredQuestions.length > 0) {
      renderQuestion();
      renderQuickNav();
      updateNavButtons();
    }
  });
});

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

  try {
    const response = await fetch('../data/quizzes/' + id + '.json');
    if (!response.ok) throw new Error("Quiz não encontrado");

    quizData = await response.json();
    console.log("Quiz loaded:", quizData.name, "with", quizData.questions.length, "questions (v" + quizData.quizVersion + ")");

    // Check if quiz requires gender
    if (quizData.requiresGender) {
      userGender = await getUserGender();
      if (!userGender) {
        showGenderModal();
        return;
      }
    }

    filterQuestionsByGender();

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
      }
    }

    initQuizUI();
    renderQuestion();
    renderQuickNav();
  } catch (error) {
    console.error("Error loading quiz:", error);
    quizLoaded = false;
    alert(t('quiz.loadError'));
    window.location.href = "../";
  }
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
    const modal = document.createElement('div');
    modal.id = 'genderModal';
    modal.className = 'result-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="result-content" style="max-width: 400px;">
        <div class="result-header" style="background: linear-gradient(135deg, ${quizData.color} 0%, ${adjustColor(quizData.color, -20)} 100%);">
          <span class="result-emoji">⚧</span>
          <h2>Antes de começar...</h2>
        </div>
        <div class="result-body" style="padding: 30px;">
          <p style="text-align: center; margin-bottom: 20px; color: #666;">
            Este questionário adapta algumas perguntas ao teu género.
          </p>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="option-btn" onclick="selectGender('masculino')">👨 Masculino</button>
            <button class="option-btn" onclick="selectGender('feminino')">👩 Feminino</button>
            <button class="option-btn" onclick="selectGender('nao-binario')">🌈 Não-binário</button>
            <button class="option-btn" onclick="selectGender('outro')">🤷 Outro / Prefiro não dizer</button>
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
 * Gets translated quiz text (question/option) if available in i18n
 * Falls back to original Portuguese text from JSON if no translation exists
 * Keys: quizContent.{quizId}.q{questionId} for questions
 *       quizContent.{quizId}.q{questionId}_o{optionIndex} for options
 *       quizContent.{quizId}.cat_{categoryIndex} for category labels
 *       quizContent.{quizId}.cat_{categoryIndex}_desc for category descriptions
 */
function getQuizText(type, questionId, optionIndex, fallback) {
  if (typeof t !== 'function') return fallback;
  
  let key;
  if (type === 'question') {
    key = 'quizContent.' + quizId + '.q' + questionId;
  } else if (type === 'option') {
    key = 'quizContent.' + quizId + '.q' + questionId + '_o' + optionIndex;
  } else if (type === 'category') {
    key = 'quizContent.' + quizId + '.cat_' + questionId; // questionId is actually category index here
  } else if (type === 'categoryDesc') {
    key = 'quizContent.' + quizId + '.cat_' + questionId + '_desc';
  }
  
  const translated = t(key);
  // If t() returns the key itself, no translation exists - use fallback
  return (translated && translated !== key) ? translated : fallback;
}

/**
 * Gets translated quiz name from i18n (quizNames.{id})
 */
function getQuizName() {
  if (typeof t !== 'function') return quizData.name;
  const translated = t('quizNames.' + quizId);
  return (translated && translated !== 'quizNames.' + quizId) ? translated : quizData.name;
}

/**
 * Gets translated quiz description from i18n (quizDescriptions.{id})
 */
function getQuizDescription() {
  if (typeof t !== 'function') return quizData.description;
  const translated = t('quizDescriptions.' + quizId);
  return (translated && translated !== 'quizDescriptions.' + quizId) ? translated : quizData.description;
}

/**
 * Gets translated category (for results)
 */
function getTranslatedCategory(category, index) {
  if (!category) return null;
  return {
    ...category,
    label: getQuizText('category', index, null, category.label),
    description: getQuizText('categoryDesc', index, null, category.description)
  };
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

  // Render dynamic options from JSON
  const container = document.getElementById("optionsContainer");
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  let html = '';

  question.options.forEach(function(option, index) {
    const isSelected = answers[question.id] && answers[question.id].optionIndex === index;
    const optionText = getQuizText('option', question.id, index, option.text);
    html += '<button class="option-btn' + (isSelected ? ' selected' : '') + '" data-index="' + index + '" onclick="selectAnswer(' + index + ')">';
    html += '<span class="option-letter">' + (letters[index] || (index + 1)) + '</span>';
    html += '<span class="option-text">' + optionText + '</span>';    html += '</button>';
  });

  container.innerHTML = html;

  updateNavButtons();
  updateQuickNav();

  // Slide animation
  const card = document.getElementById("questionCard");
  card.style.animation = "none";
  card.offsetHeight;
  card.style.animation = "slideIn 0.3s ease";
}

// ================================
// SELECT ANSWER (v2.1 - stores score + tags)
// ================================
function selectAnswer(optionIndex) {
  const question = filteredQuestions[currentQuestion];
  const option = question.options[optionIndex];

  // Store answer with score and tags
  answers[question.id] = {
    optionIndex: optionIndex,
    score: option.score,
    tags: option.tags || []
  };

  // Update button states
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(function(btn) {
    btn.classList.remove("selected");
    if (parseInt(btn.dataset.index) === optionIndex) {
      btn.classList.add("selected");
    }
  });

  // Save progress
  saveProgressToCloud();

  updateNavButtons();
  updateQuickNav();

  // Update progress bar
  const totalQuestions = filteredQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const percent = Math.round((answeredCount / totalQuestions) * 100);
  document.getElementById("progressPercent").textContent = percent + '%';
  document.getElementById("progressBar").style.width = percent + '%';

  // Auto-advance after short delay
  setTimeout(function() {
    if (currentQuestion < filteredQuestions.length - 1) {
      nextQuestion();
    }
  }, 350);
}

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
  showResults(results);
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

  saveProgressTimeout = setTimeout(async function() {
    if (currentUser && window.CloudSync) {
      try {
        await window.CloudSync.saveQuizProgress(currentUser.uid, quizId, answers, currentQuestion);
        console.log("💾 Progress saved to cloud");
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    }
  }, 2000);
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
