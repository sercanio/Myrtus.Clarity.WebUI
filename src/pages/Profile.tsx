import { Card, theme } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@store/index';
import React, { useRef, useMemo } from 'react';
import { useUpdateNotificationPreferencesMutation } from '@store/services/accountApi';
import { Switch, Button, message } from 'antd';
import { useState } from 'react';
import { fetchUserProfile } from '@store/slices/authSlice';
import { Layout, Row, Col, Descriptions, Form, Typography } from 'antd';

const { Content } = Layout;
const { Title } = Typography;

const Profile: React.FC = () => {
  const { userProfile } = useSelector((state: RootState) => state.auth);
  const { token } = theme.useToken();
  const dispatch = useDispatch();

  const [updatePreferences] = useUpdateNotificationPreferencesMutation();

  const [preferences, setPreferences] = useState({
    inAppNotification: userProfile?.notificationPreference.isInAppNotificationEnabled || false,
    emailNotification: userProfile?.notificationPreference.isEmailNotificationEnabled || false,
    pushNotification: userProfile?.notificationPreference.isPushNotificationEnabled || false,
  });

  const initialPreferencesRef = useRef(preferences);

  React.useEffect(() => {
    if (userProfile) {
      const initialPrefs = {
        inAppNotification: userProfile.notificationPreference.isInAppNotificationEnabled,
        emailNotification: userProfile.notificationPreference.isEmailNotificationEnabled,
        pushNotification: userProfile.notificationPreference.isPushNotificationEnabled,
      };
      setPreferences(initialPrefs);
      initialPreferencesRef.current = initialPrefs;
    }
  }, [userProfile]);

  const isDirty = useMemo(() => {
    return (
      preferences.inAppNotification !== initialPreferencesRef.current.inAppNotification ||
      preferences.emailNotification !== initialPreferencesRef.current.emailNotification ||
      preferences.pushNotification !== initialPreferencesRef.current.pushNotification
    );
  }, [preferences]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = (key: keyof typeof preferences) => (checked: boolean) => {
    setPreferences({ ...preferences, [key]: checked });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updatePreferences(preferences).unwrap();
      message.success('Notification preferences updated successfully.');
      dispatch(fetchUserProfile());
    } catch {
      message.error('Failed to update notification preferences.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userProfile) {
    return <div>Loading profile...</div>;
  }

  const gridStyle = {
    width: '50%',
    transition: 'background-color 0.3s',
    backgroundColor: token.colorBgContainer,
  };

  return (
    <Layout style={{ background: 'transparent', padding: 0 }}>
      <Content style={{ padding: 0, maxWidth: '1200px' }}>
        <Title level={2} style={{ textAlign: 'left'}}>Profile Management</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card>
              <Title level={3} style={{ marginBottom: 16 }}>User Profile</Title>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="First Name">{userProfile.firstName}</Descriptions.Item>
                <Descriptions.Item label="Last Name">{userProfile.lastName}</Descriptions.Item>
                <Descriptions.Item label="Email">{userProfile.email}</Descriptions.Item>
                <Descriptions.Item label="Roles">
                  {userProfile.roles.map((role) => role.name).join(', ')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card>
              <Title level={3} style={{ marginBottom: 16 }}>Notification Settings</Title>
              <Form layout="vertical">
                <Row gutter={[0, 0]}>
                  <Col span={24}>
                    <Form.Item label="In-App Notifications" valuePropName="checked">
                      <Switch 
                        checked={preferences.inAppNotification} 
                        onChange={handleToggle('inAppNotification')} 
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Email Notifications" valuePropName="checked">
                      <Switch 
                        checked={preferences.emailNotification} 
                        onChange={handleToggle('emailNotification')} 
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Push Notifications" valuePropName="checked">
                      <Switch 
                        checked={preferences.pushNotification} 
                        onChange={handleToggle('pushNotification')} 
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button
                    type="primary"
                    onClick={handleSubmit}
                    disabled={!isDirty}
                    loading={isSubmitting}
                  >
                    Save Preferences
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default Profile;