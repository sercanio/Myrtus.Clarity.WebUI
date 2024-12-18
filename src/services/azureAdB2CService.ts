import { base64UrlEncode, sha256 } from '@utils/pkce';

const AZURE_AD_B2C_CONFIG = {
    tenant: import.meta.env.VITE_AZURE_AD_B2C_TENANT,
    domain: import.meta.env.VITE_AZURE_AD_B2C_DOMAIN,
    clientId: import.meta.env.VITE_AZURE_AD_B2C_CLIENT_ID,
    clientSecret: import.meta.env.VITE_AZURE_AD_B2C_CLIENT_SECRET,
    policySignUpSignIn: import.meta.env.VITE_AZURE_AD_B2C_POLICY_SIGNUP_SIGNIN,
    policyPasswordReset: import.meta.env.VITE_AZURE_AD_B2C_POLICY_PASSWORD_RESET,
    redirectUri: import.meta.env.VITE_AZURE_AD_B2C_REDIRECT_URI,
};

export class AzureADB2CService {

    private static generateCodeVerifier(): string {
        const array = new Uint8Array(64);
        window.crypto.getRandomValues(array);
        return Array.from(array, (num) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"[num % 64]).join('');
    }

    private static async generateCodeChallenge(codeVerifier: string): Promise<string> {
        const digest = await sha256(codeVerifier);
        return base64UrlEncode(digest);
    }

    static async login() {
        const codeVerifier = this.generateCodeVerifier();
        sessionStorage.setItem('code_verifier', codeVerifier);
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);
    
        const loginUrl = `https://${AZURE_AD_B2C_CONFIG.tenant}.b2clogin.com/${AZURE_AD_B2C_CONFIG.domain}/oauth2/v2.0/authorize`;
        const params = new URLSearchParams({
            p: AZURE_AD_B2C_CONFIG.policySignUpSignIn,
            client_id: AZURE_AD_B2C_CONFIG.clientId,
            redirect_uri: AZURE_AD_B2C_CONFIG.redirectUri,
            response_type: 'code',
            scope: 'openid profile offline_access https://myrtustech.onmicrosoft.com/21490973-48a2-4037-93e2-834b5981be94/api_basic',
            nonce: 'defaultNonce',
            prompt: 'login',
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });
    
        window.location.href = `${loginUrl}?${params.toString()}`;
    }
    
    static async handleCallback(code: string) {
        const codeVerifier = sessionStorage.getItem('code_verifier');
        if (!codeVerifier) {
            throw new Error('Code verifier is missing');
        }
    
        const tokenEndpoint = `https://${AZURE_AD_B2C_CONFIG.tenant}.b2clogin.com/${AZURE_AD_B2C_CONFIG.tenant}.onmicrosoft.com/${AZURE_AD_B2C_CONFIG.policySignUpSignIn}/oauth2/v2.0/token`;
    
        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: AZURE_AD_B2C_CONFIG.clientId,
            code: code,
            redirect_uri: AZURE_AD_B2C_CONFIG.redirectUri,
            code_verifier: codeVerifier,
        });
    
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });
    
        if (!response.ok) {
            const errorResponse = await response.json();
            console.error('Token exchange error:', errorResponse);
            throw new Error(`Token exchange failed: ${errorResponse.error_description || 'Unknown error'}`);
        }
    
        return response.json();
    }

    static async refreshToken(refreshToken: string) {
        const tokenEndpoint = `https://${AZURE_AD_B2C_CONFIG.tenant}.b2clogin.com/${AZURE_AD_B2C_CONFIG.tenant}.onmicrosoft.com/${AZURE_AD_B2C_CONFIG.policySignUpSignIn}/oauth2/v2.0/token`;

        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: AZURE_AD_B2C_CONFIG.clientId,
            refresh_token: refreshToken
        });

        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(`Token refresh failed: ${responseText}`);
        }

        return JSON.parse(responseText);
    }

    static async logout(refreshToken: string) {
        const logoutUrl = `https://${AZURE_AD_B2C_CONFIG.tenant}.b2clogin.com/${AZURE_AD_B2C_CONFIG.tenant}.onmicrosoft.com/${AZURE_AD_B2C_CONFIG.policySignUpSignIn}/oauth2/v2.0/logout`;
    
        const params = new URLSearchParams({
            client_id: AZURE_AD_B2C_CONFIG.clientId,
            refresh_token: refreshToken,
        });
    
        try {
            const response = await fetch(logoutUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });
    
            if (!response.ok) {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }
}