import React, { useState, useEffect, useContext } from 'react';
import {
  Layout,
  Card,
  Button,
  Space,
  Grid,
  Modal,
  Spin,
  Pagination,
} from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLoading } from '@store/slices/uiSlice';
import { getCmsHooks } from '@src/modules/cms/store/services/cmsApi';
import { ContentSearchFilters } from './ContentSearchFilters';
import FormattedDate from '@components/FormattedDate';
import { MessageContext } from '@contexts/MessageContext';
import ContentsTableView from './ContentsTableView';
import ContentVersionsModal from './ContentsVersionModal';
import ConfirmDeleteModal from '../Shared/ConfirmDeleteModal';

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

const ContentsManagement: React.FC = () => {
  const dispatch = useDispatch();
  const messageApi = useContext(MessageContext);
  const navigate = useNavigate();

  const screens = useBreakpoint();

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

  // States for modals
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentEntity | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setLoading(isFetching));
  }, [isFetching, dispatch]);

  // Handlers
  const handleEdit = (content: ContentEntity) => {
    navigate(`/cms/contents/edit/${content.id}`);
  };

  const handleDelete = (id: string) => {
    setContentToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (contentToDelete) {
      try {
        await deleteContent(contentToDelete).unwrap();
        messageApi?.success('Content deleted successfully');
        refetch();
      } catch (error: any) {
        messageApi?.error(error.data?.message || 'Failed to delete content');
      } finally {
        setDeleteModalVisible(false);
        setContentToDelete(null);
      }
    }
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

  const handleTableChange = (
    sorter: { field?: string; order?: 'ascend' | 'descend' }
  ) => {
    if (sorter.field && sorter.order) {
      setDynamicRequest((prev) => ({
        ...prev,
        sort: [{ field: sorter.field, dir: sorter.order === 'ascend' ? 'asc' : 'desc' }],
      }));
    } else {
      setDynamicRequest((prev) => ({
        ...prev,
        sort: [{ field: 'updatedAt', dir: 'desc' }],
      }));
    }
  };

  return (
    <Content style={{ padding: '24px' }}>
      <Spin spinning={isFetching}>
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

          <ContentsTableView
            contents={contents}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewVersions={handleViewVersions}
            onSort={handleTableChange}
            dynamicRequest={dynamicRequest}
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

        {/* Content Versions Modal */}
        <ContentVersionsModal
          visible={versionModalVisible}
          content={selectedContent}
          onClose={() => setVersionModalVisible(false)}
          onRestore={handleRestoreVersion}
        />

        {/* Confirm Delete Modal */}
        <ConfirmDeleteModal
          visible={deleteModalVisible}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModalVisible(false)}
        />
      </Spin>
    </Content>
  );
};

export default ContentsManagement;