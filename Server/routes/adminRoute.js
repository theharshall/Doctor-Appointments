const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const authMiddleware = require("../middlewares/authMiddleware");

// Fetch all doctors
router.get("/get-all-doctors", authMiddleware, async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    res.status(200).send({
      msg: "Doctors fetched successfully",
      success: true,
      data: doctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).send({
      msg: "Error fetching doctors",
      success: false,
      error,
    });
  }
});

// Fetch all users
router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({
      msg: "Users fetched successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send({
      msg: "Error fetching users",
      success: false,
      error,
    });
  }
});

// Change doctor's status
router.post("/change-doctors-account-status", authMiddleware, async (req, res) => {
  try {
    const { doctorId, status } = req.body;

    // Validate input
    if (!doctorId || !status) {
      return res.status(400).send({
        success: false,
        msg: "Doctor ID and status are required",
      });
    }

    // Find and update the doctor's status
    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { status },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).send({
        success: false,
        msg: "Doctor not found",
      });
    }

    // Find the associated user
    const user = await User.findById(doctor.userId);
    if (!user) {
      return res.status(404).send({
        success: false,
        msg: "User associated with the doctor not found",
      });
    }

    // Add a notification for the user
    const unseenNotifications = user.unseenNotifications || [];
    unseenNotifications.push({
      type: "doctor-account-status-changed",
      message: `Your doctor account has been ${status}.`,
      data: {
        doctorId: doctor._id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        onClickPath: "/notifications",
      },
    });

    // Update the user's doctor status and notifications
    user.isDoctor = status === "approved";
    user.unseenNotifications = unseenNotifications;
    await user.save();

    // Send a success response
    res.status(200).send({
      success: true,
      msg: `Doctor status updated to ${status} successfully`,
      data: doctor,
    });
  } catch (error) {
    console.error("Error updating doctor's status:", error);
    res.status(500).send({
      success: false,
      msg: "An error occurred while updating the doctor's status",
      error,
    });
  }
});



module.exports = router;
