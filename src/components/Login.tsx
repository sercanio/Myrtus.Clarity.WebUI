// src/components/Login.tsx
import React from 'react';
import { Form, Input, Button, Typography, message, Checkbox } from 'antd';
import { useLoginMutation, useLazyGetCurrentUserQuery } from '@store/services/accountApi';
import { useAppDispatch } from '@store/hooks';
import { loginSuccess } from '@store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import type { LoginRequest } from '@/types/loginRequest';

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [login, { isLoading }] = useLoginMutation();
  // Use lazy query to fetch current user after login.
  const [triggerGetCurrentUser] = useLazyGetCurrentUserQuery();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onFinish = async (values: LoginRequest) => {
    try {
      await login(values).unwrap();
      const currentUserResult = await triggerGetCurrentUser();
      dispatch(
        loginSuccess({
          account: currentUserResult.data ?? null,
          accessToken: '',
        })
      );
      message.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      message.error('Login failed! Please check your credentials.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '1rem' }}>
      <Typography.Title level={2}>Login</Typography.Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="loginIdentifier"
          label="Username or Email"
          rules={[{ required: true, message: 'Please input your username or email' }]}
        >
          <Input placeholder="Username or Email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input your password' }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item name="rememberMe" valuePropName="checked" initialValue={false}>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
