import React from 'react';
import { Form, Input, Row, Col } from 'antd';

const { TextArea } = Input;

interface SEOFormProps {
    form: any;
}

const SEOForm: React.FC<SEOFormProps> = ({ form }) => {
    return (
        <>
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="metaTitle"
                        label="Meta Title"
                        rules={[{ required: true, message: 'Please input the meta title!' }]}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item
                        name="metaDescription"
                        label="Meta Description"
                        rules={[{ required: true, message: 'Please input the meta description!' }]}
                    >
                        <TextArea rows={2} />
                    </Form.Item>
                </Col>
            </Row><Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        name="metaKeywords"
                        label="Meta Keywords"
                        rules={[{ required: true, message: 'Please input the meta keywords!' }]}
                    >
                        <Input placeholder="Comma-separated keywords" />
                    </Form.Item>
                </Col>
            </Row>
        </>
    );
};

export default SEOForm;