import React from 'react';
import { Form, Row, Col, Card, Typography, Switch } from 'antd';
import { Editor } from '@tinymce/tinymce-react';

interface ContentEditorProps {
  body: string;
  setBody: (content: string) => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  contentStyle: string | null;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  body,
  setBody,
  showPreview,
  setShowPreview,
  contentStyle,
}) => {
  return (
    <>
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
              onEditorChange={setBody}
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
                content_style: contentStyle || '',
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
              padding: '0px 8px',
            }}
          >
            <Card style={{ borderRadius: 0, border: '1px solid #f0f0f0' }}>
              <Typography.Title level={5}>Preview</Typography.Title>
              <div dangerouslySetInnerHTML={{ __html: body }} />
            </Card>
          </Col>
        )}
      </Row>
    </>
  );
};

export default ContentEditor;