# HydroGuard Project Root

This directory contains a complete IoT aquatic monitoring system with:

- **Backend/**: Node.js + Express + SQLite + Socket.io
- **Frontend/**: React + Tailwind CSS + Framer Motion + Recharts  
- **Hardware/**: ESP32 C++ firmware with sensor integration

## Quick Start

1. **Backend**: `cd backend && npm install && npm start`
2. **Frontend**: `cd frontend && npm install && npm start`
3. **Hardware**: See [SETUP.md](./SETUP.md) for ESP32 configuration

## Documentation

- [README.md](./README.md) - Full project overview
- [SETUP.md](./SETUP.md) - Installation & setup guide
- [API.md](./API.md) - Complete API documentation

## Key Features

✅ Real-time dashboard with WebSocket updates
✅ Aquatic Dark Mode with Glassmorphic UI
✅ Drill-down 48-hour charts for each tank
✅ Color-coded status indicators (green/red)
✅ Offline-first architecture (local SQLite on ESP32)
✅ Browser push notifications for alerts
✅ Fully normalized database schema

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express + Socket.io |
| Database | SQLite3 (better-sqlite3) |
| Charts | Recharts |
| Hardware | ESP32 (ArduinoC++) |
| Sensors | DS18B20, pH probe, Salinity meter |

## Support

For detailed information, refer to the documentation files or check troubleshooting sections.
