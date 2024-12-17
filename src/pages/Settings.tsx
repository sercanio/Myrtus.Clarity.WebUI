import {Grid, Typography } from "antd";

const Settings: React.FC = () => {
  const screens = Grid.useBreakpoint();
  
  return (
    <div>
      <Typography.Title level={2}>
        Settings
      </Typography.Title>
      {/* Add your settings content here */}
    </div>
  );
}

export default Settings;