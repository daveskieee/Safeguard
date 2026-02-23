#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <SPIFFS.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>
#include "config.h"
#include "sensor_manager.h"
#include "database_manager.h"
#include "wifi_manager.h"

// Global instances
SensorManager sensors;
DatabaseManager database;
WiFiManager wifi;

unsigned long lastMeasurementTime = 0;
bool isConnected = false;

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n\n========================================");
  Serial.println("🌊 HydroGuard ESP32 Starting...");
  Serial.println("========================================");

  // Initialize SPIFFS for local database
  if (!SPIFFS.begin(true)) {
    Serial.println("✗ SPIFFS initialization failed!");
  } else {
    Serial.println("✓ SPIFFS initialized");
  }

  // Initialize sensors
  Serial.println("\n📊 Initializing sensors...");
  if (sensors.begin()) {
    Serial.println("✓ Sensors initialized successfully");
  } else {
    Serial.println("✗ Sensor initialization failed!");
  }

  // Initialize local database
  Serial.println("\n💾 Initializing local database...");
  if (database.begin(LOCAL_DB_PATH)) {
    Serial.println("✓ Local database initialized");
  } else {
    Serial.println("✗ Database initialization failed!");
  }

  // Connect to WiFi
  Serial.println("\n📡 Connecting to WiFi...");
  wifi.connect(SSID, PASSWORD);
  
  Serial.println("\n✓ Setup complete!");
}

void loop() {
  // Check WiFi connection
  if (!isConnected) {
    isConnected = wifi.isConnected();
    if (isConnected) {
      Serial.println("✓ WiFi connected");
    }
  } else if (!wifi.isConnected()) {
    Serial.println("✗ WiFi disconnected");
    isConnected = false;
  }

  // Take measurements at set intervals
  if (millis() - lastMeasurementTime >= MEASUREMENT_INTERVAL) {
    lastMeasurementTime = millis();
    takeMeasurement();
  }

  delay(1000);
}

void takeMeasurement() {
  Serial.println("\n📈 Taking measurements...");

  // Read sensor values
  float temperature = sensors.readTemperature();
  float pH = sensors.readPH();
  float salinity = sensors.readSalinity();

  Serial.printf("   Temperature: %.2f°C\n", temperature);
  Serial.printf("   pH: %.2f\n", pH);
  Serial.printf("   Salinity: %.3f\n", salinity);

  // Store in local database (offline-first)
  if (database.saveReading(TANK_ID, temperature, pH, salinity)) {
    Serial.println("✓ Reading saved to local database");
  } else {
    Serial.println("✗ Failed to save to local database");
  }

  // If WiFi is connected, send to server
  if (isConnected) {
    sendToServer(temperature, pH, salinity);
  } else {
    Serial.println("⚠ WiFi offline - data queued for sync");
  }
}

void sendToServer(float temp, float pH, float salinity) {
  HTTPClient http;
  
  String serverPath = String(SERVER_URL) + "/api/readings";
  http.begin(serverPath);
  http.addHeader("Content-Type", "application/json");

  // Create JSON payload
  DynamicJsonDocument doc(200);
  doc["tankId"] = TANK_ID;
  doc["temperature"] = temp;
  doc["pH"] = pH;
  doc["salinity"] = salinity;

  String jsonString;
  serializeJson(doc, jsonString);

  int httpResponseCode = http.POST(jsonString);

  if (httpResponseCode > 0) {
    Serial.printf("✓ Server response code: %d\n", httpResponseCode);
    if (httpResponseCode == 200) {
      // Clear the offline queue if sync was successful
      database.clearSyncQueue();
    }
  } else {
    Serial.printf("✗ Error code: %s\n", http.errorToString(httpResponseCode).c_str());
  }

  http.end();
}
