import React from 'react';
import { Modal, List, Typography, Space, Tag, Button, Image } from 'antd';
import type { ContentEntity, Version } from './ContentsManagement';

interface ContentVersionsModalProps {
  visible: boolean;
  content: ContentEntity | null;
  onClose: () => void;
  onRestore: (versionNumber: number) => void;
}

const ContentVersionsModal: React.FC<ContentVersionsModalProps> = ({
  visible,
  content,
  onClose,
  onRestore,
}) => {
  if (!content) return null;

  const latestVersionNumber = content.versions.length;

  return (
    <Modal
      title={`Content Versions - ${content.title}`}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <List
        dataSource={content.versions}
        renderItem={(version, index) => {
          const isCurrent = version.versionNumber === latestVersionNumber;

          return (
            <List.Item
              actions={[
                !isCurrent && (
                  <Button
                    type="primary"
                    onClick={() => onRestore(version.versionNumber)}
                    key="restore"
                  >
                    Restore
                  </Button>
                ),
              ]}
            >
              <List.Item.Meta
                title={
                  <>
                    Version{' '}
                    <Tag color="geekblue">{version.versionNumber}</Tag>
                  </>
                }
                description={
                  <Space direction="vertical" size="small">
                    <Typography.Text type="secondary">
                      Modified by {version.modifiedBy} on{' '}
                      {new Date(version.modifiedAt).toLocaleString()}
                    </Typography.Text>
                    {version.coverImageUrl && (
                      <Image
                        src={version.coverImageUrl}
                        alt="Version Cover"
                        width={120}
                        height={80}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                        placeholder
                      />
                    )}
                  </Space>
                }
              />
              {isCurrent && (
                <Tag color="blue" key="current">
                  Current Version
                </Tag>
              )}
            </List.Item>
          );
        }}
      />
    </Modal>
  );
};

export default ContentVersionsModal;