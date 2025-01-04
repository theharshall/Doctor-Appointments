import { Tabs, Button, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { showLoading, hideLoading } from '../redux/alertSlice';

function Notifications() {
    const { user, loading } = useSelector((state) => state.user); // Assuming you have a loading state for user
    const dispatch = useDispatch();
    const [unseenNotifications, setUnseenNotifications] = useState([]);
    const [seenNotifications, setSeenNotifications] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (user) {
            setUnseenNotifications(user.unseenNotifications || []);
            setSeenNotifications(user.seenNotifications || []);
        }
    }, [user]);

    const markAllAsSeen = async () => {
    try {
        // Show loading spinner
        dispatch(showLoading());

        const response = await axios.post(
            '/api/user/mark-all-notification-as-seen',
            { userId: user._id },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        dispatch(hideLoading());

        if (response.data.success) {
            // Clear unseen notifications and update Redux user state
            const updatedUser = {
                ...user,
                unseenNotifications: [],
                seenNotifications: [
                    ...user.seenNotifications,
                    ...user.unseenNotifications
                ]
            };

            dispatch({
                type: 'SET_USER',
                payload: updatedUser
            });

            // Correct state updates
            setUnseenNotifications([]); // Clear unseen notifications as an empty array
            setSeenNotifications(updatedUser.seenNotifications); // Update seen notifications
            toast.success('All notifications marked as seen');
        } else {
            toast.error('Failed to mark notifications as seen');
        }
    } catch (error) {
        dispatch(hideLoading());
        toast.error('Something went wrong');
    }
};

    

const deleteAllNotifications = async () => {
    try {
        dispatch(showLoading());

        const response = await axios.post(
            '/api/user/delete-all-notification',
            { userId: user._id },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        dispatch(hideLoading());

        if (response.data.success) {
            // Update Redux user state to clear notifications
            const updatedUser = {
                ...user,
                unseenNotifications: [],
                seenNotifications: [
                    ...user.seenNotifications,
                    ...user.unseenNotifications
                ]
            };

            dispatch({
                type: 'SET_USER',
                payload: updatedUser
            });

            // Update local state
            setUnseenNotifications([]);
            setSeenNotifications(updatedUser.seenNotifications);

            toast.success('All notifications marked as seen');
        } else {
            toast.error('Failed to mark notifications as seen');
        }
    } catch (error) {
        dispatch(hideLoading());
        toast.error('Something went wrong');
    }
};

    // If user is still loading, show a loading spinner
    if (loading) {
        return (
            <Layout>
                <Spin size="large" />
            </Layout>
        );  
    }

    const handleNotificationClick = (notification) => {
        // Use onClickPath if it's provided, otherwise fallback to '/admin/doctors'
        const path = notification.onClickPath || '/admin/doctorslist';
        navigate(path); // Navigate to the path specified in the notification
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
      
      {user?.unseenNotifications.map((notification) => (
        <div
          className="card p-2"
          onClick={() => navigate(notification.onClickPath)}
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
      
      {user?.seenNotifications.map((notification) => (
        <div
          className="card p-2"
          onClick={() => navigate(notification.onClickPath)}
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
