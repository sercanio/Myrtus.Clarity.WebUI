import { useState } from 'react';
import { Table, Card, Space, Button, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useGetUsersQuery } from '../store/services/userApi';
import type { User } from '../types/user';

const Users = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, error } = useGetUsersQuery({ pageIndex, pageSize });

  const columns: ColumnsType<User> = [
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
      sorter: true,
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Roles',
      key: 'roles',
      dataIndex: 'roles',
      render: (roles: string[]) => (
        <Space size={[0, 8]} wrap>
          {roles.length > 0 ? (
            roles.map((role) => (
              <Tag color="blue" key={role}>
                {role}
              </Tag>
            ))
          ) : (
            <Tag color="default">No roles</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => console.log('Edit:', record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => console.log('Delete:', record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Users">
      <Table<User>
        columns={columns}
        dataSource={data?.items}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: pageIndex + 1,
          pageSize: pageSize,
          total: data?.totalCount,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: (page, newPageSize) => {
            setPageIndex(page - 1);
            if (newPageSize !== pageSize) {
              setPageSize(newPageSize);
            }
          },
        }}
      />
    </Card>
  );
};

export default Users; 