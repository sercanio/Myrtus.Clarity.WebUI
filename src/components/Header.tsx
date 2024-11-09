import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Layout, Avatar, Dropdown, Switch, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  LoginOutlined,
  BulbOutlined,
  BulbFilled
} from '@ant-design/icons';
import { KeycloakService } from '../services/keycloak';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';
import { useEffect } from 'react';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

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

  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, userProfile });
  }, [isAuthenticated, userProfile]);

  const handleLogin = () => {
    KeycloakService.login();
  };

  const handleLogout = async () => {
    await KeycloakService.logout(localStorage.getItem('refresh_token') || '');
    dispatch(logout());
    navigate('/');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Text strong>{userProfile?.firstName} {userProfile?.lastName}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>{userProfile?.email}</Text>
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

  return (
    <AntHeader style={{ 
      padding: '0 24px', 
      background: isDarkMode ? '#141414' : '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '16px'
    }}>
      <Switch
        checkedChildren={<BulbOutlined />}
        unCheckedChildren={<BulbFilled />}
        checked={isDarkMode}
        onChange={setDarkMode}
      />

      {isAuthenticated ? (
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar 
              style={{ backgroundColor: '#1890ff' }}
              size="large"
              src={userProfile?.avatarUrl}
              icon={!userProfile?.avatarUrl && <UserOutlined />}
            />
          </Space>
        </Dropdown>
      ) : (
        <Space style={{ cursor: 'pointer' }} onClick={handleLogin}>
          <LoginOutlined />
          <Text>Login</Text>
        </Space>
      )}
    </AntHeader>
  );
};

export default Header;