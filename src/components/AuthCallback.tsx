import { useMsal } from '@azure/msal-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, loginFailure } from '@store/slices/authSlice';
import { useAppDispatch } from '@store/hooks';

export const AuthCallback = () => {
  const { instance, inProgress } = useMsal();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (inProgress === 'none') {
      instance.handleRedirectPromise()
        .then((response) => {
          if (response) {
            dispatch(loginSuccess(response.account));
            navigate('/');
          }
        })
        .catch((error) => {
          dispatch(loginFailure(error.message));
          navigate('/login');
        });
    }
  }, [inProgress, instance, dispatch, navigate]);

  return <div>Authenticating...</div>;
};