import React from 'react';
import { Modal, Typography } from 'antd';

interface ConfirmDeleteModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  onConfirm,
  onCancel,
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
      <Typography.Text>
        Are you sure you want to delete this content? This action cannot be undone.
      </Typography.Text>
    </Modal>
  );
};

export default ConfirmDeleteModal;