import { useState, useEffect, useContext } from 'react';
import {
  Layout, Card, Table, Button, Space, Tag, Typography, Grid, Modal, List, theme, Pagination
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, HistoryOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLoading } from '@store/slices/uiSlice';
import { getCmsHooks } from '@src/modules/cms/store/services/cmsApi';
import { ContentSearchFilters } from './ContentSearchFilters';
import FormattedDate from '@components/FormattedDate';
import { MessageContext } from '@contexts/MessageContext';
import { ContentEditModal } from './ContentEditModal';

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
}

interface Version {
  versionNumber: number;
  title: string;
  body: string;
  modifiedAt: string;
  modifiedBy: string;
}

const ContentsManagement = () => {
  const dispatch = useDispatch();
  const messageApi = useContext(MessageContext);
  const navigate = useNavigate();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentEntity | null>(null);
  const screens = useBreakpoint();
  const { token } = theme.useToken();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const {
    useGetAllContentsQuery,
    useDeleteContentMutation,
    useRestoreContentVersionMutation
  } = getCmsHooks();

  const { data: contentsData, isLoading, refetch } = useGetAllContentsQuery({ pageIndex, pageSize });
  const [deleteContent] = useDeleteContentMutation();
  const [restoreContentVersion] = useRestoreContentVersionMutation();

  const contents = contentsData?.items || [];
  const totalCount = contentsData?.totalCount || 0;

  const [modal, contextHolder] = Modal.useModal();

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  const handleEdit = (content: ContentEntity) => {
    setSelectedContent(content);
    setEditModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    modal.confirm({
      title: 'Are you sure you want to delete this blog?',
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

  const columns: ColumnsType<ContentEntity> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
    },
    {
      title: 'Type',
      dataIndex: 'contentType',
      key: 'contentType',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Published' ? 'green' : 'orange'}>{status}</Tag>
      ),
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => <FormattedDate date={date} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          />
          <Button 
            icon={<HistoryOutlined />} 
            onClick={() => handleViewVersions(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <Typography.Title level={2}>CMS Management</Typography.Title>
      <Layout style={{ background: 'inherit', padding: 0 }}>
        <Content style={{ padding: 0, width: '100%' }}>
          <Card
            title="Contents"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/cms/contents/add')}
              >
                New Content
              </Button>
            }
            style={{
              margin: screens.xs ? '2px 0px' : '2px 16px',
              padding: screens.xs ? '4px 0px' : '4px',
            }}
          >
            <ContentSearchFilters onRefresh={refetch} isLoading={isLoading} />
            <Table<ContentEntity>
              columns={columns}
              dataSource={contents}
              rowKey="id"
              pagination={false}
              loading={isLoading}
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
              showTotal={total => `${total} Contents in total`}
              style={{
                marginTop: 16,
                textAlign: 'right',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            />
          </Card>
          <ContentEditModal
            visible={editModalVisible}
            content={selectedContent}
            onClose={() => {
              setEditModalVisible(false);
              setSelectedContent(null);
            }}
            onSuccess={() => {
              setEditModalVisible(false);
              setSelectedContent(null);
              refetch();
            }}
          />
          <Modal
            title="Content Versions"
            visible={versionModalVisible}
            onCancel={() => setVersionModalVisible(false)}
            footer={null}
          >
            <List
              dataSource={selectedContent?.versions || []}
              renderItem={(version) => (
                <List.Item
                  actions={[
                    <Button onClick={() => handleRestoreVersion(version.versionNumber)}>
                      Restore
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={`Version ${version.versionNumber}`}
                    description={`Modified by ${version.modifiedBy} on ${new Date(
                      version.modifiedAt
                    ).toLocaleString()}`}
                  />
                </List.Item>
              )}
            />
          </Modal>
        </Content>
      </Layout>
    </>
  );
};

export default ContentsManagement;
