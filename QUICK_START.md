# Quick Start: Running Tauche with New Features

## Prerequisites
- Java 21
- Node.js 18+
- PostgreSQL 15
- Maven 3.9+

## 1. Backend Setup

### Start PostgreSQL
```bash
# Make sure PostgreSQL is running
# Docker: docker run --name tauche-db -e POSTGRES_PASSWORD=yourpassword -d postgres:15
```

### Create Database and Run Migrations
```bash
cd /srv/coding/Tauche

# The migration script is at:
# src/main/resources/db/migration/V2__create_certifications_and_trips_tables.sql

# Run backend (will auto-migrate with Spring Boot)
./mvnw clean spring-boot:run
```

The backend will be available at: `http://localhost:8989`

### Verify Backend API
```bash
# First, login to get a token
curl -X POST http://localhost:8989/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com", "password":"password", "nonce":"..."}'

# Then test certification endpoint (replace TOKEN with your JWT)
curl -X GET http://localhost:8989/api/certifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 2. Frontend Setup

```bash
cd /srv/coding/Tauche/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## 3. Access New Features

Once both frontend and backend are running:

### Mobile Optimization
- Simply resize browser window to test responsive design
- Or use DevTools responsive mode (F12 → Toggle device toolbar)
- Test at breakpoints: 480px (mobile), 768px (tablet), 1024px+ (desktop)

### Certification Management
- Login to the app
- Navigate to `/certification` in URL bar
- Your existing certifications will be visible (from localStorage during dev)
- Click "Add Certification" to test the form
- Currently using localStorage - will connect to backend after DB migration

### Dive Trip Planning
- Navigate to `/trips` in URL bar
- Click "Plan New Trip" to create a trip
- Click on any trip card to view details
- Add dives to trips on the detail page
- All data is backend-persistent

## 4. Database Migrations

The migration file is pre-created at:
```
src/main/resources/db/migration/V2__create_certifications_and_trips_tables.sql
```

If using Flyway or Liquibase migrations (Spring Boot handles this automatically):
- Tables will be created automatically on first run
- Or manually run the SQL file in your PostgreSQL client

## 5. Docker (All-in-One)

```bash
cd /srv/coding/Tauche

# Build and run everything
docker-compose up --build

# Access at http://localhost:8989
# Backend: http://localhost:8989
# Frontend: http://localhost:8989 (served by backend)
```

## 6. Testing the APIs

### Create a Certification
```bash
curl -X POST http://localhost:8989/api/certifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "certificationName": "Open Water Diver",
    "agency": "PADI",
    "maxDepth": 40,
    "dateIssued": "2023-06-15",
    "expiryDate": "2025-06-15",
    "certificationNumber": "OW-12345-67"
  }'
```

### Create a Trip
```bash
curl -X POST http://localhost:8989/api/trips \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tripName": "Bali Diving Adventure",
    "destination": "Bali, Indonesia",
    "startDate": "2024-07-01",
    "endDate": "2024-07-07",
    "description": "Week-long diving trip with friends"
  }'
```

### Get All Trips
```bash
curl -X GET http://localhost:8989/api/trips \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 7. Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `psql -U postgres -d tauche`
- Check port 8989 is free: `lsof -i :8989`
- Check Java 21: `java -version`

### Frontend shows 404
- Check backend is running: `curl http://localhost:8989/api/auth/nonce -X POST`
- Check frontend port 5173: `lsof -i :5173`
- Clear browser cache (Ctrl+Shift+Delete)

### Data not persisting
- Confirm database migration ran: check PostgreSQL tables
- Check JWT token in localStorage is valid
- Check browser console for API errors (F12)

### Mobile not responsive
- Use Chrome DevTools (F12 → Toggle device toolbar)
- Test at 375px width (iPhone size)
- Check that CSS media queries are loaded

## 8. File Locations Reference

### Backend Models/Controllers
```
src/main/java/com/tauche/tauche/
├── model/
│   ├── Certification.java
│   ├── DiveTrip.java
│   └── DiveTripDive.java
├── repository/
│   ├── CertificationRepository.java
│   └── DiveTripRepository.java
├── service/
│   ├── CertificationService.java
│   └── DiveTripService.java
└── controller/
    ├── CertificationController.java
    └── DiveTripController.java
```

### Frontend Components
```
frontend/src/pages/
├── TripsPage.jsx
├── TripsPage.css
├── TripDetailPage.jsx
└── TripDetailPage.css

frontend/src/api/
└── diveApi.js (updated with new endpoints)

frontend/src/
├── App.jsx (updated with new routes)
└── index.css (enhanced mobile styles)
```

### Database Migrations
```
src/main/resources/db/migration/
└── V2__create_certifications_and_trips_tables.sql
```

## 9. Next Development Steps

1. **Connect CertificationPage to Backend**
   - Update CertificationPage.jsx to use API endpoints instead of localStorage

2. **Add More Trip Features**
   - Trip packing lists
   - Shared trip invitations
   - Trip budget tracking
   - Dive forecasts for trip destinations

3. **Enhance Certifications**
   - Renewal reminders
   - Certification renewal workflows
   - Certification document uploads

4. **Mobile App**
   - Consider React Native for native mobile app

5. **Testing**
   - Add JUnit tests for services
   - Add integration tests for controllers
   - Add E2E tests with Cypress

## Support

For issues or questions:
1. Check the implementation summary at `/tmp/IMPLEMENTATION_SUMMARY.md`
2. Review the API documentation in each controller
3. Check browser console (F12) for errors
4. Check backend logs: `./mvnw spring-boot:run` output
