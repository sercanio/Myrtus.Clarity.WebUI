import React, { useEffect, useState } from 'react';
import { Badge, Dropdown, Flex, Typography, message, Pagination } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';
import { useAppDispatch, useGetNotificationsQuery } from '@store/hooks';
import { addNotification, resetNotificationCount, setNotifications, setNotificationCount } from '@store/slices/uiSlice';
import type { Notification } from '@types/notification';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index'; // Adjust the import path as necessary
import { Link } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useSelector((state: RootState) => state.ui.notifications);
  const notificationCount = useSelector((state: RootState) => state.ui.notificationCount);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const { data: notificationsData, refetch } = useGetNotificationsQuery({
    pageIndex: currentPage - 1,
    pageSize
  });
  const [connection, setConnection] = useState<HubConnection | null>(null);

  const isInAppNotificationsEnabled = userProfile?.notificationPreference.isInAppNotificationEnabled;

  useEffect(() => {
    if (notificationsData && isInAppNotificationsEnabled) {
      dispatch(setNotifications(notificationsData.items));
    }
  }, [notificationsData, dispatch, isInAppNotificationsEnabled]);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:5001/notificationHub', {
        accessTokenFactory: () => accessToken || '',
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection && isInAppNotificationsEnabled) {
      connection.start()
        .then(() => {
          console.log('Notification SignalR Connected!');
          connection.on('ReceiveNotification', (notification: Notification) => {
              dispatch(addNotification(notification));
              message.info(`${notification.details}`);           
          });
        })
        .catch(err => {
          console.error('Notification SignalR Connection Error: ', err);
          message.error('Failed to connect to the notification server.');
        });

      return () => {
        connection.off('ReceiveNotification');
        connection.stop();
      };
    }
  }, [connection, dispatch, isInAppNotificationsEnabled]);

  const handleBellClick = () => {
    // dispatch(resetNotificationCount());
  };

  const hasUnread = notifications.some(notification => !notification.isRead);

  const handleMarkAllAsRead = () => {
    if (hasUnread) { 
      dispatch(resetNotificationCount());
      message.success('All notifications marked as read.');
    }
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    dispatch(resetNotificationCount());
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    refetch();
  }, [currentPage, pageSize, refetch]);

  const notificationMenu = {
    items: isInAppNotificationsEnabled ? [
      {
        key: 'mark-all',
        label: (
          <Typography.Link
            onClick={handleMarkAllAsRead}
            style={{
              display: 'block',
              textAlign: 'center',
              color: hasUnread ? undefined : '#ccc',
              cursor: hasUnread ? 'pointer' : 'not-allowed',
            }}
          >
            Mark all as read
          </Typography.Link>
        ),
      },
      ...(notifications || []).map((notification) => ({
        key: notification.id,
        label: (
          <Flex vertical style={{ width: '300px', padding: '.5rem' }}>
            {
              notification.isRead ? (
                <Typography.Text>{notification.details}</Typography.Text>
              ) : (
                <Typography.Text strong>{notification.details}</Typography.Text>
              )
            }
            <Typography.Text type="secondary">
              {new Date(notification.timestamp).toLocaleString()}
            </Typography.Text>
          </Flex>
        ),
      })),
      {
        key: 'pagination',
        label: (
          <div
            style={{ textAlign: 'center', padding: '8px 0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={notificationsData?.totalCount || 0}
              onChange={handlePageChange}
              size="small"
            />
          </div>
        ),
      },
    ] : [
      {
        key: 'no-notifications',
        label: (
          <Link to="/profile">
            <Typography.Link style={{ padding: '12px', display: 'block', textAlign: 'center' }}>
              Open in-app notifications to get notifications
            </Typography.Link>
          </Link>
        ),
      },
    ],
  };

  return (
    <Badge count={notificationCount} offset={[-1, 1]}>
      <Dropdown
        menu={notificationMenu}
        trigger={['click']}
        onClick={handleBellClick}
      >
        <span>
          <BellOutlined style={{ fontSize: '24px', cursor: 'pointer' }} />
        </span>
      </Dropdown>
    </Badge>
  );
};

export default NotificationBell;
