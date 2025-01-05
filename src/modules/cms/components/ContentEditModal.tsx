import { useContext, useEffect, useState } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import { MessageContext } from '@contexts/MessageContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// ⬇️ Import the dynamic hook accessor
import { getCmsHooks } from '@src/modules/cms/store/services/cmsApi';

interface ContentEditModalProps {
  visible: boolean;
  content: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

const { Option } = Select;

export const ContentEditModal: React.FC<ContentEditModalProps> = ({
  visible,
  content,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const messageApi = useContext(MessageContext);
  const [body, setBody] = useState('');

  // ⬇️ Destructure the needed hooks from getCmsHooks
  const { useCreateContentMutation, useUpdateContentMutation } = getCmsHooks();
  const [createContent] = useCreateContentMutation();
  const [updateContent] = useUpdateContentMutation();

  useEffect(() => {
    if (visible && content) {
      form.setFieldsValue({
        contentType: content.contentType,
        title: content.title,
        slug: content.slug,
        tags: content.tags,
        status: content.status,
        language: content.language,
        metaTitle: content.metaTitle,
        metaDescription: content.metaDescription,
        metaKeywords: content.metaKeywords,
      });
      setBody(content.body);
    } else {
      form.resetFields();
      setBody('');
    }
  }, [visible, content, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        body,
        tags: values.tags
      };

      if (content) {
        // Update existing content
        await updateContent({ id: content.id, content: payload }).unwrap();
        messageApi?.success('Content updated successfully');
      } else {
        // Create new content
        await createContent(payload).unwrap();
        messageApi?.success('Content created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.data?.errors) {
        const fields = Object.keys(error.data.errors).map((key) => ({
          name: key,
          errors: error.data.errors[key],
        }));
        form.setFields(fields);
      } else {
        messageApi?.error('Failed to save content');
      }
    }
  };

  return (
    <Modal
      visible={visible}
      title={content ? 'Edit Content' : 'Create Content'}
      okText="Save"
      onCancel={onClose}
      onOk={handleSubmit}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'Draft',
        }}
      >
        <Form.Item
          name="contentType"
          label="Content Type"
          rules={[{ required: true, message: 'Please select the content type!' }]}
        >
          <Select placeholder="Select content type">
            <Option value="blog">Blog</Option>
            <Option value="page">Page</Option>
            <Option value="news">News</Option>
            {/* Add other content types as needed */}
          </Select>
        </Form.Item>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter the title!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="slug"
          label="Slug"
          rules={[
            { required: true, message: 'Please enter the slug!' },
            {
              pattern: /^[a-z0-9-]+$/,
              message: 'Slug can only contain lowercase letters, numbers, and hyphens.'
            },
          ]}
        >
          <Input placeholder="e.g., my-blog-post" />
        </Form.Item>
        <Form.Item
          label="Body"
          rules={[{ required: true, message: 'Please enter the body!' }]}
        >
          <ReactQuill
            value={body}
            onChange={setBody}
            style={{ height: '200px' }}
          />
        </Form.Item>
        <Form.Item
          name="tags"
          label="Tags"
          rules={[{ required: true, message: 'Please enter at least one tag!' }]}
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Add tags separated by commas"
          >
            {content?.tags?.map((tag: string) => (
              <Option key={tag} value={tag}>
                {tag}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select the status!' }]}
        >
          <Select>
            <Option value="Draft">Draft</Option>
            <Option value="Published">Published</Option>
            <Option value="Archived">Archived</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="language"
          label="Language"
          rules={[{ required: true, message: 'Please enter the language!' }]}
        >
          <Input placeholder="e.g., en, es, fr" />
        </Form.Item>
        <Form.Item
          name="metaTitle"
          label="Meta Title"
          rules={[{ required: true, message: 'Please enter the meta title!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="metaDescription"
          label="Meta Description"
          rules={[{ required: true, message: 'Please enter the meta description!' }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item
          name="metaKeywords"
          label="Meta Keywords"
          rules={[{ required: true, message: 'Please enter meta keywords!' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
