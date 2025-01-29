// UploadMediaModal.tsx
import React, { useState } from 'react';
import { Modal, Space, Upload, Button, Progress, Typography, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import type { UploadMediaMutation } from '@src/modules/cms/store/services/cmsApi';
import type { MessageContextType } from '@contexts/MessageContext';

interface UploadMediaModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  uploadMedia: UploadMediaMutation;
  messageApi?: MessageContextType;
}

const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  uploadMedia,
  messageApi,
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = async (options: UploadRequestOption<any>) => {
    const { file, onSuccess: uploadSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file as File);

    // Validation
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      messageApi?.error('Only image and video files are allowed.');
      onError?.(new Error('Invalid file type'));
      return;
    }

    setSelectedFile(file as File);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress (Replace with actual upload logic)
    const simulateProgress = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 99) {
          clearInterval(simulateProgress);
          return prev;
        }
        return prev + 1;
      });
    }, 20);

    try {
      await uploadMedia(formData).unwrap();
      clearInterval(simulateProgress);
      setUploadProgress(100);
      setTimeout(() => {
        onSuccess();
        setIsUploading(false);
        setSelectedFile(null);
        setUploadProgress(0);
      }, 500);
      uploadSuccess?.('OK');
    } catch (error: any) {
      clearInterval(simulateProgress);
      if (Array.isArray(error?.data?.errors[''])) {
        error?.data?.errors[''].forEach((err: any) => {
          messageApi?.error(err);
        });
      } else {
        messageApi?.error('Failed to upload media');
      }
      onError?.(new Error('Upload failed'));
      setIsUploading(false);
      setSelectedFile(null);
      setUploadProgress(0);
    }
  };

  return (
    <Modal
      title="Upload Media"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Upload
          customRequest={handleUpload}
          showUploadList={false}
          multiple={false}
          accept="image/*,video/*"
          disabled={isUploading}
        >
          <Button icon={<UploadOutlined />} disabled={isUploading} aria-label="Select file to upload">
            {isUploading ? 'Uploading...' : 'Select File'}
          </Button>
        </Upload>

        {selectedFile && (
          <Typography.Text type="secondary">
            Selected file: {selectedFile.name}
          </Typography.Text>
        )}

        {isUploading && (
          <Progress
            percent={uploadProgress}
            status={uploadProgress === 100 ? 'success' : 'active'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            aria-label="Upload progress"
          />
        )}
      </Space>
    </Modal>
  );
};

export default UploadMediaModal;
