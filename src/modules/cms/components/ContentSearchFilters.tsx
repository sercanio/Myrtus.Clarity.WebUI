import { Space, Input, Select, Button, Card, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, ClearOutlined } from '@ant-design/icons';
import { useState, useEffect, useCallback } from 'react';
import type { DynamicQueryRequest } from '../store/services/cmsApi';

interface ContentSearchFiltersProps {
  onRefresh: () => void;
  isLoading: boolean;
  onChange: (req: DynamicQueryRequest) => void;
}

export const ContentSearchFilters: React.FC<ContentSearchFiltersProps> = ({
  onRefresh,
  isLoading,
  onChange,
}) => {
  const [filterField, setFilterField] = useState<string>('title');
  const [filterValue, setFilterValue] = useState<string>('');

  const handleFilterChange = useCallback(() => {
    const req: DynamicQueryRequest = {
      filter: filterField && filterValue ? {
        field: filterField,
        operator: 'contains',
        value: filterValue,
        logic: 'string',
        isCaseSensitive: false,
      } : null,
      sort: [],
    };
    onChange(req);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterField, filterValue]);

  useEffect(() => {
    handleFilterChange();
  }, [handleFilterChange]);

  return (
    <Card size="small" style={{ marginBottom: 16 }}>
      <Space wrap>
        <Input
          placeholder="Search contents..."
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        <Select
          defaultValue="title"
          style={{ width: 120 }}
          options={[
            { value: 'title', label: 'Title' },
            { value: 'body', label: 'Content' },
          ]}
          onChange={(value) => setFilterField(value)}
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
        <Tooltip title="Clear Filters">
          <Button
            icon={<ClearOutlined />}
            onClick={() => {
              setFilterField('title');
              setFilterValue('');
            }}
          />
        </Tooltip>
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={isLoading}
        />
      </Space>
    </Card>
  );
};
