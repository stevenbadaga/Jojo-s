# Esoko - Full Stack E-Commerce Application

Modern React frontend + Spring Boot backend for a complete e-commerce experience.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Java 17+
- Maven 3.6+
- PostgreSQL 12+

### 1. Database Setup

Create a PostgreSQL database:
```sql
CREATE DATABASE kitenge;
```

### 2. Backend Setup

```bash
cd kitenge-backend
```

Set your environment variables (see `kitenge-backend/.env.example` for a full list), then run:

```bash
# Windows
start-server.bat

# Or manually
mvn spring-boot:run
```

Backend will run on `http://localhost:8080`.

### 3. Frontend Setup

```bash
cd kitenge-frontend
npm install
```

Start the frontend:
```bash
# Windows
start-frontend.bat

# Or manually
npm run dev
```

Frontend will run on `http://localhost:3000`.

### 4. Open Browser

Visit: `http://localhost:3000`

---

## Project Structure

```
esoko/
- kitenge-backend/      # Spring Boot Backend (Port 8080)
  - src/main/java/      # Java source code
  - src/main/resources/application.properties
  - start-server.bat    # Windows start script

- kitenge-frontend/     # React Frontend (Port 3000)
  - src/                # React source code
  - public/             # Static assets
  - start-frontend.bat  # Windows start script
```

---

## Features

### Customer Features
- Browse products with search and filters
- Shopping cart
- Wishlist
- User authentication
- Order history
- WhatsApp checkout
- Mobile-optimized (Android and iOS)

### Admin Features
- Dashboard with metrics
- Product management (CRUD)
- Image uploads
- Order management
- Customer management

---

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Spring Boot 3.2.0
- PostgreSQL
- JWT Authentication
- Spring Security

---

## Documentation

- `kitenge-backend/README.md` - Backend documentation
- `kitenge-frontend/README.md` - Frontend documentation

---

## Status

- Backend: Complete
- Frontend: Complete
- Database: Configured
- Authentication: JWT
- Mobile Optimized: Android and iOS

---

## License

This project is private and proprietary.
