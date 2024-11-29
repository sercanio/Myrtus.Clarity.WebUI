import UsersTable from '../features/users/components/UsersTable';
import { Grid } from 'antd';

const { useBreakpoint } = Grid;

const Users = () => {
  const screens = useBreakpoint();

  return (
    <div style={{ padding: screens.xs ? '8px' : '16px' }}>
      <UsersTable />
    </div>
  );
};

export default Users;