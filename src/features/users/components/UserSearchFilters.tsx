import { Input, Select, Space, Grid, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Role } from '@/types/role';

const { Option } = Select;
const { useBreakpoint } = Grid;

interface UserSearchFiltersProps {
    onSearchFieldChange: (value: string) => void;
    onSearchTextChange: (value: string) => void;
    onRoleFilterChange: (roleId: string | undefined) => void;
    selectedRoleId?: string;
    roles?: Role[];
    onRefresh: () => void;
    isLoading: boolean;
}

export const UserSearchFilters = ({
    onSearchFieldChange,
    onSearchTextChange,
    onRoleFilterChange,
    selectedRoleId,
    roles,
    onRefresh,
    isLoading
}: UserSearchFiltersProps) => {
    const screens = useBreakpoint();

    return (
        <Space
            size="large"
            direction={screens.xs ? 'vertical' : 'horizontal'}
            style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 16 }}
        >
            <Input.Group compact style={{ display: 'flex', flexDirection: screens.xs ? 'column' : 'row', gap: '8px' }}>
                <Select
                    defaultValue="firstName"
                    style={{ width: screens.xs ? '100%' : 120, margin: screens.xs ? '12px 0' : 0 }}
                    onChange={onSearchFieldChange}
                >
                    <Option value="firstName">First Name</Option>
                    <Option value="lastName">Last Name</Option>
                    <Option value="email">Email</Option>
                </Select>
                <Input
                    placeholder="Search users..."
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
            <Select
                allowClear
                style={{ width: screens.xs ? '100%' : 200 }}
                placeholder="Filter by role"
                onChange={onRoleFilterChange}
                value={selectedRoleId}
            >
                {roles?.map(role => (
                    <Select.Option key={role.id} value={role.id}>
                        {role.name}
                    </Select.Option>
                ))}
            </Select>
        </Space>
    );
};