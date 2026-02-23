# HydroGuard Quick Reference

## 🎯 Start Development

```bash
# Terminal 1: Backend
cd backend && npm install && npm start
# Runs on http://localhost:5000

# Terminal 2: Frontend  
cd frontend && npm install && npm start
# Runs on http://localhost:3000

# Terminal 3: Hardware (after config)
cd hardware
# Edit include/config.h with WiFi & server URL
pio run -t upload
pio device monitor
```

## 📍 Important Files

### Frontend
| File | Purpose |
|------|---------|
| `src/App.jsx` | Main component, state management |
| `src/components/TankCard.jsx` | Tank display card |
| `src/components/TankDetailModal.jsx` | Drill-down charts |
| `src/services/api.js` | API client functions |
| `src/hooks/useSocketConnection.js` | WebSocket hook |
| `tailwind.config.js` | Color theme customization |

### Backend
| File | Purpose |
|------|---------|
| `server.js` | Express + Socket.io server |
| `.env` | Configuration (PORT, DATABASE_PATH) |
| `hydroguard.db` | SQLite database (auto-created) |

### Hardware
| File | Purpose |
|------|---------|
| `include/config.h` | WiFi, GPIO pins, server URL |
| `src/main.cpp` | Main firmware loop |
| `include/sensor_manager.h` | Sensor reading logic |
| `include/database_manager.h` | Local SPIFFS storage |
| `include/wifi_manager.h` | WiFi connection |

## 🔌 API Cheat Sheet

```bash
# Get all tanks
curl http://localhost:5000/api/tanks

# Create tank
curl -X POST http://localhost:5000/api/tanks \
  -H "Content-Type: application/json" \
  -d '{"name":"Tank1","type":"Saltwater"}'

# Post reading (mock)
curl -X POST http://localhost:5000/api/readings \
  -H "Content-Type: application/json" \
  -d '{
    "tankId":1,
    "temperature":25.5,
    "pH":8.2,
    "salinity":1.025
  }'

# Get 48h history
curl http://localhost:5000/api/tanks/1/readings

# Update thresholds
curl -X PUT http://localhost:5000/api/thresholds/1 \
  -H "Content-Type: application/json" \
  -d '{
    "minTemp":18,"maxTemp":28,
    "minPH":6.5,"maxPH":8.5,
    "minSalinity":1.020,"maxSalinity":1.030
  }'
```

## 🎨 Tailwind Classes Used

```html
<!-- Glassmorphic containers -->
<div class="glass p-6 rounded-xl backdrop-blur-md">...</div>

<!-- Status indicators -->
<div class="glow-safe">✓ Safe</div>
<div class="glow-danger-pulse">⚠ Danger</div>

<!-- Aquatic colors -->
<div class="text-aquatic-400">...</div>
<div class="bg-aquatic-900">...</div>

<!-- Animations -->
<div class="animate-pulse-glow">...</div>
```

## 🔧 Environment Variables

### Backend `.env`
```env
PORT=5000
DATABASE_PATH=./hydroguard.db
NODE_ENV=development
```

### Hardware `config.h`
```cpp
#define SSID "Your_WiFi"
#define PASSWORD "password"
#define SERVER_URL "http://192.168.x.x:5000"
#define TANK_ID 1
#define MEASUREMENT_INTERVAL 60000  // 1 min
```

## 📊 Database Schema Quick Look

```sql
-- Tables created automatically in backend
CREATE TABLE tanks (
  id INTEGER PRIMARY KEY,
  name TEXT, type TEXT, createdAt DATETIME
);

CREATE TABLE readings (
  id INTEGER PRIMARY KEY,
  tankId INTEGER, temperature REAL, pH REAL, 
  salinity REAL, timestamp DATETIME
);

CREATE TABLE thresholds (
  id INTEGER PRIMARY KEY, tankId INTEGER UNIQUE,
  minTemp REAL, maxTemp REAL, minPH REAL, maxPH REAL,
  minSalinity REAL, maxSalinity REAL
);
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | `npx kill-port 5000` |
| Module not found | Delete `node_modules`, run `npm install` |
| ESP32 upload fails | Check USB cable, hold BOOT, press RST |
| WebSocket error | Ensure backend on same network |
| No readings showing | Post test data via API (see curl examples) |
| Dashboard blank | Check browser console for errors |

## 🔄 Git Workflow

```bash
# Clone (future)
git clone https://github.com/user/hydroguard.git
cd hydroguard

# Branch for features
git checkout -b feature/tank-settings
# Make changes, commit, push
git push origin feature/tank-settings

# Create PR, merge to main
# Pull for production deployment
git pull origin main
```

## 📱 Accessing Frontend

**Local**: http://localhost:3000
**Network**: http://your-ip-address:3000

Find your IP:
```bash
# Windows
ipconfig | find "IPv4"

# Mac/Linux
ifconfig | grep "inet "
```

## 🔌 ESP32 GPIO Mapping

| Component | GPIO | Type |
|-----------|------|------|
| Temperature (DS18B20) | 4 | 1-Wire |
| pH Probe | 35 | ADC (Analog) |
| Salinity Sensor | 34 | ADC (Analog) |
| SD Card CS | 5 | SPI |

## 📬 WebSocket Events

```javascript
// Client listening
socket.on('new-reading', (data) => {
  // {id, tankId, temperature, pH, salinity, 
  //  timestamp, isOutOfRange}
});

// Server broadcasting
io.emit('new-reading', readingData);
```

## 💾 Database Operations

```bash
# View database (with sqlite3 CLI)
sqlite3 backend/hydroguard.db

# SQL queries
SELECT * FROM tanks;
SELECT * FROM readings WHERE tankId=1 ORDER BY timestamp DESC LIMIT 10;
SELECT * FROM thresholds WHERE tankId=1;

# Backup database
cp backend/hydroguard.db backup-$(date +%s).db

# Restore database
cp backup-1234567890.db backend/hydroguard.db
```

## 🚀 Deployment Quick Start

```bash
# 1. Create production env
# 2. Build frontend
cd frontend && npm run build

# 3. Start backend (production)
cd backend
NODE_ENV=production npm start

# 4. Serve frontend (use nginx/apache)
# Point to frontend/build directory

# 5. Configure ESP32 with server URL
# Upload firmware with pio run -t upload
```

## 📖 Documentation Map

- **README.md** - Overview & features
- **SETUP.md** - Installation steps
- **API.md** - Endpoint reference
- **ARCHITECTURE.md** - System design
- **HARDWARE_WIRING.md** - Sensor wiring
- **ROADMAP.md** - Future features
- **DELIVERABLES.md** - What's included

## ✨ Pro Tips

1. **Testing**: Use Postman or curl for API testing
2. **Monitoring**: Use `pio device monitor` for ESP32 logs
3. **Debugging**: Check browser dev tools (F12) for frontend issues
4. **Scaling**: Each ESP32 can sync multiple readings via queuing
5. **Backups**: Regularly backup `hydroguard.db` file
6. **Updates**: Pull latest code, run `npm install` in both dirs

---

**HydroGuard v1.0.0** | Made with 🌊
