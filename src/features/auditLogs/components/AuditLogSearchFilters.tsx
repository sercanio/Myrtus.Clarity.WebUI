import { Input, Select, Space, Grid, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { useBreakpoint } = Grid;

interface AuditLogSearchFiltersProps {
    onSearchFieldChange: (value: string) => void;
    onSearchTextChange: (value: string) => void;
    onRefresh: () => void;
    isLoading: boolean;
}

export const AuditLogSearchFilters = ({
    onSearchFieldChange,
    onSearchTextChange,
    onRefresh,
    isLoading
}: AuditLogSearchFiltersProps) => {
    const screens = useBreakpoint();

    return (
        <Space
            size="large"
            direction={screens.xs ? 'vertical' : 'horizontal'}
            style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 16 }}
        >
            <Input.Group compact style={{ display: 'flex', flexDirection: screens.xs ? 'column' : 'row', gap: '8px' }}>
                <Select
                    defaultValue="action"
                    style={{ width: screens.xs ? '100%' : 120, margin: screens.xs ? '12px 0' : 0 }}
                    onChange={onSearchFieldChange}
                >
                    <Option value="user">User</Option>
                    <Option value="action">Action</Option>
                    <Option value="entity">Entity</Option>
                </Select>
                <Input
                    placeholder="Search logs..."
                    prefix={<SearchOutlined />}
                    onChange={e => onSearchTextChange(e.target.value)}
                    style={{ width: screens.xs ? '100%' : 200 }}
                    allowClear
                />
                <Button
                    icon={<ReloadOutlined />}
                    onClick={onRefresh}
                    loading={isLoading}
                    disabled={isLoading}
                    style={{ width: screens.xs ? '100%' : 'auto' }}
                >
                    Refresh
                </Button>
            </Input.Group>
        </Space>
    );
};
