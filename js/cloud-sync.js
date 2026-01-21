/**
 * Quest4You - Cloud Sync Service
 * Sincronização de resultados com Firestore
 */

// ================================
// CONFIGURATION
// ================================
const COLLECTION_USERS = "quest4you_users";
const COLLECTION_RESULTS = "quest4you_results";
const COLLECTION_PUBLIC_PROFILES = "quest4you_public";

// ================================
// SAVE QUIZ RESULT
// ================================
async function saveQuizResultToCloud(quizId, result) {
  const user = auth?.currentUser;
  
  // Always save locally first
  saveResultLocally(quizId, result);
  
  // If user is logged in, sync to cloud
  if (user && db) {
    try {
      await syncResultToFirestore(user.uid, quizId, result);
      console.log("✅ Result synced to cloud:", quizId);
      return { success: true, synced: true };
    } catch (error) {
      console.error("❌ Cloud sync failed:", error);
      return { success: true, synced: false, error };
    }
  }
  
  return { success: true, synced: false };
}

// ================================
// LOCAL STORAGE
// ================================
function saveResultLocally(quizId, result) {
  const results = JSON.parse(localStorage.getItem("q4y_results") || "{}");
  
  results[quizId] = {
    ...result,
    date: new Date().toISOString(),
    synced: false
  };
  
  localStorage.setItem("q4y_results", JSON.stringify(results));
  console.log("💾 Result saved locally:", quizId);
}

function getLocalResults() {
  return JSON.parse(localStorage.getItem("q4y_results") || "{}");
}

function clearLocalResults() {
  localStorage.removeItem("q4y_results");
}

// ================================
// FIRESTORE SYNC
// ================================
async function syncResultToFirestore(userId, quizId, result) {
  if (!db) throw new Error("Firestore not available");
  
  const userRef = db.collection(COLLECTION_USERS).doc(userId);
  
  // Prepare result data
  const resultData = {
    score: result.score,
    category: result.category?.label || null,
    categoryEmoji: result.category?.emoji || null,
    categoryDescription: result.category?.description || null,
    totalPoints: result.totalPoints,
    maxPoints: result.maxPoints,
    categoryScores: result.categoryScores || {},
    completedAt: firebase.firestore.FieldValue.serverTimestamp(),
    answers: result.answers || {}
  };
  
  // Update user document with nested result
  await userRef.set({
    quizResults: {
      [quizId]: resultData
    },
    lastActivity: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  
  // Also save to separate results collection for analytics
  await db.collection(COLLECTION_RESULTS).add({
    userId: userId,
    quizId: quizId,
    score: result.score,
    category: result.category?.label || null,
    completedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  // Mark local result as synced
  const localResults = getLocalResults();
  if (localResults[quizId]) {
    localResults[quizId].synced = true;
    localStorage.setItem("q4y_results", JSON.stringify(localResults));
  }
}

// ================================
// SYNC ALL LOCAL RESULTS
// ================================
async function syncAllLocalResults() {
  const user = auth?.currentUser;
  if (!user || !db) return { synced: 0, failed: 0 };
  
  const localResults = getLocalResults();
  let synced = 0;
  let failed = 0;
  
  for (const [quizId, result] of Object.entries(localResults)) {
    if (!result.synced) {
      try {
        await syncResultToFirestore(user.uid, quizId, result);
        synced++;
      } catch (error) {
        console.error(`Failed to sync ${quizId}:`, error);
        failed++;
      }
    }
  }
  
  console.log(`📤 Sync complete: ${synced} synced, ${failed} failed`);
  return { synced, failed };
}

// ================================
// LOAD RESULTS FROM CLOUD
// ================================
async function loadResultsFromCloud() {
  const user = auth?.currentUser;
  if (!user || !db) return null;
  
  try {
    const doc = await db.collection(COLLECTION_USERS).doc(user.uid).get();
    
    if (doc.exists) {
      const data = doc.data();
      return data.quizResults || {};
    }
    
    return {};
  } catch (error) {
    console.error("Error loading results from cloud:", error);
    return null;
  }
}

// ================================
// MERGE LOCAL AND CLOUD RESULTS
// ================================
async function getMergedResults() {
  const localResults = getLocalResults();
  const cloudResults = await loadResultsFromCloud();
  
  if (!cloudResults) {
    return localResults;
  }
  
  // Merge: cloud takes precedence for same quiz
  // but keep newer results based on date
  const merged = { ...localResults };
  
  for (const [quizId, cloudResult] of Object.entries(cloudResults)) {
    const localResult = localResults[quizId];
    
    if (!localResult) {
      merged[quizId] = cloudResult;
    } else {
      // Compare dates, keep newer
      const cloudDate = cloudResult.completedAt?.toDate?.() || new Date(0);
      const localDate = new Date(localResult.date || 0);
      
      if (cloudDate > localDate) {
        merged[quizId] = cloudResult;
      }
    }
  }
  
  return merged;
}

// ================================
// PUBLIC PROFILE MANAGEMENT
// ================================
async function updatePublicProfile(userData) {
  const user = auth?.currentUser;
  if (!user || !db) return false;
  
  try {
    const publicData = {
      uid: user.uid,
      displayName: userData.displayName || "Anónimo",
      photoURL: userData.photoURL || null,
      quizScores: {},
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      smartMatchEnabled: userData.settings?.smartMatchEnabled !== false
    };
    
    // Add quiz scores for matching
    if (userData.quizResults) {
      for (const [quizId, result] of Object.entries(userData.quizResults)) {
        publicData.quizScores[quizId] = {
          score: result.score,
          category: result.category
        };
      }
    }
    
    await db.collection(COLLECTION_PUBLIC_PROFILES).doc(user.uid).set(publicData, { merge: true });
    console.log("✅ Public profile updated");
    return true;
  } catch (error) {
    console.error("Error updating public profile:", error);
    return false;
  }
}

async function removePublicProfile() {
  const user = auth?.currentUser;
  if (!user || !db) return false;
  
  try {
    await db.collection(COLLECTION_PUBLIC_PROFILES).doc(user.uid).delete();
    console.log("✅ Public profile removed");
    return true;
  } catch (error) {
    console.error("Error removing public profile:", error);
    return false;
  }
}

// ================================
// EXPORTS
// ================================
window.CloudSync = {
  saveQuizResult: saveQuizResultToCloud,
  saveLocally: saveResultLocally,
  getLocalResults,
  clearLocalResults,
  syncAllLocalResults,
  loadFromCloud: loadResultsFromCloud,
  getMergedResults,
  updatePublicProfile,
  removePublicProfile
};