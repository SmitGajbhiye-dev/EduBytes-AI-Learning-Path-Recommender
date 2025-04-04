/**
 * Authentication Helper Utilities
 * 
 * This file contains helper functions to assist with authentication issues.
 */

/**
 * Checks if the current domain is authorized in Firebase Authentication
 * @returns {boolean} Whether the current domain is working with Firebase Auth
 */
export const checkDomainAuthorization = () => {
  try {
    const currentDomain = window.location.hostname;
    console.log('Current domain:', currentDomain);
    
    // List of domains that are automatically authorized in Firebase
    const autoAuthorizedDomains = [
      'localhost',
      '127.0.0.1',
    ];
    
    // Check if current domain is in the auto-authorized list
    if (autoAuthorizedDomains.includes(currentDomain)) {
      console.log('Domain is automatically authorized by Firebase');
      return true;
    }
    
    console.log('Domain may need to be added to Firebase Auth authorized domains');
    return false;
  } catch (error) {
    console.error('Error checking domain authorization:', error);
    return false;
  }
};

/**
 * Provides instructions on adding a domain to Firebase authorized domains
 * @returns {string} Detailed instructions
 */
export const getAuthDomainInstructions = () => {
  const currentDomain = window.location.hostname;
  
  return `
To fix the authentication domain error, you need to add "${currentDomain}" to your Firebase project's authorized domains:

1. Go to the Firebase Console: https://console.firebase.google.com/
2. Select your project: "edubytes-new"
3. Click on "Authentication" in the left sidebar
4. Click on the "Settings" tab at the top
5. Scroll down to "Authorized domains"
6. Click "Add domain"
7. Enter "${currentDomain}" and click "Add"

After completing these steps, return to the app and try logging in again.
`;
};

/**
 * Fallback login method that works without domain authorization
 * (For future implementation - requires backend support)
 */
export const fallbackLogin = async (email, password) => {
  // This would require a backend API that handles authentication
  // and returns tokens, bypassing the domain restriction
  console.warn('Fallback login is not implemented yet');
  return { success: false, error: 'Not implemented' };
};

export default {
  checkDomainAuthorization,
  getAuthDomainInstructions,
  fallbackLogin
}; 