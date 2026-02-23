#pragma once

#include <OneWire.h>
#include <DallasTemperature.h>
#include "config.h"

class SensorManager {
private:
  OneWire oneWire;
  DallasTemperature tempSensor;
  float calibrationPH = 7.0;      // Neutral pH calibration
  float calibrationSalinity = 1.025;  // Standard seawater

public:
  SensorManager() : oneWire(TEMP_SENSOR_PIN), tempSensor(&oneWire) {}

  bool begin() {
    try {
      tempSensor.begin();
      pinMode(PH_SENSOR_PIN, INPUT);
      pinMode(SALINITY_SENSOR_PIN, INPUT);
      return true;
    } catch (...) {
      return false;
    }
  }

  float readTemperature() {
    tempSensor.requestTemperatures();
    delay(1000);  // Wait for conversion
    float tempC = tempSensor.getTempCByIndex(0);
    
    if (tempC == DEVICE_DISCONNECTED_C) {
      Serial.println("✗ Temperature sensor error!");
      return -999.0;
    }
    
    return tempC;
  }

  float readPH() {
    int rawValue = analogRead(PH_SENSOR_PIN);
    
    // Convert 12-bit ADC value to voltage (0-3.3V)
    float voltage = (rawValue / 4095.0) * 3.3;
    
    // pH probe calibration: 3.3V = 0pH, 0V = 14pH
    // Linear mapping: pH = 14 - (voltage / 3.3 * 14)
    float pH = 14.0 - (voltage / 3.3) * 14.0;
    
    // Apply calibration offset
    pH -= (calibrationPH - 7.0);
    
    return constrain(pH, 0.0, 14.0);
  }

  float readSalinity() {
    int rawValue = analogRead(SALINITY_SENSOR_PIN);
    
    // Convert 12-bit ADC value to conductivity
    // Specific gravity of seawater at standard conditions
    // This is a simplified conversion - in production, use a proper salinity sensor
    float voltage = (rawValue / 4095.0) * 3.3;
    
    // Simplified conversion: assuming sensor output correlates with salinity
    // Range: 1.020 - 1.030 specific gravity
    float salinity = 1.020 + (voltage / 3.3) * 0.01;
    
    return constrain(salinity, 1.000, 1.050);
  }

  float getCalibrationPH() const {
    return calibrationPH;
  }

  void setCalibrationPH(float pH) {
    calibrationPH = pH;
  }

  float getCalibrationSalinity() const {
    return calibrationSalinity;
  }

  void setCalibrationSalinity(float salinity) {
    calibrationSalinity = salinity;
  }
};
