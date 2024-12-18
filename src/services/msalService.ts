import { PublicClientApplication, Configuration, PopupRequest } from '@azure/msal-browser';

const DEFAULT_SCOPES = 'openid profile offline_access';

// Define API scope separately for clarity
const API_SCOPE = 'https://myrtustech.onmicrosoft.com/21490973-48a2-4037-93e2-834b5981be94/api_basic';

const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_B2C_CLIENT_ID,
    authority: import.meta.env.VITE_AZURE_AD_B2C_AUTHORITY,
    redirectUri: import.meta.env.VITE_AZURE_AD_B2C_REDIRECT_URI,
    knownAuthorities: [import.meta.env.VITE_AZURE_AD_B2C_DOMAIN],
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'sessionStorage', // Recommended for security
    storeAuthStateInCookie: false,
  },
  system: {
    allowRedirectInIframe: true, // Required for redirect flows in modern browsers
    loggerOptions: {
      loggerCallback: (level, message) => {
        // Implement your logging mechanism
        // console.log(message);
      },
      piiLoggingEnabled: false,
    },
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL instance
await msalInstance.initialize();

// const getScopes = () => {
//   try {
//     const scopes = import.meta.env.VITE_AZURE_AD_B2C_SCOPES || DEFAULT_SCOPES;
//     return scopes.split(' ').filter(Boolean);
//   } catch (error) {
//     console.error('Error parsing scopes:', error);
//     return ['openid', 'profile', 'offline_access'];
//   }
// };

const loginRequest: PopupRequest = {
  scopes: [API_SCOPE], // Request only the API scope during login
  prompt: 'select_account',
};

export const login = async () => {
  try {
    const loginResponse = await msalInstance.loginPopup(loginRequest);
    
    if (loginResponse?.account) {
      // After successful login, explicitly request token with all required scopes
      const tokenRequest = {
        scopes: ['openid', 'profile', 'offline_access', API_SCOPE],
        account: loginResponse.account,
      };

      const tokenResponse = await msalInstance.acquireTokenSilent(tokenRequest);
      
      return {
        account: loginResponse.account,
        accessToken: tokenResponse.idToken,
      };
    }
    return null;
  } catch (error) {
    console.error('MSAL login error:', error);
    throw error;
  }
};

export const acquireTokenSilent = async (account: any) => {
  const tokenRequest = {
    scopes: ['openid', 'profile', 'offline_access', API_SCOPE],
    account: account,
  };

  try {
    return await msalInstance.acquireTokenSilent(tokenRequest);
  } catch (error) {
    console.error('Silent token acquisition failed, attempting popup:', error);
    return await msalInstance.acquireTokenPopup(tokenRequest);
  }
};

export const logoutUser = async () => {
  try {
    await msalInstance.logoutRedirect();
  } catch (error: any) {
    console.error('Logout error:', error);
    throw error;
  }
};