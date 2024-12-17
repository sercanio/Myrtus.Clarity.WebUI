import { useState, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading } from '../../../store/slices/uiSlice';
import {
    Table,
    Card,
    Button,
    Tag,
    message,
    Space,
    Form,
    Pagination,
    Grid,
    Select
} from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import debounce from 'lodash/debounce';
import {
    useGetUsersQuery,
    useGetUserDetailsQuery,
    useUpdateUserRoleMutation,
    useGetUsersDynamicQuery,
    useGetUsersByRoleQuery
} from '../../../store/services/userApi';
import { useGetRolesQuery } from '../../../store/services/roleApi';
import { useRegisterMutation } from '../../../store/services/accountApi';
import { RegisterUser } from '../../../types/registerUser';
import { UserSearchFilters } from './UserSearchFilters';
import { EditUserModal } from './EditUserModal';
import { RegisterUserModal } from './RegisterUserModal';
import type { ErrorResponse } from '../../../types/errorResponse';
import type { User } from '../../../types/user';
import type { Role } from '../../../types/role';

const UsersTable = () => {
    const dispatch = useDispatch();
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
    const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>();

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

    const {
        data: usersByRole,
        isFetching: isLoadingUsersByRole
    } = useGetUsersByRoleQuery({
        roleId: selectedRoleId!,
        pageIndex,
        pageSize,
    }, { skip: !selectedRoleId });

    const {
        data: userDetailsDynamic,
        isFetching: isLoadingDynamic
    } = useGetUsersDynamicQuery({
        pageIndex,
        pageSize,
        sort: sortField && sortDirection ? [{ field: sortField, dir: sortDirection }] : undefined,
        filter: buildFilterDescriptor(searchText, searchField)
    }, { skip: !!selectedRoleId });

    const userData = selectedRoleId ? usersByRole : userDetailsDynamic;
    const isLoading = selectedRoleId ? isLoadingUsersByRole : isLoadingDynamic;

    useEffect(() => {
        dispatch(setLoading(isLoading));
    }, [isLoading, dispatch]);

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
        } catch {
            message.error(`Failed to ${checked ? 'add' : 'remove'} role`);
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
        } catch (error: unknown) {
            const errorMessage = (error as ErrorResponse).data?.message
                || (error as ErrorResponse).data?.title
                || (error as ErrorResponse).data?.errors?.join(', ')
                || 'Failed to register user';

            message.error(errorMessage);
        }
    };

    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();

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
                style={{
                    margin: screens.xs ? '2px 0px' : '2px 16px',
                    padding: screens.xs ? '4px 0px' : '4px',
                }}
                bodyStyle={{
                    padding: screens.xs ? '4px' : '16px',
                }}
                headStyle={{
                    padding: screens.xs ? '4px 6px' : '4px',
                }}
            >
                <UserSearchFilters
                    onSearchFieldChange={setSearchField}
                    onSearchTextChange={debouncedSearch}
                    onRoleFilterChange={setSelectedRoleId}
                    selectedRoleId={selectedRoleId}
                    roles={rolesData?.items}
                />
                <Table<User>
                    columns={columns}
                    dataSource={userData?.items}
                    loading={isLoading}
                    rowKey="id"
                    pagination={false}
                    onChange={handleTableChange}
                    style={{
                        width: '100%',
                        overflowX: 'auto',
                    }}
                />
                <Pagination
                    current={pageIndex + 1}
                    pageSize={pageSize}
                    total={userData?.totalCount}
                    onChange={(page, newPageSize) => {
                        setPageIndex(page - 1);
                        setPageSize(newPageSize);
                    }}
                    responsive
                    showSizeChanger
                    showTotal={total => `${total} Users in total`}
                    style={{
                        marginTop: 16,
                        textAlign: 'right',
                        display: 'flex',
                        justifyContent: 'flex-end',
                    }}
                />
            </Card>
            <EditUserModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                selectedUser={selectedUser}
                roles={roles}
                selectedRoles={selectedRoles}
                onRoleChange={handleRoleChange}
            />
            <RegisterUserModal
                visible={registerUserModalVisible}
                onClose={() => setRegisterUserModalVisible(false)}
                onRegister={handleRegisterUser}
            />
        </>
    );
};

export default UsersTable;