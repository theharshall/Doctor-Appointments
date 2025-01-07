import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../redux/alertSlice";
import axios from "axios";
import { Table, Tag, Typography } from "antd";
import moment from "moment";
import toast from "react-hot-toast";

const { Title, Text } = Typography;

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const dispatch = useDispatch();

  const getAppointmentsData = async () => {
    try {
      dispatch(showLoading());

      const response = await axios.get(
        `https://doctor-appointments-weld.vercel.app/api/doctors/get-appointments-by-doctor-id`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      dispatch(hideLoading());
      if (response.data.success) {
        setAppointments(
          response.data.data.map((appointment) => ({
            ...appointment,
            name: appointment.userInfo
              ? `${appointment.userInfo.firstName} ${appointment.userInfo.lastName}`
              : "N/A",
            phoneNumber: appointment.userInfo
              ? appointment.userInfo.phoneNumber
              : "N/A",
          }))
        );
        toast.success("Appointments fetched successfully!");
      } else {
        toast.error("Failed to fetch appointments.");
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Something went wrong while fetching appointments.");
    }
  };

  const changeAppointmentStatus = async (record, action) => {
    try {
      dispatch(showLoading());
  
      const response = await axios.post(
        `http://localhost:3000/api/doctors/change-appointment-status`,
        {
          appointmentId: record._id,
          status: action,
          userInfo: record.userInfo, // Pass userInfo if required by backend
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
  
      dispatch(hideLoading());
  
      if (response.data.success) {
        toast.success(response.data.msg || "Status updated successfully.");
        getAppointmentsData(); // Refresh the appointments data
      } else {
        toast.error(response.data.msg || "Failed to update status.");
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Error updating status. Please try again.");
    }
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "_id",
    },
    {
      title: "Patient",
      dataIndex: "name", // Directly use name field from transformed data
      render: (text, record) => <span>{record.userInfo.name}</span>,
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber", // Directly use phoneNumber field from transformed data
      render: (text, record) => <span>{record.doctorInfo.phoneNumber}</span>,
    },
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      render: (text, record) => (
        <span>
          {record.date && record.time
            ? `${moment(record.date).format("DD-MM-YYYY")} ${moment(
                record.time,
                "HH:mm"
              ).format("HH:mm")}`
            : moment(record.createdAt).format("DD-MM-YYYY HH:mm")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "approved"
            ? "green"
            : status === "rejected"
            ? "red"
            : status === "pending"
            ? "gold"
            : "default";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div className="d-flex">
          {record.status === "pending" && (
            <div className="d-flex">
              <h1
                className="anchor px-2"
                onClick={() => changeAppointmentStatus(record, "approved")}
                style={{ color: "green", cursor: "pointer" }}
              >
                Approve
              </h1>
              <h1
                className="anchor px-2"
                onClick={() => changeAppointmentStatus(record, "rejected")}
                style={{ color: "red", cursor: "pointer" }}
              >
                Reject
              </h1>
            </div>
          )}
        </div>
      ),
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

export default DoctorAppointments;
