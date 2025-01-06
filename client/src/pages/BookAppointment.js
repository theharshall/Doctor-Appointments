import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import moment from "moment";
import Layout from "../components/Layout";
import { hideLoading, showLoading } from "../redux/alertSlice";
import { Col, DatePicker, Row, TimePicker, Button } from "antd";

const BookAppointment = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const navigate = useNavigate();
  const [date, setDate] = useState();
  const [time, setTime] = useState();
  const { user } = useSelector((state) => state.user);
  const [doctor, setDoctor] = useState(null);
  const params = useParams();
  const dispatch = useDispatch();

  const getDoctorData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/doctors/get-doctor-info-by-id",
        { doctorId: params.doctorId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      dispatch(hideLoading());

      if (response.data.success) {
        setDoctor(response.data.data);
      } else {
        toast.error(response.data.msg || "Doctor data not found");
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Failed to fetch doctor data. Please try again.");
    }
  };

  const checkAvailability = async () => {
    try {
      if (!date || !time) {
        toast.error("Please select both date and time.");
        return;
      }

      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/check-booking-availability",
        {
          doctorId: params.doctorId,
          date: date.format("DD-MM-YYYY"),
          time: time.format("HH:mm"),
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
        toast.success(
          response.data.msg || "Doctor is available at the requested time."
        );
        setIsAvailable(true);
      }
    } catch (error) {
      dispatch(hideLoading());
      if (error.response && error.response.data) {
        toast.error(
          error.response.data.msg || "Error checking availability. Please try again."
        );
      } else {
        toast.error("Error checking availability. Please try again.");
      }
    }
  };

  const bookNow = async () => {
    setIsAvailable(false);
    try {
      if (!date || !time) {
        toast.error("Please select both date and time.");
        return;
      }

      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctor,
          userInfo: user,
          date: date.format("DD-MM-YYYY"),
          time: time.format("HH:mm"),
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
        navigate('/appointments')
        toast.success(response.data.msg);
      } else {
        toast.error(response.data.msg || "Failed to book appointment.");
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Error booking appointment. Please try again.");
    }
  };

  useEffect(() => {
    getDoctorData();
  }, [params.doctorId]);

  return (
    <Layout>
      {doctor && (
        <div>
          <h1 className="page-title">
            {doctor.firstName} {doctor.lastName}
          </h1>
          <hr />
          <Row gutter={20} align="middle" justify="center">
            {/* Logo Section */}
            <Col span={8} sm={24} xs={24} lg={8}>
              <img
                src="https://t3.ftcdn.net/jpg/04/53/56/58/360_F_453565884_h376Qh8fINX4wXzq4mqQms0eSmBGv9wc.jpg"
                alt="book-now-logo"
                style={{
                  width: "100%",
                  height: "200",
                  borderRadius: "10px",
                }}
              />
            </Col>

            {/* Details Section */}
            <Col span={8} sm={24} xs={24} lg={12}>
              <h1 className="doctor-timing">
                Timings: {doctor.timing[0]} - {doctor.timing[1]}
              </h1>
              <p className="card-text" style={{ fontWeight: "bold" }}>
                Phone Number: {doctor.phoneNumber}
              </p>
              <p className="card-text" style={{ fontWeight: "bold" }}>
                Address: {doctor.address}
              </p>
              <p className="card-text" style={{ fontWeight: "bold" }}>
                Fee per Visit: {doctor.feesPerConsultation}
              </p>
              <p className="card-text" style={{ fontWeight: "bold" }}>
                Website: {doctor.website}
              </p>
            
              <div className="d-flex flex-column mt-3">
                <DatePicker
                  format="DD-MM-YYYY"
                  onChange={(value) => {
                    setIsAvailable(false);
                    setDate(value);
                  }}
                />
                <TimePicker
                  format="HH:mm"
                  className="mt-3"
                  onChange={(value) => {
                    setIsAvailable(false);
                    setTime(value);
                  }}
                />
               {!isAvailable &&  <Button
                  type="primary"
                  className="mt-3"
                  style={{
                    backgroundColor: "#018b8b",
                    borderColor: "#018b8b",
                  }}
                  onClick={checkAvailability}
                >
                  Check Availability
                </Button> }
                {isAvailable && (
                  <Button
                    type="primary"
                    className="mt-3"
                    style={{
                      backgroundColor: "#018b8b",
                      borderColor: "#018b8b",
                    }}
                    onClick={bookNow}
                  >
                    Book Now
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </div>
      )}
    </Layout>
  );
};

export default BookAppointment;
