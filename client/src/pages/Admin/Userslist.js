import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../redux/alertSlice";
import axios from "axios";
import { Table, Typography } from "antd";
import moment from "moment";
import { Button } from "antd";


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

  const handleBlockUser = (userId) => {
    // Function to handle blocking the user
    console.log("Block user with ID:", userId);
    // You can implement API call here for blocking the user
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
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div className="d-flex">
          <Button
            type="primary"
            danger
            onClick={() => handleBlockUser(record._id)}
          >
            Block
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
