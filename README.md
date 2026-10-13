# SmartFence AI — Protect Crops, Save Wildlife

> **College Hackathon Agri-IoT & Environmental AI Project**  
> An autonomous boundary monitoring system that protects valuable agricultural crops while safeguarding native wildlife using non-lethal, harmless water mist deterrents.

---

## 🌾 Project Vision & Problem Statement

Human-wildlife conflict is an acute challenge for farmers bordering forest reserves and rural sanctuaries:
1. **Crop Devastation**: Wild boars (*Sus scrofa*) and deer cause billions in agricultural crop loss annually by rooting up corn, trashing orchards, and breaking sapling rootstocks.
2. **Harmful Traditional Deterrents**: High-voltage electric fencing and lethal traps frequently cause wildlife mortality, injure livestock, and pose fire hazards.
3. **SmartFence AI Solution**: A smart IoT boundary combining **YOLO Edge Vision**, **Ultrasonic Distance Sensors**, **Harmless Low-Pressure Water Mist Actuators**, and **Cellular SMS Alerts** to startle and redirect animals back into wild habitats safely.

---

## ⚡ Core Features

- **YOLO Wildlife Detection Engine**: Real-time edge inference for wild boar, deer, and canines. Includes sample trail camera captures, custom image file upload, and user-authorized webcam stream analysis.
- **Corroborating Ultrasonic Sonar**: HC-SR04 distance sensing (2–400 cm) verifies physical boundary approach without false-triggering on distant visual movements.
- **Harmless Water Deterrent Actuator**: Optocoupler-isolated 12V solenoid valve releases a 3–5s pulse of harmless 40 PSI water mist. Zero electric shock, zero chemicals, zero injury.
- **Interactive Leaflet GIS Map**: OpenStreetMap standard and Esri high-resolution satellite imagery layers, zone polygons (North Cornfield, East Orchard, South Vineyard), custom marker placement, and GPS location support.
- **Simulated Cellular SMS Gateway**: Audit log with instant alert dispatch simulation, event cooldown deduplication (prevents repeated alert spam), and CSV export.
- **Hardware Integration Harness**: Web Serial API connection to real ESP32 microcontrollers over USB UART (115200 baud), complete wiring schematics, and Arduino C++ firmware.

---

## 🛠️ Hardware Architecture & Wiring Pinout

| Module | Component Pin | ESP32 Pinout | Voltage | Purpose |
|---|---|---|---|---|
| **HC-SR04 Sonar** | VCC | 5V (VIN) | 5.0V DC | Power supply |
| **HC-SR04 Sonar** | Trig | GPIO 12 | 3.3V Logic | 10µs ultrasonic trigger pulse |
| **HC-SR04 Sonar** | Echo | GPIO 13 | 3.3V Stepped | Pulse width echo (via 1k/2k resistor divider) |
| **5V Relay Module** | IN | GPIO 14 | 3.3V Logic | Actuator relay signal |
| **Solenoid Valve** | 12V DC Coil | Relay COM / NO | 12.0V DC | Harmless agricultural water mist release |
| **ESP32-CAM** | OV2640 Sensor | Internal DVP | 3.3V / 5V | Edge image capture & MJPEG stream |

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Development
```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev
```

Visit `http://localhost:3000` to interact with the full dashboard.

---

## 🧪 Hackathon Demo Testing Workflow

Judges can test the entire pipeline in under 30 seconds using the quick action bar:
1. **Click "Run Demo Detection"** in the top navigation or overview bar.
2. Watch the **YOLO bounding box** and confidence score appear on the trail camera view.
3. Observe the **Ultrasonic distance gauge** drop below the configured threshold.
4. Watch the **Harmless water mist actuator** turn cyan and countdown its pulse duration.
5. See the **Simulated SMS Toast** appear with formatted alert text delivered to the farmer's masked phone number.
6. Check the **Alerts & Event History** page to view the recorded event and download the CSV report.

---

## 🔒 Ethical Wildlife Safety Standards

SmartFence AI operates on a non-lethal, humane deterrence charter:
- **No Electric Shocks**: Zero high-voltage pulse generators.
- **No Toxic Deterrents**: Zero pesticides, capsaicin oils, or chemical repellents.
- **Auditory & Moisture Startle**: Animals have sensitive hearing and sudden moisture aversion; an unexpected 40 PSI cold water mist causes wildlife to turn back without physical trauma.

---

## ⚖️ Limitations & Production Road Map

- **YOLO Wildlife Weights**: Standard COCO pre-trained models do not distinguish wild boars from standard livestock. In production, models must be fine-tuned on camera trap datasets (e.g. Snapshot Serengeti).
- **Network Coverage**: Web dashboard features require internet (WiFi / 4G router). Cellular SMS requires an active SIM on a GSM SIM800L module or cloud Twilio webhook.
- **Simulation Transparency**: All synthetic readings, demo alerts, and virtual serial inputs in this prototype are explicitly badged as `[SIMULATED]` or `[DEMO DATA]`.
