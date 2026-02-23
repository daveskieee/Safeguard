# HydroGuard Architecture & System Design

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET / LAN                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
    ┌───────────┐              ┌─────────────┐
    │  ESP32    │              │   Browser   │
    │ Hardware  │              │  (Frontend) │
    └──────┬────┘              └──────┬──────┘
           │                          │
     WiFi  │                  HTTPS   │
     HTTP  │                  WebSocket│
           └──────────┬───────────────┘
                      │
            ┌─────────▼─────────┐
            │   Node.js Server  │
            │  (Port 5000)      │
            ├───────────────────┤
            │  Express Routes   │
            │  Socket.io        │
            │  API Endpoints    │
            └─────────┬─────────┘
                      │
                      ▼
            ┌──────────────────┐
            │  SQLite3 Database│
            │  hydroguard.db   │
            └──────────────────┘
```

## Data Flow

### Real-Time Update Flow
```
1. ESP32 reads sensors (every 60 seconds)
        ↓
2. POST /api/readings to backend
        ↓
3. Backend saves to SQLite & validates thresholds
        ↓
4. Socket.io broadcasts 'new-reading' to all clients
        ↓
5. React components update in real-time
        ↓
6. UI animates status indicators (green/red glow)
        ↓
7. Browser notification if out of range
```

### Offline Persistence Flow (ESP32)
```
1. WiFi connection lost
        ↓
2. ESP32 attempts connection retry
        ↓
3. While offline: Save readings to local SPIFFS database
        ↓
4. WiFi reconnects
        ↓
5. Retrieve pending readings from local DB
        ↓
6. POST all readings to server
        ↓
7. Server processes & broadcasts
        ↓
8. Clear local sync queue
```

## Database Schema

### Three-Table Normalized Design

```
┌──────────────────────┐
│      TANKS           │
├──────────────────────┤
│ * id (PK)            │
│   name               │
│   type               │
│   createdAt          │
└──────────────────────┘
         │
         │ 1:N
         │
┌──────────────────────┐
│     READINGS         │
├──────────────────────┤
│ * id (PK)            │
│   tankId (FK) ──────→│
│   temperature        │
│   pH                 │
│   salinity           │
│   timestamp          │
├─────────────────────┐ Indexed for
│ INDEX (tankId,      │ fast queries
│        timestamp)   │
└──────────────────────┘
         │
         │ 1:N
         │
┌──────────────────────┐
│    THRESHOLDS        │
├──────────────────────┤
│ * id (PK)            │
│   tankId (FK UNIQUE) │
│   minTemp            │
│   maxTemp            │
│   minPH              │
│   maxPH              │
│   minSalinity        │
│   maxSalinity        │
└──────────────────────┘
```

### Query Examples

```sql
-- Get latest reading for tank 1
SELECT * FROM readings 
WHERE tankId = 1 
ORDER BY timestamp DESC 
LIMIT 1;

-- Get 48h history
SELECT * FROM readings 
WHERE tankId = 1 
  AND timestamp > datetime('now', '-48 hours')
ORDER BY timestamp ASC;

-- Find out-of-range readings
SELECT r.*, t.minTemp, t.maxTemp
FROM readings r
LEFT JOIN thresholds t ON r.tankId = t.tankId
WHERE r.tankId = 1
  AND (r.temperature < t.minTemp 
       OR r.temperature > t.maxTemp);

-- Get tank with latest stats
SELECT 
  tank.name,
  COUNT(r.id) as reading_count,
  AVG(r.temperature) as avg_temp,
  MAX(r.temperature) as max_temp,
  MIN(r.temperature) as min_temp
FROM tanks tank
LEFT JOIN readings r ON tank.id = r.tankId
GROUP BY tank.id;
```

## Component Architecture

### Frontend Component Tree
```
App
├── DashboardHeader
├── NotificationCenter
├── TankCard[]
│   ├── StatusIndicator
│   └── MiniMetrics
└── TankDetailModal
    ├── TankInfo
    ├── TabSelector
    ├── Recharts.LineChart
    │   ├── Temperature Line
    │   ├── pH Line
    │   └── Salinity Line
    └── StatisticsCards
        ├── Max Card
        ├── Min Card
        └── Avg Card
```

### React Hooks Usage
```javascript
// Hook Dependencies
useSocketConnection()
├── useEffect (socket setup)
├── useState (socket state)
└── Return: { socket, isConnected }

App Component
├── useState (tanks, selectedTank, notifications)
├── useEffect (fetch tanks)
├── useEffect (socket listeners)
├── useEffect (request notifications)
└── callback functions
```

### Socket.io Event Map
```
CLIENT                          SERVER
  │                              │
  │                              │
  ├──→ 'connect' ───────────────→│
  │                              │ Listen for
  │                              │ 'new-reading'
  │                              │
  │                              │
  │ ← 'new-reading' ────────────│
  │ (broadcast to all)           │
  │                              │
  └── 'disconnect' ───────────→ │
```

## API Endpoint Map

```
/api/tanks
├── GET     → List all tanks
├── POST    → Create new tank
└── /:id
    ├── GET → Get tank details
    └── /readings
        └── GET → Get 48h history

/api/readings
└── POST    → Submit sensor reading

/api/thresholds
└── /:tankId
    └── PUT → Update thresholds
```

## Authentication & Authorization (Future)

```
┌─────────────┐
│  User Login │
└──────┬──────┘
       │
       ▼
  ┌────────────┐
  │ Generate   │ JWT Token
  │ JWT Token  │ {user, exp}
  └────────────┘
       │
       ▼
  Store in:
  ├── LocalStorage (frontend)
  └── HttpOnly Cookie (recommended)
       │
       ▼
  ┌─────────────────────┐
  │ Include in Request  │
  │ Authorization Header│
  │ Bearer <token>      │
  └─────────────────────┘
       │
       ▼
  ┌─────────────────────┐
  │ Verify on Server    │
  │ Check expiration    │
  │ Validate signature  │
  └─────────────────────┘
```

## Sensor Reading Flow

```
Physical World          ESP32 Hardware          Digital Data
─────────────────      ─────────────────      ──────────────

🌡️ Heat                 DS18B20            → 25.5°C (float)
                        (1-Wire)
                             ↓
                        ADC Conversion
                             ↓
                        DAQ Calibration
                             ↓

⚗️ pH Probe            Analog Input (GPIO 35) → 8.2 pH (float)
                        ADC 12-bit
                             ↓
                        Voltage→pH Map
                        (3.3V = 0pH)
                             ↓

🧂 Salinity            Analog Input (GPIO 34) → 1.025 SG (float)
                        ADC 12-bit
                             ↓
                        Conductivity Scale
                             ↓

Timestamped Record     Local SPIFFS (Offline) → CSV Row
                        Or HTTP POST
```

## Performance Characteristics

### Latency Budget
```
┌─────────────────────────────────────┐
│  Total E2E Latency: <200ms          │
├─────────────────────────────────────┤
│ ESP32 Sensor Read:        ~1000ms   │
│ WiFi Connect:              ~1000ms  │
│ HTTP POST:                  ~100ms  │
│ Backend Processing:          ~50ms  │
│ Database Write:              ~20ms  │
│ Socket.io Broadcast:         ~50ms  │
│ Network (LAN):               ~10ms  │
│ Browser Render:             ~100ms  │
└─────────────────────────────────────┘
```

### Storage Requirements
```
ESP32 SPIFFS:
├── Per Reading:    ~100 bytes (CSV)
├── Capacity:       ~1 MB
└── Max Records:    ~10,000 readings (≈7 days @ 1min interval)

Backend Database:
├── Per Reading:    ~200 bytes (binary)
├── Monthly:        ~2.88 MB (100 readings/min across all tanks)
└── Recommendation: Storage expansion after 6-12 months
```

## Scalability Considerations

### Current (MVP)
- Single ESP32 → Single Backend
- Single tank support per device
- Memory: ~50KB (sketched code)
- Storage: ~1MB SPIFFS

### Phase 2 (Multi-Tank)
- Multiple ESP32 → Single Backend
- 10+ tanks with sync
- Database size: <100MB
- API RPS: <10 per second

### Phase 3 (Enterprise)
- 100+ devices in cloud
- Multiple servers (load balanced)
- Distributed database (sharded)
- API RPS: >100 per second
- Data warehouse for analytics

## Security Architecture (Planned)

```
┌──────────────────────────────────┐
│   TRANSPORT LAYER SECURITY       │
├──────────────────────────────────┤
│ ✓ HTTPS for API                  │
│ ✓ WSS for WebSocket              │
│ ✓ TLS 1.3 minimum                │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│   APPLICATION LAYER SECURITY     │
├──────────────────────────────────┤
│ ✓ JWT Authentication             │
│ ✓ Role-Based Access Control      │
│ ✓ Input Validation               │
│ ✓ Rate Limiting                  │
│ ✓ CSRF Protection                │
└──────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│   DATA LAYER SECURITY            │
├──────────────────────────────────┤
│ ✓ Parameterized Queries          │
│ ✓ SQL Injection Protection       │
│ ✓ Encrypted at Rest (planned)    │
│ ✓ Access Logs (planned)          │
└──────────────────────────────────┘
```

---

**Architecture Version**: 1.0.0 MVP
**Last Updated**: 2024-02-23
