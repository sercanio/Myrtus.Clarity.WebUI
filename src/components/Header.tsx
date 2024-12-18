import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Avatar, Dropdown, Switch, Space, Tag, Button, Typography, Badge, Menu, Flex } from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  LoginOutlined,
  BulbOutlined,
  BulbFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useMsal, useAccount } from '@azure/msal-react';
import { login, logoutUser, msalInstance } from '@services/msalService';
import { loginSuccess, logout } from '@store/slices/authSlice';
import type { RootState } from '@store/index';
import { useAppDispatch } from '@store/hooks';
import NotificationBell from '@components/NotificationBell';
import { useGetCurrentUserQuery } from '@store/services/accountApi' // Removed comma

const { Header: AntHeader } = Layout;

interface HeaderProps {
  isDarkMode: boolean;
  setDarkMode: (value: boolean) => void;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const Header = ({ isDarkMode, setDarkMode, collapsed, setCollapsed }: HeaderProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated} = useSelector((state: RootState) => state.auth);
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});
  const [isXLScreen, setIsXLScreen] = useState(window.innerWidth >= 1200);
  const { data: userProfile } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });
  

  useEffect(() => {
    const handleResize = () => {
      setIsXLScreen(window.innerWidth >= 1200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const acquireAndStoreToken = async () => {
      if (isAuthenticated && account) {
        try {
          await msalInstance.initialize()
          const response = await instance.acquireTokenSilent({
            scopes: import.meta.env.VITE_AZURE_AD_B2C_SCOPES.split(' '),
            account: account,
          });
          const plainTenantProfiles = account.tenantProfiles
            ? Object.fromEntries(account.tenantProfiles)
            : {};

          dispatch(loginSuccess({ 
            account: { 
              ...account, 
              tenantProfiles: plainTenantProfiles 
            }, 
            accessToken: response.accessToken 
          }));
        } catch (error: any) {
          console.error('Token acquisition error in Header.tsx:', error);
          // Optionally handle token acquisition failure
        }
      }
    };
    acquireAndStoreToken();
  }, [isAuthenticated, account, instance, dispatch]);

  const handleLogin = async () => {
    try {
      const result = await login();
      if (result?.account && result?.accessToken) {
        const plainTenantProfiles = result.account.tenantProfiles
          ? Object.fromEntries(result.account.tenantProfiles)
          : {};

        dispatch(loginSuccess({
          account: {
            ...result.account,
            tenantProfiles: plainTenantProfiles,
          },
          accessToken: result.accessToken,
        }));
        navigate('/');
      } else {
        console.error('Login successful but no access token received');
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Optionally show error message to user
    }
  };

  const handleLogout = () => {
    logoutUser();
    dispatch(logout());
    navigate('/');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Typography.Text strong>
            {userProfile?.firstName} {userProfile?.lastName}
          </Typography.Text>
          <br />
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>{userProfile?.email}</Typography.Text>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  return (
    <AntHeader style={{
      padding: '0 24px',
      background: isDarkMode ? '#141414' : '#fff',
    }}>
      <Flex
        gap="middle"
        align="center"
        justify="space-between">
        <Space>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            onClick: () => setCollapsed(!collapsed),
            style: {
              position: 'relative',
              top: '1.5px',
              fontSize: '16px',
              cursor: 'pointer'
            }
          })}
          {isXLScreen && (
            <Tag color="cyan">
              {modifierKey} + B
            </Tag>
          )}
        </Space>
        <Flex gap="middle" align='center'>
          <Switch
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbFilled />}
            checked={isDarkMode}
            onChange={setDarkMode}
          />
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <Dropdown
                menu={{ items: userMenuItems }}
                trigger={['hover', 'click']}
                placement="bottomLeft"
              >
                <Avatar
                  size="large"
                  src={userProfile?.avatarUrl}
                  icon={!userProfile?.avatarUrl && <UserOutlined />}
                  style={{
                    backgroundColor: '#1890ff',
                    cursor: 'pointer'
                  }}
                />
              </Dropdown>
            </>
          ) : (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={handleLogin}>
              Login
            </Button>
          )}
        </Flex>
      </Flex>
    </AntHeader>
  );
};

export default Header;