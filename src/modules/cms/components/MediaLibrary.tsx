import React, { useState, useContext } from 'react';
import { Card, Button, List, Modal, Upload, message, Typography, Row, Col, Flex } from 'antd';
import { UploadOutlined, DeleteOutlined, AppstoreOutlined, UnorderedListOutlined, SelectOutlined } from '@ant-design/icons';
import { getCmsHooks } from '@src/modules/cms/store/services/cmsApi';
import { MessageContext } from '@contexts/MessageContext';

interface Media {
    id: string;
    fileName: string;
    blobUri: string;
    contentType: string;
    size: number;
    uploadedAt: string;
    uploadedBy: string;
}

interface MediaLibraryProps {
    onSelect: (url: string) => void;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onSelect }) => {
    const { useGetAllMediaQuery, useUploadMediaMutation, useDeleteMediaMutation } = getCmsHooks();
    const { data: mediaList, refetch } = useGetAllMediaQuery();
    const [uploadMedia] = useUploadMediaMutation();
    const [deleteMedia] = useDeleteMediaMutation();
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [isGridView, setIsGridView] = useState(true);
    const messageApi = useContext(MessageContext);

    const handleUpload = async ({ file }: any) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            await uploadMedia(formData).unwrap();
            messageApi?.success('Media uploaded successfully');
            refetch();
            setUploadModalVisible(false);
        } catch (error) {
            messageApi?.error('Failed to upload media');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteMedia(id).unwrap();
            messageApi?.success('Media deleted successfully');
            refetch();
        } catch (error) {
            messageApi?.error('Failed to delete media');
        }
    };

    const handleSelect = (url: string) => {
        onSelect(url);
    };

    const formatSize = (size: number) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
        return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <Card
            title="Media Library"
            extra={
                <Flex align="center">
                    <Button
                        icon={isGridView ? <UnorderedListOutlined /> : <AppstoreOutlined />}
                        onClick={() => setIsGridView(!isGridView)}
                        style={{ marginRight: 16 }}
                    />
                    <Button onClick={() => setUploadModalVisible(true)}>Upload Media</Button>
                </Flex>
            }
        >
            {isGridView ? (
                <Row gutter={[16, 16]}>
                    {Array.isArray(mediaList) && mediaList.map((media: Media) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={media.id}>
                            <Card
                                cover={
                                    media.contentType.startsWith('image/') && (
                                        <img src={media.blobUri} alt={media.fileName} style={{ height: '120px', objectFit: 'cover' }} />
                                    )
                                }
                                actions={[
                                    <Flex align="center" justify="space-around">
                                        <Button icon={<SelectOutlined />} onClick={() => onSelect(media.blobUri)}>Select</Button>
                                        <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(media.id)} />
                                    </Flex>
                                ]}
                            >
                                <Card.Meta
                                    title={media.fileName}
                                    description={
                                        <>
                                            <Typography.Text>Size: {formatSize(media.size)}</Typography.Text>
                                            <br />
                                            <Typography.Text>Uploaded at: {new Date(media.uploadedAt).toLocaleString()}</Typography.Text>
                                            <br />
                                            <Typography.Text>Uploaded by: {media.uploadedBy}</Typography.Text>
                                        </>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <List
                    dataSource={Array.isArray(mediaList) ? mediaList : []}
                    renderItem={(media: Media) => (
                        <List.Item
                            actions={[
                                <Flex align="center" justify="space-around">
                                    <Button icon={<SelectOutlined />} onClick={() => onSelect(media.blobUri)}>Select</Button>
                                    <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(media.id)} />
                                </Flex>
                            ]}
                        >
                            <List.Item.Meta
                                title={media.fileName}
                                description={
                                    <>
                                        <Typography.Text>Size: {formatSize(media.size)}</Typography.Text>
                                        <br />
                                        <Typography.Text>Uploaded at: {new Date(media.uploadedAt).toLocaleString()}</Typography.Text>
                                        <br />
                                        <Typography.Text>Uploaded by: {media.uploadedBy}</Typography.Text>
                                    </>
                                }
                            />
                            {media.contentType.startsWith('image/') && (
                                <img src={media.blobUri} alt={media.fileName} style={{ maxWidth: '100px', maxHeight: '100px' }} />
                            )}
                        </List.Item>
                    )}
                />
            )}
            <Modal
                title="Upload Media"
                visible={uploadModalVisible}
                onCancel={() => setUploadModalVisible(false)}
                footer={null}
            >
                <Upload customRequest={handleUpload} showUploadList={false}>
                    <Button icon={<UploadOutlined />}>Select File</Button>
                </Upload>
            </Modal>
        </Card>
    );
};

export default MediaLibrary;
