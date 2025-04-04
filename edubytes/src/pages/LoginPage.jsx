import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { checkDomainAuthorization, getAuthDomainInstructions } from '../utils/authHelper';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDomainHelp, setShowDomainHelp] = useState(false);
  
  const { login, googleLogin, user, loading, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from URL query parameter or default to dashboard
  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/dashboard';
  
  // Debug logging
  useEffect(() => {
    console.log('LoginPage mounted');
    console.log('Auth state:', { user, loading, authError });
    
    // Check domain authorization
    if (!checkDomainAuthorization()) {
      console.warn('Current domain may not be authorized for Firebase Authentication');
    }
    
    return () => console.log('LoginPage unmounted');
  }, []);
  
  // Log auth state changes
  useEffect(() => {
    console.log('Auth state updated:', { user, loading, authError });
    
    // Check for domain authorization errors
    if (authError && authError.includes('auth/unauthorized-domain')) {
      setShowDomainHelp(true);
    }
  }, [user, loading, authError]);
  
  // Clear form error when inputs change
  useEffect(() => {
    if (formError) setFormError('');
    if (authError) clearAuthError();
  }, [email, password, clearAuthError, authError]);
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      console.log('User is logged in, redirecting to:', redirectPath);
      navigate(redirectPath);
    }
  }, [user, loading, navigate, redirectPath]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Attempting email login with:', { email });
    
    // Validate inputs
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    
    if (!password) {
      setFormError('Password is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      console.log('Login result:', result);
      
      if (!result.success) {
        let errorMsg = result.error || 'Login failed. Please try again.';
        console.error('Login failed:', errorMsg);
        
        // Make error messages more user-friendly
        if (errorMsg.includes('auth/user-not-found') || errorMsg.includes('auth/wrong-password')) {
          errorMsg = 'Invalid email or password. Please try again.';
        } else if (errorMsg.includes('auth/too-many-requests')) {
          errorMsg = 'Too many failed login attempts. Please try again later or reset your password.';
        } else if (errorMsg.includes('auth/network-request-failed')) {
          errorMsg = 'Network error. Please check your internet connection and try again.';
        } else if (errorMsg.includes('auth/unauthorized-domain')) {
          errorMsg = 'This website is not authorized for authentication. Please see the instructions below.';
          setShowDomainHelp(true);
        }
        
        setFormError(errorMsg);
      } else {
        console.log('Login successful');
      }
      // No need to redirect, auth state change will handle it
    } catch (error) {
      console.error('Login error caught:', error);
      setFormError(error.message || 'An unexpected error occurred. Please try again.');
      
      // Check if it's a domain authorization error
      if (error.code === 'auth/unauthorized-domain') {
        setShowDomainHelp(true);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Google login
  const handleGoogleLogin = async () => {
    console.log('Attempting Google login');
    setIsLoading(true);
    
    try {
      const result = await googleLogin();
      console.log('Google login result:', result);
      
      if (!result.success) {
        let errorMsg = result.error || 'Google login failed. Please try again.';
        console.error('Google login failed:', errorMsg);
        
        // Make error messages more user-friendly
        if (errorMsg.includes('auth/popup-closed-by-user')) {
          errorMsg = 'Login canceled. Please try again.';
        } else if (errorMsg.includes('auth/unauthorized-domain')) {
          errorMsg = 'This website is not authorized for authentication. Please see the instructions below.';
          setShowDomainHelp(true);
        } else if (errorMsg.includes('auth/network-request-failed')) {
          errorMsg = 'Network error. Please check your internet connection and try again.';
        }
        
        setFormError(errorMsg);
      } else {
        console.log('Google login successful');
      }
      // No need to redirect, auth state change will handle it
    } catch (error) {
      console.error('Google login error caught:', error);
      setFormError(error.message || 'An unexpected error occurred. Please try again.');
      
      // Check if it's a domain authorization error
      if (error.code === 'auth/unauthorized-domain') {
        setShowDomainHelp(true);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // If still loading auth state, show loading spinner
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Helmet>
        <title>Login | EduBytes</title>
        <meta name="description" content="Log in to your EduBytes account to access personalized learning recommendations and track your progress." />
      </Helmet>
      
      <div className="container-custom py-16 md:py-24">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
            <p className="text-gray-600 dark:text-gray-400">Log in to your account to continue learning</p>
          </div>
          
          {(formError || authError) && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
              {formError || authError}
            </div>
          )}
          
          {showDomainHelp && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Domain Authorization Required</h3>
              <p className="mb-2">This domain needs to be authorized in Firebase Authentication.</p>
              <details className="cursor-pointer">
                <summary className="font-medium">Show instructions to fix</summary>
                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs whitespace-pre-wrap">
                  {getAuthDomainInstructions()}
                </pre>
              </details>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full flex justify-center items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
                  Logging in...
                </>
              ) : (
                'Log in'
              )}
            </button>
          </form>
          
          <div className="my-6 flex items-center">
            <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
            <div className="mx-4 text-sm text-gray-500 dark:text-gray-400">or</div>
            <div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
          </div>
          
          <button
            onClick={handleGoogleLogin}
            className="btn btn-secondary w-full flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-primary rounded-full"></span>
                Logging in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>
          
          <div className="text-center mt-8">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:text-primary-dark font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage; 