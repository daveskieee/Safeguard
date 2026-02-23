# ESP32 Hardware Wiring Guide

## ESP32 Pinout Reference

```
         ┌─────────────────────────────┐
         │      USB (Programming)      │
         └────────┬────────────────────┘
                  │
    ┌─────────────┴──────────────┐
    │  ESP32 DevKit v1 30-pin    │
    │                             │
    │  TOP HEADER (Left Side)    │
    │  ┌──────────────────────┐  │
    │  │ EN                   │  │ Reset/Enable
    │  │ IO36 (ADC0)          │  │ Input only
    │  │ IO39 (ADC3)          │  │ Input only
    │  │ IO34 (ADC6) ←────────┼──┼─ SALINITY SENSOR
    │  │ IO35 (ADC7) ←────────┼──┼─ pH SENSOR
    │  │ IO32 (ADC4)          │  │
    │  │ IO33 (ADC5)          │  │
    │  │ IO25                 │  │
    │  │ IO26                 │  │
    │  │ IO27                 │  │
    │  │ IO14 (ADC6)          │  │
    │  │ IO12 (ADC5)          │  │
    │  │ IO13 (ADC4)          │  │
    │  │ IO9 (SD2)            │  │
    │  │ IO10 (SD3)           │  │
    │  │ IO11 (CMD)           │  │
    │  │ VIN                  │  │
    │  │ GND                  │  │
    │  └──────────────────────┘  │
    │                             │
    │  BOTTOM HEADER (Right Side)│
    │  ┌──────────────────────┐  │
    │  │ IO23                 │  │
    │  │ IO19                 │  │
    │  │ IO18                 │  │
    │  │ IO5 ←────────────────┼──┼─ SD CARD CS
    │  │ IO17 (TX2)           │  │
    │  │ IO16 (RX2)           │  │
    │  │ IO4 ←────────────────┼──┼─ DS18B20 TEMP
    │  │ IO0                  │  │
    │  │ IO2                  │  │
    │  │ IO15                 │  │
    │  │ GND                  │  │
    │  │ TX0 (GPIO1)          │  │
    │  │ RX0 (GPIO3)          │  │
    │  │ 3.3V                 │  │
    │  │ GND                  │  │
    │  └──────────────────────┘  │
    │                             │
    └─────────────────────────────┘
```

## Sensor Pinout Diagrams

### 1. DS18B20 Temperature Sensor (1-Wire)

```
         ┌─────────────┐
         │  DS18B20    │
         │   Probe     │
         └─────────────┘
              │
         ┌────┼────┐
         │    │    │
        GND   DQ   VDD
         │    │    │
         │    └────────── GPIO4 (with 4.7k pull-up)
         │              (to 3.3V)
         │
    ┌────▼───────────────┐
    │ ESP32              │
    │ GND (Pin 13, 14)   │
    │ GPIO4 (Pin 25)     │
    │ 3.3V (Pin 1)       │
    └────────────────────┘

Wiring:
  DS18B20 Pin1 (GND)  → ESP32 GND
  DS18B20 Pin2 (DQ)   → ESP32 GPIO4 + 4.7kΩ resistor to 3.3V
  DS18B20 Pin3 (VDD)  → ESP32 3.3V
```

### 2. pH Probe (Analog Input)

```
┌────────────────────┐
│   pH Probe         │
│   (Electrode)      │
└─────────────────────┘
         │
    ┌────┴─────┐
    │           │
   GND       Signal
    │           │
    │           │ 0-3.3V voltage divider (optional preamp)
    │           │
    └─────┬─────┴─────────────┐
          │                    │
      ESP32 GND            ESP32 GPIO35 (ADC7)
```

**Optional pH Conditioning Circuit**:
```
        ┌─────────────────────────┐
        │   pH Probe Preamp       │
        │   (Not required for MVP)│
        ├─────────────────────────┤
        │ Input: pH Probe Signal  │
        │ Output: 0-3.3V Linear   │
        │ Gain: 1:1 (unity)       │
        └──────────┬──────────────┘
                   │
              ESP32 GPIO35
```

**Calibration Values**:
```
pH 7.0 (Neutral):    1.65V (half of 3.3V)
pH 6.5 (Acidic):     1.87V (13% higher)
pH 8.5 (Alkaline):   1.43V (13% lower)
pH 0.0 (Extreme):    3.30V (full scale)
pH 14.0 (Extreme):   0.00V (ground)
```

### 3. Salinity Sensor (Conductivity)

```
┌────────────────────────┐
│  Salinity Sensor       │
│  (Conductivity Probe)  │
└────────────────────────┘
         │
    ┌────┴────┐
    │          │
   GND     Signal (0-3.3V)
    │          │
    │          │
    └─────┬────┴──────┐
          │            │
      ESP32 GND    ESP32 GPIO34 (ADC6)
```

**Typical Output Mapping**:
```
Fresh water (0 ppm):     ~0.50V → SG 1.000
Brackish water (5 ppm):  ~1.25V → SG 1.005
Seawater (35 ppm):       ~2.50V → SG 1.025
High salinity (42 ppm):  ~2.90V → SG 1.030
```

## Complete Wiring Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    ESP32 DevKit v1                       │
│                                                          │
│  3.3V ────┬──────────────────────────────────────────┐  │
│           │                                          │  │
│  GND ─────┼──────────────────────────────────────────┼──┤
│           │                                          │  │
│  GPIO4 ───│───(1-Wire to DS18B20)                   │  │
│           │                                          │  │
│  GPIO5 ───│───(CS to SD Card)                       │  │
│           │                                          │  │
│  GPIO35 ──┤───(ADC to pH Probe)                     │  │
│           │                                          │  │
│  GPIO34 ──┤───(ADC to Salinity)                     │  │
│           │                                          │  │
│  TX/RX ───┤───(USB Serial Debug)                    │  │
│           │                                          │  │
└───────────┼──────────────────────────────────────────┼──┘
            │                                          │
            │           4.7kΩ Pull-up Resistors      │
            │                                          │
            │  ┌────────────────────────────────────────┘
            │  │
            │  ├─────→ DS18B20 (Temperature)
            │  │
            │  ├─────→ Analog Sensors (pH, Salinity)
            │  │
            │  └─────→ Power Distribution
```

## Assembly Instructions

### Step 1: Prepare Pull-up Resistor for DS18B20
1. Solder 4.7kΩ resistor between GPIO4 and 3.3V
2. Test continuity with multimeter
3. Use heat shrink tubing to insulate

### Step 2: Connect DS18B20 Temperature Sensor
1. Identify pin layout (usually: 1=GND, 2=DQ, 3=VDD)
2. Solder:
   - Pin 1 (GND) to ESP32 GND
   - Pin 2 (DQ) to GPIO4
   - Pin 3 (VDD) to ESP32 3.3V

### Step 3: Connect pH Probe
1. Connect analog output to GPIO35
2. Ensure stable voltage supply
3. Calibrate with known pH values (buffer solutions)

### Step 4: Connect Salinity Sensor
1. Connect analog output to GPIO34
2. Calibrate with known salinity solutions
3. Verify voltage range

### Step 5: SD Card Module (Optional)
1. Connect CS to GPIO5
2. Connect MOSI to GPIO23
3. Connect MISO to GPIO19
4. Connect CLK to GPIO18
5. Connect VCC to 3.3V
6. Connect GND to GND

## Testing the Hardware

### Test Script (Arduino IDE / PlatformIO)
```cpp
#include <OneWire.h>
#include <DallasTemperature.h>

#define ONE_WIRE_BUS 4
#define PH_PIN 35
#define SALINITY_PIN 34

OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);

void setup() {
  Serial.begin(115200);
  tempSensor.begin();
}

void loop() {
  // Read Temperature
  tempSensor.requestTemperatures();
  float tempC = tempSensor.getTempCByIndex(0);
  Serial.printf("Temperature: %.2f°C\n", tempC);
  
  // Read pH
  int phRaw = analogRead(PH_PIN);
  float phVoltage = (phRaw / 4095.0) * 3.3;
  float pH = 14 - (phVoltage / 3.3 * 14);
  Serial.printf("pH: %.2f (V: %.2f)\n", pH, phVoltage);
  
  // Read Salinity
  int salRaw = analogRead(SALINITY_PIN);
  float salVoltage = (salRaw / 4095.0) * 3.3;
  float salinity = 1.020 + (salVoltage / 3.3) * 0.01;
  Serial.printf("Salinity: %.3f (V: %.2f)\n", salinity, salVoltage);
  
  delay(2000);
}
```

## Troubleshooting

### Temperature Sensor Not Reading
- [ ] Check 1-Wire pull-up resistor (4.7kΩ)
- [ ] Verify GPIO4 connection
- [ ] Ensure probe GND connection
- [ ] Check for loose contacts

### pH Reading Erratic
- [ ] Verify probe calibration
- [ ] Check ADC voltage stability
- [ ] Add small capacitor (0.1µF) to input
- [ ] Ensure probe in solution

### Salinity Reading Unstable
- [ ] Check probe contacts
- [ ] Ensure good conductivity of sensor
- [ ] Verify using control solution
- [ ] Add RC filter to input

## Power Considerations

```
Device              Current Draw
────────────────────────────────
ESP32 (idle):       ~80 mA
ESP32 (WiFi tx):    ~240 mA
DS18B20:            ~1 mA
pH Probe (powered):  ~5 mA
Salinity Probe:      ~10 mA
────────────────────────────────
Total Peak:         ~350 mA @ 3.3V
```

**Power Supply Requirements**:
- 5V input (USB or external)
- Capable of 500mA (USB 2.0) to 2A (recommended)
- Regulated 3.3V output (on ESP32 board)
- GND properly connected

---

**Hardware Version**: 1.0
**Last Updated**: 2024-02-23
