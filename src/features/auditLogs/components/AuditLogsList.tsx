import React, { useState, useMemo } from 'react';
import { Table, Card, Pagination, Select, Grid, Input, Layout, Button } from 'antd';
import { useGetAuditLogsQuery, useGetAuditLogsDynamicQuery } from '@store/services/auditLogApi';
import debounce from 'lodash/debounce';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { AuditLog } from '@types/auditLog';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import FormattedDate from '@components/FormattedDate';
import { AuditLogSearchFilters } from './AuditLogSearchFilters';

const { Option } = Select;
const { useBreakpoint } = Grid;
const { Content } = Layout;

const AuditLogsList: React.FC = () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [searchField, setSearchField] = useState('action');
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<string | null>(null);
    const [hasUserSorted, setHasUserSorted] = useState(false);

    const buildFilterDescriptor = (text: string, field: string) => {
        if (!text) return undefined;
        return {
            field,
            operator: 'contains',
            value: text,
            isCaseSensitive: false
        };
    };

    const shouldUseDynamicQuery = Boolean(searchText || (hasUserSorted && sortField));

    const {
        data: auditLogs, 
        isFetching: isLogListLoading,
        refetch: refetchNormalQuery
    } = useGetAuditLogsQuery(
        { pageIndex, pageSize },
        { skip: shouldUseDynamicQuery }
    );

    const { 
        data: auditLogsDynamic, 
        isFetching: isDynamicLogListLoading,
        refetch: refetchDynamicQuery 
    } = useGetAuditLogsDynamicQuery(
        {
            pageIndex,
            pageSize,
            sort: sortField && sortDirection ? [{ field: sortField, dir: sortDirection }] : undefined,
            filter: buildFilterDescriptor(searchText, searchField)
        },
        { skip: !shouldUseDynamicQuery }
    );

    const currentData = shouldUseDynamicQuery ? auditLogsDynamic : auditLogs;
    const isLoading = shouldUseDynamicQuery ? isDynamicLogListLoading : isLogListLoading;

    const debouncedSearch = useMemo(
        () => debounce((value: string) => {
            setSearchText(value);
            // Reset to first page when search is cleared
            if (!value) {
                setPageIndex(0);
                // Ensure we're using the normal query by resetting sort state
                setHasUserSorted(false);
                setSortField(null);
                setSortDirection(null);
            }
        }, 500),
        []
    );

    const handleTableChange: TableProps<AuditLog>['onChange'] = (_pagination, _filters, sorter) => {
        setHasUserSorted(true);
        if ('field' in sorter && 'order' in sorter) {
            setSortField(sorter.field as string);
            setSortDirection(sorter.order === 'ascend' ? 'asc' : 'desc');
        } else {
            setSortField(null);
            setSortDirection(null);
        }
    };

    const handleRefresh = () => {
        if (searchText) {
            // If there's search text, just refresh the dynamic query
            refetchDynamicQuery();
        } else {
            // If no search text, reset states and refresh normal query
            setPageIndex(0);
            setHasUserSorted(false);
            setSortField(null);
            setSortDirection(null);
            setTimeout(() => refetchNormalQuery(), 0);
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
        <Layout style={{ background: 'transparent', padding: 0 }}>
            <Content style={{ padding: 0, width: '100%' }}>
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
                    <AuditLogSearchFilters
                        onSearchFieldChange={setSearchField}
                        onSearchTextChange={debouncedSearch}
                        onRefresh={handleRefresh}
                        isLoading={isLoading}
                    />
                    <Table<AuditLog>
                        columns={columns}
                        dataSource={currentData?.items}
                        loading={isLoading}
                        rowKey="id"
                        pagination={false}
                        onChange={handleTableChange}
                        style={{ width: '100%', overflowX: 'auto' }}
                    />
                    <Pagination
                        current={pageIndex + 1}
                        pageSize={pageSize}
                        total={currentData?.totalCount}
                        onChange={(page, newPageSize) => {
                            setPageIndex(page - 1);
                            setPageSize(newPageSize);
                        }}
                        showSizeChanger
                        showTotal={total => `${total} Logs in total`}
                        responsive
                        style={{ 
                            marginTop: 16,
                            textAlign: 'right',
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    />
                </Card>
            </Content>
        </Layout>
    );
};

export default AuditLogsList;