import { Card, Descriptions } from 'antd';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

function Profile() {
  const { userProfile } = useSelector((state: RootState) => state.auth);

  if (!userProfile) {
    return <div>Loading profile...</div>;
  }

  return (
    <Card title="User Profile">
      <Descriptions bordered>
        <Descriptions.Item label="First Name">{userProfile.firstName}</Descriptions.Item>
        <Descriptions.Item label="Last Name">{userProfile.lastName}</Descriptions.Item>
        <Descriptions.Item label="Email">{userProfile.email}</Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

export default Profile; 