import React from 'react';
import { Form, Input, Select, Row, Col, Button } from 'antd';

const { Option } = Select;

interface BasicInfoFormProps {
  form: any; // Replace 'any' with the appropriate Form instance type if available
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  coverImageUrl?: string;
  onOpenMediaLibrary: () => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  form,
  onTitleChange,
  coverImageUrl,
  onOpenMediaLibrary,
}) => {
  return (
    <>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input onChange={onTitleChange} />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[{ required: true, message: 'Please input the slug!' }]}
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
              <Option value="blog">Blog Post</Option>
              <Option value="news">News</Option>
              <Option value="activity">Activity</Option>
              <Option value="announcement">Announcement</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="language"
            label="Language"
            rules={[{ required: true, message: 'Please input the language!' }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="status" label="Status">
            <Select>
              <Option value="Draft">Draft</Option>
              <Option value="Published">Published</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="tags"
            label="Tags"
            rules={[{ required: true, message: 'Please input the tags!' }]}
          >
            <Input placeholder="Comma-separated tags" />
          </Form.Item>
        </Col>
      </Row>

      {/* Cover Image Section */}
      <Form.Item label="Cover Image">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            {coverImageUrl && (
              <img
                src={coverImageUrl}
                alt="Cover"
                style={{ maxWidth: '100%', marginBottom: 8 }}
              />
            )}
          </Col>
          <Col xs={24} md={12}>
            <Button onClick={onOpenMediaLibrary}>
              {coverImageUrl ? 'Change Cover Image' : 'Set Cover Image'}
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </>
  );
};

export default BasicInfoForm;