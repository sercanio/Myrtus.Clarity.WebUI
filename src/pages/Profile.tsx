import { Card, theme } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

function Profile() {
  const { userProfile } = useSelector((state: RootState) => state.auth);
  const { token } = theme.useToken(); // Add this line

  if (!userProfile) {
    return <div>Loading profile...</div>;
  }

  const gridStyle = {
    width: '50%',
    transition: 'background-color 0.3s',
    backgroundColor: token.colorBgContainer,
  };

  return (
    <Card title="User Profile">
      <Card.Grid style={gridStyle} hoverable={false}>
        <strong>First Name</strong>
      </Card.Grid>
      <Card.Grid style={gridStyle} hoverable={false}>
        {userProfile.firstName}
      </Card.Grid>
      <Card.Grid style={gridStyle} hoverable={false}>
        <strong>Last Name</strong>
      </Card.Grid>
      <Card.Grid style={gridStyle} hoverable={false}>
        {userProfile.lastName}
      </Card.Grid>
      <Card.Grid style={gridStyle} hoverable={false}>
        <strong>Email</strong>
      </Card.Grid>
      <Card.Grid style={gridStyle} hoverable={false}>
        {userProfile.email}
      </Card.Grid>
    </Card>
  );
}

export default Profile;