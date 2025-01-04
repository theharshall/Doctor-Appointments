const mongoose = require("mongoose");
const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    website: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    feesPerConsultation: {
      type: Number,
      required: true,
    },
    timing: {
      type: Array,
      required: true,
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.every((item) => typeof item === "string");
        },
        message: "Timing must be an array of strings",
      },
    },
    status: {
      type: String,
      default: "pending",
    }
  },
  {
    timestamps: true,
  }
);


const doctorModel = mongoose.model("doctors", doctorSchema);
module.exports = doctorModel;