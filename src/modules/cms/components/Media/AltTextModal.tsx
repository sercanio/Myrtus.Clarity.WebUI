import React, { useState } from 'react';
import { Modal, Input } from 'antd';

interface AltTextModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (altText: string) => void;
}

const AltTextModal: React.FC<AltTextModalProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  const [altText, setAltText] = useState<string>('');

  const handleOk = () => {
    if (!altText.trim()) {
      // You can add a notification or validation message here
      return;
    }
    onConfirm(altText.trim());
    setAltText('');
  };

  const handleCancel = () => {
    onCancel();
    setAltText('');
  };

  return (
    <Modal
      title="Enter Alt Text"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="Confirm"
      cancelText="Cancel"
      okButtonProps={{ type: 'primary' }}
    >
      <Input
        placeholder="Enter alt text for the image"
        value={altText}
        onChange={(e) => setAltText(e.target.value)}
      />
    </Modal>
  );
};

export default AltTextModal;
