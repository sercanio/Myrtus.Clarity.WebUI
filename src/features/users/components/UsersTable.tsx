import { useState, useMemo } from 'react';
import { Table, Card, Button, Tag, Modal, Checkbox, message, Space, Form, Input, Select, Pagination } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import { useGetUsersQuery, useGetUserDetailsQuery, useUpdateUserRoleMutation, useGetUsersDynamicQuery } from '../../../store/services/userApi';
import { useGetRolesQuery } from '../../../store/services/roleApi';
import type { Role, User } from '../../../types/user';
import { useRegisterMutation } from '../../../store/services/accountApi';
import { RegisterUser } from '../../../types/registerUser';

const { Option } = Select;

const UsersTable = () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [registerUserModalVisible, setRegisterUserModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
    const [, setHasChanges] = useState(false);
    const [registerUser] = useRegisterMutation();
    const { data: rolesData } = useGetRolesQuery({ pageIndex: 0, pageSize: 100 });
    const roles = rolesData?.items ?? [];

    useGetUserDetailsQuery(selectedUser?.id ?? '', {
        skip: !selectedUser,
    });

    const [updateUserRole] = useUpdateUserRoleMutation();
    const { refetch } = useGetUsersQuery({ pageIndex, pageSize });

    const [form] = Form.useForm();

    const [searchText, setSearchText] = useState('');
    const [searchField, setSearchField] = useState('firstName');
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<string | null>(null);

    interface FilterDescriptor {
        field: string;
        operator: string;
        value: string;
        isCaseSensitive: boolean;
    }

    const buildFilterDescriptor = (text: string, field: string): FilterDescriptor | undefined => {
        if (!text) return undefined;
        return {
            field,
            operator: 'contains',
            value: text,
            isCaseSensitive: false
        };
    };

    const { data: userDetailsDynamic, isFetching: isLoadingDynamic } = useGetUsersDynamicQuery({
        pageIndex,
        pageSize,
        sort: sortField && sortDirection ? [{ field: sortField, dir: sortDirection }] : undefined,
        filter: buildFilterDescriptor(searchText, searchField)
    });

    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            setSearchText(value);
        }, 500),
        []
    );

    const handleTableChange: TableProps<User>['onChange'] = (_pagination, _filters, sorter) => {
        if ('field' in sorter && 'order' in sorter) {
            setSortField(sorter.field as string);
            setSortDirection(sorter.order === 'ascend' ? 'asc' : 'desc');
        } else {
            setSortField(null);
            setSortDirection(null);
        }
    };

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
                roles: updatedRoles.filter((role): role is Role => role !== undefined)
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
            sorter: true,
            render: (_, record) => `${record.firstName} ${record.lastName}`,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            sorter: true,
        },
        {
            title: 'Roles',
            key: 'roles',
            render: (_, record) => (
                <Space direction="vertical">
                    {record.roles.map((role) => (
                        <Tag key={role.id} color="blue">
                            {role.name}
                        </Tag>
                    ))}
                </Space>
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

    const handleRegisterUser = async (values: RegisterUser) => {
        try {
            await registerUser(values).unwrap();
            message.success('User registered successfully');
            setRegisterUserModalVisible(false);
            form.resetFields();
            refetch();
        } catch (error: any) {
            const errorMessage = error.data?.message
                || error.data?.title
                || error.data?.errors?.join(', ')
                || 'Failed to register user';

            message.error(errorMessage);
            console.error('Registration error:', error);
        }
    };

    return (
        <>
            <Card
                title="Users"
                extra={
                    <Button
                        type="primary"
                        onClick={() => setRegisterUserModalVisible(true)}
                    >
                        New User
                    </Button>
                }
            >
                <Space size="large"  style={{display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Input.Group compact style={{marginBottom: 18 }}>
                        <Select
                            defaultValue="firstName"
                            style={{ width: 120 }}
                            onChange={value => setSearchField(value)}
                        >
                            <Option value="firstName">First Name</Option>
                            <Option value="lastName">Last Name</Option>
                            <Option value="email">Email</Option>
                        </Select>
                        <Input
                            placeholder="Search users..."
                            prefix={<SearchOutlined />}
                            onChange={e => debouncedSearch(e.target.value)}
                            style={{ width: 200 }}
                        />
                    </Input.Group>
                </Space>
                <Table<User>
                    columns={columns}
                    dataSource={userDetailsDynamic?.items}
                    loading={isLoadingDynamic}
                    rowKey="id"
                    pagination={false}
                    onChange={handleTableChange}
                    style={{ height: '100%', maxHeight: '450px', overflow: 'auto' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                    <Pagination
                        current={pageIndex + 1}
                        pageSize={pageSize}
                        total={userDetailsDynamic?.totalCount}
                        onChange={(page, newPageSize) => {
                            setPageIndex(page - 1);
                            setPageSize(newPageSize);
                        }}
                        showSizeChanger
                        showTotal={(total) => `Total ${total} items`}
                        pageSizeOptions={['5', '10', '20', '50', '100']}
                    />
                </div>
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
            <Modal
                title="Register User"
                open={registerUserModalVisible}
                onCancel={() => {
                    setRegisterUserModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleRegisterUser}
                    layout="vertical"
                >
                    <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email is required', type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Password is required', min: 8 }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Confirm Password is required', min: 8 },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Passwords do not match'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item label="First Name" name="firstName">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Last Name" name="lastName">
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Register
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default UsersTable;