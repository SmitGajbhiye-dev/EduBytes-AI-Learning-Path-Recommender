// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  connectAuthEmulator 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAOFFYsXxs09HymZU8d1dRlS5dxY15bTZk",
  authDomain: "edubytes-new.firebaseapp.com",
  projectId: "edubytes-new",
  storageBucket: "edubytes-new.appspot.com",
  messagingSenderId: "527649582809",
  appId: "1:527649582809:web:30c42d1733d1ccf29058c8",
  measurementId: "G-51Y26TD6EB"
};

// Initialize Firebase
let app;
let auth;
let db;
let analytics;
let googleProvider;

try {
  console.log('Initializing Firebase with config:', JSON.stringify(firebaseConfig));
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Set persistence to allow users to stay logged in
  auth.useDeviceLanguage();
  
  db = getFirestore(app);
  
  // Only initialize analytics on client-side
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  
  // Configure Google provider
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Mock implementations for development when real Firebase is unavailable
const mockUserData = {
  'mock-user-id': {
    uid: 'mock-user-id',
    name: 'Mock User',
    email: 'mock@example.com',
    createdAt: new Date(),
    savedCourses: [],
    learningPaths: [],
    progress: {}
  }
};

// Authentication functions
export const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    if (!auth) {
      // Fallback to mock implementation if auth is unavailable
      console.log('Mock register:', { name, email });
      const mockUser = { uid: 'mock-user-id', email };
      mockUserData['mock-user-id'] = {
        uid: 'mock-user-id',
        name,
        email,
        createdAt: new Date(),
        savedCourses: [],
        learningPaths: [],
        progress: {}
      };
      return { success: true, user: mockUser };
    }
    
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      createdAt: new Date(),
      savedCourses: [],
      learningPaths: [],
      progress: {}
    });
    return { success: true, user };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

export const loginWithEmailAndPassword = async (email, password) => {
  try {
    if (!auth) {
      // Fallback to mock implementation if auth is unavailable
      console.log('Mock login:', { email });
      return { success: true, user: { uid: 'mock-user-id', email } };
    }
    
    console.log('Attempting to sign in with email and password');
    const res = await signInWithEmailAndPassword(auth, email, password);
    console.log('Sign in successful:', res.user.uid);
    return { success: true, user: res.user };
  } catch (err) {
    console.error('Login error details:', err.code, err.message);
    return { success: false, error: err.code || err.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    if (!auth) {
      // Fallback to mock implementation if auth is unavailable
      console.log('Mock Google login');
      return { success: true, user: { uid: 'mock-user-id', email: 'mock@example.com', displayName: 'Mock User' } };
    }
    
    try {
      console.log('Attempting Google sign in');
      // Set custom parameters for the Google provider
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const res = await signInWithPopup(auth, googleProvider);
      console.log('Google sign in successful:', res.user.uid);
      const user = res.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        console.log('Creating new user document for Google user');
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          createdAt: new Date(),
          savedCourses: [],
          learningPaths: [],
          progress: {}
        });
      }
      return { success: true, user };
    } catch (err) {
      console.error("Google Sign-In Error:", err.code, err.message);
      
      // Check for specific error codes and provide more helpful messages
      if (err.code === 'auth/unauthorized-domain') {
        console.error("The domain is not authorized in Firebase Auth. Add it to authorized domains in Firebase Console.");
        return { 
          success: false, 
          error: "auth/unauthorized-domain", 
          message: "This domain is not authorized for authentication. Please contact support." 
        };
      }
      
      if (err.code === 'auth/popup-closed-by-user') {
        return { 
          success: false, 
          error: "auth/popup-closed-by-user", 
          message: "Login popup was closed. Please try again." 
        };
      }
      
      return { success: false, error: err.code || err.message };
    }
  } catch (err) {
    console.error("Outer Google Sign-In Error:", err);
    return { success: false, error: err.message };
  }
};

export const logoutUser = async () => {
  try {
    if (!auth) {
      // Fallback to mock implementation if auth is unavailable
      console.log('Mock logout');
      return { success: true };
    }
    
    await signOut(auth);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

// User data functions
export const getUserData = async (uid) => {
  try {
    if (!auth || !db) {
      // Fallback to mock implementation if auth or db is unavailable
      console.log('Mock get user data:', { uid });
      return { success: true, data: mockUserData['mock-user-id'] };
    }
    
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

export const saveCourse = async (uid, course) => {
  try {
    if (!auth || !db) {
      // Fallback to mock implementation if auth or db is unavailable
      console.log('Mock save course:', { uid, course });
      const userData = mockUserData[uid] || { savedCourses: [] };
      if (!userData.savedCourses.some(c => c.id === course.id)) {
        userData.savedCourses.push(course);
      }
      return { success: true };
    }
    
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const savedCourses = userData.savedCourses || [];
      
      // Check if course is already saved
      if (!savedCourses.some(c => c.id === course.id)) {
        await updateDoc(userRef, {
          savedCourses: [...savedCourses, course]
        });
      }
      
      return { success: true };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

export const updateUserProgress = async (uid, courseId, progress) => {
  try {
    if (!auth || !db) {
      // Fallback to mock implementation if auth or db is unavailable
      console.log('Mock update progress:', { uid, courseId, progress });
      const userData = mockUserData[uid];
      if (userData) {
        userData.progress = userData.progress || {};
        userData.progress[courseId] = progress;
      }
      return { success: true };
    }
    
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentProgress = userData.progress || {};
      
      await updateDoc(userRef, {
        progress: {
          ...currentProgress,
          [courseId]: progress
        }
      });
      
      return { success: true };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

export { auth, db, analytics }; 