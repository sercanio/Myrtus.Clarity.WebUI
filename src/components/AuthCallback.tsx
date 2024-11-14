import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { useNavigate } from 'react-router-dom';
import { KeycloakService } from '../services/keycloak';
import { setAuthTokens, fetchUserProfile } from '../store/slices/authSlice';
import { message } from 'antd';

export const AuthCallback = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        try {
          const tokens = await KeycloakService.handleCallback(code);
          
          await dispatch(setAuthTokens({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
          }));

          await dispatch(fetchUserProfile());

          navigate('/');
        } catch (error) {
          message.error('Authentication failed');
          navigate('/login');
        }
      }
    };

    handleCallback();
  }, [dispatch, navigate]);

  return <div>Authenticating...</div>;
}; 