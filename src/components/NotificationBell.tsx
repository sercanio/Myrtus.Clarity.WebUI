import React, { useEffect, useState, useContext } from 'react';
import { Badge, Dropdown, Typography, Pagination, Spin } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';
import { useAppDispatch, useGetNotificationsQuery } from '@store/hooks';
import { addNotification, setNotifications, setNotificationCount } from '@store/slices/uiSlice';
import type { Notification } from '@/types/notification';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { Link } from 'react-router-dom';
import { useLazyGetCurrentUserQuery } from '@store/services/accountApi';
import { useMarkNotificationsReadMutation } from '@store/services/userApi';
import { MessageContext } from '@contexts/MessageContext';
import { relative } from 'path';

const NotificationBell: React.FC = () => {
  const dispatch = useAppDispatch();
  const notifications = useSelector((state: RootState) => state.ui.notifications);
  const notificationCount = useSelector((state: RootState) => state.ui.notificationCount);
  const authSlice = useSelector((state: RootState) => state.auth);
  const [, { data: userProfile }] = useLazyGetCurrentUserQuery();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const { data: notificationsData, refetch } = useGetNotificationsQuery({
    pageIndex: currentPage - 1,
    pageSize,
  });
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const isInAppNotificationsEnabled =
    userProfile?.notificationPreference?.isInAppNotificationEnabled ||
    authSlice.user?.notificationPreference?.isInAppNotificationEnabled;

  const messageApi = useContext(MessageContext);
  const [markNotificationsRead] = useMarkNotificationsReadMutation();
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  useEffect(() => {    
    if (notificationsData && isInAppNotificationsEnabled) {
      dispatch(setNotifications(notificationsData.paginatedNotifications.items));
      dispatch(setNotificationCount(notificationsData.unreadCount));
    }
  }, [notificationsData, dispatch, isInAppNotificationsEnabled]);

  useEffect(() => {
    if (authSlice.isAuthenticated) {
      const newConnection = new HubConnectionBuilder()
        .withUrl(import.meta.env.VITE_SOCKET_NOTIFICATIONHUB, { withCredentials: true })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect()
        .build();
      setConnection(newConnection);
    }
  }, [authSlice.isAuthenticated]);

  useEffect(() => {
    if (connection && isInAppNotificationsEnabled) {
      connection
        .start()
        .then(() => {
          console.log('Notification SignalR Connected!');
          connection.on('ReceiveNotification', (notification: Notification) => {
            dispatch(addNotification(notification));
            messageApi?.info(notification.details);
          });
        })
        .catch((err) => {
          console.error('Notification SignalR Connection Error:', err);
        });

      return () => {
        connection.off('ReceiveNotification');
        connection.stop();
      };
    }
  }, [connection, dispatch, isInAppNotificationsEnabled, messageApi]);

  const handleBellClick = () => {
    // Optionally, reset the notification count here.
  };

  const hasUnread = notifications.some((notification) => !notification.isRead);

  const handleMarkAllAsRead = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hasUnread) {
      setIsMarkingRead(true);
      try {
        await markNotificationsRead().unwrap();
        await refetch();
        dispatch(setNotifications(notificationsData?.paginatedNotifications.items || []));
      } finally {
        setIsMarkingRead(false);
      }
    }
  };

  const handlePageChange = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    }
  };

  useEffect(() => {
    refetch();
  }, [currentPage, pageSize, refetch]);

  const notificationMenu = {
    items: isInAppNotificationsEnabled
      ? notifications.length > 0
        ? [
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
                  disabled={isMarkingRead}
                >
                  {isMarkingRead ? (
                    <span>
                      Marking as read...
                      <Spin size="small" style={{ marginLeft: 4 }} />
                    </span>
                  ) : (
                    'Mark all as read'
                  )}
                </Typography.Link>
              ),
            },
            ...notifications.map((notification) => ({
              key: notification.id,
              label: (
                <div style={{ width: '300px', padding: '.5rem' }}>
                  {notification.isRead ? (
                    <Typography.Text>{notification.details}</Typography.Text>
                  ) : (
                    <Typography.Text strong>{notification.details}</Typography.Text>
                  )}
                  <Typography.Text type="secondary">
                    {new Date(notification.timestamp).toLocaleString()}
                  </Typography.Text>
                </div>
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
                    total={notificationsData?.paginatedNotifications.totalCount || 0}
                    onChange={handlePageChange}
                    size="small"
                  />
                </div>
              ),
            },
          ]
        : [
            {
              key: 'no-notifications',
              label: (
                <Typography.Text style={{ padding: '12px', display: 'block', textAlign: 'center' }}>
                  Nothing to see here!
                </Typography.Text>
              ),
            },
          ]
      : [
          {
            key: 'no-notifications',
            label: (
              <Link to="/profile">
                <Typography.Link
                  style={{ padding: '12px', display: 'block', textAlign: 'center' }}
                >
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
        trigger={['hover']}
        onVisibleChange={(visible) => visible && handleBellClick()}
      >
        <span>
          <BellOutlined style={{ position: 'relative', top: '4px', fontSize: '24px', cursor: 'pointer' }} />
        </span>
      </Dropdown>
    </Badge>
  );
};

export default NotificationBell;