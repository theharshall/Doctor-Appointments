const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const Appointment = require("../models/appointmentModel");
const moment = require("moment");

router.post("/register", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).send({
        msg: "User Already Exists",
        success: false,
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = new User({
      ...req.body,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).send({
      msg: "User Created Successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).send({
      msg: "Error creating user",
      success: false,
      error,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const foundUser = await User.findOne({ email: req.body.email });
    if (!foundUser) {
      return res.status(400).send({
        msg: "User does not exist",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, foundUser.password);
    if (!isMatch) {
      return res.status(400).send({
        msg: "Incorrect Password",
        success: false,
      });
    }

    const token = jwt.sign(
      { id: foundUser._id },
      process.env.JWT_SECRET,
      // { expiresIn: "1d" }
    );

    res.status(200).send({
      msg: "Login Successfully",
      success: true,
      data: token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send({
      msg: "Server Error",
      success: false,
      error,
    });
  }
});

router.get("/get-user-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    if (!user) {
      return res.status(404).send({
        msg: "User not found",
        success: false,
      });
    }

    user.password = undefined;
    res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error getting user data:", error);
    res.status(500).send({
      msg: "Error getting user data",
      success: false,
      error,
    });
  }
});

router.post("/apply-doctor-account", async (req, res) => {
  try {
    const newDoctor = new Doctor({
      ...req.body,
      status: "pending",
    });
    await newDoctor.save();

    const adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      return res.status(404).send({
        msg: "Admin not found",
        success: false,
      });
    }

    const unseenNotifications = adminUser.unseenNotifications;
    unseenNotifications.push({
      type: "new-doctor-request",
      message: `A new doctor account request has been submitted by ${req.body.firstName}.Please review and approve.`,
      data: {
        doctorsId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
      },
      onClickPath: "/admin/doctorslist",
    });
    
    await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });

    res.status(200).send({
      msg: "Doctor Account Applied Successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error applying doctor account:", error);
    res.status(500).send({
      msg: "Error creating doctor account",
      success: false,
      error,
    });
  }
});

router.post("/mark-all-notification-as-seen", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).send({
        msg: "User ID is required",
        success: false,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({
        msg: "User not found",
        success: false,
      });
    }

    if (user.unseenNotifications && user.unseenNotifications.length > 0) {
      user.seenNotifications = [
        ...user.unseenNotifications, 
        ...user.seenNotifications
      ];
      user.unseenNotifications = [];
    }

    await user.save();

    res.status(200).send({
      msg: "Notifications marked as seen",
      success: true,
    });
  } catch (error) {
    console.error("Error marking notifications as seen:", error);
    res.status(500).send({
      msg: "Error marking notifications as seen",
      success: false,
      error,
    });
  }
});

router.post("/delete-all-notification", async (req, res) => {
  try {
    const user = await User.findById({ _id: req.body.userId });
    if (!user) {
      return res.status(404).send({
        msg: "User not found",
        success: false,
      });
    }

    user.seenNotifications = [];
    user.unseenNotifications = [];

    await user.save();

    res.status(200).send({
      msg: "All notifications deleted",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    res.status(500).send({
      msg: "Error deleting notifications",
      success: false,
      error,
    });
  }
});

router.get("/get-all-approved-doctors", authMiddleware, async (req, res) => {
  try {
    const doctors = await Doctor.find({status: "approved"});
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

router.post("/book-appointment", authMiddleware, async (req, res) => {
  try {
    if (Array.isArray(req.body.time)) {
      req.body.time = req.body.time[0];
    }

    // Use a consistent format for both date and time
    req.body.date = moment(req.body.date, 'DD-MM-YYYY').startOf('day').toISOString();  // ISO format with start of the day
    req.body.time = moment(req.body.time, 'HH:mm').format("HH:mm");  // Time in HH:mm format (no date part)

    req.body.status = "pending"; // Set status to pending
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    const user = await User.findOne({ _id: req.body.doctorInfo.userId });
    user.unseenNotifications.push({
      type: "new-appointment-request",
      message: `A new appointment request has been made by ${req.body.userInfo.name} for ${req.body.date} at ${req.body.time}`,
      onClickPath: "/doctor/appointments",
    });
    await user.save();

    res.status(200).send({
      msg: "Appointment booked successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).send({
      msg: "Error Booking Appointment",
      success: false,
      error,
    });
  }
});


router.post("/check-booking-availability", authMiddleware, async (req, res) => {
  try {
    const { date, time, doctorId } = req.body;

    // Ensure both date and time are provided
    if (!date || !time || !doctorId) {
      return res.status(400).send({
        msg: "Please provide date, time, and doctorId.",
        success: false,
      });
    }

    // Parse and format date and time consistently
    const formattedDate = moment(date, 'DD-MM-YYYY').startOf('day').toISOString();
    const formattedTime = moment(time, 'HH:mm').format("HH:mm"); // Ensure time is in HH:mm format

    // Define fromTime and toTime to create a range around the requested time
    const fromTime = moment(time, "HH:mm").subtract(1, "hours").toISOString();
    const toTime = moment(time, "HH:mm").add(30, "minutes").toISOString();

    console.log("Checking availability for:", { formattedDate, formattedTime, fromTime, toTime, doctorId });

    // Find existing appointments for the doctor with overlapping time range
    const appointments = await Appointment.find({
      doctorId,
      date: formattedDate, // Match exact date
      time: {
        $gte: moment(fromTime).format("HH:mm"), // Greater than or equal to fromTime
        $lt: moment(toTime).format("HH:mm"),   // Less than toTime
      },
    });

    console.log("Appointments found:", appointments);

    // If appointments exist, doctor is not available at the requested time
    if (appointments.length > 0) {
      return res.status(400).send({
        msg: "Appointment not available at the requested time.",
        success: false,
      });
    }

    // If no appointments, doctor is available at the requested time
    res.status(200).send({
      msg: "This doctor is available at the requested time.",
      success: true,
    });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).send({
      msg: "Error checking availability. Please try again later.",
      success: false,
      error: error.message,  // Send error message for better clarity
    });
  }
});


router.get("/get-appointments-by-user-id", authMiddleware, async (req, res) => {
  try {
   const appointments = await Appointment.find({ userId: req.body.userId })

    res.status(200).send({
      msg: "Appointments fetched successfully",
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).send({
      msg: "Error fetching appointments",
      success: false,
      error,
    });
  }
});




module.exports = router;
