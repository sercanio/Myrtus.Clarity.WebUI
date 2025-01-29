import React from 'react';
import { Modal } from 'antd';
import MediaLibrary from '@src/modules/cms/components/Media/MediaLibrary';

interface MediaLibraryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (url: string, alt: string) => void;
  onSelectCoverImage: (url: string) => void;
}

const ContentMediaLibraryModal: React.FC<MediaLibraryModalProps> = ({
  visible,
  onClose,
  onSelect,
  onSelectCoverImage,
}) => {
  return (
    <Modal
      title="Media Library"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
    >
      <MediaLibrary
        onSelect={onSelect}
        onSelectCoverImage={onSelectCoverImage}
      />
    </Modal>
  );
};

export default ContentMediaLibraryModal;