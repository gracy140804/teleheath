# AI-Driven Smart Telehealth Platform

A production-ready, AI-powered telehealth web application with speech-based symptom analysis and intelligent doctor recommendations.

## Core Features

- **RBAC (Role-Based Access Control):** Separate dashboards and features for Patients, Doctors, and Admins.
- **AI-Powered Symptom Submission:** Record/Upload voice, convert to text (STT), and analyze with Med-BERT for clinical extraction.
- **Intelligent Doctor Recommendation:** Uses Neural Collaborative Filtering (NCF) to rank and recommend top 3 specialists.
- **Secure Appointment Booking:** Integrated calendar, simulated payment gateway, and confirmation.
- **Doctor Clinical Tools:** Manage appointments, view AI-analyzed patient data, and create digital prescriptions.
- **Admin Command Center:** Approve doctors, manage all users, and view platform-wide analytics.
- **Premium UI/UX:** Modern, glassmorphism-based design with smooth animations.

## Tech Stack

- **Frontend:** Next.js 14+, Tailwind CSS, Framer Motion, Axios.
- **Backend:** FastAPI (Python 3.10+), SQLAlchemy ORM, Pydantic, JWT Auth.
- **AI Modules:** Speech-to-Text (Whisper), Clinical NLP (Med-BERT), Recommendation (NCF).
- **Database:** PostgreSQL (supports SQLite for development).

## Setup Instructions

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (optional, can use SQLite)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Default Credentials (Mock)
- **Patient:** jane@example.com / password123
- **Doctor:** sarah@example.com / password123 (Needs Admin Approval)
- **Admin:** admin@healthai.com / admin123

## AI Pipeline Visualization

1. **Capture:** Microphone recording of patient symptoms.
2. **Decode:** Whisper converts audio to clinical transcription.
3. **Analyze:** Med-BERT extracts symptoms, severity, and involved body parts.
4. **Rank:** NCF model processes patient embedding vs doctor embeddings.
5. **Recommend:** Top matched specialists are displayed for instant booking.

---

Built for excellence by Antigravity AI.
