import React from 'react';
import { Image, Table, Typography, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import FormattedDate from '@components/FormattedDate';
import ContentActions from './ContentActions';
import type { Content } from '@srcmodules/cms/store/services/cmsApi';

interface ContentsTableViewProps {
  contents: Content[];
  onEdit: (content: Content) => void;
  onDelete: (id: string) => void;
  onViewVersions: (content: Content) => void;
  onSort: (sorter: { field?: string; order?: 'ascend' | 'descend' }) => void;
  dynamicRequest: {
    sort: { field: string; dir: 'asc' | 'desc' }[];
    filter: null | {
      field: string;
      operator: string;
      value: string;
      logic: string;
      isCaseSensitive: boolean;
    };
  };
}

const ContentsTableView: React.FC<ContentsTableViewProps> = ({
  contents,
  onEdit,
  onDelete,
  onViewVersions,
  onSort,
  dynamicRequest,
}) => {
  const columns: ColumnsType<Content> = [
    {
      title: 'Cover',
      dataIndex: 'coverImageUrl',
      key: 'cover',
      render: (url: string) =>
        url ? (
          <Image
            src={url}
            alt="Cover"
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : null,
      width: 70,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      sortOrder:
        dynamicRequest.sort?.[0]?.field === 'title'
          ? dynamicRequest.sort[0].dir === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      sortDirections: ['ascend', 'descend'],
      render: (text: string) => <Typography.Text strong>{text}</Typography.Text>,
      width: 200,
    },
    {
      title: 'Type',
      dataIndex: 'contentType',
      key: 'contentType',
      sorter: true,
      sortOrder:
        dynamicRequest.sort?.[0]?.field === 'contentType'
          ? dynamicRequest.sort[0].dir === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      sortDirections: ['ascend', 'descend'],
      render: (type: string) => <Tag color="blue">{type}</Tag>,
      width: 90,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      sortOrder:
        dynamicRequest.sort?.[0]?.field === 'status'
          ? dynamicRequest.sort[0].dir === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      sortDirections: ['ascend', 'descend'],
      render: (status: string) => (
        <Tag color={status === 'Published' ? 'green' : 'orange'}>{status}</Tag>
      ),
      width: 100,
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      sorter: true,
      sortOrder:
        dynamicRequest.sort?.[0]?.field === 'language'
          ? dynamicRequest.sort[0].dir === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      sortDirections: ['ascend', 'descend'],
      width: 80,
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      sortOrder:
        dynamicRequest.sort?.[0]?.field === 'updatedAt'
          ? dynamicRequest.sort[0].dir === 'asc'
            ? 'ascend'
            : 'descend'
          : undefined,
      sortDirections: ['ascend', 'descend'],
      render: (date: string) => <FormattedDate date={date} />,
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <ContentActions
            content={record}
            onEdit={() => onEdit(record)}
            onDelete={() => onDelete(record.id)}
            onViewVersions={() => onViewVersions(record)}
          />
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <Table<Content>
      columns={columns}
      dataSource={contents}
      rowKey="id"
      pagination={false}
      size="middle"
      style={{ width: '100%', overflowX: 'auto', marginTop: 16 }}
      onChange={(_, __, sorter: any) => {
        onSort(sorter);
      }}
      scroll={{ x: true }}
      locale={{ emptyText: 'No contents found.' }}
    />
  );
};

export default ContentsTableView;
