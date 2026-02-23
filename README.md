# 🌊 HydroGuard - Aquatic Shop Monitoring Dashboard

A portable, real-time monitoring system for aquatic shops using ESP32, React, and Node.js. HydroGuard provides instant dashboard updates, local data persistence, and intelligent threshold-based notifications.

## 🏗️ Architecture

```
HydroGuard/
├── frontend/              # React.js Dashboard
│   ├── public/
│   ├── src/
│   │   ├── components/    # UI Components (TankCard, Modal, etc)
│   │   ├── services/      # API clients & Socket.io
│   │   ├── hooks/         # Custom React hooks
│   │   └── App.jsx        # Main app
│   └── package.json
├── backend/               # Node.js + Express
│   ├── server.js          # Main server & WebSocket
│   ├── hydroguard.db      # SQLite database
│   └── package.json
└── hardware/              # ESP32 Firmware
    ├── src/
    │   └── main.cpp       # Main firmware code
    ├── include/           # Headers (sensors, database, WiFi)
    └── platformio.ini     # PlatformIO config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (Backend & Frontend)
- Git
- PlatformIO CLI or VS Code PlatformIO Extension
- USB cable for ESP32 programming

### Backend Setup
```bash
cd backend
npm install
npm start
```
Server starts on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Dashboard opens on `http://localhost:3000`

### Hardware Setup (ESP32)
1. Edit `hardware/include/config.h` with WiFi credentials and server URL
2. Connect ESP32 via USB
3. Run: `pio run -t upload` (in `hardware/` directory)
4. Monitor: `pio device monitor`

## 📊 Features

### Task 1: Best-in-Class UI/UX ✅
- **Bento Grid Layout**: Modular card-based design
- **Glassmorphic Finish**: Modern frosted glass effect with backdrop blur
- **Aquatic Dark Mode**: Deep blues/teals (#051830 to #1aafdf) with high-contrast text
- **Color-Coded Status**:
  - 🟢 **Green glow** = All parameters safe
  - 🔴 **Red pulse** = Out of range (animated warning)
- **Framer Motion Animations**: Smooth transitions and interactions
- **Responsive Design**: Works on desktop, tablet, and mobile

### Task 2: Portable Database & Backend ✅
- **SQLite3 Schema**:
  ```sql
  tanks (id, name, type, createdAt)
  readings (id, tankId, temperature, pH, salinity, timestamp)
  thresholds (id, tankId, minTemp, maxTemp, minPH, maxPH, minSalinity, maxSalinity)
  ```
- **REST API** for CRUD operations
- **WebSocket (Socket.io)** for real-time updates
- **Automatic Notification Checks**: Threshold validation on every reading

### Task 3: Hardware Integration with ESP32 ✅
- **Sensor Support**:
  - 🌡️ **DS18B20**: Temperature sensor (1-Wire protocol)
  - ⚗️ **pH Probe**: Analog sensor (ADC conversion)
  - 🧂 **Salinity Sensor**: Conductivity-based measurement
  
- **Offline-First Architecture**:
  - Local storage on SPIFFS (SPI Flash File System)
  - Automatic sync when WiFi reconnects
  - Prevents data loss in intermittent connectivity

- **WiFi Management**:
  - Auto-reconnection with exponential backoff
  - Signal strength monitoring
  - Connection status logging

### Task 4: Notification System ✅
- **Browser Push Notifications** when parameters exceed thresholds
- **Real-time Toast Notifications** on dashboard
- **Threshold Management** via API
- **Visual Alerts** with pulsing animations

## 🔌 API Endpoints

### Tanks
```
GET    /api/tanks              → Get all tanks
GET    /api/tanks/:id          → Get tank with latest reading & thresholds
POST   /api/tanks              → Create new tank
GET    /api/tanks/:id/readings → Get 48h reading history
```

### Readings
```
POST   /api/readings           → Post new sensor reading
```

### Thresholds
```
PUT    /api/thresholds/:tankId → Update tank thresholds
```

## 📡 WebSocket Events

### Server → Client
```javascript
socket.on('new-reading', (reading) => {
  // { id, tankId, temperature, pH, salinity, timestamp, isOutOfRange }
})
```

### Client → Server
```javascript
socket.emit('subscribe', { tankId })
```

## 🔧 Configuration

### Backend (`.env`)
```env
PORT=5000
DATABASE_PATH=./hydroguard.db
NODE_ENV=development
```

### Hardware (`hardware/include/config.h`)
```cpp
#define SSID "YourWiFiSSID"
#define PASSWORD "YourPassword"
#define SERVER_URL "http://192.168.x.x:5000"
#define TANK_ID 1
#define MEASUREMENT_INTERVAL 60000  // 1 minute
```

## 📦 Database Schema

### tanks table
```sql
id INTEGER PK
name TEXT
type TEXT
createdAt DATETIME
```

### readings table
```sql
id INTEGER PK
tankId INTEGER FK
temperature REAL
pH REAL
salinity REAL
timestamp DATETIME
```

### thresholds table
```sql
id INTEGER PK
tankId INTEGER FK UNIQUE
minTemp REAL (default 18)
maxTemp REAL (default 28)
minPH REAL (default 6.5)
maxPH REAL (default 8.5)
minSalinity REAL (default 1.020)
maxSalinity REAL (default 1.030)
```

## 🎨 Tailwind CSS Configuration

Custom colors and animations:
- `aquatic-50` to `aquatic-950`: Gradient color palette
- `.glass`: Glassmorphic styling class
- `.glow-safe` / `.glow-danger-pulse`: Status indicators
- `animate-pulse-glow`: Dynamic pulsing effect

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React + Tailwind CSS | 18.x |
| UI Framework | Framer Motion | 10.x |
| Charts | Recharts | 2.8.x |
| Backend | Express.js | 4.18.x |
| Real-time | Socket.io | 4.5.x |
| Database | SQLite3 (better-sqlite3) | 9.x |
| Hardware | Arduino + PlatformIO | - |
| Board | ESP32 DevKit v1 | - |

## 🔐 Security Notes

- [ ] Add JWT authentication for API
- [ ] Implement HTTPS/WSS for production
- [ ] Add input validation & sanitization
- [ ] Rate limiting on API endpoints
- [ ] Environment variable validation

## 📈 Performance Metrics

- Dashboard load time: < 1 second
- WebSocket latency: < 100ms
- Local DB queries: < 50ms
- Sensor polling interval: 60 seconds (configurable)

## 🐛 Troubleshooting

### ESP32 not connecting to WiFi
1. Check SSID and password in `config.h`
2. Verify ESP32 is in range of WiFi
3. Check serial logs: `pio device monitor`

### Dashboard not updating
1. Verify backend is running on port 5000
2. Check browser console for WebSocket errors
3. Ensure frontend `.env` has correct `REACT_APP_API_URL`

### Sensor readings invalid
1. Check sensor wiring and GPIO pins
2. Verify OneWire protocol for DS18B20
3. Calibrate pH and salinity sensors

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Made with 🌊 by the HydroGuard Team**
