import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../redux/alertSlice";
import axios from "axios";
import { Table, Tag, Typography } from "antd";
import moment from "moment";

const { Title, Text } = Typography;

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const dispatch = useDispatch();

  const getAppointmentsData = async () => {
    try {
      dispatch(showLoading());

      const response = await axios.get(`/api/user/get-appointments-by-user-id`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      dispatch(hideLoading());

      if (response.data.success) {
        setAppointments(
          response.data.data.map((appointment) => ({
            ...appointment,
            name: appointment.doctorInfo
              ? `${appointment.doctorInfo.firstName} ${appointment.doctorInfo.lastName}`
              : "N/A",
            phoneNumber: appointment.doctorInfo ? appointment.doctorInfo.phoneNumber : "N/A",
          }))
        );
      } else {
        console.error("Failed to fetch appointments:", response.data.msg);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Failed to fetch appointments data:", error.response || error);
    }
  };

  const columns = [
    {
      title: "Appointment ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Doctor",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Text strong>
          {record.name || <Text type="secondary">No doctor assigned</Text>}
        </Text>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      key: "date",
      render: (text, record) => (
        <Text>
          {record.date && record.time
            ? `${moment(record.date).format("DD-MM-YYYY")} ${moment(
                record.time,
                "HH:mm"
              ).format("HH:mm")}`
            : moment(record.createdAt).format("DD-MM-YYYY HH:mm")}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "approve"
            ? "green"
            : status === "reject"
            ? "red"
            : status === "pending"
            ? "gold"
            : "default";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  useEffect(() => {
    getAppointmentsData();
  }, []);

  return (
    <Layout>
      <div style={{ padding: "20px" }}>
        <Title level={3}>Appointments</Title>
      </div>
      <Table
        columns={columns}
        dataSource={appointments}
        rowKey={(record) => record._id}
        pagination={{ pageSize: 5 }}
        bordered
        style={{ margin: "20px" }}
      />
    </Layout>
  );
};

export default Appointments;
