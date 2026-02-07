/**
 * Quest4You - Quiz Logic
 * Logica para questionarios com escala Likert 1-5
 */

// ================================
// STATE
// ================================
let quizData = null;
let filteredQuestions = []; // Questions filtered by gender
let currentQuestion = 0;
let answers = {};
let quizId = null;
let currentUser = null;
let userGender = null; // User's gender for filtering questions

// ================================
// INITIALIZATION
// ================================
document.addEventListener("DOMContentLoaded", function() {
  // Get quiz ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  quizId = urlParams.get("id");
  if (!quizId) {
    alert("Quiz nao especificado!");
    window.location.href = "../";
    return;
  }

  console.log("Loading quiz:", quizId);

  // Check authentication state
  if (typeof firebase !== 'undefined' && window.firebaseAuth) {
    window.firebaseAuth.onAuthStateChanged(function(user) {
      currentUser = user;
      if (user) {
        console.log("Utilizador autenticado:", user.email);
        updateUserUI(user);
      }
    });
  }

  loadQuiz(quizId);
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
  try {
    const response = await fetch('../data/quizzes/' + id + '.json');
    if (!response.ok) {
      throw new Error("Quiz nao encontrado");
    }

    quizData = await response.json();
    console.log("Quiz loaded:", quizData.name, "with", quizData.questions.length, "questions");

    // Check if quiz requires gender
    if (quizData.requiresGender) {
      userGender = await getUserGender();
      if (!userGender) {
        // Show gender selection modal
        showGenderModal();
        return;
      }
    }
      // Filter questions by gender
    filterQuestionsByGender();

    // Load saved progress from cloud
    if (currentUser && window.CloudSync) {
      try {
        const progress = await window.CloudSync.getQuizProgress(currentUser.uid, id);
        if (progress && progress.answers) {
          answers = progress.answers;
          // Find first unanswered question
          for (let i = 0; i < filteredQuestions.length; i++) {
            if (!answers[filteredQuestions[i].id]) {
              currentQuestion = i;
              break;
            }
          }
          console.log("Progress loaded from cloud:", Object.keys(answers).length, "answers");
        }
      } catch (error) {
        console.error("Error loading progress from cloud:", error);
      }
    }

    // Update UI
    initQuizUI();
    renderQuestion();
    renderQuickNav();

  } catch (error) {    console.error("Error loading quiz:", error);
    alert("Erro ao carregar o questionario. Por favor, tenta novamente.");
    window.location.href = "../";
  }
}

// ================================
// GET USER GENDER
// ================================
async function getUserGender() {
  // If user is logged in, get from cloud via CloudSync
  if (currentUser && window.CloudSync) {
    try {
      const gender = await window.CloudSync.getUserGender(currentUser.uid);
      if (gender) {
        return gender;
      }
    } catch (error) {
      console.error("Error fetching user gender from cloud:", error);
    }
  }
  
  // Fallback: check localStorage (for migration purposes only)
  const localGender = localStorage.getItem("q4y_user_gender");
  if (localGender) {
    // Migrate to cloud if user is logged in
    if (currentUser && window.CloudSync) {
      try {
        await window.CloudSync.saveUserGender(currentUser.uid, localGender);
        localStorage.removeItem("q4y_user_gender");
        console.log("Gender migrated from localStorage to cloud");
      } catch (e) {
        console.warn("Could not migrate gender to cloud:", e);
      }
    }
    return localGender;
  }
  
  return null;
}

// ================================
// SHOW GENDER MODAL
// ================================
function showGenderModal() {
  // Create modal if it doesn't exist
  if (!document.getElementById('genderModal')) {
    const modal = document.createElement('div');
    modal.id = 'genderModal';
    modal.className = 'result-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="result-content" style="max-width: 400px;">
        <div class="result-header" id="genderHeader" style="background: linear-gradient(135deg, ${quizData.color} 0%, ${adjustColor(quizData.color, -20)} 100%);">
          <span class="result-emoji">⚧</span>
          <h2>Antes de começar...</h2>
        </div>
        <div class="result-body" style="padding: 30px;">
          <p style="text-align: center; margin-bottom: 20px; color: #666;">
            Este questionário adapta algumas perguntas ao teu género para uma experiência mais personalizada.
          </p>
          <div class="gender-options" style="display: flex; flex-direction: column; gap: 12px;">
            <button class="gender-btn" onclick="selectGender('masculino')" style="padding: 16px; border: 2px solid #e0e0e0; border-radius: 12px; background: white; cursor: pointer; font-size: 16px; transition: all 0.3s ease;">
              👨 Masculino
            </button>
            <button class="gender-btn" onclick="selectGender('feminino')" style="padding: 16px; border: 2px solid #e0e0e0; border-radius: 12px; background: white; cursor: pointer; font-size: 16px; transition: all 0.3s ease;">
              👩 Feminino
            </button>
            <button class="gender-btn" onclick="selectGender('nao-binario')" style="padding: 16px; border: 2px solid #e0e0e0; border-radius: 12px; background: white; cursor: pointer; font-size: 16px; transition: all 0.3s ease;">
              🌈 Não-binário
            </button>
            <button class="gender-btn" onclick="selectGender('outro')" style="padding: 16px; border: 2px solid #e0e0e0; border-radius: 12px; background: white; cursor: pointer; font-size: 16px; transition: all 0.3s ease;">
              🤷 Outro / Prefiro não dizer
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Add hover effects
    const style = document.createElement('style');
    style.textContent = '.gender-btn:hover { border-color: ' + quizData.color + ' !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }';
    document.head.appendChild(style);
  } else {
    document.getElementById('genderModal').style.display = 'flex';
  }
}

// ================================
// SELECT GENDER
// ================================
async function selectGender(gender) {
  userGender = gender;
  
  // Save to cloud via CloudSync
  if (currentUser && window.CloudSync) {
    try {
      await window.CloudSync.saveUserGender(currentUser.uid, gender);
      console.log("Gender saved to cloud:", gender);
    } catch (error) {
      console.error("Error saving gender:", error);
    }
  }
  
  // Hide modal
  document.getElementById('genderModal').style.display = 'none';
  
  // Continue loading quiz
  filterQuestionsByGender();
  
  // Load saved progress from cloud
  if (currentUser && window.CloudSync) {
    try {
      const progress = await window.CloudSync.getQuizProgress(currentUser.uid, quizId);
      if (progress && progress.answers) {
        answers = progress.answers;
        currentQuestion = progress.currentQuestion || 0;
        console.log("Progress loaded from cloud:", Object.keys(answers).length, "answers");
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  }
  
  // Update UI
  initQuizUI();
  renderQuestion();
  renderQuickNav();
}

// ================================
// FILTER QUESTIONS BY GENDER
// ================================
function filterQuestionsByGender() {
  if (!quizData.requiresGender || !userGender) {
    // No filtering needed
    filteredQuestions = quizData.questions;
    return;
  }
  
  filteredQuestions = quizData.questions.filter(function(question) {
    // If question has no forGender filter, include it
    if (!question.forGender) {
      return true;
    }
    
    // Check if user's gender matches the filter
    return question.forGender.includes(userGender) || question.forGender.includes('all');
  });
  
  console.log("Filtered questions for gender " + userGender + ":", filteredQuestions.length, "of", quizData.questions.length);
}

// ================================
// INITIALIZE UI
// ================================
function initQuizUI() {
  document.getElementById("quizIcon").textContent = quizData.icon;
  document.getElementById("quizTitle").textContent = quizData.name;
  document.getElementById("quizDescription").textContent = quizData.description;
  document.title = quizData.name + ' - Quest4You';

  document.documentElement.style.setProperty("--primary-color", quizData.color);

  const header = document.getElementById("quizHeader");
  if (header) {
    header.style.background = 'linear-gradient(135deg, ' + quizData.color + ' 0%, ' + adjustColor(quizData.color, -20) + ' 100%)';
  }
}

// ================================
// RENDER QUESTION
// ================================
function renderQuestion() {
  const question = filteredQuestions[currentQuestion];

  document.getElementById("questionNumber").textContent = currentQuestion + 1;
  document.getElementById("questionText").textContent = question.text;

  const totalQuestions = filteredQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const percent = Math.round((answeredCount / totalQuestions) * 100);

  document.getElementById("progressText").textContent = 'Pergunta ' + (currentQuestion + 1) + ' de ' + totalQuestions;
  document.getElementById("progressPercent").textContent = percent + '%';
  document.getElementById("progressBar").style.width = percent + '%';

  const buttons = document.querySelectorAll(".likert-btn");
  buttons.forEach(btn => btn.classList.remove("selected"));

  if (answers[question.id]) {
    const savedValue = answers[question.id];
    buttons.forEach(btn => {
      if (parseInt(btn.dataset.value) === savedValue) {
        btn.classList.add("selected");
      }
    });
  }

  updateNavButtons();
  updateQuickNav();

  const card = document.getElementById("questionCard");
  card.style.animation = "none";
  card.offsetHeight;
  card.style.animation = "slideIn 0.3s ease";
}

// ================================
// SELECT ANSWER
// ================================
function selectAnswer(value) {
  const question = filteredQuestions[currentQuestion];
  answers[question.id] = value;

  const buttons = document.querySelectorAll(".likert-btn");
  buttons.forEach(btn => {
    btn.classList.remove("selected");
    if (parseInt(btn.dataset.value) === value) {
      btn.classList.add("selected");
    }
  });

  // Save progress to cloud (debounced)
  saveProgressToCloud();

  updateNavButtons();
  updateQuickNav();

  const totalQuestions = filteredQuestions.length;
  const answeredCount = Object.keys(answers).length;
  const percent = Math.round((answeredCount / totalQuestions) * 100);
  document.getElementById("progressPercent").textContent = percent + '%';
  document.getElementById("progressBar").style.width = percent + '%';

  setTimeout(function() {
    if (currentQuestion < filteredQuestions.length - 1) {
      nextQuestion();
    }
  }, 300);
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
    html += '<button class="quick-nav-dot" data-index="' + i + '" onclick="goToQuestion(' + i + ')" title="Pergunta ' + (i + 1) + '"></button>';
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
// CALCULATE RESULTS
// ================================
function calculateResults() {
  // Check if this is a role-based quiz
  if (quizData.resultType === "role") {
    return calculateRoleResults();
  }
  
  // Standard spectrum/percentage calculation with weight support
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let categoryScores = {};
  
  filteredQuestions.forEach(function(question) {
    let value = answers[question.id] || 3;
    // Support both 'invert' and 'reverse' property names
    if (question.invert || question.reverse) {
      value = 6 - value;
    }
    
    // Apply weight (default to 1 if not specified)
    const weight = question.weight !== undefined ? question.weight : 1;
    totalWeightedScore += value * weight;
    totalWeight += 5 * weight; // Max score per question is 5

    if (question.category) {
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { total: 0, weight: 0 };
      }
      categoryScores[question.category].total += value * weight;
      categoryScores[question.category].weight += 5 * weight;
    }
  });

  const percentage = Math.round((totalWeightedScore / totalWeight) * 100);

  let resultCategory = null;
  if (quizData.categories) {
    for (let i = 0; i < quizData.categories.length; i++) {
      const cat = quizData.categories[i];
      if (percentage >= cat.min && percentage <= cat.max) {
        resultCategory = cat;
        break;
      }
    }
  }

  const categoryAverages = {};
  for (const key in categoryScores) {
    const data = categoryScores[key];
    categoryAverages[key] = Math.round((data.total / data.weight) * 100);
  }

  return {
    score: percentage,
    totalPoints: Math.round(totalWeightedScore),
    maxPoints: Math.round(totalWeight),
    category: resultCategory,
    categoryScores: categoryAverages
  };
}

// ================================
// CALCULATE ROLE RESULTS
// ================================
function calculateRoleResults() {
  const rolePoints = {};
  
  // Initialize role points
  if (quizData.roles) {
    Object.keys(quizData.roles).forEach(function(role) {
      rolePoints[role] = 0;
    });
  }
  
  // Calculate points for each role based on answers
  filteredQuestions.forEach(function(question) {
    const answerValue = answers[question.id] || 3;
    
    if (question.rolePoints) {
      // Calculate weighted role points based on answer
      Object.keys(question.rolePoints).forEach(function(role) {
        const basePoints = question.rolePoints[role];
        // Scale: answer 1 = 0%, 2 = 25%, 3 = 50%, 4 = 75%, 5 = 100% of base points
        const scaledPoints = basePoints * ((answerValue - 1) / 4);
        rolePoints[role] = (rolePoints[role] || 0) + scaledPoints;
      });
    }
  });
  
  // Find dominant role
  let dominantRole = null;
  let maxPoints = 0;
  
  Object.keys(rolePoints).forEach(function(role) {
    if (rolePoints[role] > maxPoints) {
      maxPoints = rolePoints[role];
      dominantRole = role;
    }
  });
  
  // Calculate percentages for each role
  const totalPoints = Object.values(rolePoints).reduce(function(a, b) { return a + b; }, 0) || 1;
  const rolePercentages = {};
  
  Object.keys(rolePoints).forEach(function(role) {
    rolePercentages[role] = Math.round((rolePoints[role] / totalPoints) * 100);
  });
  
  // Get role info from quiz data
  const roleInfo = quizData.roles ? quizData.roles[dominantRole] : null;
  
  // Find matching category by role
  let resultCategory = null;
  if (quizData.categories && dominantRole) {
    resultCategory = quizData.categories.find(function(cat) {
      return cat.role === dominantRole;
    });
  }
  
  // If no category found by role, fall back to percentage-based
  if (!resultCategory && quizData.categories) {
    const dominantPercentage = rolePercentages[dominantRole] || 50;
    for (let i = 0; i < quizData.categories.length; i++) {
      const cat = quizData.categories[i];
      if (dominantPercentage >= cat.min && dominantPercentage <= cat.max) {
        resultCategory = cat;
        break;
      }
    }
  }
  
  return {
    score: rolePercentages[dominantRole] || 0,
    dominantRole: dominantRole,
    roleInfo: roleInfo,
    rolePoints: rolePoints,
    rolePercentages: rolePercentages,
    category: resultCategory,
    categoryScores: rolePercentages,
    matchWith: roleInfo ? roleInfo.matchWith : null
  };
}

// ================================
// FINISH QUIZ
// ================================
function finishQuiz() {
  const allAnswered = Object.keys(answers).length === filteredQuestions.length;
  if (!allAnswered) {
    const unanswered = filteredQuestions.length - Object.keys(answers).length;
    if (!confirm('Ainda tens ' + unanswered + ' pergunta(s) por responder. Queres ver o resultado assim mesmo?')) {
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
    document.getElementById("resultCategoryEmoji").textContent = results.category.emoji;
    document.getElementById("resultCategoryLabel").textContent = results.category.label;
    document.getElementById("resultDescription").textContent = results.category.description;
    document.getElementById("resultEmoji").textContent = results.category.emoji;

    const header = document.getElementById("resultHeader");
    header.style.background = 'linear-gradient(135deg, ' + quizData.color + ' 0%, ' + adjustColor(quizData.color, -20) + ' 100%)';
  }

  // Build breakdown based on result type
  let breakdownHtml = '';
  if (quizData.resultType === "role" && results.rolePercentages) {
    breakdownHtml = buildRoleBreakdown(results);
  } else {
    breakdownHtml = buildBreakdown(results.categoryScores);
  }
  document.getElementById("resultBreakdown").innerHTML = breakdownHtml;

  saveResult(results);
  modal.style.display = "flex";
  celebrateResult();
}

function buildRoleBreakdown(results) {
  const rolePercentages = results.rolePercentages;
  const roles = quizData.roles || {};
  
  // Sort roles by percentage descending
  const sortedRoles = Object.entries(rolePercentages).sort(function(a, b) { return b[1] - a[1]; });
  
  let html = '<p style="font-weight: 600; margin-bottom: 0.75rem; color: #333;">Os teus perfis:</p>';
  
  sortedRoles.forEach(function(entry) {
    const roleId = entry[0];
    const percentage = entry[1];
    const roleInfo = roles[roleId];
    // Use 'label' first (JSON format), fallback to 'name', then format the roleId
    const label = roleInfo ? (roleInfo.label || roleInfo.name || formatCategoryLabel(roleId)) : formatCategoryLabel(roleId);
    const emoji = roleInfo ? (roleInfo.emoji || '🎭') : '🎭';
    
    html += '<div class="result-breakdown-item">';
    html += '<span class="result-breakdown-label">' + emoji + ' ' + label + '</span>';
    html += '<div class="result-breakdown-bar"><div class="result-breakdown-fill" style="width: ' + percentage + '%"></div></div>';
    html += '<span class="result-breakdown-value">' + percentage + '%</span>';
    html += '</div>';
  });
  
  // Show match info
  if (results.matchWith && results.matchWith.length > 0) {
    html += '<div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, rgba(229, 57, 53, 0.1), rgba(194, 24, 91, 0.1)); border-radius: 12px;">';
    html += '<p style="font-weight: 600; margin: 0 0 10px 0; color: #333;">💕 Compatible com:</p>';
    
    results.matchWith.forEach(function(matchRole) {
      const matchInfo = roles[matchRole];
      if (matchInfo) {
        const matchLabel = matchInfo.label || matchInfo.name || matchRole;
        html += '<span style="display: inline-block; background: white; padding: 6px 12px; border-radius: 20px; margin: 4px; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">';
        html += (matchInfo.emoji || '🎭') + ' ' + matchLabel;
        html += '</span>';
      }
    });
    
    html += '</div>';
  }
  
  return html;
}

function buildBreakdown(categoryScores) {
  const entries = Object.entries(categoryScores);
  if (entries.length === 0) return "";

  entries.sort(function(a, b) { return b[1] - a[1]; });
  const top5 = entries.slice(0, 5);

  let html = '<p style="font-weight: 600; margin-bottom: 0.75rem; color: #333;">Top Categorias:</p>';
  top5.forEach(function(entry) {
    const category = entry[0];
    const score = entry[1];
    const label = formatCategoryLabel(category);
    html += '<div class="result-breakdown-item">';
    html += '<span class="result-breakdown-label">' + label + '</span>';
    html += '<div class="result-breakdown-bar"><div class="result-breakdown-fill" style="width: ' + score + '%"></div></div>';
    html += '<span class="result-breakdown-value">' + score + '%</span>';
    html += '</div>';
  });
  return html;
}

function formatCategoryLabel(category) {
  return category.split("_").map(function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(" ");
}

// ================================
// SAVE PROGRESS TO CLOUD (debounced)
// ================================
let saveProgressTimeout = null;

function saveProgressToCloud() {
  // Debounce: wait 2 seconds after last answer before saving
  if (saveProgressTimeout) {
    clearTimeout(saveProgressTimeout);
  }
  
  saveProgressTimeout = setTimeout(async function() {
    if (currentUser && window.CloudSync) {
      try {
        await window.CloudSync.saveQuizProgress(currentUser.uid, quizId, answers, currentQuestion);
        console.log("💾 Progress saved to cloud");
      } catch (error) {
        console.error("Error saving progress to cloud:", error);
      }
    }
  }, 2000);
}

// ================================
// SAVE RESULT
// ================================
async function saveResult(results) {
  const resultData = {
    score: results.score,
    category: results.category ? results.category.label : null,
    categoryEmoji: results.category ? results.category.emoji : null,
    categoryDescription: results.category ? results.category.description : null,
    categoryScores: results.categoryScores || {},
    date: new Date().toISOString(),
    answers: answers
  };
    // Add role-specific data if present
  if (results.dominantRole) {
    resultData.dominantRole = results.dominantRole;
    resultData.rolePercentages = results.rolePercentages;
    resultData.matchWith = results.matchWith;
  }
  // Save to cloud only (no localStorage)
  if (currentUser && window.CloudSync) {
    try {
      await window.CloudSync.saveQuizResult(currentUser.uid, quizId, resultData);
      // Clear progress after saving result
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
  indicator.innerHTML = success ? ' Guardado na cloud!' : ' Guardado localmente';
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
  // Get result from cloud or use current calculated result
  let result = null;
  if (currentUser && window.CloudSync) {
    result = await window.CloudSync.getQuizResult(currentUser.uid, quizId);
  }
  
  if (!result) {
    alert("Resultado não encontrado");
    return;
  }

  const text = 'Fiz o questionário "' + quizData.name + '" no Quest4You!\n\nO meu resultado: ' + (result.category || result.score + '%') + '\n\nDescobre o teu também em quest4you.com';

  if (navigator.share) {
    navigator.share({
      title: 'Quest4You - ' + quizData.name,
      text: text,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(text).then(function() {
      alert("Resultado copiado para a área de transferência!");
    });
  }
}

async function retakeQuiz() {
  if (confirm("Tens a certeza que queres refazer o questionário? As tuas respostas serão apagadas.")) {
    answers = {};
    currentQuestion = 0;
    
    // Delete result from cloud
    if (currentUser && window.CloudSync) {
      try {
        await window.CloudSync.deleteQuizResult(currentUser.uid, quizId);
        await window.CloudSync.clearQuizProgress(currentUser.uid, quizId);
        console.log("Result and progress deleted from cloud");
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
// EDIT ANSWERS (keep answers, go back to review)
// ================================
function editAnswers() {
  // Close the result modal
  closeResult();
  
  // Go to first question (user can navigate with quick-nav)
  currentQuestion = 0;
  renderQuestion();
  renderQuickNav();
  
  // Show a helpful toast/message
  showEditModeMessage();
}

function showEditModeMessage() {
  // Create toast notification
  const toast = document.createElement('div');
  toast.className = 'edit-mode-toast';
  toast.innerHTML = `
    <span>✏️ Modo de edição ativo</span>
    <p>Navega pelas perguntas e altera as que quiseres. Clica em "Ver Resultado" quando terminares.</p>
  `;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
    z-index: 10000;
    text-align: center;
    animation: slideUp 0.3s ease-out;
    max-width: 90%;
    width: 400px;
  `;
  toast.querySelector('span').style.cssText = 'font-weight: 600; font-size: 1.1rem; display: block; margin-bottom: 8px;';
  toast.querySelector('p').style.cssText = 'margin: 0; font-size: 0.9rem; opacity: 0.9;';
  
  // Add animation style if not exists
  if (!document.getElementById('editModeStyle')) {
    const style = document.createElement('style');
    style.id = 'editModeStyle';
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateX(-50%) translateY(100px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(0); opacity: 1; }
        to { transform: translateX(-50%) translateY(100px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  // Remove after 4 seconds
  setTimeout(function() {
    toast.style.animation = 'slideDown 0.3s ease-in forwards';
    setTimeout(function() {
      toast.remove();
    }, 300);
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