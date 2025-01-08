import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import Layout from "../../components/Layout"; // Update this path if necessary
import DoctorForm from "../../components/DoctorForm"; // Update this path if necessary
import { hideLoading, showLoading } from "../../redux/alertSlice";

const Profile = () => {
  const { user } = useSelector((state) => state.user); // Get user data from Redux
  const params = useParams();
  const [doctor, setDoctor] = useState(null); // Local state for doctor data
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Function to fetch doctor data
  const getDoctorData = async () => {
    if (!params.userId) {
      console.error("User ID is missing in params.");
      toast.error("User ID is missing. Cannot fetch doctor data.");
      return;
    }
  
    try {
      dispatch(showLoading());
  
      // Correct URL (single slash between domain and endpoint)
      const response = await axios.post(
        "https://doctor-appointments-weld.vercel.app/api/doctors/get-doctor-info", // Corrected double slash
        { userId: params.userId }, // Ensure correct userId is passed
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token for authentication
          },
        }
      );
  
      dispatch(hideLoading());
  
      if (response.data.success) {
        setDoctor(response.data.data); // Set doctor data in state
      } else {
        toast.error(response.data.msg || "Doctor data not found");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error fetching doctor data:", error);
      toast.error("Failed to fetch doctor data. Please try again.");
    }
  };
  

  // Run once on component mount or when user data changes
  useEffect(() => {
    getDoctorData();
  }, [params.userId]); // Re-fetch if the userId changes

  // Function to handle form submission
  const onFinish = async (values) => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "https://doctor-appointments-weld.vercel.app/api/doctors/update-doctor-profile",
        { ...values, userId: user._id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());

      if (response.data.success) {
        toast.success(response.data.msg);
        navigate("/"); // Redirect after success
      } else {
        toast.error(response.data.msg);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error updating doctor data:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Layout>
      <h1 className="page-title">Doctor's Profile</h1>
      <hr />
      {doctor ? (
        <DoctorForm onFinish={onFinish} initialValues={doctor} /> // Pass existing data to form
      ) : (
        <p>Loading doctor's profile...</p>
      )}
    </Layout>
  );
};

export default Profile;
