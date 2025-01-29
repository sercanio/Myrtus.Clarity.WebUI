import React from 'react';
import { Space, Button } from 'antd';
import {
  SelectOutlined,
  PictureOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { Media } from '@src/modules/cms/store/services/cmsApi';

interface MediaActionsProps {
  media: Media;
  onSelect?: (url: string) => void;
  onSelectCoverImage?: (url: string) => void;
  onDelete: (media: Media) => void;
}

const MediaActions: React.FC<MediaActionsProps> = React.memo(({
  media,
  onSelect,
  onSelectCoverImage,
  onDelete,
}) => {
  return (
    <Space direction="horizontal" align="start">
      {onSelect && (
        <Button
          icon={<SelectOutlined />}
          onClick={() => onSelect(media.blobUri)}
          type="link"
          style={{ padding: 0 }}
        >
          Select
        </Button>
      )}
      {onSelectCoverImage && (
        <Button
          icon={<PictureOutlined />}
          onClick={() => onSelectCoverImage(media.blobUri)}
          type="link"
          style={{ padding: 0 }}
        >
          Set as Cover
        </Button>
      )}
      <Button
        danger
        icon={<DeleteOutlined />}
        onClick={() => onDelete(media)}
        type="link"
        style={{ padding: 0 }}
      >
        Delete
      </Button>
    </Space>
  );
});

export default MediaActions;