import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Role } from '../../../types/user';

const { Option } = Select;

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
}: UserSearchFiltersProps) => (
    <Space size="large" style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 16 }}>
        <Input.Group compact>
            <Select
                defaultValue="firstName"
                style={{ width: 120 }}
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
                style={{ width: 200 }}
            />
        </Input.Group>
        <Select
            allowClear
            style={{ width: 200 }}
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