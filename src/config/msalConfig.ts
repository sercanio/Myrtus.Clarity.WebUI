export const msalConfig = {
    auth: {
      clientId: import.meta.env.VITE_AZURE_AD_B2C_CLIENT_ID,
      authority: import.meta.env.VITE_AZURE_AD_B2C_AUTHORITY,
      redirectUri: import.meta.env.VITE_AZURE_AD_B2C_REDIRECT_URI,
      postLogoutRedirectUri: import.meta.env.VITE_AZURE_AD_B2C_POST_LOGOUT_REDIRECT_URI,
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: false,
    },
  };
  
  export const loginRequest = {
    scopes: [import.meta.env.VITE_AZURE_AD_B2C_SCOPES],
  };