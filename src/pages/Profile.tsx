import { Card, Avatar, Flex } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import React, { useRef, useMemo, useContext, useEffect } from 'react';
import { useUpdateNotificationPreferencesMutation } from '@store/services/accountApi';
import { Switch, Button } from 'antd';
import { useState } from 'react';
import { Layout, Row, Col, Descriptions, Form, Typography } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { MessageContext } from '@contexts/MessageContext';

const Profile: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [updatePreferences] = useUpdateNotificationPreferencesMutation();
  const [preferences, setPreferences] = useState({
    inAppNotification: false,
    emailNotification: false,
    pushNotification: false,
  });

  const initialPreferencesRef = useRef(preferences);
  const messageApi = useContext(MessageContext);

  useEffect(() => {
    if (user?.notificationPreference) {
      const initialPrefs = {
        inAppNotification: user.notificationPreference.isInAppNotificationEnabled,
        emailNotification: user.notificationPreference.isEmailNotificationEnabled,
        pushNotification: user.notificationPreference.isPushNotificationEnabled,
      };
      setPreferences(initialPrefs);
      initialPreferencesRef.current = initialPrefs;
    }
  }, [user]);

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

  const handleSubmit = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await updatePreferences(preferences).unwrap();
      messageApi?.success('Notification preferences updated successfully.');
    } catch {
      messageApi?.error('Failed to update notification preferences.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>No user data available</div>;
  }

  const userName = user.userName

  return (
    <>
      <Layout style={{ background: 'transparent', padding: 0 }}>
        <Layout.Content style={{ padding: 0, maxWidth: '1200px' }}>
          <Typography.Title level={2} style={{ textAlign: 'left' }}>Profile Management</Typography.Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card>
                <Flex vertical align="center" style={{ marginBottom: 24 }}>
                  <Avatar 
                    size={128}
                    src={user.avatarUrl}
                    icon={!user.avatarUrl && <UserOutlined />}
                  />
                </Flex>
                <Typography.Title level={3} style={{ marginBottom: 16 }}>User Profile</Typography.Title>
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Username">{userName}</Descriptions.Item>
                  <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                  <Descriptions.Item label="Roles">
                    {user.roles?.map((role) => role.name).join(', ') || 'No roles assigned'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card>
                <Typography.Title level={3} style={{ marginBottom: 16 }}>Notification Settings</Typography.Title>
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
                      onClick={(event) => handleSubmit(event)}
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
        </Layout.Content>
      </Layout>
    </>
  );
}

export default Profile;