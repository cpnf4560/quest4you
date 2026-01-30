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
async function getUserProfile(userId) {
  if (!db) return null;
  
  try {
    const doc = await db.collection(COLLECTION_USERS).doc(userId).get();
    
    if (doc.exists) {
      return doc.data();
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

async function saveUserProfile(userId, profileData) {
  if (!db) throw new Error("Firestore not available");
  
  try {
    await db.collection(COLLECTION_USERS).doc(userId).set(profileData, { merge: true });
    console.log("✅ User profile saved");
    return true;
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
}

async function publishPublicProfile(userId, userData) {
  if (!db) throw new Error("Firestore not available");
  
  try {
    // Get local results for quiz scores and roles
    const localResults = getLocalResults();
    
    const publicData = {
      uid: userId,
      displayName: userData.displayName || "Anónimo",
      age: userData.age || null,
      gender: userData.gender || null,
      location: userData.location || null,
      photoURL: userData.photoURL || null,
      quizScores: userData.quizScores || {},
      quizRoles: {}, // For role-based quizzes
      isPublic: true,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Extract role information from results
    for (const [quizId, result] of Object.entries(localResults)) {
      if (result.dominantRole) {
        publicData.quizRoles[quizId] = {
          dominantRole: result.dominantRole,
          matchWith: result.matchWith || []
        };
      }
    }
    
    await db.collection(COLLECTION_PUBLIC_PROFILES).doc(userId).set(publicData, { merge: true });
    console.log("✅ Public profile published");
    return true;
  } catch (error) {
    console.error("Error publishing public profile:", error);
    throw error;
  }
}

async function unpublishPublicProfile(userId) {
  if (!db) throw new Error("Firestore not available");
  
  try {
    await db.collection(COLLECTION_PUBLIC_PROFILES).doc(userId).update({
      isPublic: false
    });
    console.log("✅ Public profile unpublished");
    return true;
  } catch (error) {
    console.error("Error unpublishing public profile:", error);
    throw error;
  }
}

// ================================
// FIND MATCHES
// ================================
async function findMatches(userId, userScores) {
  if (!db) return [];
  
  try {
    // Get all public profiles
    const snapshot = await db.collection(COLLECTION_PUBLIC_PROFILES)
      .where('isPublic', '==', true)
      .limit(100)
      .get();
    
    const matches = [];
    const localResults = getLocalResults();
    
    snapshot.forEach(doc => {
      const profile = doc.data();
      
      // Skip self
      if (profile.uid === userId) return;
      
      // Calculate compatibility
      const compatibility = calculateCompatibility(userScores, profile.quizScores || {}, localResults, profile.quizRoles || {});
      
      matches.push({
        id: doc.id,
        ...profile,
        compatibility: compatibility
      });
    });
    
    // Sort by compatibility descending
    matches.sort((a, b) => b.compatibility - a.compatibility);
    
    return matches;
  } catch (error) {
    console.error("Error finding matches:", error);
    return [];
  }
}

// ================================
// CALCULATE COMPATIBILITY
// ================================
function calculateCompatibility(userScores, theirScores, userResults, theirRoles) {
  let totalMatch = 0;
  let quizCount = 0;
  
  // Find common quizzes
  for (const quizId of Object.keys(userScores)) {
    if (theirScores[quizId] !== undefined) {
      quizCount++;
      
      const userResult = userResults[quizId] || {};
      const theirRoleInfo = theirRoles[quizId] || {};
      
      // Check if this is a role-based quiz with inverse matching
      if (userResult.dominantRole && theirRoleInfo.dominantRole) {
        // Role-based matching (inverse)
        // Check if user's role is in their matchWith list
        const userMatchWith = userResult.matchWith || [];
        const theirRole = theirRoleInfo.dominantRole;
        
        if (userMatchWith.includes(theirRole)) {
          // Perfect role match! High compatibility
          totalMatch += 95;
        } else if (theirRoleInfo.matchWith && theirRoleInfo.matchWith.includes(userResult.dominantRole)) {
          // They match with our role
          totalMatch += 85;
        } else {
          // Same role - lower compatibility for inverse matching quizzes
          totalMatch += 30;
        }
      } else {
        // Standard score-based matching (similar scores = compatible)
        const scoreDiff = Math.abs(userScores[quizId] - theirScores[quizId]);
        const matchPercent = Math.max(0, 100 - scoreDiff);
        totalMatch += matchPercent;
      }
    }
  }
  
  if (quizCount === 0) return 0;
  
  return Math.round(totalMatch / quizCount);
}

async function updatePublicProfile(userData) {
  const user = auth?.currentUser;
  if (!user || !db) return false;
  
  try {
    const localResults = getLocalResults();
    
    const publicData = {
      uid: user.uid,
      displayName: userData.displayName || "Anónimo",
      photoURL: userData.photoURL || null,
      quizScores: {},
      quizRoles: {},
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
      smartMatchEnabled: userData.settings?.smartMatchEnabled !== false
    };
    
    // Add quiz scores and roles for matching
    if (userData.quizResults) {
      for (const [quizId, result] of Object.entries(userData.quizResults)) {
        publicData.quizScores[quizId] = {
          score: result.score,
          category: result.category
        };
        
        // Add role info if present
        if (result.dominantRole) {
          publicData.quizRoles[quizId] = {
            dominantRole: result.dominantRole,
            matchWith: result.matchWith || []
          };
        }
      }
    }
    
    // Also check local results
    for (const [quizId, result] of Object.entries(localResults)) {
      if (!publicData.quizScores[quizId]) {
        publicData.quizScores[quizId] = {
          score: result.score,
          category: result.category
        };
      }
      
      if (result.dominantRole && !publicData.quizRoles[quizId]) {
        publicData.quizRoles[quizId] = {
          dominantRole: result.dominantRole,
          matchWith: result.matchWith || []
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
  getUserProfile,
  saveUserProfile,
  publishPublicProfile,
  unpublishPublicProfile,
  findMatches,
  updatePublicProfile,
  removePublicProfile
};