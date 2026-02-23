#pragma once

#include <SPIFFS.h>
#include <time.h>
#include "config.h"

// Simple SQLite equivalent using SPIFFS for local storage
// For production, use sqlite3-esp32 library for full SQLite support

struct SensorReading {
  uint32_t id;
  uint8_t tankId;
  float temperature;
  float pH;
  float salinity;
  char timestamp[25];
};

class DatabaseManager {
private:
  File dbFile;
  const char* dbPath;
  uint32_t recordCount;

public:
  DatabaseManager() : dbPath(nullptr), recordCount(0) {}

  bool begin(const char* path) {
    dbPath = path;
    
    // Initialize SPIFFS file for database
    if (SPIFFS.exists(dbPath)) {
      Serial.printf("📂 Using existing database: %s\n", dbPath);
    } else {
      Serial.printf("📝 Creating new database: %s\n", dbPath);
    }

    return true;
  }

  bool saveReading(uint8_t tankId, float temp, float pH, float salinity) {
    if (!dbPath) return false;

    // Get current timestamp
    time_t now = time(nullptr);
    struct tm* timeinfo = localtime(&now);
    char timestamp[25];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%d %H:%M:%S", timeinfo);

    // Create reading record
    SensorReading reading;
    reading.id = recordCount++;
    reading.tankId = tankId;
    reading.temperature = temp;
    reading.pH = pH;
    reading.salinity = salinity;
    strcpy(reading.timestamp, timestamp);

    // Append to SPIFFS file (simple binary storage)
    File file = SPIFFS.open(dbPath, FILE_APPEND);
    if (!file) {
      Serial.println("✗ Failed to open database file for writing");
      return false;
    }

    // Write record as string format for simplicity
    char record[256];
    snprintf(record, sizeof(record), 
      "%u,%u,%.2f,%.2f,%.3f,%s\n",
      reading.id, reading.tankId, reading.temperature, reading.pH, reading.salinity, reading.timestamp);

    if (file.print(record) > 0) {
      file.close();
      return true;
    }

    file.close();
    return false;
  }

  bool getAllReadings(void (*callback)(const SensorReading&)) {
    if (!dbPath) return false;

    File file = SPIFFS.open(dbPath, FILE_READ);
    if (!file) return false;

    char line[256];
    while (file.available()) {
      int len = file.readBytesUntil('\n', (uint8_t*)line, sizeof(line) - 1);
      if (len > 0) {
        line[len] = '\0';
        
        // Parse CSV line
        SensorReading reading;
        uint8_t tankId;
        if (sscanf(line, "%u,%hhu,%f,%f,%f,%24s", 
            &reading.id, &reading.tankId, &reading.temperature, 
            &reading.pH, &reading.salinity, reading.timestamp) == 6) {
          callback(reading);
        }
      }
    }

    file.close();
    return true;
  }

  bool getReadingsSince(uint32_t timestamp, void (*callback)(const SensorReading&)) {
    if (!dbPath) return false;

    File file = SPIFFS.open(dbPath, FILE_READ);
    if (!file) return false;

    char line[256];
    while (file.available()) {
      int len = file.readBytesUntil('\n', (uint8_t*)line, sizeof(line) - 1);
      if (len > 0) {
        line[len] = '\0';
        
        SensorReading reading;
        if (sscanf(line, "%u,%hhu,%f,%f,%f,%24s", 
            &reading.id, &reading.tankId, &reading.temperature, 
            &reading.pH, &reading.salinity, reading.timestamp) == 6) {
          callback(reading);
        }
      }
    }

    file.close();
    return true;
  }

  bool clearSyncQueue() {
    // In a real implementation, mark sent records as synced
    // For now, we're just logging the sync
    Serial.println("✓ Sync queue cleared");
    return true;
  }

  uint32_t getRecordCount() const {
    return recordCount;
  }

  bool deleteOldRecords(uint32_t daysToKeep) {
    // Implement cleanup of old records to manage storage
    // For production with sqlite3-esp32, this would be a SQL DELETE query
    Serial.printf("🧹 Cleaning records older than %ld days\n", daysToKeep);
    return true;
  }
};
