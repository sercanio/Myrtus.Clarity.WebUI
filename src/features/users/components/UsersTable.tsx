import { useState, useMemo, useEffect, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { setLoading } from '@store/slices/uiSlice';
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Pagination,
  Grid,
  Layout,
  Typography
} from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import debounce from 'lodash/debounce';
import {
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserRoleMutation,
  useGetUsersDynamicQuery,
  useGetUsersByRoleQuery
} from '@store/services/userApi';
import { useGetRolesQuery } from '@store/services/roleApi';
import { UserSearchFilters } from './UserSearchFilters';
import { EditUserModal } from './EditUserModal';
import type { UserInfo } from '@/types/user';
import type { Role } from '@/types/role';
import { MessageContext } from '@contexts/MessageContext';

const { Content } = Layout;

const UsersTable = () => {
  const dispatch = useDispatch();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [, setHasChanges] = useState(false);
  const { data: rolesData } = useGetRolesQuery({ pageIndex: 0, pageSize: 100 });
  const roles = rolesData?.items ?? [];

  useGetUserDetailsQuery(selectedUser?.id ?? '', {
    skip: !selectedUser,
  });

  const [updateUserRole] = useUpdateUserRoleMutation();
  const { refetch } = useGetUsersQuery({ pageIndex, pageSize });

  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState('IdentityUser.UserName');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>();

  const messageApi = useContext(MessageContext);

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
    isFetching: isLoadingUsersByRole,
    refetch: refetchUsersByRole
  } = useGetUsersByRoleQuery({
    roleId: selectedRoleId!,
    pageIndex,
    pageSize,
  }, { skip: !selectedRoleId });

  const {
    data: userDetailsDynamic,
    isFetching: isLoadingDynamic,
    refetch: refetchDynamicUsers
  } = useGetUsersDynamicQuery({
    pageIndex,
    pageSize,
    sort:
      sortField && sortDirection
        ? [{ field: sortField, dir: sortDirection }]
        : undefined,
    filter: buildFilterDescriptor(searchText, searchField)
  }, { skip: !!selectedRoleId });

  const userData = selectedRoleId ? usersByRole : userDetailsDynamic;
  const isLoading = selectedRoleId ? isLoadingUsersByRole : isLoadingDynamic;

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchText(value);
      }, 500),
    []
  );

  // Modified table change handler for dynamic sorting
  const handleTableChange: TableProps<UserInfo>['onChange'] = (_pagination, _filters, sorter) => {
    let field: string | null = null;
    let order: 'ascend' | 'descend' | null = null;

    if (!Array.isArray(sorter)) {
      field = sorter.field as string | null;
      order = sorter.order as 'ascend' | 'descend' | null;
    }

    // Map UI field to nested field for dynamic query sorting
    if (field === 'email') {
      field = 'IdentityUser.Email';
    } else if (field === 'userName') {
      field = 'IdentityUser.UserName';
    }

    if (field && order) {
      setSortField(field);
      setSortDirection(order === 'ascend' ? 'asc' : 'desc');
    } else {
      setSortField(null);
      setSortDirection(null);
    }
  };

  const handleEditClick = (user: UserInfo) => {
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

      messageApi?.success(`Role ${checked ? 'added' : 'removed'} successfully`);
    } catch {
      messageApi?.error(`Failed to ${checked ? 'add' : 'remove'} role`);
    }
  };

  const columns: ColumnsType<UserInfo> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      // Show sort indicator if sortField is either the UI field or the mapped nested field
      sortOrder:
        sortField === 'email' || sortField === 'IdentityUser.Email'
          ? sortDirection === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      render: (text: string) => text || '-',
    },
    {
      title: 'Username',
      dataIndex: 'userName',
      key: 'userName',
      sorter: true,
      sortOrder:
        sortField === 'userName' || sortField === 'IdentityUser.UserName'
          ? sortDirection === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      render: (text: string) => text || '-',
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

  const handleRefresh = () => {
    setPageIndex(0);
    if (selectedRoleId) {
      refetchUsersByRole();
    } else if (searchText) {
      refetchDynamicUsers();
    } else {
      refetch();
    }
  };

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  return (
    <>
      <Layout style={{ background: 'inherit', padding: 0 }}>
        <Content style={{ padding: 0, width: '100%' }}>
          <Typography.Title level={2}>Users Management</Typography.Title>
          <Card
            title="Users"
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
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
            <Table<UserInfo>
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
              showTotal={(total) => `${total} Users in total`}
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
        </Content>
      </Layout>
    </>
  );
};

export default UsersTable;