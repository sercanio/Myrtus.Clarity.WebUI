import React from 'react';
import { Tabs, Typography } from 'antd';
import ActivityMonitor from './ActivityMonitor';
import AuditLogsList from '@features/auditLogs/components/AuditLogsList';

const { TabPane } = Tabs;

const AuditLogs: React.FC = () => {
    return (
        <>
        <Typography.Title level={2}>
            Auditing
        </Typography.Title>
        <Tabs defaultActiveKey="1">
            <TabPane tab="Audit Logs" key="1" >
                <AuditLogsList />
            </TabPane>
            <TabPane tab="Realtime Monitor" key="2">
                <ActivityMonitor />
            </TabPane>
        </Tabs>
        </>
    );
};

export default AuditLogs;