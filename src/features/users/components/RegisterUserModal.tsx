import { Modal, Form, Input, Button } from 'antd';
import type { RegisterUser } from '@/types/registerUser';

interface RegisterUserModalProps {
    visible: boolean;
    onClose: () => void;
    onRegister: (values: RegisterUser) => Promise<void>;
}

export const RegisterUserModal = ({
    visible,
    onClose,
    onRegister
}: RegisterUserModalProps) => {
    const [form] = Form.useForm();

    const handleClose = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Register User"
            open={visible}
            onCancel={handleClose}
            footer={null}
        >
            <Form
                form={form}
                onFinish={onRegister}
                layout="vertical"
            >
                <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email is required', type: 'email' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Username is required' }]}>
                    <Input />
                </Form.Item>
                <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Password is required' }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true, message: 'Please confirm your password' }]}>
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Register
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};