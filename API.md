## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Currently no authentication required. (TODO: Add JWT in production)

---

## Tanks Endpoints

### GET /tanks
Get all tanks in the system.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Main Display Tank",
    "type": "Saltwater",
    "createdAt": "2024-02-23T10:30:00Z"
  },
  {
    "id": 2,
    "name": "Breeding Tank",
    "type": "Freshwater",
    "createdAt": "2024-02-23T11:00:00Z"
  }
]
```

---

### GET /tanks/:id
Get specific tank with latest reading and thresholds.

**Parameters:**
- `id` (number) - Tank ID

**Response:**
```json
{
  "tank": {
    "id": 1,
    "name": "Main Display Tank",
    "type": "Saltwater",
    "createdAt": "2024-02-23T10:30:00Z"
  },
  "latestReading": {
    "id": 42,
    "tankId": 1,
    "temperature": 25.5,
    "pH": 8.2,
    "salinity": 1.025,
    "timestamp": "2024-02-23T14:35:20Z"
  },
  "thresholds": {
    "id": 1,
    "tankId": 1,
    "minTemp": 18,
    "maxTemp": 28,
    "minPH": 6.5,
    "maxPH": 8.5,
    "minSalinity": 1.020,
    "maxSalinity": 1.030
  }
}
```

---

### POST /tanks
Create a new tank.

**Request Body:**
```json
{
  "name": "Quarantine Tank",
  "type": "Saltwater"
}
```

**Response (201):**
```json
{
  "id": 3,
  "name": "Quarantine Tank",
  "type": "Saltwater"
}
```

---

### GET /tanks/:id/readings
Get reading history for last 48 hours (for drill-down charts).

**Parameters:**
- `id` (number) - Tank ID

**Response:**
```json
[
  {
    "id": 40,
    "tankId": 1,
    "temperature": 25.2,
    "pH": 8.1,
    "salinity": 1.024,
    "timestamp": "2024-02-22T14:30:00Z"
  },
  {
    "id": 41,
    "tankId": 1,
    "temperature": 25.5,
    "pH": 8.2,
    "salinity": 1.025,
    "timestamp": "2024-02-22T15:30:00Z"
  },
  {
    "id": 42,
    "tankId": 1,
    "temperature": 25.5,
    "pH": 8.2,
    "salinity": 1.025,
    "timestamp": "2024-02-23T14:35:20Z"
  }
]
```

---

## Readings Endpoints

### POST /readings
Submit a new sensor reading (typically from ESP32).

**Request Body:**
```json
{
  "tankId": 1,
  "temperature": 25.5,
  "pH": 8.2,
  "salinity": 1.025
}
```

**Response (200):**
```json
{
  "id": 43,
  "tankId": 1,
  "temperature": 25.5,
  "pH": 8.2,
  "salinity": 1.025,
  "timestamp": "2024-02-23T14:36:00Z",
  "isOutOfRange": false
}
```

**WebSocket Broadcast:**
All connected clients receive:
```javascript
// Socket event: 'new-reading'
{
  "id": 43,
  "tankId": 1,
  "temperature": 25.5,
  "pH": 8.2,
  "salinity": 1.025,
  "timestamp": "2024-02-23T14:36:00Z",
  "isOutOfRange": false
}
```

---

## Thresholds Endpoints

### PUT /thresholds/:tankId
Update safety thresholds for a tank.

**Parameters:**
- `tankId` (number) - Tank ID

**Request Body:**
```json
{
  "minTemp": 18,
  "maxTemp": 28,
  "minPH": 6.5,
  "maxPH": 8.5,
  "minSalinity": 1.020,
  "maxSalinity": 1.030
}
```

**Response (200):**
```json
{
  "success": true
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required field: tankId"
}
```

### 404 Not Found
```json
{
  "error": "Tank not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Database error message"
}
```

---

## WebSocket Events

### Client Listener: 'new-reading'
Emitted by server when a new reading is posted.

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('new-reading', (reading) => {
  console.log('New reading:', reading);
  // {
  //   id: 43,
  //   tankId: 1,
  //   temperature: 25.5,
  //   pH: 8.2,
  //   salinity: 1.025,
  //   timestamp: "2024-02-23T14:36:00Z",
  //   isOutOfRange: false
  // }
});
```

### Status Code Reference
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Server Error |

---

## Rate Limiting (TODO)
- ESP32: 1 reading/minute (configurable)
- API: Not yet implemented
- WebSocket: Unlimited

---

## Example cURL Commands

### Get all tanks
```bash
curl http://localhost:5000/api/tanks
```

### Create tank
```bash
curl -X POST http://localhost:5000/api/tanks \
  -H "Content-Type: application/json" \
  -d '{"name":"Tank1","type":"Saltwater"}'
```

### Post reading
```bash
curl -X POST http://localhost:5000/api/readings \
  -H "Content-Type: application/json" \
  -d '{
    "tankId":1,
    "temperature":25.5,
    "pH":8.2,
    "salinity":1.025
  }'
```

### Update thresholds
```bash
curl -X PUT http://localhost:5000/api/thresholds/1 \
  -H "Content-Type: application/json" \
  -d '{
    "minTemp":18,
    "maxTemp":28,
    "minPH":6.5,
    "maxPH":8.5,
    "minSalinity":1.020,
    "maxSalinity":1.030
  }'
```

### Get readings history
```bash
curl http://localhost:5000/api/tanks/1/readings
```

---

## Response Time Targets
- GET /tanks: < 50ms
- GET /tanks/:id: < 50ms
- GET /tanks/:id/readings: < 100ms
- POST /readings: < 100ms
- WebSocket delivery: < 50ms

---

Last updated: 2024-02-23
