import { PublicClientApplication, Configuration, AccountInfo } from '@azure/msal-browser';
import { loginRequest, tokenRequest } from '@config/msalConfig';

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
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    allowRedirectInIframe: true,
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

await msalInstance.initialize();

let currentAccount: any = null;
let currentAccessToken: string | null = null;

export const getCurrentAccount = () => currentAccount;
export const getCurrentAccessToken = () => currentAccessToken;

export const login = async () => {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      currentAccount = accounts[0];
      const tokenResult = await acquireTokenSilent(currentAccount);
      currentAccessToken = tokenResult.idToken;
      return { account: currentAccount, accessToken: currentAccessToken };
    }

    await msalInstance.loginRedirect(loginRequest);
    return null;
  } catch (error) {
    console.error('MSAL login error:', error);
    throw error;
  }
};

export const handleRedirectResponse = async () => {
  try {
    const response = await msalInstance.handleRedirectPromise();
    if (response) {
      currentAccount = response.account;
      const tokenResult = await acquireTokenSilent(currentAccount);
      currentAccessToken = tokenResult.idToken;
      return { account: currentAccount, accessToken: currentAccessToken };
    }
    return null;
  } catch (error) {
    console.error('Handle redirect error:', error);
    throw error;
  }
};

export const acquireTokenSilent = async (account: AccountInfo) => {
  tokenRequest.account = account;

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