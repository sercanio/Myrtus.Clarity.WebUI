import { useEffect } from 'react';
import { useAppDispatch } from '../store/hooks';
import { useNavigate } from 'react-router-dom';
import { AzureADB2CService } from '../services/azureAdB2CService';
import { setAzureAuthTokens, fetchUserProfile } from '../store/slices/authSlice';
import { message } from 'antd';

export const AuthCallback = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        try {
          const tokens = await AzureADB2CService.handleCallback(code);

          dispatch(setAzureAuthTokens({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            idToken: tokens.id_token,
          }));

          // localStorage.setItem('access_token', tokens.access_token);
          localStorage.setItem('refresh_token', tokens.refresh_token);
          localStorage.setItem('id_token', tokens.id_token);

          dispatch(fetchUserProfile());

          navigate('/');
        } catch (error) {
          message.error('Authentication failed');
          navigate('/login');
        }
      } else {
        message.error('Invalid authentication response');
        navigate('/login');
      }
    };

    handleCallback();
  }, [dispatch, navigate]);

  return <div>Authenticating...</div>;
};