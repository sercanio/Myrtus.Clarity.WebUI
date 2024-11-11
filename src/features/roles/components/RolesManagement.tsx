import { useState, useMemo } from 'react';
import { Layout, Card, List, Checkbox, Typography, Space, Spin, message, theme } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useGetRoleDetailsQuery,
  useUpdateRolePermissionMutation
} from '../../../store/services/roleApi';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const formatPermissionName = (permissionName: string): string => {
  const [feature, action] = permissionName.split(':');
  // Capitalize first letter of action and add the feature name
  return `${action.charAt(0).toUpperCase() + action.slice(1)} ${feature}`;
};

const RolesManagement = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const { token } = theme.useToken();
  
  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery({ 
    pageIndex: 0, 
    pageSize: 10 
  });
  
  const { data: permissionsData } = useGetPermissionsQuery({ 
    pageIndex: 0, 
    pageSize: 100 
  });
  
  const { data: roleDetails } = useGetRoleDetailsQuery(selectedRoleId!, { 
    skip: !selectedRoleId 
  });
  
  const [updatePermission] = useUpdateRolePermissionMutation();

  // Group permissions by feature
  const groupedPermissions = useMemo(() => {
    if (!permissionsData?.items) return {};
    
    return permissionsData.items.reduce((acc, permission) => {
      if (!acc[permission.feature]) {
        acc[permission.feature] = [];
      }
      acc[permission.feature].push(permission);
      return acc;
    }, {} as Record<string, typeof permissionsData.items>);
  }, [permissionsData]);

  const handlePermissionChange = async (permissionId: string, checked: boolean) => {
    if (!selectedRoleId) return;

    try {
      await updatePermission({
        roleId: selectedRoleId,
        permissionId,
        operation: checked ? 'Add' : 'Remove'
      }).unwrap();
      
      message.success(`Permission ${checked ? 'added to' : 'removed from'} role`);
    } catch (error) {
      message.error('Failed to update permission');
    }
  };

  return (
    <Layout style={{ background: 'inherit' }}>
      <Sider width={300} style={{ background: 'inherit' }}>
        <Card title="Roles" loading={isLoadingRoles}>
          <List
            dataSource={rolesData?.items}
            renderItem={(role) => (
              <List.Item
                onClick={() => setSelectedRoleId(role.id)}
                style={{ 
                  cursor: 'pointer',
                  padding: '12px 24px',
                  margin: '4px 0',
                  borderRadius: token.borderRadius,
                  background: selectedRoleId === role.id ? token.colorBgTextHover : 'transparent',
                  transition: 'all 0.3s'
                }}
              >
                <Text strong>{role.name}</Text>
              </List.Item>
            )}
          />
        </Card>
      </Sider>
      
      <Content style={{ padding: '0 24px' }}>
        {selectedRoleId ? (
          <Card title={`Permissions for ${roleDetails?.name}`}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {Object.entries(groupedPermissions).map(([feature, permissions]) => (
                <Card 
                  key={feature} 
                  size="small" 
                  title={<Text strong style={{ textTransform: 'capitalize' }}>{feature}</Text>}
                >
                  <Space direction="vertical">
                    {permissions.map((permission) => (
                      <Checkbox
                        key={permission.id}
                        checked={roleDetails?.permissions?.some(p => p.id === permission.id)}
                        onChange={(e: CheckboxChangeEvent) => 
                          handlePermissionChange(permission.id, e.target.checked)
                        }
                      >
                        {formatPermissionName(permission.name)}
                      </Checkbox>
                    ))}
                  </Space>
                </Card>
              ))}
            </Space>
          </Card>
        ) : (
          <Card>
            <Text>Select a role to manage permissions</Text>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default RolesManagement; 