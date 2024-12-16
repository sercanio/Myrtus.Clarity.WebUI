import React from 'react';
import UsersTable from '../features/users/components/UsersTable';
import { Grid } from 'antd';

const Users : React.FC = () => {
  const screens = Grid.useBreakpoint();

  return (
    // <div style={{ padding: screens.xs ? '8px' : '16px' }}>
      <UsersTable />
    // </div>
  );
};

export default Users;