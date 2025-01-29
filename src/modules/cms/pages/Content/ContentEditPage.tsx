import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Form,
  Button,
  Card,
  Tabs,
  theme,
} from 'antd';
import { MessageContext } from '@contexts/MessageContext';
import { getCmsHooks } from '@src/modules/cms/store/services/cmsApi';
import BasicInfoForm from '@src/modules/cms/components/Content/BasicInfoForm';
import SEOForm from '@src/modules/cms/components/SEO/SEOForm';
import ContentEditor from '@src/modules/cms/components/Content/ContentEditor';
import ContentActionButtons from '@src/modules/cms/components/Content/ContentActionButtons';
import ContentMediaLibraryModal from '@src/modules/cms/components/Content/ContentMediaLibraryModal';
import { generateSlug } from '@src/modules/cms/utils/slugGenerator';

const { TabPane } = Tabs;

const ContentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const messageApi = useContext(MessageContext);

  const { useGetContentByIdQuery, useUpdateContentMutation } = getCmsHooks();
  const { data: content } = useGetContentByIdQuery(id!, { skip: !id });
  const [updateContent] = useUpdateContentMutation();

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

  // Generate a slug for the user
  const handleSlugGeneration = (title: string) => {
    const slug = generateSlug(title);
    form.setFieldsValue({ slug });
    setSlugError(null);
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

  // On content load, fill the form
  useEffect(() => {
    if (content) {
      form.setFieldsValue({
        contentType: content.contentType,
        title: content.title,
        slug: content.slug,
        tags: content.tags.join(', '), // Assuming tags are stored as array
        status: content.status,
        language: content.language,
        metaTitle: content.metaTitle,
        metaDescription: content.metaDescription,
        metaKeywords: content.metaKeywords,
      });
      setBody(content.body);
      setCoverImageUrl(content.coverImageUrl);
    }
  }, [content, form]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setFieldsValue({ title });
    handleSlugGeneration(title);
  };


  /**
   * Insert in-body image
   */
  const handleMediaSelect = (url: string, alt: string) => {
    setBody((prevBody) => `${prevBody}<img src="${url}" alt="${alt}" width="500" />`);
    setMediaLibraryVisible(false);
    setActiveTabKey('3'); // Switch to "Content" tab
  };

  const handleSelectCoverImage = (url: string) => {
    setCoverImageUrl(url);
    setMediaLibraryVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const tagsArray = values.tags
        ? values.tags.split(',').map((tag: string) => tag.trim())
        : [];

      const payload = {
        ...values,
        body,
        coverImageUrl,
        tags: tagsArray,
      };

      if (content) {
        await updateContent({ id: content.id, content: payload }).unwrap();
        messageApi?.success('Content updated successfully');
        navigate('/cms/contents');
      } else {
        messageApi?.success('Content created successfully');
        navigate('/cms/contents');
      }
    } catch (error: any) {
      if (error.data?.errors) {
        const fields = Object.keys(error.data.errors).map((key) => ({
          name: key,
          errors: error.data.errors[key],
        }));
        form.setFields(fields);
        messageApi?.error(fields[0].errors[0]);
      } else {
        messageApi?.error('Failed to save content');
      }
    }
  };

  return (
    <Card title="Edit Content">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Tabs
          activeKey={activeTabKey}
          onChange={setActiveTabKey}
          defaultActiveKey="1"
          destroyInactiveTabPane={false}
          style={{ height: '100%' }}
        >
          <TabPane tab="Basic Info" key="1" forceRender>
            <BasicInfoForm
              form={form}
              onTitleChange={handleTitleChange}
              coverImageUrl={coverImageUrl}
              onOpenMediaLibrary={() => setMediaLibraryVisible(true)}
            />
          </TabPane>

          <TabPane tab="SEO" key="2" forceRender>
            <SEOForm form={form} />
          </TabPane>

          <TabPane tab="Content" key="3" forceRender>
            <ContentEditor
              body={body}
              setBody={setBody}
              showPreview={showPreview}
              setShowPreview={setShowPreview}
              contentStyle={contentStyle}
            />
          </TabPane>

          <TabPane tab="Media Library" key="4" forceRender>
            <Button onClick={() => setMediaLibraryVisible(true)}>Open Media Library</Button>
          </TabPane>
        </Tabs>

        {/* Action Buttons */}
        <ContentActionButtons onSave={handleSubmit} />
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

export default ContentEditPage;
