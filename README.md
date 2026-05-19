# Tauche — Dive Logbook & Telemetry Analytics Suite

**Tauche** *(Swiss German for “diving”)* is a modern full-stack web application for logging, managing, and analyzing scuba dives.  
It combines detailed dive logging with interactive telemetry visualization, geospatial mapping, and an automated media upload pipeline.

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

Open a terminal in the project root directory and start the Spring Boot backend:

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

### Download the docker-compose.yml

```bash
wget https://raw.githubusercontent.com/Swissschoggi/tauche/refs/heads/main/docker-compose.yml
```

### Create Root `.env`

Place the following `.env` file in the project root:

```env
FRONTEND_PORT=3000
BACKEND_PORT=8080
POSTGRES_PORT=5432

POSTGRES_USER=dive_master
POSTGRES_PASSWORD=secure_reef_password
POSTGRES_DB=divelog_db
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
├── .mvn/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── diveApi.js
│   │   ├── components/
│   │   └── AnalyticsPage.jsx
│   ├── .env
│   └── Dockerfile
│
├── src/
│   └── main/java/com/tauche/
│       ├── config/
│       │   └── WebConfig.java
│       └── TaucheApplication.java
│
├── uploads/
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

# Important Configuration Notes

## CORS Configuration

If you change frontend ports, domains, or add reverse proxies, update the allowed origins inside:

```text
src/main/java/com/tauche/config/WebConfig.java
```

Example configuration:

```java
registry.addMapping("/**")
    .allowedOrigins(
        "http://localhost:5173",
        "http://localhost:3000"
    )
    .allowedMethods(
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    );
```

---

# Future Improvements

- Advanced dive analytics & statistics
- Live telemetry ingestion
- Mobile-responsive enhancements
- Public dive map sharing
