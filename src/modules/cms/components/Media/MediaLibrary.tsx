import React, { useState, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Card,
  Button,
  Pagination,
  Space,
  Spin,
} from 'antd';
import {
  UnorderedListOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { getCmsHooks } from '@src/modules/cms/store/services/cmsApi';
import { MessageContext } from '@contexts/MessageContext';
import MediaFilterBar from './MediaFilterBar';
import MediaGridView from './MediaGridView';
import MediaTableView from './MediaTableView';
import UploadMediaModal from './UploadMediaModal';
import AltTextModal from './AltTextModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { setLoading } from '@src/store/slices/uiSlice';
import type { DynamicQueryRequest, Media } from '@src/modules/cms/store/services/cmsApi';

interface MediaLibraryProps {
  onSelect?: (url: string, alt: string) => void;
  onSelectCoverImage?: (url: string) => void;
}

const DEFAULT_SORT = [{ field: 'uploadedAt', dir: 'desc' }];

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect, onSelectCoverImage }) => {
  const {
    useGetAllMediaDynamicQuery,
    useUploadMediaMutation,
    useDeleteMediaMutation,
  } = getCmsHooks();

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Dynamic Query
  const [dynamicRequest, setDynamicRequest] = useState<DynamicQueryRequest>({
    sort: DEFAULT_SORT,
    filter: null,
  });

  // Query Call
  const {
    data: mediaData,
    refetch,
    isFetching,
  } = useGetAllMediaDynamicQuery({
    pageIndex,
    pageSize,
    requestBody: dynamicRequest,
  });

  const messageApi = useContext(MessageContext);
  const [uploadMedia] = useUploadMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();
  const dispatch = useDispatch();

  // UI States
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [altModalVisible, setAltModalVisible] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedDeleteMedia, setSelectedDeleteMedia] = useState<Media | null>(null);

  useEffect(() => {
    dispatch(setLoading(isFetching));
  }, [dispatch, isFetching]);

  // Handlers for modals and actions
  const handleUploadSuccess = () => {
    messageApi?.success('Media uploaded successfully');
    refetch();
    setUploadModalVisible(false);
  };

  const handleDeleteSuccess = () => {
    messageApi?.success('Media deleted successfully');
    refetch();
    setDeleteModalVisible(false);
    setSelectedDeleteMedia(null);
  };

  const handleDeleteError = () => {
    messageApi?.error('Failed to delete media');
  };

  const handleSelect = (url: string) => {
    setSelectedMediaUrl(url);
    setAltModalVisible(true);
  };

  const handlePreview = (url: string) => {
    setSelectedMediaUrl(url);
    setPreviewVisible(true);
  };

  const mediaList = mediaData?.items || [];
  const totalCount = mediaData?.totalCount || 0;

  // Local client filter (optional)
  const searchTerm = ''; // Currently unused, can be connected to a search input if needed

  const filteredMediaList = mediaList.filter(
    (m) =>
      m.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Spin spinning={isFetching}>
      <Card
        title="Media Library"
        extra={
          <Space align="center" size="small">
            <Button
              icon={isGridView ? <UnorderedListOutlined /> : <AppstoreOutlined />}
              onClick={() => setIsGridView(!isGridView)}
            />
            <Button onClick={() => setUploadModalVisible(true)}>Upload Media</Button>
          </Space>
        }
      >
        {/* The advanced filter & sort UI */}
        <MediaFilterBar
          isGridView={isGridView}
          onChange={(req) => {
            setDynamicRequest(req);
            setPageIndex(0);
          }}
        />

        {isGridView ? (
          <MediaGridView
            mediaList={filteredMediaList}
            onSelect={onSelect}
            onSelectCoverImage={onSelectCoverImage}
            onDelete={(media) => {
              setSelectedDeleteMedia(media);
              setDeleteModalVisible(true);
            }}
            onPreview={handlePreview}
          />
        ) : (
          <MediaTableView
            mediaList={filteredMediaList}
            onSelect={onSelect}
            onSelectCoverImage={onSelectCoverImage}
            onDelete={(media) => {
              setSelectedDeleteMedia(media);
              setDeleteModalVisible(true);
            }}
            onPreview={handlePreview}
            onSort={(sorter) => {
              if (sorter.field && sorter.order) {
                setDynamicRequest((prev) => ({
                  ...prev,
                  sort: [
                    {
                      field: sorter.field,
                      dir: sorter.order === 'ascend' ? 'asc' : 'desc',
                    },
                  ],
                }));
              } else {
                setDynamicRequest((prev) => ({
                  ...prev,
                  sort: DEFAULT_SORT.map((sort) => ({
                    ...sort,
                    dir: sort.dir as 'asc' | 'desc',
                  })),
                }));
              }
            }}
          />
        )}

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
          showTotal={(total) => `${total} Media items in total`}
          style={{
            marginTop: 16,
            textAlign: 'right',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        />

        {/* Upload Media Modal */}
        <UploadMediaModal
          visible={uploadModalVisible}
          onCancel={() => setUploadModalVisible(false)}
          onSuccess={handleUploadSuccess}
          uploadMedia={uploadMedia}
          messageApi={messageApi}
        />

        {/* Alt Text Modal */}
        <AltTextModal
          visible={altModalVisible}
          onCancel={() => {
            setAltModalVisible(false);
            setSelectedMediaUrl('');
          }}
          onConfirm={(altText) => {
            onSelect?.(selectedMediaUrl, altText);
            setAltModalVisible(false);
            setSelectedMediaUrl('');
          }}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          visible={deleteModalVisible}
          media={selectedDeleteMedia}
          onCancel={() => {
            setDeleteModalVisible(false);
            setSelectedDeleteMedia(null);
          }}
          onConfirm={async () => {
            if (selectedDeleteMedia) {
              try {
                await deleteMedia(selectedDeleteMedia.id).unwrap();
                handleDeleteSuccess();
              } catch {
                handleDeleteError();
              }
            }
          }}
        />
      </Card>
    </Spin>
  );
};

export default MediaLibrary;
