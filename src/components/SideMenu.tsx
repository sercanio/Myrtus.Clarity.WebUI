import React from 'react';
import { Menu } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const items: MenuProps['items'] = [
    {
        key: 'user-management',
        icon: <UserOutlined />,
        label: 'User Management',
        children: [
            {
                key: 'users',
                icon: <TeamOutlined />,
                label: 'Users',
            },
            {
                key: 'roles',
                icon: <TeamOutlined />,
                label: 'Roles',
            },
        ],
    },
];

const SideMenu: React.FC = () => {
    const onClick: MenuProps['onClick'] = (e) => {
        console.log('clicked ', e);
    };

    return (
        <Menu
            onClick={onClick}
            mode="inline"
            defaultSelectedKeys={['users']}
            defaultOpenKeys={['user-management']}
            style={{ width: "100%" }}
            items={items}
        />
    );
};

export default SideMenu; 