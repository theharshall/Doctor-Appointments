import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../redux/alertSlice";
import axios from "axios";
import { Table, notification } from "antd"; 
import moment from "moment";
import { Button } from "antd";


const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const dispatch = useDispatch();
  const getDoctorsData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.get("/api/admin/get-all-doctors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      dispatch(hideLoading());
      if (response.data.success) {
        setDoctors(
          response.data.data.map((doctor) => ({
            ...doctor,
            name: `${doctor.firstName} ${doctor.lastName}`, // Combine first and last name
          }))
        );
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Failed to fetch doctors data:", error);
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  const handleAction = async (record, action) => {
    try {
      dispatch(showLoading());

      // Determine the new status based on the action
      const newStatus = action === "approve" ? "approved" : "blocked";

      const response = await axios.post(
        "/api/admin/change-doctors-account-status", // Correct endpoint
        { doctorId: record._id, status: newStatus }, // Send doctorId and status
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());

      if (response.data.success) {
        // Show a success notification
        notification.success({
          message: `Doctor ${action.charAt(0).toUpperCase() + action.slice(1)}d`,
        });
        getDoctorsData();  // Refresh the data
      } else {
        // Show a failure notification
        notification.error({
          message: `Failed to ${action} doctor`,
          description: response.data.message || "An error occurred.",
        });
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error(`Failed to ${action} doctor:`, error);
      notification.error({
        message: "Error",
        description: "An error occurred while processing the request.",
      });
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phone",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (text) => moment(text).format("DD-MM-YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div>
          {record.status === "approved" ? (
            <Button
              type="primary"
              danger
              onClick={() => handleAction(record, "block")}
            >
              Block
            </Button>
          ) : (
            <Button
              type="primary"
              style={{ backgroundColor: "green", borderColor: "green" }}
              onClick={() => handleAction(record, "approve")}
            >
              Approve
            </Button>
          )}
        </div>
      ),
    },
  ];
  

  return (
    <Layout>
      <h1 className="page-header">Doctors List</h1>
      <Table
        columns={columns}
        dataSource={doctors}
        rowKey={(record) => record._id} // Ensure unique row keys
      />
    </Layout>
  );
};

export default DoctorsList;
