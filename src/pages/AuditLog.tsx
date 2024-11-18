import { useEffect, useState } from 'react';
import { Table } from 'antd';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const AuditLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:5001/auditLogHub') // Ensure this URL matches your backend configuration
      .configureLogging(LogLevel.Information)
      .build();

    connection.on('ReceiveAuditLog', (message) => {
      setLogs((prevLogs) => [...prevLogs, JSON.parse(message)]);
    });

    connection.start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.error('Connection failed: ', err));

    return () => {
      connection.stop();
    };
  }, []);

  const columns = [
    { title: 'User ID', dataIndex: 'UserId', key: 'UserId' },
    { title: 'Action', dataIndex: 'Action', key: 'Action' },
    { title: 'Entity', dataIndex: 'Entity', key: 'Entity' },
    { title: 'Entity ID', dataIndex: 'EntityId', key: 'EntityId' },
    { title: 'Timestamp', dataIndex: 'Timestamp', key: 'Timestamp' },
    { title: 'Details', dataIndex: 'Details', key: 'Details' },
  ];

  return <Table dataSource={logs} columns={columns} rowKey="Id" />;
};

export default AuditLog;