# Doctor Appointments API Documentation

## Base URL

https://github.com/theharshall/Doctor-Appointments/blob/main/API/api_docs.README.md


## Endpoints

### User Endpoints
- *POST /api/user/register*
  - Registers a new user.
  - Request Body: { "name": "string", "email": "string", "password": "string" }
  - Response: 201 Created

- *POST /api/user/login*
  - Logs in a user.
  - Request Body: { "email": "string", "password": "string" }
  - Response: 200 OK

- *GET /api/user/get-appointments-by-user-id*
  - Retrieves appointments for a user.
  - Requires authentication.
  - Response: 200 OK

### Doctor Endpoints
- *POST /api/doctors/get-doctor-info*
  - Retrieves doctor information by user ID.
  - Requires authentication.
  - Request Body: { "userId": "string" }
  - Response: 200 OK

- *POST /api/doctors/get-doctor-info-by-id*
  - Retrieves doctor information by doctor ID.
  - Requires authentication.
  - Request Body: { "doctorId": "string" }
  - Response: 200 OK

- *POST /api/doctors/update-doctor-profile*
  - Updates doctor profile.
  - Request Body: { "userId": "string", "updateData": "object" }
  - Response: 200 OK

- *GET /api/doctors/get-appointments-by-doctor-id*
  - Retrieves appointments for a doctor.
  - Requires authentication.
  - Response: 200 OK

### Appointment Endpoints
- *POST /api/user/book-appointment*
  - Books a new appointment.
  - Request Body: { "userId": "string", "doctorId": "string", "date": "string", "time": "string" }
  - Response: 200 OK

- *POST /api/user/check-booking-availability*
  - Checks booking availability.
  - Request Body: { "date": "string", "time": "string", "doctorId": "string" }
  - Response: 200 OK

### Admin Endpoints
- *GET /api/admin/get-all-doctors*
  - Retrieves all doctors.
  - Requires authentication.
  - Response: 200 OK

- *GET /api/admin/get-all-users*
  - Retrieves all users.
  - Requires authentication.
  - Response: 200 OK

- *POST /api/admin/change-doctors-account-status*
  - Changes doctor account status.
  - Requires authentication.
  - Request Body: { "doctorId": "string", "status": "string" }
  - Response: 200 OK

## Environment Variables
- PORT: Port number for the backend server.
- MONGO_URI: MongoDB connection string.
- JWT_SECRET: Secret key for JWT authentication.
