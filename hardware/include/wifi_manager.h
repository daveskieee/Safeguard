#pragma once

#include <WiFi.h>
#include "config.h"

class WiFiManager {
private:
  bool isWiFiConnected;
  unsigned long lastConnectionAttempt;
  const unsigned long RECONNECT_INTERVAL = 10000;  // 10 seconds

public:
  WiFiManager() : isWiFiConnected(false), lastConnectionAttempt(0) {}

  void connect(const char* ssid, const char* password) {
    Serial.printf("Connecting to WiFi: %s\n", ssid);
    
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n✓ WiFi connected");
      Serial.print("IP address: ");
      Serial.println(WiFi.localIP());
      isWiFiConnected = true;
    } else {
      Serial.println("\n✗ WiFi connection failed");
      isWiFiConnected = false;
    }
  }

  bool isConnected() {
    // Check current connection status
    if (WiFi.status() == WL_CONNECTED) {
      return true;
    }
    
    // Attempt reconnection if interval has passed
    if (millis() - lastConnectionAttempt >= RECONNECT_INTERVAL) {
      lastConnectionAttempt = millis();
      Serial.println("🔄 Attempting WiFi reconnection...");
      WiFi.reconnect();
    }
    
    return false;
  }

  const char* getSSID() const {
    return WiFi.SSID().c_str();
  }

  const char* getIP() const {
    return WiFi.localIP().toString().c_str();
  }

  int getSignalStrength() {
    return WiFi.RSSI();  // RSSI in dBm
  }

  void disconnect() {
    WiFi.disconnect();
    isWiFiConnected = false;
  }
};
