import React from "react";
import "../Layout.css";
import { useNavigate } from "react-router-dom";


const Doctor = ({ doctor }) => {
const navigate = useNavigate();
  return (
    <div className="card p-2" onClick={()=>navigate(`/book-appointment/${doctor._id}`)}>
      <h1 className="card-title" style={{ color: "#005555", fontWeight: "bold" }}>{doctor.firstName} {doctor.lastName}</h1>
      <p className="card-text" style={{ fontWeight: "bold" }}>Phone Number: {doctor.phoneNumber}</p>
      <p className="card-text" style={{ fontWeight: "bold" }}>Address: {doctor.address}</p>
      <p className="card-text" style={{ fontWeight: "bold" }}>Fee per Visit: {doctor.
feesPerConsultation}</p>
    <p className="doctor-timing">
  Timing: {doctor.timing[0]} - {doctor.timing[1]}
</p>

    </div>
  );
};

export default Doctor;
