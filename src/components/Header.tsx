import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Avatar, Dropdown, Switch, Space, Tag, Button, Typography, Flex } from 'antd';
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
import { AzureADB2CService } from '../services/azureAdB2CService';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';
const { Header: AntHeader } = Layout;

interface HeaderProps {
  isDarkMode: boolean;
  setDarkMode: (value: boolean) => void;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

const Header = ({ isDarkMode, setDarkMode, collapsed, setCollapsed }: HeaderProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, userProfile } = useSelector((state: RootState) => state.auth);
  const [isXLScreen, setIsXLScreen] = useState(window.innerWidth >= 1200);

  useEffect(() => {
    const handleResize = () => {
      setIsXLScreen(window.innerWidth >= 1200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = () => {
    AzureADB2CService.login();
  };

  const handleLogout = async () => {
    await AzureADB2CService.logout(localStorage.getItem('refresh_token') || '');
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
            <Dropdown
              menu={{ items: userMenuItems }}
              trigger={['hover']}
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