// Firebase Configuration
// Quest4Couple Firebase Project
const firebaseConfig = {
  apiKey: "AIzaSyA8-Oe449em8Tgo3Q-MJ87CHQdeIqr4tLk",
  authDomain: "quest4couple.firebaseapp.com",
  projectId: "quest4couple",
  storageBucket: "quest4couple.firebasestorage.app",
  messagingSenderId: "27375862534",
  appId: "1:27375862534:web:40039fa60931212e701487",
  measurementId: "G-VK4Z2F1693"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Export para usar noutros ficheiros
window.firebaseAuth = auth;
window.firebaseDb = db;
window.googleProvider = googleProvider;

console.log('🔥 Firebase inicializado!');