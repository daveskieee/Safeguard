# Installation & Setup Guide for HydroGuard

## Step-by-Step Setup Instructions

### 1. Backend Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the server
npm start
```

Expected output:
```
🚀 HydroGuard Backend running on http://localhost:5000
✓ Database initialized
```

### 2. Frontend Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The browser will automatically open to `http://localhost:3000`

### 3. ESP32 Hardware Setup

#### 3.1 Install PlatformIO
- **Option A**: VS Code Extension
  - Install "PlatformIO IDE" extension
  - Click Home icon → PlatformIO

- **Option B**: Command Line
  ```bash
  pip install platformio
  ```

#### 3.2 Configure ESP32 Firmware

Edit `hardware/include/config.h`:
```cpp
#define SSID "Your_WiFi_Name"
#define PASSWORD "Your_WiFi_Password"
#define SERVER_URL "http://192.168.1.100:5000"  // Backend server address
#define TANK_ID 1
```

#### 3.3 Compile & Upload

```bash
cd hardware

# Build
pio run

# Upload to ESP32
pio run -t upload

# Monitor serial output
pio device monitor
```

### 4. Sensor Wiring (ESP32)

Connect sensors to ESP32:

| Sensor | GPIO Pin | Protocol |
|--------|----------|----------|
| DS18B20 Temp | GPIO 4 | 1-Wire |
| pH Probe | GPIO 35 (ADC) | Analog |
| Salinity | GPIO 34 (ADC) | Analog |
| SD Card CS | GPIO 5 | SPI |

**Wiring Diagram**:
```
ESP32                External
+3.3V ────────┬──────← VCC (sensors)
             │
GND ─────────┼──────← GND (sensors)
             │
GPIO 4 ──────┴──────← DS18B20 Data (with 4.7k pull-up to 3.3V)
GPIO 35 ────────────← pH Probe Signal
GPIO 34 ────────────← Salinity Signal
GPIO 5 ─────────────← SD Card CS (optional)
```

## Testing the System

### 1. Verify Backend
```bash
curl http://localhost:5000/api/tanks
# Expected: []  (empty array on first run)
```

### 2. Create a Tank via API
```bash
curl -X POST http://localhost:5000/api/tanks \
  -H "Content-Type: application/json" \
  -d '{"name":"Main Tank","type":"Saltwater"}'
```

### 3. Simulate Sensor Reading
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

### 4. Check Dashboard
Open `http://localhost:3000` and verify:
- Tank card appears with the reading
- Real-time update via WebSocket
- Drill-down chart shows data

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or find and kill manually
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### ESP32 Upload Failed
1. Check USB cable connection
2. Verify device manager shows COM port
3. Reset ESP32: Hold BOOT button, press RST

### WebSocket Connection Error
```javascript
// Check browser console for error details
// Ensure backend and frontend are on the same network
```

## Docker Deployment (Optional)

```bash
# Run backend in Docker
docker build -t hydroguard-backend ./backend
docker run -p 5000:5000 hydroguard-backend

# Run frontend in Docker
docker build -t hydroguard-frontend ./frontend
docker run -p 3000:3000 hydroguard-frontend
```

## Environment Variables

### Backend `.env`
```env
PORT=5000
DATABASE_PATH=./hydroguard.db
NODE_ENV=production
LOG_LEVEL=info
```

### Frontend `.env` (create if needed)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

## Network Setup for Local Deployment

1. Find your computer's IP:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```

2. Update ESP32 config with your IP:
   ```cpp
   #define SERVER_URL "http://192.168.X.X:5000"
   ```

3. Put backend server on same network as ESP32

## Next Steps

1. ✅ Test with simulated readings
2. ✅ Calibrate sensors with known values
3. ✅ Set safe threshold levels
4. ✅ Configure push notifications
5. ✅ Deploy to production server

---

Need help? Check the README.md or open an issue!
