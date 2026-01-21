/**
 * Quest4You - Authentication Logic
 * Sistema de autenticaÃ§Ã£o com Firebase
 */

// ================================
// TAB NAVIGATION
// ================================
document.addEventListener("DOMContentLoaded", function() {
  // Tab switching
  const tabs = document.querySelectorAll(".auth-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", function() {
      const tabName = this.dataset.tab;
      switchTab(tabName);
    });
  });

  // Check if user is already logged in
  if (typeof auth !== "undefined") {
    auth.onAuthStateChanged(function(user) {
      if (user) {
        // User is logged in, redirect to home or profile
        const redirectUrl = getRedirectUrl();
        window.location.href = redirectUrl;
      }
    });
  }
});

function switchTab(tabName) {
  // Update tabs
  document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.classList.remove("active");
    if (tab.dataset.tab === tabName) {
      tab.classList.add("active");
    }
  });

  // Update forms
  document.querySelectorAll(".auth-form").forEach(form => {
    form.classList.remove("active");
  });

  if (tabName === "login") {
    document.getElementById("loginForm").classList.add("active");
  } else if (tabName === "register") {
    document.getElementById("registerForm").classList.add("active");
  }

  // Clear messages
  hideMessage();
}

function showResetPassword() {
  document.querySelectorAll(".auth-form").forEach(form => {
    form.classList.remove("active");
  });
  document.getElementById("resetForm").classList.add("active");
  
  // Update tabs
  document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.classList.remove("active");
  });
}

function showLogin() {
  switchTab("login");
}

// ================================
// MESSAGE HANDLING
// ================================
function showMessage(message, type = "info") {
  const messageEl = document.getElementById("authMessage");
  messageEl.textContent = message;
  messageEl.className = "auth-message " + type;
}

function hideMessage() {
  const messageEl = document.getElementById("authMessage");
  messageEl.className = "auth-message";
  messageEl.textContent = "";
}

// ================================
// GOOGLE AUTH
// ================================
async function loginWithGoogle() {
  try {
    setLoading(true);
    hideMessage();

    const result = await auth.signInWithPopup(googleProvider);
    const user = result.user;

    console.log("Google login successful:", user.email);

    // Check if new user, create profile
    if (result.additionalUserInfo?.isNewUser) {
      await createUserProfile(user);
      showMessage("Conta criada com sucesso! A redirecionar...", "success");
    } else {
      showMessage("Login efetuado! A redirecionar...", "success");
    }

    // Redirect after short delay
    setTimeout(() => {
      window.location.href = getRedirectUrl();
    }, 1500);

  } catch (error) {
    console.error("Google login error:", error);
    handleAuthError(error);
  } finally {
    setLoading(false);
  }
}

// ================================
// EMAIL/PASSWORD AUTH
// ================================
async function loginWithEmail(event) {
  event.preventDefault();
  
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    showMessage("Por favor, preenche todos os campos.", "error");
    return;
  }

  try {
    setLoading(true);
    hideMessage();

    const result = await auth.signInWithEmailAndPassword(email, password);
    console.log("Email login successful:", result.user.email);

    showMessage("Login efetuado! A redirecionar...", "success");

    setTimeout(() => {
      window.location.href = getRedirectUrl();
    }, 1500);

  } catch (error) {
    console.error("Email login error:", error);
    handleAuthError(error);
  } finally {
    setLoading(false);
  }
}

async function registerWithEmail(event) {
  event.preventDefault();

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const passwordConfirm = document.getElementById("registerPasswordConfirm").value;
  const acceptTerms = document.getElementById("acceptTerms").checked;

  // Validation
  if (!name || !email || !password || !passwordConfirm) {
    showMessage("Por favor, preenche todos os campos.", "error");
    return;
  }

  if (password !== passwordConfirm) {
    showMessage("As palavras-passe nÃ£o coincidem.", "error");
    return;
  }

  if (password.length < 6) {
    showMessage("A palavra-passe deve ter pelo menos 6 caracteres.", "error");
    return;
  }

  if (!acceptTerms) {
    showMessage("Tens de aceitar os Termos de Uso.", "error");
    return;
  }

  try {
    setLoading(true);
    hideMessage();

    // Create user
    const result = await auth.createUserWithEmailAndPassword(email, password);
    const user = result.user;

    // Update display name
    await user.updateProfile({
      displayName: name
    });

    // Create user profile in Firestore
    await createUserProfile(user, { displayName: name });

    console.log("Registration successful:", user.email);
    showMessage("Conta criada com sucesso! A redirecionar...", "success");

    setTimeout(() => {
      window.location.href = getRedirectUrl();
    }, 1500);

  } catch (error) {
    console.error("Registration error:", error);
    handleAuthError(error);
  } finally {
    setLoading(false);
  }
}

// ================================
// PASSWORD RESET
// ================================
async function resetPassword(event) {
  event.preventDefault();

  const email = document.getElementById("resetEmail").value.trim();

  if (!email) {
    showMessage("Por favor, introduz o teu email.", "error");
    return;
  }

  try {
    setLoading(true);
    hideMessage();

    await auth.sendPasswordResetEmail(email);

    showMessage("Email enviado! Verifica a tua caixa de entrada.", "success");

  } catch (error) {
    console.error("Password reset error:", error);
    handleAuthError(error);
  } finally {
    setLoading(false);
  }
}

// ================================
// USER PROFILE
// ================================
async function createUserProfile(user, additionalData = {}) {
  if (!db) {
    console.warn("Firestore not available");
    return;
  }

  try {
    const userRef = db.collection("quest4you_users").doc(user.uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      await userRef.set({
        uid: user.uid,
        email: user.email,
        displayName: additionalData.displayName || user.displayName || "Utilizador",
        photoURL: user.photoURL || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        quizResults: {},
        progress: {},
        settings: {
          notifications: true,
          publicProfile: false,
          smartMatchEnabled: true
        }
      });
      console.log("User profile created");
    } else {
      // Update last login
      await userRef.update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log("User profile updated");
    }
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
}

// ================================
// ERROR HANDLING
// ================================
function handleAuthError(error) {
  let message = "Ocorreu um erro. Por favor, tenta novamente.";

  switch (error.code) {
    case "auth/user-not-found":
      message = "NÃ£o existe nenhuma conta com este email.";
      break;
    case "auth/wrong-password":
      message = "Palavra-passe incorreta.";
      break;
    case "auth/email-already-in-use":
      message = "JÃ¡ existe uma conta com este email.";
      break;
    case "auth/weak-password":
      message = "A palavra-passe Ã© demasiado fraca.";
      break;
    case "auth/invalid-email":
      message = "O email introduzido nÃ£o Ã© vÃ¡lido.";
      break;
    case "auth/too-many-requests":
      message = "Demasiadas tentativas. Tenta novamente mais tarde.";
      break;
    case "auth/popup-closed-by-user":
      message = "O popup foi fechado antes de completar o login.";
      break;
    case "auth/network-request-failed":
      message = "Erro de ligaÃ§Ã£o. Verifica a tua internet.";
      break;
    default:
      console.error("Unhandled auth error:", error.code, error.message);
  }

  showMessage(message, "error");
}

// ================================
// UTILITIES
// ================================
function setLoading(isLoading) {
  const authBox = document.querySelector(".auth-box");
  if (isLoading) {
    authBox.classList.add("loading");
  } else {
    authBox.classList.remove("loading");
  }
}

function getRedirectUrl() {
  // Check for redirect parameter
  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get("redirect");
  
  if (redirect) {
    // Handle known redirects
    switch (redirect) {
      case "smart-match":
        return "smart-match.html";
      case "profile":
        return "profile.html";
      default:
        return decodeURIComponent(redirect);
    }
  }
  
  // Default redirect
  return "../index.html";
}

// ================================
// EXPORTS
// ================================
window.loginWithGoogle = loginWithGoogle;
window.loginWithEmail = loginWithEmail;
window.registerWithEmail = registerWithEmail;
window.resetPassword = resetPassword;
window.showResetPassword = showResetPassword;
window.showLogin = showLogin;