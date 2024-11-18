import RolesManagement from '../features/roles/components/RolesManagement';
import { Grid } from 'antd';

const { useBreakpoint } = Grid;

const Roles = () => {
  const screens = useBreakpoint();

  return (
    <div style={{ padding: screens.xs ? '8px' : '16px' }}>
      <RolesManagement />
    </div>
  );
};

export default Roles;