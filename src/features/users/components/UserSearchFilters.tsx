import { Input, Select, Space, Grid } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { Role } from '@types/role';

const { Option } = Select;
const { useBreakpoint } = Grid;

interface UserSearchFiltersProps {
    onSearchFieldChange: (value: string) => void;
    onSearchTextChange: (value: string) => void;
    onRoleFilterChange: (roleId: string | undefined) => void;
    selectedRoleId?: string;
    roles?: Role[];
}

export const UserSearchFilters = ({
    onSearchFieldChange,
    onSearchTextChange,
    onRoleFilterChange,
    selectedRoleId,
    roles
}: UserSearchFiltersProps) => {
    const screens = useBreakpoint();

    return (
        <Space
            size="large"
            direction={screens.xs ? 'vertical' : 'horizontal'}
            style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 16 }}
        >
            <Input.Group compact style={{ display: 'flex', flexDirection: screens.xs ? 'column' : 'row' }}>
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
                />
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