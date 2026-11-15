# 🏥 MediTrack: Smart Outpatient Queue & Digital Prescription System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-00D1B2?style=for-the-badge&logo=render&logoColor=white)](https://meditrack-m156.onrender.com)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Nidhi-shakya/MediTrack)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **Live Production URL:** [https://meditrack-m156.onrender.com](https://meditrack-m156.onrender.com)  
> **Demo Staff PIN:** `1234`

---

## 📋 Project Overview
**MediTrack** is a real-time outpatient department (OPD) queue optimization and digital prescription system designed for clinics and polyclinics. It features an **Automated Smart Triage Engine** that evaluates vitals (temperature, age, symptoms) in real time to prioritize critical patients, a synchronized live queue board, multilingual support (English, Hindi, Punjabi), role-guarded staff terminals, and a print-ready digital prescription pad.

---

## 🎯 25-Mark University Evaluation Rubric Compliance

| # | Technical Requirement | Implementation File(s) & Description | Rubric Status |
|---|---|---|:---:|
| **1** | **Multiple React Components** | `Navbar`, `StatCard`, `PatientCard`, `BookingForm`, `LiveQueueBoard`, `ProtectedRoute`, `BookingPage`, `LiveQueuePage`, `ReceptionDashboard`, `DoctorPortal`, `LoginPage` | ✅ Complete |
| **2** | **Responsive Web Design** | Mobile-first layout with Tailwind breakpoints (`sm:`, `md:`, `lg:`, `xl:`), responsive tables, and mobile navigation drawer | ✅ Complete |
| **3** | **Tailwind CSS** | Medical UI design with triage badges, clinical cards, stat tiles, animated status pills, and printable prescription layout | ✅ Complete |
| **4** | **Fetch API** | Pure native `fetch()` with `async/await` throughout `ClinicContext.jsx` without Axios dependency | ✅ Complete |
| **5** | **Error Handling** | Full `try/catch` blocks on Express routes and React frontend with dismissible UI error/success banners | ✅ Complete |
| **6** | **Props and State** | Props passed down to child components (`PatientCard`, `StatCard`, etc.); local state managed with `useState` | ✅ Complete |
| **7** | **Conditional Rendering** | Ternary operators (`? :`) and logical `&&` for loading spinners, triage alert badges, role actions, and empty queue states | ✅ Complete |
| **8** | **React Router & Protected Routes** | `react-router-dom` v6 (`/`, `/queue`, `/login`, and protected `/reception` & `/doctor` via `<ProtectedRoute>`) | ✅ Complete |
| **9** | **Forms and Form Validation** | Controlled booking & login forms: Name $\ge$ 3 chars, Age 1–120, Phone regex `/^[6-9]\d{9}$/`, Temp 95–108°F, inline red error feedback | ✅ Complete |
| **10** | **Hooks & Context API** | Global `ClinicContext` (`useContext`, `useState`, `useEffect`, `useMemo`) for auth, queue sync, and trilingual support (EN / HI / PA) | ✅ Complete |
| **11** | **REST API** | Express modular routes: `GET /api/patients`, `POST /api/patients`, `PUT /api/patients/:id`, `DELETE /api/patients/:id`, `POST /api/prescriptions`, `POST /api/auth/login` | ✅ Complete |
| **12** | **Environment Variables** | `dotenv` configuration with `.env` and `.env.example` defining `PORT`, `MONGODB_URI`, and `STAFF_PIN` | ✅ Complete |
| **13** | **MongoDB CRUD** | Full CRUD operations for creating, reading, updating patient status, and deleting records | ✅ Complete |
| **14** | **MongoDB Atlas & Fallback** | `mongoose.connect(process.env.MONGODB_URI)` + **Smart In-Memory Fallback** with 4 pre-seeded realistic Indian patient records for offline demo resiliency | ✅ Complete |
| **15** | **Mongoose Schemas** | `models/Patient.js` and `models/Prescription.js` with types, `required`, `enum`, regex, and `timestamps: true` | ✅ Complete |

---

## ⚡ Real-Time Scenario Features

### 1. Automated Smart Triage Engine
When a patient books a token, their priority and risk score are computed instantly:
- 🔴 **High Priority (Red Alert, 85% Risk Score):** Triggered if Age $\ge 65$ OR Temperature $\ge 102^\circ\text{F}$ OR Symptoms include *"Chest Pain"* or *"Breathing Difficulty"*. Placed at the top of the waiting queue.
- 🟡 **Medium Priority (Urgent, 50% Risk Score):** Triggered if Age $\ge 50$ OR Temperature $\ge 100^\circ\text{F}$.
- 🟢 **Normal Priority (Routine, 15% Risk Score):** Routine outpatient consultations queued sequentially.

### 2. Live Waiting Time Calculation
$$\text{Estimated Wait Time} = \text{Patients Ahead in Queue} \times 10\text{ minutes}$$

### 3. Digital Prescription Pad (`/doctor`)
- Allows physicians to select any patient in line.
- Dynamic medication list editor with dosage patterns (`1-0-1`, `1-0-0`, `0-0-1`, `1-1-1`, `As Needed`) and durations.
- Clinical advice, doctor notes, and registration number.
- Saving automatically transitions the patient's queue status to `Completed`.
- Generates a print-ready OPD slip with clinic header and signature line.

### 4. Multilingual Context
Seamlessly toggle the complete interface between:
- 🇬🇧 **English**
- 🇮🇳 **हिन्दी (Hindi)**
- 🇮🇳 **ਪੰਜਾਬੀ (Punjabi)**

---

## 🛠️ REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | Server health check and database connection mode |
| `GET` | `/api/patients` | Retrieve all patients sorted by triage priority and status |
| `POST` | `/api/patients` | Register new appointment, compute triage, and issue token |
| `PUT` | `/api/patients/:id` | Update patient status (`Waiting` $\rightarrow$ `In-Consultation` $\rightarrow$ `Completed`) |
| `DELETE`| `/api/patients/:id` | Remove patient record from clinic queue |
| `POST` | `/api/prescriptions` | Save prescription and auto-mark patient as completed |
| `GET` | `/api/prescriptions` | Retrieve prescription history |
| `POST` | `/api/auth/login` | Authenticate clinic staff via 4-digit PIN |

---

## 💻 Local Setup & Execution

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
# Clone the repository
git clone https://github.com/Nidhi-shakya/MediTrack.git
cd MediTrack

# Install all dependencies (frontend and backend)
npm run install:all

# Build frontend production assets
npm run build

# Start unified server on http://localhost:5000
npm start
```

---

## 🔐 Staff Demo Credentials
- **PIN:** `1234`
- **Roles:**
  - Receptionist (`/reception`)
  - Consulting Doctor (`/doctor`)

---

## 📂 Repository Structure
```text
MediTrack/
├── backend/
│   ├── models/
│   │   ├── Patient.js              # Mongoose Patient Schema
│   │   └── Prescription.js         # Mongoose Prescription Schema
│   ├── .env.example                # Sample environment file
│   ├── package.json
│   └── server.js                   # Unified Express REST API + Static Server
├── frontend/
│   ├── src/
│   │   ├── components/             # Navbar, PatientCard, StatCard, BookingForm, etc.
│   │   ├── context/                # ClinicContext (Context API + Fetch API)
│   │   ├── pages/                  # BookingPage, LiveQueuePage, Reception, Doctor, Login
│   │   ├── App.jsx                 # React Router v6 configuration
│   │   └── main.jsx
│   ├── tailwind.config.js          # Tailwind CSS medical color system
│   ├── vite.config.js
│   └── package.json
├── package.json                    # Root full-stack orchestration
├── render.yaml                     # Cloud deployment blueprint
└── README.md
```
