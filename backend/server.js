const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize Express app and Socket.io
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'hydroguard.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✓ Database connected');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS tanks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        image TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `, (err) => {
      if (!err) {
        // Add image column if it doesn't exist
        db.run(`
          ALTER TABLE tanks ADD COLUMN image TEXT;
        `, (err) => {
          // Column might already exist, ignore error
        });
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tankId INTEGER NOT NULL,
        temperature REAL,
        pH REAL,
        salinity REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tankId) REFERENCES tanks(id)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS thresholds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tankId INTEGER NOT NULL UNIQUE,
        minTemp REAL DEFAULT 18,
        maxTemp REAL DEFAULT 28,
        minPH REAL DEFAULT 6.5,
        maxPH REAL DEFAULT 8.5,
        minSalinity REAL DEFAULT 1.020,
        maxSalinity REAL DEFAULT 1.030,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tankId) REFERENCES tanks(id)
      );
    `);

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_readings_tank_timestamp ON readings(tankId, timestamp);
    `, () => {
      console.log('✓ Database schema initialized');
    });
  });
}

// API Routes

// Get all tanks
app.get('/api/tanks', (req, res) => {
  db.all(`
    SELECT 
      t.id,
      t.name,
      t.type,
      t.image,
      t.createdAt,
      r.id as latestReadingId,
      r.temperature,
      r.pH,
      r.salinity,
      r.timestamp as latestReadingTime
    FROM tanks t
    LEFT JOIN readings r ON t.id = r.tankId 
      AND r.id = (
        SELECT id FROM readings 
        WHERE tankId = t.id 
        ORDER BY timestamp DESC 
        LIMIT 1
      )
    ORDER BY t.id DESC
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Transform rows to include latestReading object
      const tanks = rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        image: row.image,
        createdAt: row.createdAt,
        latestReading: row.latestReadingId ? {
          id: row.latestReadingId,
          tankId: row.id,
          temperature: row.temperature,
          pH: row.pH,
          salinity: row.salinity,
          timestamp: row.latestReadingTime
        } : null,
        isOutOfRange: false
      }));
      res.json(tanks);
    }
  });
});

// Get tank details with latest reading
app.get('/api/tanks/:id', (req, res) => {
  const tankId = req.params.id;
  let tank, latestReading, thresholds;
  let completed = 0;

  db.get('SELECT * FROM tanks WHERE id = ?', [tankId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    tank = row;
    completed++;
    if (completed === 3) sendResponse();
  });

  db.get('SELECT * FROM readings WHERE tankId = ? ORDER BY timestamp DESC LIMIT 1', [tankId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    latestReading = row;
    completed++;
    if (completed === 3) sendResponse();
  });

  db.get('SELECT * FROM thresholds WHERE tankId = ?', [tankId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    thresholds = row;
    completed++;
    if (completed === 3) sendResponse();
  });

  function sendResponse() {
    res.json({ tank, latestReading, thresholds });
  }
});

// Get readings for last 48 hours (for drill-down chart)
app.get('/api/tanks/:id/readings', (req, res) => {
  const tankId = req.params.id;
  db.all(`
    SELECT * FROM readings 
    WHERE tankId = ? AND timestamp > datetime('now', '-48 hours')
    ORDER BY timestamp ASC
  `, [tankId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows || []);
    }
  });
});

// Create new tank
app.post('/api/tanks', (req, res) => {
  const { name, type, image } = req.body;
  
  db.run('INSERT INTO tanks (name, type, image) VALUES (?, ?, ?)', [name, type, image || null], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const tankId = this.lastID;
      
      // Create default thresholds
      db.run('INSERT INTO thresholds (tankId) VALUES (?)', [tankId], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({ id: tankId, name, type, image: image || null });
        }
      });
    }
  });
});

// Post new reading from ESP32
app.post('/api/readings', (req, res) => {
  const { tankId, temperature, pH, salinity } = req.body;
  
  db.run(
    'INSERT INTO readings (tankId, temperature, pH, salinity) VALUES (?, ?, ?, ?)',
    [tankId, temperature, pH, salinity],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        // Get thresholds for status check
        db.get('SELECT * FROM thresholds WHERE tankId = ?', [tankId], (err, thresholds) => {
          const isOutOfRange = checkThresholds(temperature, pH, salinity, thresholds);
          
          const newReading = {
            id: this.lastID,
            tankId,
            temperature,
            pH,
            salinity,
            timestamp: new Date().toISOString(),
            isOutOfRange
          };
          
          // Broadcast to all connected clients
          io.emit('new-reading', newReading);
          res.json(newReading);
        });
      }
    }
  );
});

// Update thresholds
app.put('/api/thresholds/:tankId', (req, res) => {
  const { minTemp, maxTemp, minPH, maxPH, minSalinity, maxSalinity } = req.body;
  const tankId = req.params.tankId;
  
  db.run(`
    UPDATE thresholds 
    SET minTemp = ?, maxTemp = ?, minPH = ?, maxPH = ?, minSalinity = ?, maxSalinity = ?
    WHERE tankId = ?
  `, [minTemp, maxTemp, minPH, maxPH, minSalinity, maxSalinity, tankId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ success: true });
    }
  });
});

// Update tank image
app.put('/api/tanks/:id/image', (req, res) => {
  const tankId = req.params.id;
  const { image } = req.body;
  
  db.run('UPDATE tanks SET image = ? WHERE id = ?', [image || null, tankId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Tank not found' });
    } else {
      io.emit('tank-updated', { id: tankId, image });
      res.json({ success: true, id: tankId, image });
    }
  });
});

// Delete tank
app.delete('/api/tanks/:id', (req, res) => {
  const tankId = req.params.id;
  
  db.run('DELETE FROM readings WHERE tankId = ?', [tankId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.run('DELETE FROM thresholds WHERE tankId = ?', [tankId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.run('DELETE FROM tanks WHERE id = ?', [tankId], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          io.emit('tank-deleted', { tankId });
          res.json({ success: true });
        }
      });
    });
  });
});

// Helper function to check thresholds
function checkThresholds(temp, pH, salinity, thresholds) {
  if (!thresholds) return false;
  
  return (
    (temp && (temp < thresholds.minTemp || temp > thresholds.maxTemp)) ||
    (pH && (pH < thresholds.minPH || pH > thresholds.maxPH)) ||
    (salinity && (salinity < thresholds.minSalinity || salinity > thresholds.maxSalinity))
  );
}

// Socket.io events
io.on('connection', (socket) => {
  console.log('✓ Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('✗ Client disconnected:', socket.id);
  });
});

// Initialize and start server
initializeDatabase();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 HydroGuard Backend running on http://localhost:${PORT}`);
});
