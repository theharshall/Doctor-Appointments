import { Form, Input, Button } from "antd";
import { Link } from "react-router-dom";
import React from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/alertSlice"; // Adjust the import path as needed
import { useNavigate } from "react-router-dom";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((state) => state.alerts.loading); // Get the loading state from Redux





const onFinish = async (values) => {
  try {
    dispatch(showLoading()); // Show the loading spinner

    // Send the login request to the backend
    const response = await axios.post("https://doctor-appointments-weld.vercel.app/api/user/login", values);

    // Debugging: Check the response structure
    console.log("Login response:", response.data);

    dispatch(hideLoading()); // Hide the loading spinner

    // Check if login is successful
    if (response.data.success) {
      toast.success("Login successful!");

      // Verify and store the token in localStorage
      const token = response.data.data; // Assuming `data` contains the token
      console.log(token);
      
      if (token) {
        localStorage.setItem("token", token); // Save the token in localStorage
        console.log("Token saved to localStorage:", token);

        // Redirect to Home Page
        navigate("/");
      } else {
        console.error("Token is missing in the response.");
        toast.error("Failed to retrieve login token.");
      }
    } else {
      toast.error(response.data.msg || "Login failed. Please try again.");
    }
  } catch (error) {
    dispatch(hideLoading()); // Hide the loading spinner
    console.error("Login Error:", error);

    // Handle errors and show appropriate toast message
    toast.error(error.response?.data?.msg || "Something went wrong. Please try again.");
  }
};

const onFinishFailed = (errorInfo) => {
  console.log("Failed:", errorInfo);
};


  return (
    <div className="authentication">
      <div className="authentication-form card p-3">
        <h1 className="card-title">Welcome Back</h1>
        <Form
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="primary-button my-2"
              loading={loading} // Show loading spinner when request is in progress
              disabled={loading} // Disable button while loading
            >
              Login
            </Button>
          </Form.Item>

          <div className="mt-2">
            <Link to="/register" className="anchor">
              Click here to register
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Login;
