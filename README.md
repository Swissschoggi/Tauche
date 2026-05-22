# Tauche - Dive Logbook & Telemetry Analytics Suite

[![Live Demo](https://img.shields.io/badge/Live%20Demo-tauche.onrender.com-38bdf8?style=for-the-badge&logo=render&logoColor=white)](https://tauche.onrender.com)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)

**Tauche** *(Swiss German for “diving”)* is a modern full-stack web application for logging, managing, and analyzing scuba dives.  
It combines detailed dive logging with interactive telemetry visualization, equipment service tracking, media upload and sharing capabilities.
As a disclaimer, I partially vibecoded this, due to time constraints and lack of knowledge. I am always happy if people can help me improve both my skills and this app by opening issues :)
> **Live Demo**: [https://tauche.onrender.com](https://tauche.onrender.com)
> 
> *Note: The free tier may take up to 30 seconds to wake up on first visit.*

---

## Features

-  Dive log management with rich metadata
-  Interactive SVG telemetry profile timeline
-  Map-based dive overview
-  image/media upload
-  Fully containerized deployment
-  Modern React + Spring Boot architecture


---

# Local Development

To run Tauche locally **without Docker**, start the backend and frontend separately.

---

## Prerequisites

Make sure the following tools are installed:

- **Java 21+ (JDK)**
- **Node.js 20+**
- **npm**
- A running **PostgreSQL** instance matching your backend configuration

---

##  Backend Setup

1. Configure your local database properties or environment variables.
2. Run the Spring Boot wrapper script inside the root directory:

```bash
./mvnw spring-boot:run
```

The backend will be available at:

```text
http://localhost:8080
```

### Uploaded Media

User-uploaded images are stored in:

```text
./uploads/
```

---

## Frontend Setup

Create a `.env` file inside the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Then start the frontend development server:

```bash
cd frontend

npm install
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

*(or port 3000 depending on your Vite configuration)*

---

# Docker Deployment

## Docker Compose Setup

### Download the docker-compose.yml and .env file

```bash
wget https://raw.githubusercontent.com/Swissschoggi/tauche/refs/heads/main/docker-compose.yml
wget https://raw.githubusercontent.com/Swissschoggi/tauche/refs/heads/main/.env.example
mv .env.example .env
```
---

### Launch the Stack

Build and start all services:

```bash
docker-compose up -d
```

---

# Project Structure

```text
Tauche/
├── docker-compose.yml
├── Dockerfile
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── DiveCalculations.jsx
│   │   │   ├── DiveTrendChart.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── CertificationPage.jsx
│   │   │   ├── DiveFormPage.jsx
│   │   │   ├── DiveInfo.jsx
│   │   │   ├── EquipmentPage.jsx
│   │   │   ├── GearPackingList.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MapPage.jsx
│   │   │   ├── MedicalQuestionnaire.jsx
│   │   │   ├── PhotoGallery.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   └── SharedDivePage.jsx
│   │   └── ...
│   └── vite.config.js
├── LICENSE
├── pom.xml
├── README.md
├── render.yaml
└── src/
    └── main/
        └── java/
            └── com/tauche/tauche/
                ├── config/
                ├── controller/
                ├── dto/
                ├── model/
                ├── repository/
                ├── service/
                └── TaucheApplication.java
```

---

# Important Configuration Notes

## CORS Configuration

Tauche parses cross-origin restrictions dynamically at startup from your environment configuration. You do not need to change java core code to whitelist new nodes. Simply append your target access URLs directly to the ALLOWED_ORIGINS variable separated by commas inside your active .env context block before firing docker commands:

```env
ALLOWED_ORIGINS=[http://172.168.1.143:8989](http://172.168.1.143:8989),http://localhost:5173
```

---

# Future Improvements

- Advanced dive analytics & statistics
- Live telemetry ingestion
- Mobile-responsive enhancements
- Public dive map sharing
