import React from 'react';
import { Row, Col, Typography } from 'antd';
import MediaCard from './MediaCard';
import type { Media } from '@src/modules/cms/store/services/cmsApi';

interface MediaGridViewProps {
  mediaList: Media[];
  onSelect?: (url: string) => void;
  onSelectCoverImage?: (url: string) => void;
  onDelete: (media: Media) => void;
  onPreview: (url: string) => void;
}

const MediaGridView: React.FC<MediaGridViewProps> = ({
  mediaList,
  onSelect,
  onSelectCoverImage,
  onDelete,
  onPreview,
}) => {
  return (
    <Row gutter={[16, 16]}>
      {mediaList.length > 0 ? (
        mediaList.map((media) => (
          <Col xs={24} sm={12} md={8} lg={6} key={media.id}>
            <MediaCard
              media={media}
              onSelect={onSelect}
              onSelectCoverImage={onSelectCoverImage}
              onDelete={onDelete}
              onPreview={onPreview}
            />
          </Col>
        ))
      ) : (
        <Col span={24}>
          <Typography.Text type="secondary">No media found.</Typography.Text>
        </Col>
      )}
    </Row>
  );
};

export default MediaGridView;
