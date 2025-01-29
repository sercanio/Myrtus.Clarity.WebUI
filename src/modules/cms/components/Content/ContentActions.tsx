import React from 'react';
import { Button, Space } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
} from '@ant-design/icons';

interface ContentActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onViewVersions: () => void;
}

const ContentActions: React.FC<ContentActionsProps> = ({
  onEdit,
  onDelete,
  onViewVersions,
}) => {
  return (
    <Space size="small">
      <Button
        type="default"
        icon={<EditOutlined />}
        title="Edit"
        onClick={onEdit}
        size="small"
      />
      <Button
        danger
        icon={<DeleteOutlined />}
        title="Delete"
        onClick={onDelete}
        size="small"
      />
      <Button
        type="default"
        icon={<HistoryOutlined />}
        title="View Versions"
        onClick={onViewVersions}
        size="small"
      />
    </Space>
  );
};

export default ContentActions;