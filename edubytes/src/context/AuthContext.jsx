import { createContext, useState, useEffect, useContext } from 'react';
import { 
  auth, 
  loginWithEmailAndPassword, 
  registerWithEmailAndPassword, 
  signInWithGoogle, 
  logoutUser, 
  getUserData
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Create the Auth Context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    let unsubscribe = () => {};
    
    // Check if auth is defined (not using placeholder credentials)
    if (auth) {
      try {
        unsubscribe = onAuthStateChanged(auth, async (authUser) => {
          try {
            if (authUser) {
              setUser(authUser);
              // Get user data from Firestore
              const result = await getUserData(authUser.uid);
              if (result.success) {
                setUserData(result.data);
              } else {
                console.warn("User authenticated but failed to fetch user data:", result.error);
              }
            } else {
              setUser(null);
              setUserData(null);
            }
          } catch (err) {
            console.error("Error in auth state change handler:", err);
            setAuthError(err.message);
          } finally {
            setLoading(false);
          }
        }, (error) => {
          console.error("Auth state change error:", error);
          setAuthError(error.message);
          setLoading(false);
        });
      } catch (err) {
        console.error("Error setting up auth state listener:", err);
        setAuthError(err.message);
        setLoading(false);
      }
    } else {
      // If auth is undefined (using placeholders), just set loading to false
      console.log('Using mock auth - no auth state changes will be detected');
      setLoading(false);
    }

    // Cleanup subscription
    return () => {
      try {
        unsubscribe();
      } catch (err) {
        console.error("Error unsubscribing from auth state:", err);
      }
    };
  }, []);

  // Login with email and password
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await loginWithEmailAndPassword(email, password);
      if (!result.success) {
        setAuthError(result.error);
      }
      return result;
    } catch (err) {
      console.error("Login error:", err);
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Register with email and password
  const register = async (name, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await registerWithEmailAndPassword(name, email, password);
      if (!result.success) {
        setAuthError(result.error);
      }
      return result;
    } catch (err) {
      console.error("Registration error:", err);
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Login with Google
  const googleLogin = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        // Check specifically for unauthorized domain error
        if (result.error && result.error.includes('auth/unauthorized-domain')) {
          console.error("Unauthorized domain error. Please ensure your domain is added to Firebase Auth authorized domains.");
          setAuthError("Authentication domain not authorized. Please contact support or try again later.");
        } else {
          setAuthError(result.error);
        }
      }
      return result;
    } catch (err) {
      console.error("Google login error:", err);
      // Check if this is an unauthorized domain error
      if (err.code === 'auth/unauthorized-domain') {
        setAuthError("Authentication domain not authorized. Please contact support or try again later.");
      } else {
        setAuthError(err.message);
      }
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const result = await logoutUser();
      if (!result.success) {
        setAuthError(result.error);
      }
      return result;
    } catch (err) {
      console.error("Logout error:", err);
      setAuthError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUserData = async () => {
    if (user) {
      try {
        const result = await getUserData(user.uid);
        if (result.success) {
          setUserData(result.data);
          return result;
        }
        setAuthError("Failed to refresh user data");
        return { success: false, error: 'Failed to refresh user data' };
      } catch (err) {
        console.error("Error refreshing user data:", err);
        setAuthError(err.message);
        return { success: false, error: err.message };
      }
    }
    return { success: false, error: 'No user logged in' };
  };

  // Context value
  const value = {
    user,
    userData,
    loading,
    authError,
    login,
    register,
    googleLogin,
    logout,
    refreshUserData,
    clearAuthError: () => setAuthError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 