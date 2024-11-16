import { useState, useMemo } from 'react';
import { Layout, Card, List, Checkbox, Typography, Space, message, theme, Button, Modal, Input, Popconfirm, Grid, Collapse, Tag } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useGetRoleDetailsQuery,
  useUpdateRolePermissionMutation,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useUpdateRoleNameMutation
} from '../../../store/services/roleApi';

const { Sider, Content } = Layout;
const { Text } = Typography;
const { Panel } = Collapse;

const formatPermissionName = (permissionName: string): string => {
  const [feature, action] = permissionName.split(':');
  return `${action.charAt(0).toUpperCase() + action.slice(1)} ${feature}`;
};

const RolesManagement = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const { token } = theme.useToken();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const [createRole] = useCreateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();

  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<{ id: string; name: string } | null>(null);

  const [updateRoleName] = useUpdateRoleNameMutation();

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
    } catch {
      message.error('Failed to update permission');
    }
  };

  const handleCreateRole = async () => {
    try {
      await createRole({ name: newRoleName }).unwrap();
      message.success('Role created successfully');
      setIsCreateModalOpen(false);
      setNewRoleName('');
    } catch (error: any) {
      if (error.data?.errors) {
        error.data.errors.forEach((errorMessage: string) => {
          message.error(errorMessage);
        });
      } else {
        message.error('Failed to create role');
      }
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRole(roleId).unwrap();
      message.success('Role deleted successfully');
      if (selectedRoleId === roleId) {
        setSelectedRoleId(null);
      }
    } catch (error: any) {
      if (error.status === 403 && error.data?.errors) {
        error.data.errors.forEach((errorMessage: string) => {
          message.error(errorMessage);
        });
      } else {
        message.error('Failed to delete role');
      }
    }
  };

  const handleEditRole = (role: { id: string; name: string }) => {
    setEditingRole(role);
    setIsEditNameModalOpen(true);
  };

  const handleUpdateRoleName = async () => {
    if (!editingRole) return;

    try {
      await updateRoleName({
        roleId: editingRole.id,
        name: editingRole.name,
      }).unwrap();

      message.success('Role name updated successfully');
      setIsEditNameModalOpen(false);
      setEditingRole(null);
    } catch {
      message.error('Failed to update role name');
    }
  };

  return (
    <Layout style={{ background: 'inherit', flexDirection: screens.md ? 'row' : 'column' }}>
      <Sider width={screens.md ? 300 : '100%'} style={{ background: 'inherit', marginBottom: screens.md ? 0 : 16 }}>
        <Collapse defaultActiveKey={['1']} style={{ background: 'inherit' }}>
          <Panel
            header={selectedRoleId ? `Selected Role: ${rolesData?.items.find(role => role.id === selectedRoleId)?.name}` : "Roles"}
            key="1"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalOpen(true)}
              />
            }
          >
            <List
              dataSource={rolesData?.items}
              style={{ maxHeight: '500px', overflow: 'auto' }}
              renderItem={(role) => (
                <List.Item
                  onClick={() => setSelectedRoleId(role.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '10px 0px 10px 12px',
                    margin: '4px 0',
                    borderRadius: token.borderRadius,
                    background: selectedRoleId === role.id ? token.colorBgTextHover : 'transparent',
                    transition: 'all 0.3s'
                  }}
                  actions={[
                    <Space align="center" size={1}>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditRole(role);
                        }}
                      />
                      {!role.isDefault && (
                        <Popconfirm
                          title="Delete Role"
                          description="Are you sure you want to delete this role?"
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            handleDeleteRole(role.id);
                          }}
                          onCancel={(e) => e?.stopPropagation()}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={(e) => e.stopPropagation()}
                            style={{ marginRight: '0px', paddingRight: '0px' }}
                          />
                        </Popconfirm>
                      )}
                    </Space>
                  ]}
                >
                  <Space align="center" size={1}>
                    <Text strong>{role.name}</Text>
                    {role.isDefault && <Tag color="blue" style={{ marginLeft: 4, fontSize: '75%' }}>Default</Tag>}
                  </Space>
                </List.Item>
              )}
            />
          </Panel>
        </Collapse>
      </Sider>
      <Content style={{ padding: screens.md ? '0 24px' : '0', width: '100%' }}>
        {selectedRoleId ? (
          <Card title={`Permissions for ${roleDetails?.name}`}>
            <Space direction="vertical" style={{ maxHeight: '500px', overflow: 'auto', width: '100%' }}>
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

      <Modal
        title="Create New Role"
        open={isCreateModalOpen}
        onOk={handleCreateRole}
        onCancel={() => {
          setIsCreateModalOpen(false);
          setNewRoleName('');
        }}
        okButtonProps={{ disabled: !newRoleName.trim() }}
      >
        <Input
          placeholder="Enter role name"
          value={newRoleName}
          onChange={(e) => setNewRoleName(e.target.value)}
        />
      </Modal>

      <Modal
        title="Edit Role Name"
        open={isEditNameModalOpen}
        onOk={handleUpdateRoleName}
        onCancel={() => {
          setIsEditNameModalOpen(false);
          setEditingRole(null);
        }}
        okButtonProps={{ disabled: !editingRole?.name.trim() }}
      >
        <Input
          placeholder="Enter new role name"
          value={editingRole?.name || ''}
          onChange={(e) => setEditingRole(prev => prev ? { ...prev, name: e.target.value } : null)}
        />
      </Modal>
    </Layout>
  );
};

export default RolesManagement;