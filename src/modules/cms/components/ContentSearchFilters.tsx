import { Space, Input, Select, Button, Card } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

interface ContentSearchFiltersProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export const ContentSearchFilters: React.FC<ContentSearchFiltersProps> = ({
  onRefresh,
  isLoading,
}) => {
  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space wrap>
        <Input
          placeholder="Search contents..."
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
        />
        <Select
          defaultValue="title"
          style={{ width: 120 }}
          options={[
            { value: 'title', label: 'Title' },
            { value: 'body', label: 'Content' },
            { value: 'tags', label: 'Tags' },
          ]}
        />
        <Select
          placeholder="Content Type"
          style={{ width: 120 }}
          allowClear
          options={[
            { value: 'page', label: 'Page' },
            { value: 'blog', label: 'Blog Post' },
            { value: 'news', label: 'News' },
          ]}
        />
        <Select
          placeholder="Status"
          style={{ width: 120 }}
          allowClear
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'archived', label: 'Archived' },
          ]}
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={isLoading}
        />
      </Space>
    </Card>
  );
};
