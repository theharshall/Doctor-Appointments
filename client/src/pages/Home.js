import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import Doctor from "../components/Doctor"; // Import the Doctor component
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertSlice";
import { Row, Col } from "antd"; // Import Row and Col from Ant Design

const Home = () => {
  const [doctors, setDoctors] = useState([]); // State to store doctors data
  const dispatch = useDispatch();

  // Function to fetch doctors data
  const getDoctors = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found, redirecting to login.");
      window.location.href = "/login";
      return;
    }

    try {
      dispatch(showLoading());

      // API request to fetch doctors
      const response = await axios.get("/api/user/get-all-approved-doctors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch(hideLoading());

      if (response.data.success) {
        setDoctors(response.data.data); // Update state with doctors data
      } else {
        console.error("Error fetching doctors. Redirecting to login.");
        window.location.href = "/login";
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error during API call: ", error);
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    getDoctors();
  }, []);

  return (
    <Layout>
      <Row gutter={[16, 24]}>
        {doctors.length > 0 ? (
          doctors.map((doctor) => (
            <Col span={24} key={doctor._id}>  {/* Full width for each doctor */}
              <Doctor doctor={doctor} />
            </Col>
          ))
        ) : (
          <p style={{ textAlign: "center", marginBottom: "20px", color: "#16a085", fontWeight: "bold"}}>No doctors available.</p>
        )}
      </Row>
    </Layout>
  );
};

export default Home;
