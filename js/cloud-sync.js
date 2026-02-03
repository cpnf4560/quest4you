/**
 * Quest4You - Cloud Sync Service
 * 100% Cloud-based - No localStorage dependency
 * All data stored in Firebase Firestore
 */

// ================================
// CONFIGURATION
// ================================
const COLLECTION_USERS = "quest4you_users";
const COLLECTION_RESULTS = "quest4you_results";
const COLLECTION_PUBLIC_PROFILES = "quest4you_public";

// ================================
// CACHE (in-memory only, not localStorage)
// ================================
let cachedUserData = null;
let cachedResults = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function isCacheValid() {
  return cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION);
}

function clearCache() {
  cachedUserData = null;
  cachedResults = null;
  cacheTimestamp = null;
}

// ================================
// SAVE QUIZ RESULT (Cloud Only)
// ================================
async function saveQuizResult(userId, quizId, result) {
  if (!db) throw new Error("Firestore not available");
  if (!userId) throw new Error("User not authenticated");
  
  const userRef = db.collection(COLLECTION_USERS).doc(userId);
  
  // Prepare result data
  const resultData = {
    score: result.score,
    category: result.category || null,
    categoryEmoji: result.categoryEmoji || null,
    categoryDescription: result.categoryDescription || null,
    categoryScores: result.categoryScores || {},
    dominantRole: result.dominantRole || null,
    rolePercentages: result.rolePercentages || null,
    matchWith: result.matchWith || null,
    completedAt: firebase.firestore.FieldValue.serverTimestamp(),
    date: new Date().toISOString(),
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
    category: result.category || null,
    completedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  // Update cache
  if (cachedResults) {
    cachedResults[quizId] = resultData;
  }
  
  console.log("✅ Result saved to cloud:", quizId);
  return { success: true };
}

// ================================
// LOAD QUIZ RESULTS (Cloud Only)
// ================================
async function getQuizResults(userId) {
  if (!db) return {};
  if (!userId) return {};
  
  // Check cache first
  if (isCacheValid() && cachedResults) {
    console.log("📦 Using cached results");
    return cachedResults;
  }
  
  try {
    const doc = await db.collection(COLLECTION_USERS).doc(userId).get();
    
    if (doc.exists) {
      const data = doc.data();
      cachedResults = data.quizResults || {};
      cachedUserData = data;
      cacheTimestamp = Date.now();
      return cachedResults;
    }
    
    return {};
  } catch (error) {
    console.error("Error loading results from cloud:", error);
    return {};
  }
}

// ================================
// GET SINGLE QUIZ RESULT
// ================================
async function getQuizResult(userId, quizId) {
  const results = await getQuizResults(userId);
  return results[quizId] || null;
}

// ================================
// DELETE QUIZ RESULT
// ================================
async function deleteQuizResult(userId, quizId) {
  if (!db || !userId) return false;
  
  try {
    const userRef = db.collection(COLLECTION_USERS).doc(userId);
    await userRef.update({
      [`quizResults.${quizId}`]: firebase.firestore.FieldValue.delete()
    });
    
    // Update cache
    if (cachedResults && cachedResults[quizId]) {
      delete cachedResults[quizId];
    }
    
    console.log("🗑️ Result deleted:", quizId);
    return true;
  } catch (error) {
    console.error("Error deleting result:", error);
    return false;
  }
}

// ================================
// USER PROFILE
// ================================
async function getUserProfile(userId) {
  if (!db || !userId) return null;
  
  // Check cache first
  if (isCacheValid() && cachedUserData) {
    return cachedUserData;
  }
  
  try {
    const doc = await db.collection(COLLECTION_USERS).doc(userId).get();
    
    if (doc.exists) {
      cachedUserData = doc.data();
      cacheTimestamp = Date.now();
      return cachedUserData;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

async function saveUserProfile(userId, profileData) {
  if (!db || !userId) throw new Error("Firestore or user not available");
  
  try {
    await db.collection(COLLECTION_USERS).doc(userId).set(profileData, { merge: true });
    
    // Update cache
    cachedUserData = { ...cachedUserData, ...profileData };
    
    console.log("✅ User profile saved");
    return true;
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
}

// ================================
// USER GENDER
// ================================
async function getUserGender(userId) {
  const profile = await getUserProfile(userId);
  return profile?.gender || null;
}

async function saveUserGender(userId, gender) {
  return await saveUserProfile(userId, { gender: gender });
}

// ================================
// QUIZ PROGRESS (in-progress answers)
// ================================
async function saveQuizProgress(userId, quizId, answers, currentQuestion) {
  if (!db || !userId) return false;
  
  try {
    await db.collection(COLLECTION_USERS).doc(userId).set({
      quizProgress: {
        [quizId]: {
          answers: answers,
          currentQuestion: currentQuestion,
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        }
      }
    }, { merge: true });
    
    console.log("💾 Progress saved:", quizId);
    return true;
  } catch (error) {
    console.error("Error saving progress:", error);
    return false;
  }
}

async function getQuizProgress(userId, quizId) {
  if (!db || !userId) return null;
  
  try {
    const profile = await getUserProfile(userId);
    return profile?.quizProgress?.[quizId] || null;
  } catch (error) {
    console.error("Error getting progress:", error);
    return null;
  }
}

async function clearQuizProgress(userId, quizId) {
  if (!db || !userId) return false;
  
  try {
    await db.collection(COLLECTION_USERS).doc(userId).update({
      [`quizProgress.${quizId}`]: firebase.firestore.FieldValue.delete()
    });
    
    console.log("🗑️ Progress cleared:", quizId);
    return true;
  } catch (error) {
    console.error("Error clearing progress:", error);
    return false;
  }
}

// ================================
// PUBLIC PROFILE MANAGEMENT
// ================================
async function publishPublicProfile(userId, userData) {
  if (!db) throw new Error("Firestore not available");
  
  try {
    // Get all quiz results for public profile
    const results = await getQuizResults(userId);
    
    const publicData = {
      uid: userId,
      displayName: userData.displayName || "Anónimo",
      age: userData.age || null,
      gender: userData.gender || null,
      location: userData.location || null,
      photoURL: userData.photoURL || null,
      quizScores: {},
      quizRoles: {},
      isPublic: true,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Extract scores and roles from results
    for (const [quizId, result] of Object.entries(results)) {
      publicData.quizScores[quizId] = result.score;
      
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

async function removePublicProfile(userId) {
  if (!db) throw new Error("Firestore not available");
  
  try {
    await db.collection(COLLECTION_PUBLIC_PROFILES).doc(userId).delete();
    console.log("✅ Public profile removed");
    return true;
  } catch (error) {
    console.error("Error removing public profile:", error);
    throw error;
  }
}

// ================================
// FIND MATCHES
// ================================
async function findMatches(userId) {
  if (!db) return [];
  
  try {
    // Get user's results first
    const userResults = await getQuizResults(userId);
    const userScores = {};
    
    for (const [quizId, result] of Object.entries(userResults)) {
      userScores[quizId] = result.score;
    }
    
    // Get all public profiles
    const snapshot = await db.collection(COLLECTION_PUBLIC_PROFILES)
      .where('isPublic', '==', true)
      .limit(100)
      .get();
    
    const matches = [];
    
    snapshot.forEach(doc => {
      const profile = doc.data();
      
      // Skip self
      if (profile.uid === userId) return;
      
      // Calculate compatibility
      const compatibility = calculateCompatibility(userScores, profile.quizScores || {}, userResults, profile.quizRoles || {});
      
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

// Quizzes where opposite scores mean better compatibility (e.g., Dom + Sub)
const INVERSE_MATCHING_QUIZZES = ['bdsm'];

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
        const userMatchWith = userResult.matchWith || [];
        const theirRole = theirRoleInfo.dominantRole;
        
        if (userMatchWith.includes(theirRole)) {
          // Perfect role match!
          totalMatch += 95;
        } else if (theirRoleInfo.matchWith && theirRoleInfo.matchWith.includes(userResult.dominantRole)) {
          // They match with our role
          totalMatch += 85;
        } else {
          // Same role - lower compatibility for inverse matching quizzes
          totalMatch += 30;
        }
      } else if (INVERSE_MATCHING_QUIZZES.includes(quizId)) {
        // Inverse matching for spectrum quizzes like BDSM (Dom + Sub = good match)
        // Score 0-100: 0 = Submisso, 50 = Switch, 100 = Dominante
        const userScore = userScores[quizId];
        const theirScore = theirScores[quizId];
        const scoreDiff = Math.abs(userScore - theirScore);
        
        // Perfect match: scores are opposite (diff = 100) or both are switch (diff = 0, both around 50)
        // Dom (90) + Sub (10) = diff 80 = excellent match
        // Dom (90) + Dom (90) = diff 0 = poor match (unless both switch)
        // Switch (50) + Switch (50) = diff 0 = good match
        
        const bothAreSwitch = Math.abs(userScore - 50) < 15 && Math.abs(theirScore - 50) < 15;
        
        if (bothAreSwitch) {
          // Both are switches - good compatibility
          totalMatch += 85;
        } else if (scoreDiff >= 60) {
          // Opposite ends of spectrum - excellent match
          totalMatch += 95;
        } else if (scoreDiff >= 40) {
          // Fairly different - good match
          totalMatch += 75;
        } else if (scoreDiff >= 20) {
          // Somewhat similar - moderate match
          totalMatch += 50;
        } else {
          // Very similar scores (both Dom or both Sub) - lower compatibility
          totalMatch += 25;
        }
      } else {
        // Standard score-based matching (similar = compatible)
        const scoreDiff = Math.abs(userScores[quizId] - theirScores[quizId]);
        const matchPercent = Math.max(0, 100 - scoreDiff);
        totalMatch += matchPercent;
      }
    }
  }
  
  if (quizCount === 0) return 0;
  
  return Math.round(totalMatch / quizCount);
}

// ================================
// MIGRATE FROM LOCALSTORAGE (one-time)
// ================================
async function migrateFromLocalStorage(userId) {
  if (!db || !userId) return { migrated: 0 };
  
  // Check if there's data in localStorage
  const localResultsStr = localStorage.getItem("q4y_results");
  if (!localResultsStr) return { migrated: 0 };
  
  const localResults = JSON.parse(localResultsStr);
  const localGender = localStorage.getItem("q4y_user_gender");
  
  let migrated = 0;
  
  // Valid quiz IDs
  const validQuizIds = ['vanilla', 'orientation', 'cuckold', 'swing', 'kinks', 'bdsm', 'adventure', 'fantasies', 'exhibitionism'];
  
  for (const [quizId, result] of Object.entries(localResults)) {
    // Skip invalid quiz IDs
    if (!validQuizIds.includes(quizId)) continue;
    
    try {
      await saveQuizResult(userId, quizId, result);
      migrated++;
    } catch (error) {
      console.error("Error migrating result:", quizId, error);
    }
  }
  
  // Migrate gender
  if (localGender) {
    await saveUserGender(userId, localGender);
  }
  
  // Clear localStorage after successful migration
  if (migrated > 0 || localGender) {
    localStorage.removeItem("q4y_results");
    localStorage.removeItem("q4y_user_gender");
    // Clear quiz progress keys
    validQuizIds.forEach(id => localStorage.removeItem("q4y_quiz_" + id));
    console.log(`✅ Migrated ${migrated} results from localStorage to cloud`);
  }
  
  return { migrated, gender: localGender };
}

// ================================
// EXPORTS
// ================================
window.CloudSync = {
  // Results
  saveQuizResult,
  getQuizResults,
  getQuizResult,
  deleteQuizResult,
  
  // Progress
  saveQuizProgress,
  getQuizProgress,
  clearQuizProgress,
  
  // User Profile
  getUserProfile,
  saveUserProfile,
  getUserGender,
  saveUserGender,
  
  // Public Profile
  publishPublicProfile,
  unpublishPublicProfile,
  removePublicProfile,
  
  // Matching
  findMatches,
  
  // Migration
  migrateFromLocalStorage,
  
  // Cache
  clearCache
};