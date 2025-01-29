import React from 'react';
import { Card, Button, Image, Space, Typography, Tooltip } from 'antd';
import {
  SelectOutlined,
  PictureOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { Media } from '@src/modules/cms/store/services/cmsApi';
import { formatSize } from '@utils/formatSize';

interface MediaCardProps {
  media: Media;
  onSelect?: (url: string) => void;
  onSelectCoverImage?: (url: string) => void;
  onDelete: (media: Media) => void;
  onPreview: (url: string) => void;
}

const MediaCard: React.FC<MediaCardProps> = ({
  media,
  onSelect,
  onSelectCoverImage,
  onDelete,
  onPreview,
}) => {
  const renderCover = () => {
    if (media.contentType.startsWith('image/')) {
      return (
        <Image
          src={media.blobUri}
          alt={media.fileName}
          style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
          loading="lazy"
        />
      );
    }

    return (
      <div
        style={{
          height: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f2f5',
          cursor: 'pointer',
        }}
        onClick={() => onPreview(media.blobUri)}
      >
        {media.contentType.startsWith('video/') ? (
          <VideoCameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
        ) : media.contentType === 'application/pdf' ? (
          <FilePdfOutlined style={{ fontSize: '48px', color: '#f5222d' }} />
        ) : (
          <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
        )}
      </div>
    );
  };

  return (
    <Card
      hoverable
      cover={renderCover()}
      actions={[
        <Space direction="vertical" align="center" key="actions">
          {onSelect && (
            <Button
              icon={<SelectOutlined />}
              onClick={() => onSelect?.(media.blobUri)}
              type="link"
            >
              Select
            </Button>
          )}
          {onSelectCoverImage && (
            <Button
              icon={<PictureOutlined />}
              onClick={() => onSelectCoverImage?.(media.blobUri)}
              type="link"
            >
              Set as Cover
            </Button>
          )}
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(media)}
            type="link"
          >
            Delete
          </Button>
        </Space>,
      ]}
    >
      <Card.Meta
        title={
          <Typography.Text ellipsis title={media.fileName}>
            {media.fileName}
          </Typography.Text>
        }
        description={
          <Space direction="vertical" size={4}>
            <Space>
              <ClockCircleOutlined style={{ color: '#bfbfbf' }} />
              <Typography.Text type="secondary">
                {new Date(media.uploadedAt).toLocaleString()}
              </Typography.Text>
            </Space>
            <Space>
                <FileTextOutlined style={{ color: '#bfbfbf' }} />
              <Typography.Text type="secondary">
                {formatSize(media.size)}
              </Typography.Text>
            </Space>
            <Space>
              <UserOutlined style={{ color: '#bfbfbf' }} />
              <Tooltip title={media.uploadedBy}>
                <Typography.Text type="secondary" ellipsis style={{ maxWidth: 120 }}>
                  {media.uploadedBy}
                </Typography.Text>
              </Tooltip>
            </Space>
          </Space>
        }
      />
    </Card>
  );
};

export default MediaCard;
