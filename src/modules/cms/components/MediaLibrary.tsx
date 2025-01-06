import React, { useState, useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    Card,
    Button,
    Modal,
    Upload,
    Typography,
    Row,
    Col,
    Input,
    Pagination,
    Space,
    Tooltip,
    Progress,
    Table,
    Spin,
} from 'antd';
import {
    UploadOutlined,
    DeleteOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    SelectOutlined,
    UserOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    VideoCameraOutlined,
    FilePdfOutlined,
} from '@ant-design/icons';
import { getCmsHooks } from '@src/modules/cms/store/services/cmsApi';
import { MessageContext } from '@contexts/MessageContext';
import MediaFilterBar from './MediaFilterBar'; // <-- Make sure you have this component
import type {
    DynamicQueryRequest,
    Media,
} from '@src/modules/cms/store/services/cmsApi';
import { setLoading } from '@src/store/slices/uiSlice';

interface MediaLibraryProps {
    onSelect?: (url: string, alt: string) => void;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect }) => {
    const {
        useGetAllMediaDynamicQuery,
        useUploadMediaMutation,
        useDeleteMediaMutation,
    } = getCmsHooks();

    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [dynamicRequest, setDynamicRequest] = useState<DynamicQueryRequest>({
        sort: [{ field: 'uploadedAt', dir: 'desc' }],
        filter: null,
    });

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
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [isGridView, setIsGridView] = useState(true);
    const [altTextInput, setAltTextInput] = useState<string>('');
    const [altModalVisible, setIsAltModalVisible] = useState(false);
    const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>('');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedDeleteMedia, setSelectedDeleteMedia] = useState<Media | null>(null);
    const [searchTerm] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const dispatch = useDispatch();

    useEffect(() => {
        if (isFetching) {
            dispatch(setLoading(true));
        } else {
            dispatch(setLoading(false));
        }
    }, [dispatch, isFetching]);

    const handleUpload = async ({ file }: { file: File }) => {
        setSelectedFile(file);
        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);

        const simulateProgress = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 99) {
                    clearInterval(simulateProgress);
                    return prev;
                }
                return prev + 1;
            });
        }, 20);

        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            clearInterval(simulateProgress);
            messageApi?.error('Only image and video files are allowed.');
            setIsUploading(false);
            setSelectedFile(null);
            setUploadProgress(0);
            return;
        }

        try {
            await uploadMedia(formData).unwrap();
            clearInterval(simulateProgress);
            setUploadProgress(100);

            setTimeout(() => {
                messageApi?.success('Media uploaded successfully');
                refetch();
                setUploadModalVisible(false);
                setIsUploading(false);
                setSelectedFile(null);
                setUploadProgress(0);
            }, 500);
        } catch (error: any) {
            clearInterval(simulateProgress);
            if (Array.isArray(error?.data?.errors[''])) {
                error?.data?.errors[''].forEach((err: any) => {
                    messageApi?.error(err);
                });
            } else {
                messageApi?.error('Failed to upload media');
            }
            console.log(error?.data?.errors);
            setIsUploading(false);
            setSelectedFile(null);
            setUploadProgress(0);
        }
    };

    const handleDelete = (media: Media) => {
        setSelectedDeleteMedia(media);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteModalOk = async () => {
        if (selectedDeleteMedia) {
            try {
                await deleteMedia(selectedDeleteMedia.id).unwrap();
                messageApi?.success('Media deleted successfully');
                refetch();
                setIsDeleteModalVisible(false);
                setSelectedDeleteMedia(null);
            } catch (error: any) {
                messageApi?.error('Failed to delete media');
            }
        }
    };

    const handleDeleteModalCancel = () => {
        setIsDeleteModalVisible(false);
        setSelectedDeleteMedia(null);
    };

    const handleSelect = (url: string) => {
        setSelectedMediaUrl(url);
        setAltTextInput('');
        setIsAltModalVisible(true);
    };

    const handleAltModalOk = () => {
        if (altTextInput.trim() === '') {
            messageApi?.error('Alt text cannot be empty.');
            return;
        }
        onSelect?.(selectedMediaUrl, altTextInput.trim());
        setIsAltModalVisible(false);
        setSelectedMediaUrl('');
        setAltTextInput('');
    };

    const handleAltModalCancel = () => {
        setIsAltModalVisible(false);
        setSelectedMediaUrl('');
        setAltTextInput('');
    };

    // Preview
    const handlePreview = (url: string) => {
        setSelectedMediaUrl(url);
        setPreviewVisible(true);
    };

    const handlePreviewModalClose = () => {
        const videoElement = document.querySelector('.preview-modal video') as HTMLVideoElement;
        if (videoElement) {
            videoElement.pause();
        }
        setPreviewVisible(false);
    };

    // Helper
    const formatSize = (size: number) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    };

    // Media items from the dynamic query
    const mediaList = mediaData?.items || [];
    const totalCount = mediaData?.totalCount || 0;

    // Optional local client filter
    const filteredMediaList = mediaList.filter((m) =>
        m.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Display helper
    const MetaDataDescription = ({ media }: { media: Media }) => (
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
    );

    const handleTableChange = (sorter: { field: string; order: 'ascend' | 'descend' }) => {
        if (sorter) {
            setDynamicRequest((prev) => ({
                ...prev,
                sort: [{
                    field: sorter.field,
                    dir: sorter.order === 'ascend' ? 'asc' : 'desc'
                }]
            }));
        }
    };

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
                {/* (A) The new advanced filter & sort UI */}
                <MediaFilterBar
                    isGridView={isGridView}
                    onChange={(req) => {
                        setDynamicRequest(req);
                        setPageIndex(0);
                    }}
                />

                {isGridView ? (
                    <Row gutter={[16, 16]}>
                        {filteredMediaList.length > 0 ? (
                            filteredMediaList.map((media: Media) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={media.id}>
                                    <Card
                                        hoverable
                                        cover={
                                            media.contentType.startsWith('image/') ? (
                                                <img
                                                    src={media.blobUri}
                                                    alt={media.fileName}
                                                    style={{ height: '150px', objectFit: 'cover' }}
                                                    loading="lazy"
                                                    onClick={() => handlePreview(media.blobUri)}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        height: '150px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: '#f0f2f5',
                                                    }}
                                                    onClick={() => handlePreview(media.blobUri)}
                                                >
                                                    {media.contentType.startsWith('video/') ? (
                                                        <VideoCameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                                                    ) : media.contentType === 'application/pdf' ? (
                                                        <FilePdfOutlined style={{ fontSize: '48px', color: '#f5222d' }} />
                                                    ) : (
                                                        <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                                                    )}
                                                </div>
                                            )
                                        }
                                        actions={[
                                            <Space align="center" key="actions">
                                                {onSelect && (
                                                    <Button
                                                        icon={<SelectOutlined />}
                                                        onClick={() => handleSelect(media.blobUri)}
                                                        type="link"
                                                    >
                                                        Select
                                                    </Button>
                                                )}
                                                <Button
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleDelete(media)}
                                                    type="link"
                                                >
                                                    Delete
                                                </Button>
                                            </Space>,
                                        ]}
                                    >
                                        <Card.Meta
                                            title={<Typography.Text ellipsis>{media.fileName}</Typography.Text>}
                                            description={<MetaDataDescription media={media} />}
                                        />
                                    </Card>
                                </Col>
                            ))
                        ) : (
                            <Col span={24}>
                                <Typography.Text type="secondary">No media found.</Typography.Text>
                            </Col>
                        )}
                    </Row>
                ) : (
                    <Table
                        columns={[
                            {
                                title: 'File Name',
                                dataIndex: 'fileName',
                                sorter: true,
                            },
                            {
                                title: 'Uploaded By',
                                dataIndex: 'uploadedBy',
                                sorter: true,
                            },
                            {
                                title: 'Size',
                                dataIndex: 'size',
                                sorter: true,
                                render: (size) => formatSize(size),
                            },
                            {
                                title: 'Uploaded At',
                                dataIndex: 'uploadedAt',
                                sorter: true,
                                render: (date) => new Date(date).toLocaleString(),
                            },
                        ]}
                        dataSource={filteredMediaList}
                        onChange={handleTableChange}
                        loading={isFetching}
                        pagination={false}
                        locale={{ emptyText: 'No media found.' }}
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
                <Modal
                    title="Upload Media"
                    visible={uploadModalVisible}
                    onCancel={() => {
                        setUploadModalVisible(false);
                        setIsUploading(false);
                        setSelectedFile(null);
                        setUploadProgress(0);
                    }}
                    footer={null}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Upload
                            customRequest={handleUpload}
                            showUploadList={false}
                            multiple={false}
                            accept="image/*,video/*"
                            disabled={isUploading}
                        >
                            <Button icon={<UploadOutlined />} disabled={isUploading}>
                                {isUploading ? 'Uploading...' : 'Select File'}
                            </Button>
                        </Upload>

                        {selectedFile && (
                            <Typography.Text type="secondary">
                                Selected file: {selectedFile.name}
                            </Typography.Text>
                        )}

                        {isUploading && (
                            <Progress
                                percent={uploadProgress}
                                status={uploadProgress === 100 ? 'success' : 'active'}
                                strokeColor={{
                                    '0%': '#108ee9',
                                    '100%': '#87d068',
                                }}
                            />
                        )}
                    </Space>
                </Modal>

                {/* Alt Text Modal */}
                <Modal
                    title="Enter Alt Text"
                    visible={altModalVisible}
                    onOk={handleAltModalOk}
                    onCancel={handleAltModalCancel}
                    okText="Confirm"
                    cancelText="Cancel"
                    okButtonProps={{ type: 'primary' }}
                >
                    <Input
                        placeholder="Enter alt text for the image"
                        value={altTextInput}
                        onChange={(e) => setAltTextInput(e.target.value)}
                    />
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal
                    title="Confirm Deletion"
                    visible={isDeleteModalVisible}
                    onOk={handleDeleteModalOk}
                    onCancel={handleDeleteModalCancel}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ type: 'primary', danger: true }}
                >
                    {selectedDeleteMedia && (
                        <Typography.Text>
                            Are you sure you want to delete <strong>{selectedDeleteMedia.fileName}</strong>?
                        </Typography.Text>
                    )}
                </Modal>

                {/* Preview Modal */}
                <Modal
                    visible={previewVisible}
                    title="Preview"
                    footer={null}
                    onCancel={handlePreviewModalClose}
                    className="preview-modal"
                >
                    {selectedMediaUrl &&
                        (selectedMediaUrl.endsWith('.pdf') ? (
                            <embed src={selectedMediaUrl} width="100%" height="500" />
                        ) : selectedMediaUrl.endsWith('.jpg') ||
                            selectedMediaUrl.endsWith('.jpeg') ||
                            selectedMediaUrl.endsWith('.png') ||
                            selectedMediaUrl.endsWith('.webp') ? (
                            <img src={selectedMediaUrl} alt="Preview" style={{ width: '100%' }} />
                        ) : (
                            <video controls style={{ width: '100%' }}>
                                <source src={selectedMediaUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        ))}
                </Modal>
            </Card>
        </Spin>
    );
};

export default MediaLibrary;
