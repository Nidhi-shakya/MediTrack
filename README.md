# 🏥 MediTrack: Smart Outpatient Queue & Digital Prescription System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-00D1B2?style=for-the-badge&logo=render&logoColor=white)](https://meditrack-m156.onrender.com)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Nidhi-shakya/MediTrack)
[![Security](https://img.shields.io/badge/Security-JWT%20%2B%20Bcrypt%20%2B%20RBAC-blue?style=for-the-badge&logo=auth0&logoColor=white)](https://jwt.io/)
[![Tests](https://img.shields.io/badge/Tests-36%20Passed%20(Jest)-brightgreen?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)

> **Live Production URL:** [https://meditrack-m156.onrender.com](https://meditrack-m156.onrender.com)  
> **Staff Credentials:** PIN `1234` (Bcrypt verified) • Roles: Receptionist (`reception`) & Doctor (`doctor`)

---

## 📋 Project Overview
**MediTrack** is a secure, real-time outpatient department (OPD) queue coordination and digital prescription system designed for modern community clinics and hospitals. It integrates:
- **Automated Smart Triage Engine:** Calculates patient urgency scores in real time based on vitals, demographics, and clinical red flags, complete with ethical decision-support disclaimers.
- **Enterprise Security Architecture:** Real JSON Web Token (JWT) authentication with 8-hour expiration, Bcrypt password hashing (10 salt rounds), and strict Role-Based Access Control (RBAC).
- **Patient Data Privacy Layer:** Protects patient anonymity by masking names (e.g. `Ramesh S.`) and strictly preventing exposure of phone numbers and raw symptoms through public queue feeds.
- **Dual Storage Engine:** Seamless connection to MongoDB Atlas with an automated in-memory failover fallback ensuring 100% demo uptime.
- **Digital Prescription Pad:** Doctor-authenticated Rx pad that automatically transitions patient queue status to `Completed` and generates formatted print slips.
- **Bilingual Accessibility:** English and हिन्दी (Hindi) language support.

---

## 🔒 Security Architecture & Role-Based Access Control (RBAC)

### 1. Authentication Layer
- **Cryptographic Signing:** Industry-standard `jsonwebtoken` (HMAC-SHA256) signed with `JWT_SECRET`.
- **Credential Storage:** Staff PINs and passwords are never stored in plain text; all credentials are encrypted using `bcryptjs` with 10 salt rounds.
- **Session Lifecycle:** Tokens expire in 8 hours (`JWT_EXPIRES_IN=8h`). The client context automatically catches `TOKEN_EXPIRED` (HTTP 401), clears storage, and redirects to the sign-in modal.

### 2. Authorization Permission Matrix

| Endpoint | Method | Public | Receptionist | Consulting Doctor | Purpose |
|---|:---:|:---:|:---:|:---:|---|
| `/api/patients/public-queue` | `GET` | ✅ Allowed (Masked) | ✅ Allowed | ✅ Allowed | Privacy-safe live queue board |
| `/api/patients` | `POST` | ✅ Allowed | ✅ Allowed | ✅ Allowed | Register appointment & triage |
| `/api/auth/login` | `POST` | ✅ Allowed | ✅ Allowed | ✅ Allowed | Bcrypt verify PIN & return JWT |
| `/api/patients` | `GET` | ❌ 401 Blocked | ✅ Allowed (Full Data) | ✅ Allowed (Full Data) | Full clinical patient roster |
| `/api/patients/:id` | `PUT` | ❌ 401 Blocked | ✅ Allowed | ✅ Allowed | Advance consultation status |
| `/api/patients/:id` | `DELETE`| ❌ 401 Blocked | ✅ Allowed | ❌ 403 Forbidden | Remove record from queue |
| `/api/prescriptions` | `POST` | ❌ 401 Blocked | ❌ 403 Forbidden | ✅ Allowed | Issue official Rx and complete |
| `/api/prescriptions` | `GET` | ❌ 401 Blocked | ✅ Allowed | ✅ Allowed | Review digital Rx archive |

### 3. Patient Data Privacy Enforcement (HIPAA / DISHA Principles)
- **Public View Isolation:** When unauthenticated patients or waiting room displays access `/api/patients/public-queue`, sensitive fields (`phone`, `symptoms`, clinical notes) are stripped before sending the response.
- **Name Masking:** Names are obfuscated (e.g. `Ramesh Sharma` $\rightarrow$ `Ramesh S.`).
- **Data Leak Prevention:** Sanitized error handling middleware masks all internal database exceptions and stack traces from API callers.

---

## 🧬 Automated Smart Triage & Clinical Decision-Support

### Priority Classification Rules
- 🔴 **High Priority (Priority 1, 85% Estimated Risk Score):**  
  Triggered if **Age $\ge 65$** OR **Temperature $\ge 102^\circ\text{F}$** OR **Acute Red-Flag Symptoms** (*severe chest pain, shortness of breath, sudden numbness, loss of consciousness*). Automatically sequenced to the head of the queue.
- 🟡 **Medium Priority (Priority 2, 50% Estimated Risk Score):**  
  Triggered if **Age $\ge 50$** OR **Temperature $\ge 100^\circ\text{F}$**.
- 🟢 **Normal Priority (Priority 3, 15% Estimated Risk Score):**  
  Standard routine outpatient checkup sequenced sequentially.

### ⚠️ Decision-Support & Medical Safety Disclaimer
> *"MediTrack Automated Smart Triage is an algorithmic decision-support tool developed strictly for queue prioritization and educational demonstration. It is NOT a clinically validated diagnostic device or medical diagnosis. Attending licensed physicians retain sole clinical responsibility for all patient assessments, triage priority overrides, and medical management. For acute emergency symptoms, patients must contact emergency medical services (112 / 102) immediately."*

---

## 🧪 Automated Test Suite (Jest + Supertest)

The project includes an end-to-end automated testing suite with **36 unit & integration tests** covering authentication, role boundaries, data privacy, patient CRUD, and triage logic.

```bash
# Run all automated tests
cd backend
npm test
```

### Test Suite Breakdown:
1. `tests/auth.test.js`: Verifies JWT issuance, Bcrypt comparison, 401 on incorrect PIN, and `/api/auth/me` session extraction.
2. `tests/authorization.test.js`: Verifies 401 on missing/expired tokens, 403 when receptionist attempts prescribing, and 403 when doctor attempts deleting patient records.
3. `tests/privacy_and_patients.test.js`: Verifies public queue strips phone numbers and symptoms, verifies patient registration validation (min 3 chars, Indian phone regex, temperature bounds).
4. `tests/prescriptions.test.js`: Verifies doctor prescription issuance, input validation, and automatic patient status update to `Completed`.
5. `tests/triage.test.js`: Verifies all triage algorithmic branches, emergency notices, and legal disclaimers.

```text
PASS tests/authorization.test.js
PASS tests/privacy_and_patients.test.js
PASS tests/auth.test.js
PASS tests/prescriptions.test.js
PASS tests/triage.test.js

Test Suites: 5 passed, 5 total
Tests:       36 passed, 36 total
Snapshots:   0 total
Time:        8.479 s
```

---

## 🛠️ Complete REST API Reference

| Endpoint | Method | Auth Required | Description |
|---|:---:|:---:|---|
| `/api/status` | `GET` | No | System health check, database status & security mode |
| `/api/patients/public-queue` | `GET` | No | Public queue feed with masked names & no personal data |
| `/api/patients` | `POST` | No | Patient registration & smart token generation |
| `/api/auth/login` | `POST` | No | Staff authentication returning JWT |
| `/api/auth/me` | `GET` | JWT | Verified session profile |
| `/api/patients` | `GET` | JWT (Staff) | Complete patient roster with clinical vitals |
| `/api/patients/:id` | `PUT` | JWT (Staff) | Advance queue status (`Waiting` $\rightarrow$ `In-Consultation` $\rightarrow$ `Completed`) |
| `/api/patients/:id` | `DELETE` | JWT (Reception) | Remove patient record |
| `/api/prescriptions` | `POST` | JWT (Doctor) | Generate digital prescription slip |
| `/api/prescriptions` | `GET` | JWT (Staff) | Access prescription archive |

---

## ⚙️ Environment Variables

Create a `backend/.env` file based on `.env.example`:

```env
# Server Network Port
PORT=5000
NODE_ENV=production

# JSON Web Token Security
JWT_SECRET=your_super_secret_jwt_signing_key_here
JWT_EXPIRES_IN=8h

# MongoDB Atlas Cloud URI (Leave blank to use Smart In-Memory Fallback)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.yourdomain.mongodb.net/meditrack_db?retryWrites=true&w=majority

# Staff Credentials
RECEPTION_PIN=1234
DOCTOR_PIN=1234
```

---

## 🚀 Quick Start (Local Execution)

```bash
# 1. Clone repository
git clone https://github.com/Nidhi-shakya/MediTrack.git
cd MediTrack

# 2. Install all dependencies
npm run install:all

# 3. Build optimized frontend production bundle
npm run build

# 4. Start unified server on http://localhost:5000
npm start
```

---

## 🎓 University Evaluation Checklist (25 Marks)

- [x] **Multiple React Components:** `Navbar`, `StatCard`, `PatientCard`, `BookingForm`, `LiveQueueBoard`, `ProtectedRoute`, `BookingPage`, `DoctorPortal`, `ReceptionDashboard`, `LoginPage`.
- [x] **Responsive Design:** Mobile-first layout with Tailwind CSS breakpoints (`sm:`, `md:`, `lg:`, `xl:`).
- [x] **Native Fetch API:** Native `fetch()` with `async/await` throughout; zero Axios dependencies.
- [x] **Error Handling:** Full `try/catch` on frontend and backend with sanitized JSON errors.
- [x] **Props and State:** Reusable components driven by props; local and global context state.
- [x] **Conditional Rendering:** Loading spinners, triage badges, role buttons, empty states.
- [x] **React Router v6:** Public (`/`, `/queue`, `/login`) and Protected routes (`/reception`, `/doctor`).
- [x] **Validation:** Name $\ge 3$, Age 1–120, Phone `/^[6-9]\d{9}$/`, Temp 95–108°F with inline red feedback.
- [x] **Context API & Hooks:** Global `ClinicContext` with JWT session, queue synchronization, and trilingual support.
- [x] **REST API:** Modular Express router architecture.
- [x] **Environment Variables:** `.env.example` template with configurable secrets.
- [x] **MongoDB CRUD & Mongoose Schemas:** Full schema types, validators, and timestamps.
- [x] **Atlas + In-Memory Fallback:** Reliable cloud connectivity with automated offline fallback.
