/**
 * Quest4You - Quiz Logic
 * Logica para questionarios com escala Likert 1-5
 */

// ================================
// STATE
// ================================
let quizData = null;
let currentQuestion = 0;
let answers = {};
let quizId = null;
let currentUser = null;

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

    // Load saved answers from localStorage
    const savedAnswers = localStorage.getItem('q4y_quiz_' + id);
    if (savedAnswers) {
      answers = JSON.parse(savedAnswers);
      // Find first unanswered question
      for (let i = 0; i < quizData.questions.length; i++) {
        if (!answers[quizData.questions[i].id]) {
          currentQuestion = i;
          break;
        }
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
  const question = quizData.questions[currentQuestion];

  document.getElementById("questionNumber").textContent = currentQuestion + 1;
  document.getElementById("questionText").textContent = question.text;

  const totalQuestions = quizData.questions.length;
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
  const question = quizData.questions[currentQuestion];
  answers[question.id] = value;

  const buttons = document.querySelectorAll(".likert-btn");
  buttons.forEach(btn => {
    btn.classList.remove("selected");
    if (parseInt(btn.dataset.value) === value) {
      btn.classList.add("selected");
    }
  });

  localStorage.setItem('q4y_quiz_' + quizId, JSON.stringify(answers));

  updateNavButtons();
  updateQuickNav();

  const totalQuestions = quizData.questions.length;
  const answeredCount = Object.keys(answers).length;
  const percent = Math.round((answeredCount / totalQuestions) * 100);
  document.getElementById("progressPercent").textContent = percent + '%';
  document.getElementById("progressBar").style.width = percent + '%';

  setTimeout(function() {
    if (currentQuestion < quizData.questions.length - 1) {
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
  if (currentQuestion < quizData.questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  }
}

function goToQuestion(index) {
  if (index >= 0 && index < quizData.questions.length) {
    currentQuestion = index;
    renderQuestion();
  }
}

function updateNavButtons() {
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const btnFinish = document.getElementById("btnFinish");

  btnPrev.disabled = currentQuestion === 0;

  const allAnswered = Object.keys(answers).length === quizData.questions.length;
  const isLastQuestion = currentQuestion === quizData.questions.length - 1;

  if (isLastQuestion && allAnswered) {
    btnNext.style.display = "none";
    btnFinish.style.display = "inline-flex";
  } else {
    btnNext.style.display = "inline-flex";
    btnFinish.style.display = "none";
    btnNext.disabled = !answers[quizData.questions[currentQuestion].id];
  }
}

// ================================
// QUICK NAVIGATION
// ================================
function renderQuickNav() {
  const container = document.getElementById("quickNavDots");
  let html = "";
  for (let i = 0; i < quizData.questions.length; i++) {
    html += '<button class="quick-nav-dot" data-index="' + i + '" onclick="goToQuestion(' + i + ')" title="Pergunta ' + (i + 1) + '"></button>';
  }
  container.innerHTML = html;
  updateQuickNav();
}

function updateQuickNav() {
  const dots = document.querySelectorAll(".quick-nav-dot");
  dots.forEach(function(dot, index) {
    dot.classList.remove("answered", "current");
    const question = quizData.questions[index];
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
  let totalScore = 0;
  let maxPossibleScore = quizData.questions.length * 5;
  let categoryScores = {};

  quizData.questions.forEach(function(question) {
    let value = answers[question.id] || 3;
    if (question.reverse) {
      value = 6 - value;
    }
    totalScore += value;

    if (question.category) {
      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { total: 0, count: 0 };
      }
      categoryScores[question.category].total += value;
      categoryScores[question.category].count++;
    }
  });

  const percentage = Math.round((totalScore / maxPossibleScore) * 100);

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
    categoryAverages[key] = Math.round((data.total / data.count) * 20);
  }

  return {
    score: percentage,
    totalPoints: totalScore,
    maxPoints: maxPossibleScore,
    category: resultCategory,
    categoryScores: categoryAverages
  };
}

// ================================
// FINISH QUIZ
// ================================
function finishQuiz() {
  const allAnswered = Object.keys(answers).length === quizData.questions.length;
  if (!allAnswered) {
    const unanswered = quizData.questions.length - Object.keys(answers).length;
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

  const breakdownHtml = buildBreakdown(results.categoryScores);
  document.getElementById("resultBreakdown").innerHTML = breakdownHtml;

  saveResult(results);
  modal.style.display = "flex";
  celebrateResult();
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
// SAVE RESULT
// ================================
async function saveResult(results) {
  const savedResults = JSON.parse(localStorage.getItem("q4y_results") || "{}");
  savedResults[quizId] = {
    score: results.score,
    category: results.category ? results.category.label : null,
    categoryScores: results.categoryScores || {},
    date: new Date().toISOString(),
    answers: answers
  };
  localStorage.setItem("q4y_results", JSON.stringify(savedResults));
  localStorage.removeItem('q4y_quiz_' + quizId);

  if (currentUser && window.CloudSync) {
    try {
      await window.CloudSync.saveQuizResult(currentUser.uid, quizId, {
        score: results.score,
        category: results.category ? results.category.label : null,
        categoryScores: results.categoryScores || {},
        answers: answers
      });
      console.log("Resultado guardado na cloud!");
      showCloudSyncIndicator(true);
    } catch (error) {
      console.error("Erro ao guardar na cloud:", error);
      showCloudSyncIndicator(false);
    }
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

function shareResult() {
  const results = JSON.parse(localStorage.getItem("q4y_results") || "{}");
  const result = results[quizId];
  if (!result) return;

  const text = 'Fiz o questionario "' + quizData.name + '" no Quest4You!\n\nO meu resultado: ' + (result.category || result.score + '%') + '\n\nDescobre o teu tambem em quest4you.com';

  if (navigator.share) {
    navigator.share({
      title: 'Quest4You - ' + quizData.name,
      text: text,
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(text).then(function() {
      alert("Resultado copiado para a area de transferencia!");
    });
  }
}

function retakeQuiz() {
  if (confirm("Tens a certeza que queres refazer o questionario? As tuas respostas serao apagadas.")) {
    answers = {};
    currentQuestion = 0;
    localStorage.removeItem('q4y_quiz_' + quizId);
    closeResult();
    renderQuestion();
    renderQuickNav();
  }
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