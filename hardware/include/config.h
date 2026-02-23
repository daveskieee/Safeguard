#pragma once

// GPIO Pins
#define TEMP_SENSOR_PIN 4        // DS18B20
#define PH_SENSOR_PIN 35         // Analog input for pH probe
#define SALINITY_SENSOR_PIN 34   // Analog input for salinity probe
#define SD_CS_PIN 5              // SPI Chip Select for SD Card

// WiFi credentials
#define SSID "YourSSID"
#define PASSWORD "YourPassword"

// Server settings
#define SERVER_URL "http://192.168.x.x:5000"
#define TANK_ID 1

// Measurement interval
#define MEASUREMENT_INTERVAL 60000  // 60 seconds

// Database settings
#define LOCAL_DB_PATH "/spiffs/readings.db"
