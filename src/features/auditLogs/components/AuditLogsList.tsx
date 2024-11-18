import React, { useState, useMemo } from 'react';
import { Table, Card, Pagination, Select, Grid, Space, Input } from 'antd';
import { useGetAuditLogsDynamicQuery } from '../../../store/services/auditLogApi';
import debounce from 'lodash/debounce';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { AuditLog } from '../../../types/auditLog';
import { SearchOutlined } from '@ant-design/icons';
import FormattedDate from '../../../components/FormattedDate';

const { Option } = Select;
const { useBreakpoint } = Grid;

const AuditLogsList: React.FC = () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [searchField, setSearchField] = useState('action');
    const [sortField, setSortField] = useState<string | null>("timestamp");
    const [sortDirection, setSortDirection] = useState<string | null>("desc");

    const buildFilterDescriptor = (text: string, field: string) => {
        if (!text) return undefined;
        return {
            field,
            operator: 'contains',
            value: text,
            isCaseSensitive: false
        };
    };

    const { data: auditLogs, isFetching: isLoading } = useGetAuditLogsDynamicQuery({
        pageIndex,
        pageSize,
        sort: sortField && sortDirection ? [{ field: sortField, dir: sortDirection }] : undefined,
        filter: buildFilterDescriptor(searchText, searchField)
    });

    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            setSearchText(value);
        }, 500),
        []
    );

    const handleTableChange: TableProps<AuditLog>['onChange'] = (_pagination, _filters, sorter) => {
        if ('field' in sorter && 'order' in sorter) {
            setSortField(sorter.field as string);
            setSortDirection(sorter.order === 'ascend' ? 'asc' : 'desc');
        } else {
            setSortField(null);
            setSortDirection(null);
        }
    };

    const columns: ColumnsType<AuditLog> = [
        { title: 'User', dataIndex: 'user', key: 'user', sorter: true },
        { title: 'Action', dataIndex: 'action', key: 'action', sorter: true },
        { title: 'Entity', dataIndex: 'entity', key: 'entity' },
        { title: 'Entity Id', dataIndex: 'entityId', key: 'entityId' },
        { 
            title: 'Timestamp', 
            dataIndex: 'timestamp', 
            key: 'timestamp', 
            sorter: true,
            render: (text: string) => <FormattedDate date={text} />
        },
        { title: 'Details', dataIndex: 'details', key: 'details' },
    ];

    const screens = useBreakpoint();

    return (
        <>
            <Card
                title="Audit Logs"
                style={{
                    margin: screens.xs ? '2px 0px' : '2px 16px',
                    padding: screens.xs ? '4px 0px' : '4px',
                }}
                bodyStyle={{
                    padding: screens.xs ? '4px' : '16px',
                }}
                headStyle={{
                    padding: screens.xs ? '4px 6px' : '4px',
                }}
            >
                <Space
                    size="large"
                    direction={screens.xs ? 'vertical' : 'horizontal'}
                    style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: 16 }}
                ></Space>
                <Input.Group compact style={{ display: 'flex', flexDirection: screens.xs ? 'column' : 'row', margin: '16px 0 32px 0' }}>
                    <Select
                        defaultValue="action"
                        style={{ width: screens.xs ? '100%' : 120, margin: screens.xs ? '12px 0' : 0 }}
                        onChange={setSearchField}
                    >
                        <Option value="user">User</Option>
                        <Option value="action">Action</Option>
                        <Option value="entity">Entity</Option>
                    </Select>
                    <Input
                        placeholder="Search logs..."
                        prefix={<SearchOutlined />}
                        onChange={e => debouncedSearch(e.target.value)}
                        style={{ width: screens.xs ? '100%' : 200 }} />
                </Input.Group>
                <Table<AuditLog>
                    columns={columns}
                    dataSource={auditLogs?.items}
                    loading={isLoading}
                    rowKey="id"
                    pagination={false}
                    onChange={handleTableChange}
                    style={{ width: '100%', overflowX: 'auto' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 16 }}>
                    <Pagination
                        current={pageIndex + 1}
                        pageSize={pageSize}
                        total={auditLogs?.totalCount}
                        onChange={(page, newPageSize) => {
                            setPageIndex(page - 1);
                            setPageSize(newPageSize);
                        }}
                        responsive
                    />
                    <Select
                        value={pageSize}
                        onChange={(value) => setPageSize(value)}
                        style={{ width: 100, marginLeft: 16 }}
                    >
                        <Select.Option value={5}>5 / page</Select.Option>
                        <Select.Option value={10}>10 / page</Select.Option>
                        <Select.Option value={20}>20 / page</Select.Option>
                        <Select.Option value={50}>50 / page</Select.Option>
                        <Select.Option value={100}>100 / page</Select.Option>
                    </Select>
                </div>
            </Card>
        </>
    );
};

export default AuditLogsList;