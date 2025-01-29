import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Space, Tooltip, Button, Flex } from 'antd';
import { ClearOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';
import type { DynamicQueryRequest, DynamicFilter, DynamicSort } from '../../store/services/cmsApi';

const { Option } = Select;

interface MediaFilterBarProps {
    isGridView: boolean;
    onChange: (req: DynamicQueryRequest) => void;
}

const MediaFilterBar: React.FC<MediaFilterBarProps> = ({ isGridView, onChange }) => {
    const [filterField, setFilterField] = useState<string>('fileName');
    const [filterValue, setFilterValue] = useState<string>('');
    const [sortField, setSortField] = useState<string>('uploadedAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

    const buildRequest = () => {
        let filterObj: DynamicFilter | null = null;
        if (filterField && filterValue) {
            let logicType = 'string';
            if (filterField === 'size') {
                logicType = 'number';
            }

            filterObj = {
                field: filterField,
                operator: "contains",
                value: filterValue,
                logic: logicType,
                isCaseSensitive: false
            };
        }

        const sortArr: DynamicSort[] = [
            { field: sortField, dir: sortDir }
        ];

        const requestBody: DynamicQueryRequest = {
            filter: filterObj,
            sort: sortArr
        };
        onChange(requestBody);
    };

    useEffect(() => {
        buildRequest();
    }, [filterField, filterValue, sortField, sortDir]);

    const handleReset = () => {
        setFilterField('fileName');
        setFilterValue('');
        setSortField('uploadedAt');
        setSortDir('asc');
        onChange({ sort: [{ field: 'uploadedAt', dir: 'desc' }], filter: null });
    };

    return (
        <Form layout="inline" style={{ marginBottom: 32 }}>
            <Flex wrap gap={16} align="start" justify='space-between' style={{ width: '100%' }}>
                <Space align="center">
                    <Tooltip title="Filter Field">
                        <Select
                            placeholder="Filter by..."
                            style={{ minWidth: 130 }}
                            value={filterField}
                            onChange={(val) => setFilterField(val)}
                            allowClear
                        >
                            <Option value="fileName">File Name</Option>
                            <Option value="uploadedBy">Uploader</Option>
                            <Option value="contentType">Content Type</Option>
                        </Select>
                    </Tooltip>

                    <Tooltip title="Filter Value">
                        <Input
                            placeholder="Enter filter value"
                            style={{ width: 180 }}
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                        />
                    </Tooltip>
                </Space>
                {isGridView &&
                    <Space align="center">
                        <Tooltip title="Sort Field">
                            <Select
                                style={{ minWidth: 130 }}
                                value={sortField}
                                onChange={(val) => setSortField(val)}
                            >
                                <Option value="uploadedAt">Uploaded Date</Option>
                                <Option value="size">Size</Option>
                                <Option value="fileName">File Name</Option>
                                <Option value="uploadedBy">Uploader</Option>
                            </Select>
                        </Tooltip>
                        <Tooltip title="Sort Direction">
                            <Button
                                icon={sortDir === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                                onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                            />
                        </Tooltip>
                        <Tooltip title="Reset">
                            <Button
                                icon={<ClearOutlined />}
                                onClick={handleReset}
                            />
                        </Tooltip>
                    </Space>
                }
            </Flex>
        </Form>
    );
};

export default MediaFilterBar;
