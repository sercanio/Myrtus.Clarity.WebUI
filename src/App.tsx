import { useState, useEffect } from 'react';
import { Layout, Grid } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '@components/Sidebar';
import Header from '@components/Header';
import Footer from '@components/Footer';
import AppRoutes from './routes';
import { ConfigProvider, theme } from 'antd';
import useLocalStorage from '@hooks/useLocalStorage';
import { useMsal } from '@azure/msal-react';
import { useAppDispatch } from '@store/hooks';
import { acquireTokenSilent } from '@services/msalService';
import { loginSuccess, logoutFailure } from '@store/slices/authSlice';
import { useGetCurrentUserQuery } from '@store/services/accountApi';
import { UserInfo } from '@/types/user';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import { setUserLoading } from '@store/slices/uiSlice';
import useMessage from '@hooks/useMessage';
import { MessageContext } from '@contexts/MessageContext';

const { Content } = Layout;
const { useBreakpoint } = Grid;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('theme-preference', false);
  const screens = useBreakpoint();
  const { accounts } = useMsal();
  const dispatch = useAppDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { data: userProfile } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated
  });
  const { messageApi, contextHolder } = useMessage();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'b') {
        event.preventDefault();
        setCollapsed(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (screens.xs) {
      setCollapsed(true);
    }
  }, [screens]);

  useEffect(() => {
    const processAccount = async () => {
      dispatch(setUserLoading(true));
      try {
        if (accounts.length > 0) {
          const account = accounts[0];
          try {
            const tokenResponse = await acquireTokenSilent(account);

            if (tokenResponse?.accessToken) {
              const plainTenantProfiles: Record<string, UserInfo> = account.tenantProfiles
                ? Object.fromEntries(
                  Object.entries(account.tenantProfiles).map(([key, profile]) => [
                    key, profile as UserInfo
                  ])
                )
                : {};

              dispatch(loginSuccess({
                account: {
                  ...account,
                  tenantProfiles: plainTenantProfiles,
                  firstName: userProfile?.firstName,
                  lastName: userProfile?.lastName,
                  roles: userProfile?.roles || [],
                  notificationPreferences: userProfile?.notificationPreference,
                  avatarUrl: userProfile?.avatarUrl || 'https://ui-avatars.com/api/?name=John+Doe&background=random&rounded=true&bold=true&size=128',
                },
                accessToken: tokenResponse.accessToken,
              }));
            } else {
              console.error('Token acquired but no access token present');
              dispatch(logoutFailure());
            }
          } catch (error) {
            console.error('Token acquisition error:', error);
            dispatch(logoutFailure());
          }
        } else {
          dispatch(logoutFailure());
        }
      } finally {
        dispatch(setUserLoading(false));
      }
    };

    processAccount();
  }, [accounts, dispatch, userProfile]);


  return (
    <BrowserRouter>
      <ConfigProvider theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}>
        <MessageContext.Provider value={messageApi}>
          {contextHolder}
          <div style={{ minHeight: '100vh', background: isDarkMode ? '#141414' : '#fff' }}>
            <Layout style={{ minHeight: '100vh', maxWidth: 1920, margin: '0 auto' }}>
              <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
              <Layout>
                <Header
                  collapsed={collapsed}
                  setCollapsed={setCollapsed}
                  isDarkMode={isDarkMode}
                  setDarkMode={setIsDarkMode}
                />
                <Content
                  style={{
                    margin: screens.xs ? '12px 2px' : '24px 16px',
                    padding: screens.xs ? '12px 2px' : 24,
                    background: isDarkMode ? '#141414' : '#fff',
                    minHeight: 280
                  }}
                >
                  <AppRoutes />
                </Content>
                <Footer />
              </Layout>
            </Layout>
          </div>
        </MessageContext.Provider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
