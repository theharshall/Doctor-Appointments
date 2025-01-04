const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).send({
        message: "No token provided",
        success: false,
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Auth Failed",
          success: false,
        });
      }
      // Add userId from decoded token to the request body
      req.body.userId = decoded.id;
      next(); // Pass control to the next middleware or route handler
    });
  } catch (error) {
    return res.status(401).send({
      message: "Auth Failed",
      success: false,
    });
  }
};
