import React from 'react';
import { Modal, Typography } from 'antd';
import type { Media } from '@src/modules/cms/store/services/cmsApi';

interface DeleteConfirmationModalProps {
  visible: boolean;
  media: Media | null;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  visible,
  media,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      title="Confirm Deletion"
      visible={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Delete"
      cancelText="Cancel"
      okButtonProps={{ type: 'primary', danger: true }}
    >
      {media && (
        <Typography.Text>
          Are you sure you want to delete <strong>{media.fileName}</strong>?
        </Typography.Text>
      )}
    </Modal>
  );
};

export default DeleteConfirmationModal;
