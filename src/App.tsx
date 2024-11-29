import { useState, useEffect } from 'react';
import { Layout, Grid } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import AppRoutes from './routes';
import { ConfigProvider, theme } from 'antd';
import useLocalStorage from './hooks/useLocalStorage';

const { Content } = Layout;
const { useBreakpoint } = Grid;

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useLocalStorage('theme-preference', false);
  const screens = useBreakpoint();

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

  return (
    <BrowserRouter>
      <ConfigProvider theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}>
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
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;