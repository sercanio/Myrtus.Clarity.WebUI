import React, { useState, useContext, useEffect } from 'react';
import {
  Form, Input, Button, Select, Space, Typography, Card, Row, Col, Tabs, Grid, Switch,
  theme, Modal
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { MessageContext } from '@contexts/MessageContext';
import { Editor } from '@tinymce/tinymce-react';
import { getCmsHooks } from '@src/modules/cms/store/services/cmsApi';
import MediaLibrary from '@src/modules/cms/components/MediaLibrary';

const { TextArea } = Input;
const { useBreakpoint } = Grid;
const { TabPane } = Tabs;

const ContentAddPage: React.FC = () => {
  const [form] = Form.useForm();
  const messageApi = useContext(MessageContext);

  const { useCreateContentMutation } = getCmsHooks();
  const [createContent] = useCreateContentMutation();

  const navigate = useNavigate();
  const [body, setBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const screens = useBreakpoint();
  const [slugError, setSlugError] = useState<string | null>(null);
  const [contentStyle, setContentStyle] = useState<string | null>(null);

  // For opening the media library
  const [mediaLibraryVisible, setMediaLibraryVisible] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(undefined);

  const [activeTabKey, setActiveTabKey] = useState('1');
  const { token } = theme.useToken();

  const generateSlug = async (title: string) => {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .trim();
    setSlugError(null);
    form.setFieldsValue({ slug });
  };

  useEffect(() => {
    form.validateFields(['slug']);
  }, [form, slugError]);

  useEffect(() => {
    setContentStyle(`
      body {
        padding: 16px;
        background-color: ${token.colorBgContainer};
        color: ${token.colorText};
      }
    `);
  }, [token.colorBgContainer, token.colorText]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setFieldsValue({ title });
    generateSlug(title);
  };

  const handleEditorChange = (content: string) => {
    setBody(content);
  };

  /**
   * This is how we insert an in-body image 
   * (the old approach). If user picks an image from MediaLibrary:
   */
  const handleMediaSelect = (url: string, alt: string) => {
    // Insert <img> in the body for inline images
    setBody((prevBody) => `${prevBody}<img src="${url}" alt="${alt}" width="500" />`);
    setMediaLibraryVisible(false);
    setActiveTabKey('3'); // Switch to "Content" tab
  };

  /**
   * Submitting the form
   */
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const tagsArray = values.tags
        ? values.tags.split(',').map((tag: string) => tag.trim())
        : [];

      await createContent({
        ...values,
        body,
        coverImageUrl, // Include coverImageUrl in payload
        tags: tagsArray,
        status: values.status || 'Draft'
      }).unwrap();

      messageApi?.success('Content created successfully');
      form.resetFields();
      setBody('');
      navigate('/cms/contents');
    } catch (error: any) {
      if (error.data?.errors) {
        const errors = error.data.errors;
        const fields = Object.keys(errors).map((key) => ({
          name: key,
          errors: error.data.errors[key],
        }));
        form.setFields(fields);
        messageApi?.error(fields[0].errors);
      } else {
        messageApi?.error('Failed to create content');
      }
    }
  };

  return (
    <Card
      title="Add Content">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Tabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          defaultActiveKey="1"
          style={{ height: '100%' }}
        >
          <TabPane tab="Basic Info" key="1">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="title"
                  label="Title"
                  rules={[{ required: true, message: 'Please input the title!' }]}
                >
                  <Input onChange={handleTitleChange} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="slug"
                  label="Slug"
                  rules={[{ required: true, message: slugError || 'Please input the slug!' }]}
                  validateStatus={slugError ? 'error' : ''}
                  help={slugError}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="contentType"
                  label="Content Type"
                  rules={[{ required: true, message: 'Please select the content type!' }]}
                >
                  <Select>
                    <Select.Option value="blog">Blog Post</Select.Option>
                    <Select.Option value="news">News</Select.Option>
                    <Select.Option value="activity">Activity</Select.Option>
                    <Select.Option value="announcement">Announcement</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="language"
                  label="Language"
                  rules={[
                    { required: true, message: 'Please input the language!' }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="status" label="Status">
                  <Select>
                    <Select.Option value="Draft">Draft</Select.Option>
                    <Select.Option value="Published">Published</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="tags"
                  label="Tags"
                  rules={[{ required: true, message: 'Please input the tags!' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            {/* COVER IMAGE section */}
            <Form.Item label="Cover Image">
              <Space direction="vertical" style={{ width: '100%' }}>
                {coverImageUrl && (
                  <img
                    src={coverImageUrl}
                    alt="Cover"
                    style={{ maxWidth: '300px', marginBottom: 8 }}
                  />
                )}
                <Button onClick={() => setMediaLibraryVisible(true)}>
                  {coverImageUrl ? 'Change Cover Image' : 'Set Cover Image'}
                </Button>
              </Space>
            </Form.Item>
          </TabPane>

          <TabPane tab="SEO" key="2">
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
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="metaKeywords"
                  label="Meta Keywords"
                  rules={[{ required: true, message: 'Please input the meta keywords!' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Content" key="3">
            <Row gutter={16} justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Typography.Title level={4}>Content Editor</Typography.Title>
              </Col>
              <Col>
                <Switch
                  checked={showPreview}
                  onChange={() => setShowPreview(!showPreview)}
                  checkedChildren="Preview On"
                  unCheckedChildren="Preview Off"
                />
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} lg={showPreview ? 12 : 24}>
                <Form.Item rules={[{ required: true, message: 'Please input the body!' }]}>
                  <Editor
                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                    value={body}
                    onEditorChange={handleEditorChange}
                    init={{
                      height: 600,
                      menubar: false,
                      plugins: [
                        'advlist autolink lists link image charmap print preview anchor',
                        'searchreplace visualblocks code fullscreen',
                        'insertdatetime media table paste code help wordcount',
                        'code', 'preview',
                      ],
                      toolbar:
                        'undo redo | formatselect | bold italic backcolor | ' +
                        'alignleft aligncenter alignright alignjustify | ' +
                        'bullist numlist outdent indent | removeformat | code | preview | help',
                      content_css: [],
                      content_style: contentStyle!,
                    }}
                    key={contentStyle}
                  />
                </Form.Item>
              </Col>
              {showPreview && (
                <Col
                  xs={24}
                  lg={12}
                  style={{
                    height: '100%',
                    overflow: 'auto',
                    padding: screens.xs ? '48px 8px' : '0px 8px',
                  }}
                >
                  <Card style={{ borderRadius: 0, border: '1px solid' }}>
                    <Typography.Title level={5}>Preview</Typography.Title>
                    <div dangerouslySetInnerHTML={{ __html: body }} />
                  </Card>
                </Col>
              )}
            </Row>
          </TabPane>

          <TabPane tab="Media Library" key="4">
            <Button onClick={() => setMediaLibraryVisible(true)}>Open Media Library</Button>
          </TabPane>
        </Tabs>

        {/* Buttons */}
        <Form.Item>
          <Space size="middle" style={{ marginTop: 48 }}>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
            <Button onClick={() => navigate('/cms/contents')}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {/* Modal for the Media Library (shared by cover image or inline images) */}
      <Modal
        title="Media Library"
        visible={mediaLibraryVisible}
        onCancel={() => setMediaLibraryVisible(false)}
        footer={null}
        width={1200}
      >
        <MediaLibrary
          onSelect={handleMediaSelect}
          onSelectCoverImage={(url) => {
            setCoverImageUrl(url);
            setMediaLibraryVisible(false);
          }}
        />
      </Modal>
    </Card>
  );
};

export default ContentAddPage;
