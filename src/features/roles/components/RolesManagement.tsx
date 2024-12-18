import { useState, useMemo, useEffect } from 'react';
import { Layout, Card, List, Checkbox, Typography, Space, message, theme, Button, Modal, Input, Popconfirm, Grid, Collapse, Tag, Spin } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../../store/slices/uiSlice';
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useGetRoleDetailsQuery,
  useUpdateRolePermissionMutation,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useUpdateRoleNameMutation
} from '../../../store/services/roleApi';
import { Role } from '@types/role';
import { Permission } from '../../../types/permission';

const { Sider, Content } = Layout;
const { Text } = Typography;
const { Panel } = Collapse;

const formatPermissionName = (permissionName: string): string => {
  const [feature, action] = permissionName.split(':');
  return `${action.charAt(0).toUpperCase() + action.slice(1)} ${feature}`;
};

const RolesManagement = () => {
  const dispatch = useDispatch();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const { token } = theme.useToken();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const [messageApi, contextHolder] = message.useMessage();

  const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery({
    pageIndex: 0,
    pageSize: 10
  });

  const { data: permissionsData, isLoading: isLoadingPermissions } = useGetPermissionsQuery({
    pageIndex: 0,
    pageSize: 100
  });

  const { data: roleDetails, isLoading: isLoadingRoleDetails } = useGetRoleDetailsQuery(selectedRoleId!, {
    skip: !selectedRoleId
  });

  useEffect(() => {
    dispatch(setLoading(isLoadingRoles || isLoadingPermissions || isLoadingRoleDetails));
  }, [isLoadingRoles, isLoadingPermissions, isLoadingRoleDetails, dispatch]);

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

    return permissionsData.items.reduce((acc: { [x: string]: Permission[]; }, permission: Permission) => {
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

      messageApi.success(`Permission ${checked ? 'added to' : 'removed from'} role`);
    } catch (error: any) {
      messageApi.error(error.data?.errors || 'Failed to update permission');
    }
  };

  const handleCreateRole = async () => {
    try {
      await createRole({ name: newRoleName }).unwrap();
      messageApi.success('Role created successfully');
      setIsCreateModalOpen(false);
      setNewRoleName('');
    } catch (error: any) {
      if (error.data?.errors) {
        error.data.errors.forEach((errorMessage: string) => {
          messageApi.error(errorMessage);
        });
      } else {
        messageApi.error('Failed to create role');
      }
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRole(roleId).unwrap();
      messageApi.success('Role deleted successfully');
      if (selectedRoleId === roleId) {
        setSelectedRoleId(null);
      }
    } catch (error: any) {
      if (error.status === 403 && error.data?.errors) {
        error.data.errors.forEach((errorMessage: string) => {
          messageApi.error(errorMessage);
        });
      } else {
        messageApi.error('Failed to delete role');
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

      messageApi.success('Role name updated successfully');
      setIsEditNameModalOpen(false);
      setEditingRole(null);
    } catch (error: any) {
      messageApi.error(error.data?.errors || 'Failed to update role name');
    }
  };

  return (
    <>
    {contextHolder}
      <Typography.Title level={2}>Roles Management</Typography.Title>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreateModalOpen(true);
                  }}
                />
              }
            >
              <Spin spinning={isLoadingRoles}>
                <List
                  dataSource={rolesData?.items}
                  style={{ maxHeight: '500px', overflow: 'auto' }}
                  renderItem={(role: Role) => (
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
              </Spin>
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
                      {(permissions as Permission[]).map((permission: Permission) => (
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
    </>
  );
};

export default RolesManagement;