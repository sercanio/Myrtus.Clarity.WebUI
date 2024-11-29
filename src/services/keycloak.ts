const KEYCLOAK_CONFIG = {
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    adminClientId: import.meta.env.VITE_KEYCLOAK_ADMIN_CLIENT_ID,
    adminClientSecret: import.meta.env.VITE_KEYCLOAK_ADMIN_CLIENT_SECRET,
    clientSecret: import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET,
    baseUrl: import.meta.env.VITE_KEYCLOAK_BASE_URL,
    redirectUri: `${import.meta.env.VITE_APP_BASE_URL}/auth/callback`,
};

export class KeycloakService {

    static async refreshToken(refreshToken: string) {
        const tokenEndpoint = `${KEYCLOAK_CONFIG.baseUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`;

        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: KEYCLOAK_CONFIG.clientId,
            client_secret: KEYCLOAK_CONFIG.clientSecret,
            refresh_token: refreshToken
        });

        try {
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
        } catch (error) {
            throw error;
        }
    }

static login() {
    const loginUrl = `${KEYCLOAK_CONFIG.baseUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/auth`;
    const params = new URLSearchParams({
        client_id: KEYCLOAK_CONFIG.clientId,
        redirect_uri: KEYCLOAK_CONFIG.redirectUri,
        response_type: 'code',
        scope: 'openid profile email offline_access',
    });

    window.location.href = `${loginUrl}?${params.toString()}`;
}

    static async logout(refreshToken: string) {
        const logoutUrl = `${KEYCLOAK_CONFIG.baseUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/logout`;

        const params = new URLSearchParams({
            client_id: KEYCLOAK_CONFIG.clientId,
            client_secret: KEYCLOAK_CONFIG.clientSecret,
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

    static async handleCallback(code: string) {
        const tokenEndpoint = `${KEYCLOAK_CONFIG.baseUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`;

        const params = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: KEYCLOAK_CONFIG.clientId,
            client_secret: KEYCLOAK_CONFIG.clientSecret,
            code: code,
            redirect_uri: KEYCLOAK_CONFIG.redirectUri,
        });

        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            throw new Error('Token exchange failed');
        }

        return response.json();
    }
} 