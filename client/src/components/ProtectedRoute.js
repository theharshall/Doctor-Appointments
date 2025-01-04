import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setUser } from "../redux/userSlice";
import { hideLoading, showLoading } from "../redux/alertSlice";

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getUser = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.get(
        "/api/user/get-user-by-id",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      dispatch(hideLoading());

      if (response.data.success) {
        dispatch(setUser(response.data.data));
      } else {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      dispatch(hideLoading());
      localStorage.removeItem("token");
      navigate("/login");

      if (!error.response) {
        alert("Network error. Please check your internet connection.");
      } else if (error.response.status === 401) {
        alert("Unauthorized access. Please log in again.");
      } else {
        alert("An error occurred. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (!user && localStorage.getItem("token")) {
      getUser();
    }
  }, [dispatch, navigate, user]);

  // Check token first before rendering the protected content
  if (!localStorage.getItem("token")) {
    return <Navigate to="/login" />;
  }

  // Render children (protected components) after validation
  return user ? children : null;
};

export default ProtectedRoute;
