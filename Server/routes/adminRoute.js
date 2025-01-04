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
    const { doctorId, status, userId } = req.body;

    // Update the doctor's status
    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { status },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).send({
        msg: "Doctor not found",
        success: false,
      });
    }

    // Update user's notifications
    const user = await User.findById({_id: doctor.userId});
    if (!user) {
      return res.status(404).send({
        msg: "User not found",
        success: false,
      });
    }

    const unseenNotifications = user.unseenNotifications || [];
    unseenNotifications.push({
      type: "new-doctor-account-request-changed",
      message: `Your doctor account has been ${status}`,
      data: {
        doctorId: doctor._id,
        name: doctor.firstName + " " + doctor.lastName,
        onClickPath: "/notifications",
      },
    });

    user.isDoctor = status === "approved" ? true : false;

    // Save updated user data
    user.unseenNotifications = unseenNotifications;
    await user.save();

 

    res.status(200).send({
      msg: "Doctor status updated successfully ",
      success: true,
      data: doctor,
    });
  } catch (error) {
    console.error("Error updating doctor's status:", error);
    res.status(500).send({
      msg: "Error updating doctor's status",
      success: false,
      error,
    });
  }
});


module.exports = router;
