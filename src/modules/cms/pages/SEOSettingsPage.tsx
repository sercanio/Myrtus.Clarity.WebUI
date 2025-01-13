import React, { useState, useEffect, useContext } from 'react';
import {
    Form,
    Input,
    Button,
    Typography,
    Spin,
    Space,
    Card
} from 'antd';
import { getCmsHooks } from '@src/modules/cms/store/services/cmsApi';
import { MessageContext } from '@src/contexts/MessageContext';

const { Title } = Typography;

interface SEOSettingsFormValues {
    DefaultMetaTitle: string;
    DefaultMetaDescription: string;
    DefaultMetaKeywords: string;
}

interface UpdateSEOSettingsDto {
    DefaultMetaTitle: string;
    DefaultMetaDescription: string;
    DefaultMetaKeywords: string;
}

const SEOSettingsPage: React.FC = () => {
    const { useGetSEOSettingsQuery, useUpdateSEOSettingsMutation } = getCmsHooks();

    const { data, error, isLoading, refetch } = useGetSEOSettingsQuery();
    const [updateSEOSettings, { isLoading: isUpdating }] = useUpdateSEOSettingsMutation();
    const messageApi = useContext(MessageContext);

    const [form] = Form.useForm<SEOSettingsFormValues>();

    const [isNotFound, setIsNotFound] = useState(false);

    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                DefaultMetaTitle: data?.value?.defaultMetaTitle,
                DefaultMetaDescription: data?.value?.defaultMetaDescription,
                DefaultMetaKeywords: data?.value?.defaultMetaKeywords
            });
            setIsNotFound(false);
        } else if (error) {
            if ('status' in error && error.status === 404) {
                setIsNotFound(true);
                form.resetFields();
            }
        }
    }, [data, error, form]);

    const onFinish = async (values: SEOSettingsFormValues) => {
        const { DefaultMetaTitle, DefaultMetaDescription, DefaultMetaKeywords } = values;

        const updateDto: UpdateSEOSettingsDto = {
            DefaultMetaTitle: DefaultMetaTitle.trim(),
            DefaultMetaDescription: DefaultMetaDescription.trim(),
            DefaultMetaKeywords: DefaultMetaKeywords.trim(),
        };

        try {
            await updateSEOSettings(updateDto).unwrap();
            messageApi?.success('SEO settings saved successfully');
            refetch();
        } catch (err: any) {            
            messageApi?.error(err?.data?.detail)

        }
    };

    return (
        <Card title="Add Content">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {isLoading ? (
                    <Spin tip="Loading SEO settings..." />
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        {isNotFound && (
                            <Typography.Text type="warning">
                                No SEO settings found. Please create new SEO settings.
                            </Typography.Text>
                        )}
                        <Form.Item
                            label="Meta Title"
                            name="DefaultMetaTitle"
                            rules={[{ required: true, message: 'Please enter the meta title' }]}
                        >
                            <Input placeholder="Enter meta title" />
                        </Form.Item>

                        <Form.Item
                            label="Meta Description"
                            name="DefaultMetaDescription"
                            rules={[{ required: true, message: 'Please enter the meta description' }]}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Enter meta description"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Meta Keywords"
                            name="DefaultMetaKeywords"
                            rules={[{ required: true, message: 'Please enter the meta keywords' }]}
                        >
                            <Input placeholder="Enter meta keywords, separated by commas" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={isUpdating} disabled={isUpdating}>
                                {isNotFound ? 'Create SEO Settings' : 'Update SEO Settings'}
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Space>
        </Card>
    );
};

export default SEOSettingsPage;
