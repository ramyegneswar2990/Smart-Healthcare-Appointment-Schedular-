# 🏥 Smart Healthcare Appointment Scheduler

A comprehensive AI-powered healthcare appointment management system with intelligent doctor-patient matching, scheduling optimization, and medical record management.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![MongoDB](https://img.shields.io/badge/mongodb-6.0-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Key Features Documentation](#-key-features-documentation)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🤖 AI-Powered Smart Scheduling
- **Intelligent Doctor Matching**: AI analyzes patient symptoms and matches them with suitable specialists
- **Optimal Time Slot Recommendations**: ML-based slot suggestions prioritizing morning/afternoon availability
- **Doctor Scoring Algorithm**: Ranks doctors based on rating (40%), experience (30%), and specialization (30%)
- **Alternative Suggestions**: Automatically suggests backup doctors if primary choices are unavailable
- **Conflict Detection**: Real-time appointment conflict prevention

### 👨‍⚕️ Doctor Dashboard
- **Work Board**: Kanban-style appointment management (Pending, Confirmed, Completed)
- **Schedule Table**: Comprehensive appointment calendar with patient details
- **Patient Report Manager**: Upload medical reports directly to patient accounts
- **Real-time Clock**: Live date/time display in dashboard header
- **Global Search**: Search across appointments and patient requests
- **Statistics**: Total patients, today's appointments, and request counts
- **Profile Management**: Update professional details and specialization

### 👤 Patient Dashboard
- **Health Overview**: Quick stats on appointments, prescriptions, and reports
- **AI Smart Booking**: Symptom-based intelligent appointment booking
- **Quick Book**: Traditional appointment scheduling
- **Digital Prescriptions**: View and download prescription slips
- **Medical Reports**: Access all uploaded medical reports
- **Doctor Directory**: Browse specialists with ratings and experience
- **Profile Editing**: Update personal and medical information

### 📊 Report Management System
- **Doctor-to-Patient Reports**: Doctors upload reports that auto-sync to patient dashboards
- **Status Tracking**: Pending, Reviewed, Updated status indicators
- **Clinical Notes**: Attach findings and recommendations
- **File Upload Support**: PDF, JPG, PNG (ready for cloud storage integration)
- **Report History**: Complete chronological medical record tracking

### 🔐 Authentication & Security
- **JWT-based Authentication**: Secure token-based user sessions
- **Role-based Access Control**: Separate doctor and patient permissions
- **Password Encryption**: bcrypt hashing for secure password storage
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Auto-generated profile images for new users

---

## 🛠️ Tech Stack

### Frontend
- **React** 18.2.0 - UI framework
- **React Router DOM** 6.x - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling with Outfit font family
- **Context API** - State management

### Backend
- **Node.js** 14+ - Runtime environment
- **Express.js** 4.x - Web framework
- **MongoDB** 6.0+ - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development Tools
- **nodemon** - Auto-restart server
- **dotenv** - Environment variable management
- **Git** - Version control

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Doctor     │  │   Patient    │  │    Auth      │      │
│  │  Dashboard   │  │  Dashboard   │  │   Pages      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/REST
┌───────────────────────────┴─────────────────────────────────┐
│                    Express.js Server                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth       │  │  Scheduler   │  │   Report     │      │
│  │   Routes     │  │   Service    │  │  Controller  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────┴─────────────────────────────────┐
│                      MongoDB Database                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Users     │  │ Appointments │  │   Reports    │      │
│  │ Prescriptions│  │ Availability │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher)
- **MongoDB** (v6.0 or higher)
- **npm** or **yarn**
- **Git**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ramyegneswar2990/Smart-Healthcare-Appointment-Schedular-.git
cd Smart-Healthcare-Appointment-Schedular-
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### 1. Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/healthcare_db
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/healthcare_db

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Optional: File Upload (for production)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Frontend Configuration

Update `frontend/src/utils/api.js` if needed:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Change for production
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "patient"
}
```

#### Login
```http
POST /api/auth/login

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### AI Scheduler Endpoints

#### Get Smart Recommendations
```http
POST /api/scheduler/recommendations
Authorization: Bearer {token}

{
  "condition": "heart",
  "symptoms": "chest pain",
  "preferredDate": "2025-12-30",
  "urgency": "high"
}
```

---

## 📁 Project Structure

```
Smart-Healthcare/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Ram Yegneswar**
- GitHub: [@ramyegneswar2990](https://github.com/ramyegneswar2990)
- Repository: [Smart Healthcare Appointment Scheduler](https://github.com/ramyegneswar2990/Smart-Healthcare-Appointment-Schedular-)

---

**Built with ❤️ for better healthcare management**
