import { useState, useEffect } from 'react';
import { Layout, Grid, ConfigProvider, theme } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '@components/Sidebar';
import Header from '@components/Header';
import Footer from '@components/Footer';
import AppRoutes from './routes';
import useLocalStorage from '@hooks/useLocalStorage';
import useMessage from '@hooks/useMessage';
import { MessageContext } from '@contexts/MessageContext';
import axios from 'axios';

// Import our RTK Query hook and Redux dispatch and our loginSuccess action
import { useGetCurrentUserQuery } from '@store/services/accountApi';
import { useAppDispatch } from '@store/hooks';
import { loginSuccess } from '@store/slices/authSlice';

const { Content } = Layout;
const { useBreakpoint } = Grid;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('theme-preference', false);
  const screens = useBreakpoint();
  const { messageApi, contextHolder } = useMessage();
  const dispatch = useAppDispatch();

  // RTK Query automatically sends credentials so your cookie session will be maintained
  const { data: currentUser, isFetching: isUserFetching } = useGetCurrentUserQuery();

  useEffect(() => {
    if (currentUser && !isUserFetching) {
      dispatch(
        loginSuccess({
          account: currentUser,
          accessToken: '', // not used because auth is managed with cookies
        })
      );
    }
  }, [currentUser, isUserFetching, dispatch]);

  useEffect(() => {
    async function fetchAndStoreXsrfToken() {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/Security/antiforgery/token`,
          { withCredentials: true }
        );
        const { token } = response.data;
        localStorage.setItem('xsrfToken', token);
      } catch (error) {
        console.error('Failed to fetch antiforgery token:', error);
      }
    }
    fetchAndStoreXsrfToken();
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'b') {
        event.preventDefault();
        setCollapsed((prev) => !prev);
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

  return (
    <BrowserRouter>
      <ConfigProvider theme={{ algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
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
                    minHeight: 280,
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
