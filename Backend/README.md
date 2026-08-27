# MarketMet Backend - Spring Boot

A modern Spring Boot backend for the MarketMet e-commerce platform, replacing the Node.js/Express implementation with a more robust, scalable solution.

## Features

- RESTful API
- JWT authentication
- Spring Security with role-based access control (Admin/User)
- PostgreSQL integration with JPA/Hibernate
- File upload for product images
- Email notifications (optional)
- CORS support for frontend integration
- Bean Validation for request input

## Tech Stack

- Spring Boot 3.2.0
- Java 17
- PostgreSQL
- Spring Data JPA
- Spring Security
- JWT (jjwt)
- Lombok
- Maven

## Prerequisites

- Java 17 or higher
- PostgreSQL 12+
- Optional: Email account for order notifications

This project includes the Maven Wrapper, so a separate Maven installation is not required.

## Setup Instructions

### 1. Database Setup

Make sure PostgreSQL is running and create the database:

```sql
CREATE DATABASE kitenge;
```

The application will automatically create tables using JPA's `ddl-auto=update` setting.

Alternatively, you can run the SQL script from the original project:
```bash
psql -U postgres -f ../kitenge-project/setup_kitenge.sql
```

### 2. Configuration

Set environment variables (see `.env.example` for a full list):

```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/kitenge
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=your_password
JWT_SECRET=your-strong-random-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@kitenge.com
ADMIN_DEFAULT_PASSWORD=change-me
```

### 3. Build and Run

```bash
# Navigate to the backend directory
cd kitenge-backend

# Build the project
./mvnw clean install

# Run the application
./mvnw spring-boot:run
```

On Windows Command Prompt or PowerShell, use:

```powershell
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run
```

Or use your IDE to run `MarketMetApplication.java`.

The server will start on `http://localhost:8080`.

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Login and get JWT token
- `POST /api/logout` - Logout (client-side token removal)
- `GET /api/check-auth` - Check authentication status

### Products (Public)

- `GET /api/public-products` - Get all active products
- `GET /api/products/{id}` - Get product by ID

### Products (Admin Only)

- `GET /api/products` - Get all products (including inactive)
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Orders

- `POST /api/orders` - Create a new order (public)
- `GET /api/orders` - List all orders (admin only)

### Wishlist (Authenticated)

- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add/remove item from wishlist

### File Upload (Admin Only)

- `POST /api/upload-image` - Upload product image

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After login, include the token in requests:

```
Authorization: Bearer <your-jwt-token>
```

### Example Login Request

```json
POST /api/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Example Response

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "isAdmin": false
}
```

## Frontend Integration

Update your frontend to use the new API:

1. Base URL: Change from `http://localhost:4000` to `http://localhost:8080`
2. Authentication: Store JWT token and include in headers:
   ```javascript
   headers: {
     Authorization: `Bearer ${token}`,
     'Content-Type': 'application/json',
   }
   ```
3. Endpoints: All endpoints remain the same (`/api/products`, `/api/orders`, etc.)

## Project Structure

```
kitenge-backend/
- src/
  - main/
    - java/com/kitenge/
      - config/          # Configuration classes
      - controller/      # REST controllers
      - dto/             # Data Transfer Objects
      - model/           # Entity models
      - repository/      # JPA repositories
      - security/        # Security configuration
      - service/         # Business logic
      - util/            # Utility classes
    - resources/
      - application.properties
  - test/
- pom.xml
```

## Differences from Node.js Version

1. Stateless authentication with JWT instead of server-side sessions
2. Strong typing with Java
3. Layered architecture (Controller + Service + Repository)
4. Bean Validation for requests
5. JPA handles schema updates automatically
6. Structured error handling

## Production Considerations

1. Change JWT secret to a strong, random value
2. Configure database connection pooling
3. Enable HTTPS in production
4. Restrict CORS to your frontend domain
5. Configure proper logging levels
6. Use environment variables for sensitive data
7. Consider cloud storage for uploaded files (S3, etc.)
8. Set `ADMIN_DEFAULT_PASSWORD` only for initial admin creation, then rotate it

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check database credentials in `application.properties`
- Ensure database `kitenge` exists

### Port Already in Use
- Change `server.port` in `application.properties`
- Or stop the process using port 8080

### JWT Token Issues
- Ensure token is included in `Authorization` header
- Check token expiration (default: 30 days)
- Verify JWT secret matches

## License

This project is part of the MarketMet e-commerce platform.
