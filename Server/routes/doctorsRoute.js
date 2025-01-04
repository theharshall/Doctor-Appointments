const express = require('express');
const router = express.Router();
const Doctor = require('../models/doctorModel');
const authMiddleware = require('../middlewares/authMiddleware');
const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');

// Get Doctor Info by User ID
router.post("/get-doctor-info", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.body.userId });

    if (!doctor) {
      return res.status(404).send({
        success: false,
        msg: "Doctor not found",
      });
    }

    return res.status(200).send({
      success: true,
      msg: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Error getting doctor info:", error);
    return res.status(500).send({
      success: false,
      msg: "Error getting doctor info",
      error: error.message, // Send error message for debugging
    });
  }
});

router.post("/get-doctor-info-by-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.body.doctorId });

    if (!doctor) {
      return res.status(404).send({
        success: false,
        msg: "Doctor not found",
      });
    }

    return res.status(200).send({
      success: true,
      msg: "Doctor info fetched successfully",
      data: doctor,
    });
  } catch (error) {
    console.error("Error getting doctor info:", error);
    return res.status(500).send({
      success: false,
      msg: "Error getting doctor info",
      error: error.message, // Send error message for debugging
    });
  }
});


router.post("/update-doctor-profile", async (req, res) => {
  try {
    const { userId, ...updateData } = req.body;
    const updatedDoctor = await Doctor.findOneAndUpdate(
      { userId: userId }, // Find by userId
      { $set: updateData }, // Update fields
      { new: true } // Return the updated document
    );
    if (updatedDoctor) {
      res.status(200).send({ success: true, msg: "Profile updated successfully!" });
    } else {
      res.status(404).send({ success: false, msg: "Doctor not found" });
    }
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).send({ success: false, msg: "Server error" });
  }
});

router.get("/get-appointments-by-doctor-id", authMiddleware, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.body.userId });
    if (!doctor) {
      return res.status(404).send({ msg: "Doctor not found", success: false });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate("userInfo", "firstName lastName phoneNumber")
      .sort({ createdAt: -1 });

    res.status(200).send({
      msg: "Appointments fetched successfully",
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).send({
      msg: "Error fetching appointments",
      success: false,
      error: error.message, // Include error message for better debugging
    });
  }
});

router.post("/change-appointment-status", authMiddleware, async (req, res) => {
  try {
    const { appointmentId, status } = req.body;

    // Update the appointment's status
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).send({
        msg: "Appointment not found",
        success: false,
      });
    }

    // Find the user associated with the appointment
    const user = await User.findById(appointment.userId);
    if (!user) {
      return res.status(404).send({
        msg: "User not found",
        success: false,
      });
    }

    // Add notification to the user's unseen notifications
    const unseenNotifications = user.unseenNotifications || [];
    unseenNotifications.push({
      type: "appointment-status-changed",
      message: `Your appointment status has been ${status}.`,
      data: {
        doctorId: appointment.doctorId,
        appointmentId: appointment._id,
        status,
      },
      onClickPath: "/appointments",
    });

    // Save the updated user data
    user.unseenNotifications = unseenNotifications;
    await user.save();

    res.status(200).send({
      msg: "Appointment status updated successfully.",
      success: true,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).send({
      msg: "Error updating appointment status.",
      success: false,
      error,
    });
  }
});



module.exports = router;
