

import { Tabs, Button, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { showLoading, hideLoading } from '../redux/alertSlice';
import { setUser } from '../redux/userSlice';

function Notifications() {
  const { user, loading } = useSelector((state) => state.user); // Assuming you have a loading state for user
  const dispatch = useDispatch();
  const [unseenNotifications, setUnseenNotifications] = useState([]);
  const [seenNotifications, setSeenNotifications] = useState([]);
  const [loadingone, setLoadingone] = useState(false); // Local loading state for specific actions
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUnseenNotifications(user.unseenNotifications || []);
      setSeenNotifications(user.seenNotifications || []);
    }
  }, [user , loadingone]);

  const markAllAsSeen = async () => {
    try {
      setLoadingone(true); // Start specific loading state
      const response = await axios.post(
        '/api/user/mark-all-notification-as-seen',
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setLoadingone(false); // End specific loading state

      if (response.data.success) {
        const updatedUser = {
          ...user,
          unseenNotifications: [],
          seenNotifications: [
            ...user.seenNotifications,
            ...user.unseenNotifications,
          ],
        };

        dispatch({
          type: 'SET_USER',
          payload: updatedUser,
        });

        setUnseenNotifications([]);
        setSeenNotifications(updatedUser.seenNotifications);
        toast.success('All notifications marked as seen');
        dispatch(setUser(null));
      } else {
        toast.error('Failed to mark notifications as seen');
      }
    } catch (error) {
      setLoadingone(false); // Ensure loading state is reset on error
      toast.error('Something went wrong');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      setLoadingone(true); // Start specific loading state
      const response = await axios.post(
        '/api/user/delete-all-notification',
        { userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setLoadingone(false); // End specific loading state

      if (response.data.success) {
        const updatedUser = {
          ...user,
          unseenNotifications: [],
          seenNotifications: [],
        };

        dispatch({
          type: 'SET_USER',
          payload: updatedUser,
        });

        setUnseenNotifications([]);
        setSeenNotifications([]);
        toast.success('All notifications deleted');
        dispatch(setUser(null));
      } else {
        toast.error('Failed to delete notifications');
      }
    } catch (error) {
      setLoadingone(false); // Ensure loading state is reset on error
      toast.error('Something went wrong');
    }
  };

  if (loading || loadingone) {
    // Show loading spinner during global or specific loading
    return (
      <Layout>
        <Spin size="large" />
      </Layout>
    );
  }

  const handleNotificationClick = (notification) => {
    const path = notification.onClickPath || '/admin/doctorslist';
    navigate(path);
  };

  return (
    <Layout>
      <h1 className="page-title">Notifications</h1>

      <Tabs>
        {/* Unseen Notifications Tab */}
        <Tabs.TabPane tab="Unseen" key={0}>
          <div className="d-flex justify-content-end">
            <h1 className="anchor" onClick={() => markAllAsSeen()}>
              Mark all as seen
            </h1>
          </div>

          {unseenNotifications.map((notification) => (
            <div
              className="card p-2"
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="card-text">{notification.message}</div>
            </div>
          ))}
        </Tabs.TabPane>

        {/* Seen Notifications Tab */}
        <Tabs.TabPane tab="Seen" key={1}>
          <div className="d-flex justify-content-end">
            <h1 className="anchor" onClick={() => deleteAllNotifications()}>
              Delete all
            </h1>
          </div>

          {seenNotifications.map((notification) => (
            <div
              className="card p-2"
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="card-text">{notification.message}</div>
            </div>
          ))}
        </Tabs.TabPane>
      </Tabs>
    </Layout>
  );
}

export default Notifications;

