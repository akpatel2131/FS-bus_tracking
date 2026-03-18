# API Documentation

This document describes the API endpoints used by the frontend application.

## Base URL

```
http://localhost:5000/api
```

## Endpoints

### Shows

#### Get All Shows
```http
GET /shows
```

**Response**
```json
[
  {
    "id": "uuid",
    "name": "Movie Night",
    "startTime": "2024-03-20T19:00:00Z",
    "totalSeats": 50,
    "availableSeats": 45,
    "bookedSeats": [1, 2, 3, 4, 5],
    "createdAt": "2024-03-15T10:00:00Z",
    "updatedAt": "2024-03-15T10:00:00Z"
  }
]
```

#### Get Show by ID
```http
GET /shows/:id
```

**Parameters**
- `id` (string, required) - Show UUID

**Response**
```json
{
  "id": "uuid",
  "name": "Movie Night",
  "startTime": "2024-03-20T19:00:00Z",
  "totalSeats": 50,
  "availableSeats": 45,
  "bookedSeats": [1, 2, 3, 4, 5]
}
```

#### Create Show
```http
POST /shows
```

**Request Body**
```json
{
  "name": "Concert Night",
  "startTime": "2024-03-25T20:00:00Z",
  "totalSeats": 100
}
```

**Response**
```json
{
  "id": "new-uuid",
  "name": "Concert Night",
  "startTime": "2024-03-25T20:00:00Z",
  "totalSeats": 100,
  "availableSeats": 100,
  "bookedSeats": []
}
```

### Bookings

#### Create Booking
```http
POST /bookings
```

**Request Body**
```json
{
  "showId": "show-uuid",
  "seatNumbers": [10, 11, 12],
  "userEmail": "user@example.com"
}
```

**Response**
```json
{
  "id": "booking-uuid",
  "showId": "show-uuid",
  "seatNumbers": [10, 11, 12],
  "status": "CONFIRMED",
  "userEmail": "user@example.com",
  "createdAt": "2024-03-15T14:30:00Z"
}
```

**Possible Status Values**
- `PENDING` - Booking is being processed
- `CONFIRMED` - Booking successful
- `FAILED` - Booking failed (seats already taken or other error)

#### Get All Bookings
```http
GET /bookings
```

**Response**
```json
[
  {
    "id": "booking-uuid",
    "showId": "show-uuid",
    "seatNumbers": [10, 11, 12],
    "status": "CONFIRMED",
    "userEmail": "user@example.com",
    "createdAt": "2024-03-15T14:30:00Z"
  }
]
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Validation error",
  "details": {
    "field": "name",
    "error": "Name is required"
  }
}
```

### 404 Not Found
```json
{
  "message": "Show not found"
}
```

### 409 Conflict
```json
{
  "message": "Seats already booked",
  "details": {
    "conflictingSeats": [10, 11]
  }
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

## Frontend Integration

### API Service Configuration

The frontend uses Axios with the following configuration:

```typescript
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
```

### Error Handling

Errors are transformed into a consistent format:

```typescript
interface ApiError {
  message: string;
  statusCode?: number;
  details?: any;
}
```

### Request Examples

#### Fetch Shows
```typescript
const shows = await apiService.getShows();
```

#### Create Show
```typescript
const newShow = await apiService.createShow({
  name: "Rock Concert",
  startTime: "2024-04-01T19:00:00Z",
  totalSeats: 200
});
```

#### Book Seats
```typescript
const booking = await apiService.bookSeats({
  showId: "show-uuid",
  seatNumbers: [5, 6, 7],
  userEmail: "john@example.com"
});
```

## Rate Limiting

Currently, there is no rate limiting implemented. For production use, consider implementing:

- Request throttling
- API key authentication
- User-based rate limits

## CORS

The backend should be configured to accept requests from the frontend origin:

```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## WebSocket (Future Enhancement)

For real-time seat updates, consider implementing WebSocket connections:

```typescript
// Proposed WebSocket events
socket.on('seat:booked', (data) => {
  // Update UI when seats are booked by other users
});

socket.on('show:updated', (data) => {
  // Refresh show data
});
```
