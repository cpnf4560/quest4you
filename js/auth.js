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
  
  // Handle redirect result (for mobile or when popup is blocked)
  if (typeof auth !== "undefined") {
    // Check for pending redirect result first
    auth.getRedirectResult().then(function(result) {
      if (result && result.user) {
        console.log("🔐 Redirect login successful:", result.user.email);
        sessionStorage.removeItem('pendingRedirect');
        sessionStorage.removeItem('authAction');
        
        if (result.additionalUserInfo?.isNewUser) {
          createUserProfile(result.user);
        }
        
        showMessage(t('auth.msgLoginSuccess'), "success");
        setTimeout(() => {
          window.location.href = getRedirectUrl();
        }, 1500);
      }
    }).catch(function(error) {
      console.error("Redirect error:", error);
      sessionStorage.removeItem('pendingRedirect');
      sessionStorage.removeItem('authAction');
      if (error.code) {
        handleAuthError(error);
      }
    });

    // Check if user is already logged in
    auth.onAuthStateChanged(function(user) {
      console.log("🔐 Auth state changed:", user ? user.email : "No user");
      if (user) {
        // User is logged in, redirect to home or profile
        // Only redirect if we're on the auth page and not in the middle of an auth action
        const isAuthAction = sessionStorage.getItem('authAction');
        const pendingRedirect = sessionStorage.getItem('pendingRedirect');
        if (!isAuthAction && !pendingRedirect) {
          console.log("🔄 Redirecting logged-in user...");
          const redirectUrl = getRedirectUrl();
          window.location.href = redirectUrl;
        } else {
          console.log("⏳ Auth action in progress, skipping redirect");
        }
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
    
    // Mark that we're in the middle of an auth action
    sessionStorage.setItem('authAction', 'google');
    console.log("🔐 Starting Google login...");

    // Try popup first, fall back to redirect if blocked
    let result;
    try {
      result = await auth.signInWithPopup(googleProvider);
    } catch (popupError) {
      // If popup is blocked or closed, try redirect method
      if (popupError.code === 'auth/popup-blocked' || 
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request') {
        console.log("📱 Popup blocked/closed, using redirect...");
        showMessage(t('auth.msgRedirectGoogle'), "info");
        // Store redirect info before navigating away
        sessionStorage.setItem('pendingRedirect', 'true');
        await auth.signInWithRedirect(googleProvider);
        return; // The page will redirect
      }
      throw popupError; // Re-throw other errors
    }
    
    const user = result.user;
    console.log("Google login successful:", user.email);

    // Check if new user, create profile
    if (result.additionalUserInfo?.isNewUser) {
      await createUserProfile(user);
      showMessage(t('auth.msgAccountCreated'), "success");
    } else {
      showMessage(t('auth.msgLoginSuccess'), "success");
    }

    // Clear auth action flag before redirect
    sessionStorage.removeItem('authAction');

    // Redirect after short delay
    setTimeout(() => {
      window.location.href = getRedirectUrl();
    }, 1500);
  } catch (error) {
    console.error("Google login error:", error);
    sessionStorage.removeItem('authAction');
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
    showMessage(t('auth.msgFillFields'), "error");
    return;
  }

  try {
    setLoading(true);
    hideMessage();

    const result = await auth.signInWithEmailAndPassword(email, password);
    console.log("Email login successful:", result.user.email);

    showMessage(t('auth.msgLoginSuccess'), "success");

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
  const gender = document.getElementById("registerGender").value;
  const password = document.getElementById("registerPassword").value;
  const passwordConfirm = document.getElementById("registerPasswordConfirm").value;
  const acceptTerms = document.getElementById("acceptTerms").checked;
  const acceptNewsletter = document.getElementById("acceptNewsletter")?.checked || false;

  // Validation
  if (!name || !email || !gender || !password || !passwordConfirm) {
    showMessage(t('auth.msgFillFields'), "error");
    return;
  }

  if (password !== passwordConfirm) {
    showMessage(t('auth.msgPasswordMismatch'), "error");
    return;
  }

  if (password.length < 6) {
    showMessage(t('auth.msgPasswordMin'), "error");
    return;
  }

  if (!acceptTerms) {
    showMessage(t('auth.msgAcceptTerms'), "error");
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
    });    // Create user profile in Firestore with gender and newsletter preference
    await createUserProfile(user, { displayName: name, gender: gender, newsletter: acceptNewsletter });

    console.log("Registration successful:", user.email);
    showMessage(t('auth.msgAccountCreated'), "success");

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
    showMessage(t('auth.msgEnterEmail'), "error");
    return;
  }

  try {
    setLoading(true);
    hideMessage();

    await auth.sendPasswordResetEmail(email);

    showMessage(t('auth.msgEmailSent'), "success");

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
        displayName: additionalData.displayName || user.displayName || t('hero.welcomeUser'),
        photoURL: user.photoURL || null,
        gender: additionalData.gender || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        quizResults: {},
        quizProgress: {},
        progress: {},
        settings: {
          notifications: true,
          publicProfile: false,
          smartMatchEnabled: true,
          newsletter: additionalData.newsletter || false
        }
      });
      console.log("User profile created with gender:", additionalData.gender, "newsletter:", additionalData.newsletter);
    } else {
      // Update last login
      await userRef.update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log("User profile updated");
    }
    
    // Migrate any localStorage data to cloud
    if (window.CloudSync) {
      try {
        const migrationResult = await window.CloudSync.migrateFromLocalStorage(user.uid);
        if (migrationResult.migrated > 0) {
          console.log("✅ Migrated", migrationResult.migrated, "results from localStorage to cloud");
        }
      } catch (migrationError) {
        console.warn("Migration warning:", migrationError);
      }
    }
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
}

// ================================
// ERROR HANDLING
// ================================
function handleAuthError(error) {
  let message = t('auth.errGeneric');

  switch (error.code) {
    case "auth/user-not-found":
      message = t('auth.errUserNotFound');
      break;
    case "auth/wrong-password":
      message = t('auth.errWrongPassword');
      break;
    case "auth/email-already-in-use":
      message = t('auth.errEmailInUse');
      break;
    case "auth/weak-password":
      message = t('auth.errWeakPassword');
      break;
    case "auth/invalid-email":
      message = t('auth.errInvalidEmail');
      break;
    case "auth/too-many-requests":
      message = t('auth.errTooManyRequests');
      break;
    case "auth/popup-closed-by-user":
      message = t('auth.errPopupClosed');
      break;
    case "auth/network-request-failed":
      message = t('auth.errNetwork') !== 'auth.errNetwork' ? t('auth.errNetwork') : "Network error. Check your internet connection.";
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