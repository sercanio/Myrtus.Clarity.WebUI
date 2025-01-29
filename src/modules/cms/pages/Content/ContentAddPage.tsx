import React, { useState, useContext, useEffect } from 'react';
import {
  Form, Card, Tabs, Modal, Spin,
  Button,
  theme,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { MessageContext } from '@contexts/MessageContext';
import { getCmsHooks } from '@src/modules/cms/store/services/cmsApi';
import BasicInfoForm from '../../components/Content/BasicInfoForm';
import SEOForm from '../../components/SEO/SEOForm';
import ContentEditor from '../../components/Content/ContentEditor';
import ContentActionButtons from '../../components/Content/ContentActionButtons';
import ContentMediaLibraryModal from '../../components/Content/ContentMediaLibraryModal';
import { generateSlug } from '../../utils/slugGenerator';

const { TabPane } = Tabs;

const ContentAddPage: React.FC = () => {
  const [form] = Form.useForm();
  const messageApi = useContext(MessageContext);

  const { useCreateContentMutation } = getCmsHooks();
  const [createContent] = useCreateContentMutation();

  const navigate = useNavigate();
  const [body, setBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [contentStyle, setContentStyle] = useState<string | null>(null);

  // Modal State
  const [mediaLibraryVisible, setMediaLibraryVisible] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>(undefined);

  const [activeTabKey, setActiveTabKey] = useState('1');
  const { token } = theme.useToken();

  useEffect(() => {
    setContentStyle(`
      body {
        padding: 16px;
        background-color: ${token.colorBgContainer};
        color: ${token.colorText};
      }
    `);
  }, [token.colorBgContainer, token.colorText]);

  /**
   * Generate slug when title changes
   */
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setFieldsValue({ title });
    const slug = generateSlug(title);
    form.setFieldsValue({ slug });
    setSlugError(null);
  };

  /**
   * Handle media selection from MediaLibrary
   */
  const handleMediaSelect = (url: string, alt: string) => {
    // Insert <img> in the body for inline images
    setBody((prevBody) => `${prevBody}<img src="${url}" alt="${alt}" width="500" />`);
    setMediaLibraryVisible(false);
    setActiveTabKey('3'); // Switch to "Content" tab
  };

  /**
   * Handle cover image selection from MediaLibrary
   */
  const handleSelectCoverImage = (url: string) => {
    setCoverImageUrl(url);
    setMediaLibraryVisible(false);
  };

  /**
   * Handle form submission
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
        status: values.status || 'Draft',
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
    <Card title="Add Content">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Tabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          defaultActiveKey="1"
          style={{ height: '100%' }}
        >
          <TabPane tab="Basic Info" key="1">
            <BasicInfoForm
              form={form}
              onTitleChange={handleTitleChange}
              coverImageUrl={coverImageUrl}
              onOpenMediaLibrary={() => setMediaLibraryVisible(true)}
            />
          </TabPane>

          <TabPane tab="SEO" key="2">
            <SEOForm form={form} />
          </TabPane>

          <TabPane tab="Content" key="3">
            <ContentEditor
              body={body}
              setBody={setBody}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              contentStyle={contentStyle}
            />
          </TabPane>

          <TabPane tab="Media Library" key="4">
            <Button onClick={() => setMediaLibraryVisible(true)}>Open Media Library</Button>
          </TabPane>
        </Tabs>

        {/* Action Buttons */}
        <ContentActionButtons onCreate={handleSubmit} />
      </Form>

      {/* Media Library Modal */}
      <ContentMediaLibraryModal
        visible={mediaLibraryVisible}
        onClose={() => setMediaLibraryVisible(false)}
        onSelect={handleMediaSelect}
        onSelectCoverImage={handleSelectCoverImage}
      />
    </Card>
  );
};

export default ContentAddPage;