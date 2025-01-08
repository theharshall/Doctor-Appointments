import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../redux/alertSlice";
import axios from "axios";
import { Table, Typography, Button, message } from "antd";
import moment from "moment";

const { Title } = Typography;

const Userslist = () => {
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();

  const getUsersData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.get("/api/admin/get-all-users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(hideLoading());

      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    getUsersData();
  }, []);

  const handleBlockUser = async (userId, currentStatus) => {
    try {
      dispatch(showLoading());
      const newStatus = currentStatus === "active" ? "blocked" : "active";
      const response = await axios.post(
        "/api/admin/update-user-status",
        { userId, status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());

      if (response.data.success) {
        message.success(`User status updated to ${newStatus}`);
        // Refresh the user list
        getUsersData();
      } else {
        message.error(response.data.message || "Failed to update user status.");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error updating user status:", error);
      message.error("Failed to update user status.");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => moment(text).format("DD-MM-YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Typography.Text type={status === "blocked" ? "danger" : "success"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Typography.Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div className="d-flex">
          <Button
            type={record.status === "active" ? "danger" : "primary"}
            onClick={() => handleBlockUser(record._id, record.status)}
          >
            {record.status === "active" ? "Block" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div style={{ padding: "20px" }}>
        <Title level={3}>Users List</Title>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 5 }}
        bordered
        style={{ margin: "20px" }}
      />
    </Layout>
  );
};

export default Userslist;
