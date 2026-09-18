# 🏥 MediCare - Hospital Management System

A full-stack Hospital Management System built with the MERN stack, enabling patients to book appointments with doctors and doctors to manage their appointment requests in real time.
## Live Demo
- Frontend: https://hospital-management-system-indol-chi.vercel.app
- Backend API: https://hospital-management-system-l69l.onrender.com
## Features

- **Role-based Authentication** — JWT-based auth with separate flows for patients and doctors
- **Doctor Discovery** — Patients can browse available doctors with specialization, experience, fees, and availability
- **Appointment Booking** — Patients can book appointments with their preferred date and time
- **Appointment Lifecycle Management** — Doctors can accept, reject, or mark appointments as completed
- **Role-based Dashboards** — Separate, tailored dashboards for patients and doctors showing relevant appointment data
- **Responsive UI** — Clean, modern interface built with Tailwind CSS

## Tech Stack

**Frontend:**
- React (Vite)
- React Router
- Axios
- Tailwind CSS

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs

## Project Structure

hospital-management-system/
├── client/ # React frontend
│ └── src/
│ ├── pages/ # Login, Register, Dashboard, DoctorList, DoctorDashboard
│ └── components/ # Navbar
├── server/ # Express backend
│ ├── models/ # User, Patient, Doctor, Appointment
│ ├── routes/ # auth, patient, doctor, appointment
│ └── middleware/ # JWT auth middleware

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB Atlas account (or local MongoDB instance)

### Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in `server/` with:
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

Run the server:
```bash
node server.js
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173`

## API Overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register a new patient or doctor |
| POST | `/api/auth/login` | Login and receive JWT |
| GET/PUT | `/api/patient/profile` | Get/update patient profile |
| GET/PUT | `/api/doctor/profile` | Get/update doctor profile |
| GET | `/api/doctor` | Public list of all doctors |
| POST | `/api/appointments` | Book an appointment |
| GET | `/api/appointments/patient` | Get logged-in patient's appointments |
| GET | `/api/appointments/doctor` | Get logged-in doctor's appointments |
| PUT | `/api/appointments/:id` | Update appointment status |

## Future Improvements

- AI-based X-ray diagnosis module (pneumonia detection)
- Admin panel for managing doctors and patients
- Email/SMS appointment reminders
- Payment integration for consultation fees

## Author

Built by Vaibhav as a portfolio project.
