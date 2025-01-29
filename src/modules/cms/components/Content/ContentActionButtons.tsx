import React from 'react';
import { Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

interface ActionButtonsProps {
  onCreate: () => void;
}

const ContentActionButtons: React.FC<ActionButtonsProps> = ({ onCreate }) => {
  const navigate = useNavigate();

  return (
    <Space size="middle" style={{ marginTop: 48 }}>
      <Button type="primary" htmlType="submit" onClick={onCreate}>
        Create
      </Button>
      <Button onClick={() => navigate('/cms/contents')}>
        Cancel
      </Button>
    </Space>
  );
};

export default ContentActionButtons;