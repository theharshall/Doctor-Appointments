const express = require("express");
const cors = require("cors"); // Import the cors package
const app = express();
require("dotenv").config();

// Set up database connection
async function main() {
  try {
    mongoose.connect(process.env.MONGO_URL);
    console.log("db connected");
  } catch (error) {
    console.log("db not connected");
  }
}

main();

// Middleware
app.use(express.json()); // Parse incoming JSON requests

// Enable CORS
app.use(cors());

// User routes
const userRoute = require("./routes/userRoute");
app.use("/api/user", userRoute);

//Admin routes
const adminRoute = require("./routes/adminRoute");
app.use("/api/admin", adminRoute);

//doctors routes
const doctorsRoute = require("./routes/doctorsRoute");
app.use("/api/doctors", doctorsRoute);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
