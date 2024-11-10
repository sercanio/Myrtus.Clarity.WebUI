import { useState } from 'react';
import { Table, Card, Button, Tag, Modal, Checkbox, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useGetUsersQuery, useGetUserDetailsQuery, useUpdateUserRoleMutation } from '../../../store/services/userApi';
import { useGetRolesQuery } from '../../../store/services/roleApi';
import type { User } from '../../../types/user';

const UsersTable = () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const [hasChanges, setHasChanges] = useState(false);

    const { data: rolesData } = useGetRolesQuery({ pageIndex: 0, pageSize: 100 });
    const roles = rolesData?.items ?? [];

    const { data: userDetails } = useGetUserDetailsQuery(selectedUser?.id ?? '', {
        skip: !selectedUser,
    });

    const [updateUserRole] = useUpdateUserRoleMutation();
    const { data, isLoading } = useGetUsersQuery({ pageIndex, pageSize });

    const handleEditClick = (user: User) => {
        setSelectedUser(user);
        setSelectedRoles(new Set(user.roles.map(role => role.id)));
        setHasChanges(false);
        setEditModalVisible(true);
    };

    const handleRoleChange = async (roleId: string, checked: boolean) => {
        if (!selectedUser) return;

        try {
            await updateUserRole({
                userId: selectedUser.id,
                roleId,
                operation: checked ? 'Add' : 'Remove',
            }).unwrap();

            const newSelectedRoles = new Set(selectedRoles);
            if (checked) {
                newSelectedRoles.add(roleId);
            } else {
                newSelectedRoles.delete(roleId);
            }
            setSelectedRoles(newSelectedRoles);

            const updatedRoles = checked
                ? [...selectedUser.roles, roles.find(r => r.id === roleId)]
                : selectedUser.roles.filter(r => r.id !== roleId);

            setSelectedUser({
                ...selectedUser,
                roles: updatedRoles.filter(Boolean)
            });

            message.success(`Role ${checked ? 'added' : 'removed'} successfully`);
        } catch (error) {
            message.error(`Failed to ${checked ? 'add' : 'remove'} role`);
            console.error('Failed to update role:', error);
        }
    };

    const columns: ColumnsType<User> = [
        {
            title: 'Name',
            key: 'name',
            render: (_, record) => `${record.firstName} ${record.lastName}`,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Roles',
            key: 'roles',
            render: (_, record) => (
                <>
                    {record.roles.map((role) => (
                        <Tag key={role.id} color="blue">
                            {role.name}
                        </Tag>
                    ))}
                </>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button type="link" onClick={() => handleEditClick(record)}>
                    Edit
                </Button>
            ),
        },
    ];

    return (
        <>
            <Card title="Users" extra={<Button type="primary" onClick={()=>{}}>New User</Button>} >
                <Table<User>
                    columns={columns}
                    dataSource={data?.items}
                    loading={isLoading}
                    rowKey="id"
                    pagination={{
                        current: pageIndex + 1,
                        pageSize,
                        total: data?.totalCount,
                        onChange: (page, newPageSize) => {
                            setPageIndex(page - 1);
                            setPageSize(newPageSize);
                        },
                    }}
                />
            </Card>
            <Modal
                title="Edit User Roles"
                open={editModalVisible}
                onCancel={() => setEditModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setEditModalVisible(false)}>
                        Close
                    </Button>,
                ]}
            >
                {selectedUser && (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <div >
                                <strong>Name: </strong>
                                &nbsp;{selectedUser.firstName} {selectedUser.lastName}
                            </div>
                            <div>
                                <strong>Email: </strong>
                                &nbsp;{selectedUser.email}
                            </div>
                        </div>
                        <div>
                            <strong>Roles:</strong>
                            {roles.map((role) => (
                                <div key={role.id} style={{ marginTop: 8 }}>
                                    <Checkbox
                                        checked={selectedRoles.has(role.id)}
                                        onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                                    >
                                        {role.name}
                                    </Checkbox>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Modal>
        </>
    );
};

export default UsersTable;