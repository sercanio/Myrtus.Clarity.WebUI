import { BrowserAuthOptions, BrowserCacheLocation, BrowserSystemOptions, BrowserTelemetryOptions, Configuration, RedirectRequest, SilentRequest } from '@azure/msal-browser';
import { CacheOptions } from 'node_modules/@azure/msal-browser/lib/types';

export const msalConfig : Configuration = {
    auth: {
      clientId: import.meta.env.VITE_AZURE_AD_B2C_CLIENT_ID,
      authority: import.meta.env.VITE_AZURE_AD_B2C_AUTHORITY,
      redirectUri: import.meta.env.VITE_AZURE_AD_B2C_REDIRECT_URI,
      postLogoutRedirectUri: import.meta.env.VITE_AZURE_AD_B2C_POST_LOGOUT_REDIRECT_URI,
    } as BrowserAuthOptions,
    cache: {
      cacheLocation: 'sessionStorage' as BrowserCacheLocation,
      temporaryCacheLocation: 'memoryStorage' as BrowserCacheLocation,
      storeAuthStateInCookie: true as boolean,
      secureCookies: true as boolean,
      cacheMigrationEnabled: true as boolean,

    } as CacheOptions,
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) {
            return;
          }
          switch (level) {
            case 0:
              console.error(message);
              return;
            case 1:
              console.warn(message);
              return;
            case 2:
              console.info(message);
              return;
            case 3:
              console.log(message);
              return;
            default:
              return;
          }
        },
      },
    } as BrowserSystemOptions,
    telemetry: {
      applicationName: import.meta.env.VITE_AZURE_AD_B2C_APP_NAME,
      applicationVersion: import.meta.env.VITE_AZURE_AD_B2C_APP_VERSION,
    } as BrowserTelemetryOptions,
  };
  
  export const loginRequest : RedirectRequest = {
    scopes: [import.meta.env.VITE_AZURE_AD_B2C_SCOPES],
    prompt: import.meta.env.VITE_AZURE_AD_B2C_PROMPT,
    redirectStartPage: window.location.origin,
    redirectUri: import.meta.env.VITE_AZURE_AD_B2C_REDIRECT_URI,
    authority: import.meta.env.VITE_AZURE_AD_B2C_AUTHORITY, 
  };

export const tokenRequest: SilentRequest = {
  scopes: [import.meta.env.VITE_AZURE_AD_B2C_SCOPES],
  account: undefined,
};