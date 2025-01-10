import { useState, useEffect, useContext } from 'react';
import {
  Layout,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Grid,
  Modal,
  List,
  theme,
  Pagination,
  Spin,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TableProps } from 'antd/es/table';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLoading } from '@store/slices/uiSlice';
import { getCmsHooks } from '@src/modules/cms/store/services/cmsApi';
import { ContentSearchFilters } from './ContentSearchFilters';
import FormattedDate from '@components/FormattedDate';
import { MessageContext } from '@contexts/MessageContext';

const { Content } = Layout;
const { useBreakpoint } = Grid;

interface ContentEntity {
  id: string;
  title: string;
  slug: string;
  status: string;
  contentType: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  versions: Version[];
  coverImageUrl?: string;
}

interface Version {
  versionNumber: number;
  title: string;
  body: string;
  coverImageUrl?: string;
  modifiedAt: string;
  modifiedBy: string;
}

const ContentsManagement = () => {
  const dispatch = useDispatch();
  const messageApi = useContext(MessageContext);
  const navigate = useNavigate();

  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentEntity | null>(null);

  const screens = useBreakpoint();
  const { token } = theme.useToken();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [dynamicRequest, setDynamicRequest] = useState({
    sort: [{ field: 'updatedAt', dir: 'desc' }] as { field: string; dir: 'asc' | 'desc' }[],
    filter: null as null | {
      field: string;
      operator: string;
      value: string;
      logic: string;
      isCaseSensitive: boolean;
    },
  });

  const {
    useGetAllContentsDynamicQuery,
    useDeleteContentMutation,
    useRestoreContentVersionMutation,
  } = getCmsHooks();

  const { data: contentsData, isFetching, refetch } = useGetAllContentsDynamicQuery({
    pageIndex,
    pageSize,
    requestBody: dynamicRequest,
  });

  const [deleteContent] = useDeleteContentMutation();
  const [restoreContentVersion] = useRestoreContentVersionMutation();

  const contents = contentsData?.items || [];
  const totalCount = contentsData?.totalCount || 0;

  const [modal, contextHolder] = Modal.useModal();

  useEffect(() => {
    dispatch(setLoading(isFetching));
  }, [isFetching, dispatch]);

  const handleEdit = (content: ContentEntity) => {
    navigate(`/cms/contents/edit/${content.id}`);
  };

  const handleDelete = async (id: string) => {
    modal.confirm({
      title: 'Are you sure you want to delete this content?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteContent(id).unwrap();
          messageApi?.success('Content deleted successfully');
          refetch();
        } catch (error: any) {
          messageApi?.error(error.data?.message || 'Failed to delete content');
        }
      },
    });
  };

  const handleViewVersions = (content: ContentEntity) => {
    setSelectedContent(content);
    setVersionModalVisible(true);
  };

  const handleRestoreVersion = async (versionNumber: number) => {
    if (selectedContent) {
      try {
        await restoreContentVersion({ id: selectedContent.id, versionNumber }).unwrap();
        messageApi?.success('Content restored successfully');
        setVersionModalVisible(false);
        refetch();
      } catch (error: any) {
        messageApi?.error(error.data?.message || 'Failed to restore content');
      }
    }
  };

  const handleTableChange: TableProps<ContentEntity>['onChange'] = (_pagination, _filters, sorter) => {
    if ('field' in sorter && 'order' in sorter) {
      setDynamicRequest((prev) => ({
        ...prev,
        sort: [{ field: sorter.field as string, dir: sorter.order === 'ascend' ? 'asc' : 'desc' }],
      }));
    }
  };

  const columns: ColumnsType<ContentEntity> = [
    {
      title: 'Cover',
      dataIndex: 'coverImageUrl',
      key: 'cover',
      render: (url: string) =>
        url ? (
          <img
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
      sortOrder: dynamicRequest.sort?.[0]?.field === 'title' ? (dynamicRequest.sort[0].dir === 'asc' ? 'ascend' : 'descend') : undefined,
      sortDirections: ['ascend', 'descend'],
      render: (text: string) => (
        <Typography.Text strong>{text}</Typography.Text>
      ),
      width: 200,
    },
    {
      title: 'Type',
      dataIndex: 'contentType',
      key: 'contentType',
      sorter: true,
      sortOrder: dynamicRequest.sort?.[0]?.field === 'contentType' ? (dynamicRequest.sort[0].dir === 'asc' ? 'ascend' : 'descend') : undefined,
      sortDirections: ['ascend', 'descend'],
      render: (type: string) => <Tag color="blue">{type}</Tag>,
      width: 90,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      sortOrder: dynamicRequest.sort?.[0]?.field === 'status' ? (dynamicRequest.sort[0].dir === 'asc' ? 'ascend' : 'descend') : undefined,
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
      sortOrder: dynamicRequest.sort?.[0]?.field === 'language' ? (dynamicRequest.sort[0].dir === 'asc' ? 'ascend' : 'descend') : undefined,
      sortDirections: ['ascend', 'descend'],
      width: 80,
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      sorter: true,
      sortOrder: dynamicRequest.sort?.[0]?.field === 'updatedAt' ? (dynamicRequest.sort[0].dir === 'asc' ? 'ascend' : 'descend') : undefined,
      sortDirections: ['ascend', 'descend'],
      render: (date: string) => <FormattedDate date={date} />,
      width: 150,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="default"
            icon={<EditOutlined />}
            title="Edit"
            onClick={() => handleEdit(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            title="Delete"
            onClick={() => handleDelete(record.id)}
          />
          <Button
            type="default"
            icon={<HistoryOutlined />}
            title="View Versions"
            onClick={() => handleViewVersions(record)}
          />
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <Spin spinning={isFetching}>
      {contextHolder}
      <Card
        title="CMS Management"
        extra={
          <Space align="center" size="small">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/cms/contents/add')}
            >
              New Content
            </Button>
          </Space>
        }
      >
        <ContentSearchFilters
          onRefresh={refetch}
          isLoading={isFetching}
          onChange={(req) => {
            setDynamicRequest(req);
            setPageIndex(0);
          }}
        />

        <Table<ContentEntity>
          columns={columns}
          dataSource={contents}
          rowKey="id"
          pagination={false}
          loading={isFetching}
          size="middle"
          style={{ width: '100%', overflowX: 'auto', marginTop: 16 }}
          onChange={handleTableChange}
          scroll={{ x: screens.xs ? 800 : undefined }}
        />

        <Pagination
          current={pageIndex + 1}
          pageSize={pageSize}
          total={totalCount}
          onChange={(page, newPageSize) => {
            setPageIndex(page - 1);
            setPageSize(newPageSize);
          }}
          responsive
          showSizeChanger
          showTotal={(total) => `${total} Contents in total`}
          style={{
            marginTop: 16,
            textAlign: 'right',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        />
      </Card>

      <Modal
        title="Content Versions"
        visible={versionModalVisible}
        onCancel={() => setVersionModalVisible(false)}
        footer={null}
        width={700}
      >
        <List
          dataSource={selectedContent?.versions || []}
          renderItem={(version, index) => {
            const versionsArray = selectedContent?.versions || [];
            const lastIndex = versionsArray.length - 1;
            const isCurrent = index === lastIndex;

            return (
              <List.Item
                actions={[
                  isCurrent ? (
                    <Tag color="blue" key="current">
                      Current Version
                    </Tag>
                  ) : (
                    <Button
                      type="default"
                      onClick={() => handleRestoreVersion(version.versionNumber)}
                    >
                      Restore
                    </Button>
                  ),
                ]}
              >
                <List.Item.Meta
                  title={
                    <>
                      Version <Tag color="geekblue">{version.versionNumber}</Tag>
                    </>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Typography.Text type="secondary">
                        Modified by {version.modifiedBy} on{' '}
                        {new Date(version.modifiedAt).toLocaleString()}
                      </Typography.Text>
                      {version.coverImageUrl && (
                        <img
                          src={version.coverImageUrl}
                          alt="Version Cover"
                          style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 4 }}
                        />
                      )}
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Modal>
    </Spin>
  );
};

export default ContentsManagement;
