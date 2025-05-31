# Charging Station REST API

A comprehensive REST API for managing EV charging stations with user authentication using Node.js, Express, MongoDB, and JWT.

## Features

- **User Authentication**
  - User registration and login
  - JWT token-based authentication
  - Protected routes

- **Charging Station Management**
  - Create, Read, Update, Delete (CRUD) operations
  - Advanced filtering and pagination
  - Geolocation-based nearby search
  - Comprehensive station details

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd charging-station-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/charging-stations
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes

#### Register User
- **POST** `/api/auth/register`
- Body:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### Login User
- **POST** `/api/auth/login`
- Body:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### Get Current User
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`

### Charging Station Routes

All station routes require authentication. Include the JWT token in the Authorization header:
`Authorization: Bearer <your-jwt-token>`

#### Create Charging Station
- **POST** `/api/stations`
- Body:
  ```json
  {
    "name": "Downtown Charging Hub",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St, New York, NY"
    },
    "status": "Active",
    "power": 150,
    "connectorTypes": ["Type 2", "CCS"],
    "pricePerKwh": 0.25,
    "amenities": ["WiFi", "Restroom", "Cafe"]
  }
  ```

#### Get All Charging Stations
- **GET** `/api/stations`
- Query Parameters:
  - `page` (default: 1)
  - `limit` (default: 10, max: 100)
  - `status` (Active/Inactive/Maintenance)
  - `minPower` and `maxPower`
  - `search` (search in name and address)

#### Get Single Charging Station
- **GET** `/api/stations/:id`

#### Update Charging Station
- **PUT** `/api/stations/:id`
- Body: (same as create, all fields optional)

#### Delete Charging Station
- **DELETE** `/api/stations/:id`

#### Get Nearby Stations
- **GET** `/api/stations/nearby/:latitude/:longitude`
- Query Parameters:
  - `radius` (km, default: 10)
  - `limit` (default: 20, max: 50)

## Data Models

### User Model
```javascript
{
  username: String (required, unique, 3-30 chars),
  email: String (required, unique, valid email),
  password: String (required, min 6 chars, hashed),
  timestamps: true
}
```

### Charging Station Model
```javascript
{
  name: String (required, max 100 chars),
  location: {
    latitude: Number (required, -90 to 90),
    longitude: Number (required, -180 to 180),
    address: String (optional, max 200 chars)
  },
  status: String (Active/Inactive/Maintenance, default: Active),
  power: Number (required, positive),
  connectorTypes: [String] (Type 1/Type 2/CCS/CHAdeMO/Tesla Supercharger),
  pricePerKwh: Number (optional, positive),
  amenities: [String],
  createdBy: ObjectId (User reference),
  timestamps: true
}
```

## Example Usage

### 1. Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Create a charging station
```bash
curl -X POST http://localhost:5000/api/stations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Downtown Charging Hub",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "123 Main St, New York, NY"
    },
    "power": 150,
    "status": "Active"
  }'
```

### 4. Get all stations with filtering
```bash
curl "http://localhost:5000/api/stations?status=Active&minPower=100&page=1&limit=5" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Security Features

- Password hashing using bcryptjs
- JWT token authentication
- Input validation and sanitization
- Protected routes
- Error handling middleware

## Error Handling

The API returns consistent error responses:
```json
{
  "message": "Error description",
  "errors": [/* validation errors if applicable */]
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Development

To extend this API:

1. **Add new fields** to the ChargingStation model
2. **Create new routes** in the routes directory
3. **Add middleware** for additional functionality
4. **Implement rate limiting** for production use
5. **Add comprehensive logging**
6. **Set up API documentation** (Swagger/OpenAPI)

## Production Considerations

- Use a production-grade database (MongoDB Atlas)
- Implement rate limiting
- Add comprehensive logging
- Set up monitoring and health checks
- Use HTTPS in production
- Implement API versioning
- Add comprehensive tests
- Set up CI/CD pipeline