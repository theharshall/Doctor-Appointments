import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../redux/alertSlice";
import axios from "axios";
import { Table, Typography, message, Button } from "antd";
import moment from "moment";

const { Title } = Typography;

const Userslist = () => {
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();

  // Fetch Users Data
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
      message.error("Failed to fetch users.");
    }
  };

  // Block User
  const handleBlockUser = async (userId) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/admin/block-user",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());

      if (response.data.success) {
        message.success("User has been blocked successfully.");
        // Refresh the user list
        getUsersData();
      } else {
        message.error(response.data.message || "Failed to block user.");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error blocking user:", error);
      message.error("Failed to block user.");
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
            type="primary"
            danger
            disabled={record.status === "blocked"}
            onClick={() => handleBlockUser(record._id)}
          >
            Block
          </Button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    getUsersData();
  }, []);

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
