import { KeycloakService } from '../services/keycloak';

export const LoginButton = () => {
  const handleLogin = () => {
    KeycloakService.login();
  };

  return <button onClick={handleLogin}>Login with Keycloak</button>;
}; 