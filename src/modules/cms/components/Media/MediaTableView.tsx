// MediaTableView.tsx
import React from 'react';
import { Table, Typography, Image } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import type { Media } from '@src/modules/cms/store/services/cmsApi';
import { formatSize } from '@utils/formatSize';
import MediaActions from './MediaActions';

interface MediaTableViewProps {
  mediaList: Media[];
  onSelect?: (url: string, alt: string) => void;
  onSelectCoverImage?: (url: string) => void;
  onDelete: (media: Media) => void;
  onPreview: (media: Media) => void;
  onSort: (sorter: { field?: string; order?: 'ascend' | 'descend' }) => void;
}

const MediaTableView: React.FC<MediaTableViewProps> = ({
  mediaList,
  onSelect,
  onSelectCoverImage,
  onDelete,
  onSort,
}) => {
  
  const columns: ColumnsType<Media> = [
    {
      title: 'Thumbnail',
      dataIndex: 'blobUri',
      key: 'thumbnail',
      render: (url: string, record: Media) => (
        <Image
            src={url}
            alt={record.fileName}
            width={50}
            height={50}
            style={{ objectFit: 'cover', borderRadius: 2 }}
          />
      ),
    },
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (text: string) => (
        <Typography.Text ellipsis title={text}>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: 'Uploaded By',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (text: string) => (
        <Typography.Text ellipsis title={text}>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (size: number) => formatSize(size),
    },
    {
      title: 'Uploaded At',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <MediaActions
          media={record}
          onSelect={onSelect}
          onSelectCoverImage={onSelectCoverImage}
          onDelete={onDelete}
        />
      )
    },
  ];

  return (
    <>
      <Table<Media>
        columns={columns}
        dataSource={mediaList}
        rowKey="id"
        pagination={false}
        onChange={(_, __, sorter: any) => {
          onSort(sorter);
        }}
        locale={{ emptyText: 'No media found.' }}
        style={{ width: '100%', overflowX: 'auto', marginTop: 16 }}
        size="middle"
      />
    </>
  );
};

export default MediaTableView;
