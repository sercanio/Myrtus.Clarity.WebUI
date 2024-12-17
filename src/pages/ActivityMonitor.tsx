import React, { useState, useEffect } from 'react';
import { Table, Select, message, Grid, Card, Layout } from 'antd';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { ColumnsType } from 'antd/es/table';
import FormattedDate from '@components/FormattedDate';

const { Option } = Select;
const { useBreakpoint } = Grid;
const { Content } = Layout;

interface Log {
    Id: string;
    User: string;
    Action: string;
    Timestamp: string;
    Details: string;
    IpAddress: string;
}

const columns: ColumnsType<Log> = [
    {
        title: 'User',
        dataIndex: 'User',
        key: 'User',
    },
    {
        title: 'Action',
        dataIndex: 'Action',
        key: 'Action',
    },
    {
        title: 'Entity',
        dataIndex: 'Entity',
        key: 'Entity',
    },
    {
        title: 'Entity Id',
        dataIndex: 'EntityId',
        key: 'EntityId',
    },
    {
        title: 'Timestamp',
        dataIndex: 'Timestamp',
        key: 'Timestamp',
        render: (text: string) => <FormattedDate date={text} />
    },
    {
        title: 'Details',
        dataIndex: 'Details',
        key: 'Details',
    }
];

const ActivityMonitor: React.FC = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [logSize, setLogSize] = useState<number>(10);
    const screens = useBreakpoint();

    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl('https://localhost:5001/auditLogHub')
            .configureLogging(LogLevel.Information)
            .build();

        connection.start()
            .then(() => {
                console.log('SignalR Connected!');
            })
            .catch(err => {
                console.error('SignalR Connection Error: ', err);
                message.error('Failed to connect to the log server.');
            });

        connection.on('ReceiveAuditLog', (message: string) => {
            const newLog: Log = JSON.parse(message);
            setLogs((prevLogs) => {
                const updatedLogs = [newLog, ...prevLogs];
                return updatedLogs.slice(0, logSize);
            });
        });

        return () => {
            connection.stop();
        };
    }, [logSize]);

    return (
        <Layout style={{ background: 'transparent', padding: 0 }}>
            <Content style={{ padding: 0, width: '100%' }}>
                <Card
                    title="Realtime Activity Monitor"
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
                    <div style={{ padding: screens.xs ? '8px' : '16px' }}>
                        <Select
                            defaultValue={10}
                            style={{ width: screens.xs ? '100%' : 120, margin: '16px 0' }}
                            onChange={(value) => setLogSize(value)}
                        >
                            <Option value={10}>10 logs</Option>
                            <Option value={20}>20 logs</Option>
                            <Option value={50}>50 logs</Option>
                            <Option value={100}>100 logs</Option>
                        </Select>
                        <div style={{ overflowX: 'auto' }}>
                            <Table columns={columns} dataSource={logs} pagination={false} rowKey="Id" />
                        </div>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
};

export default ActivityMonitor;