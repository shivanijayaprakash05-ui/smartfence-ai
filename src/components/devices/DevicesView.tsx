import React, { useState } from 'react';
import {
  Cpu,
  Radio,
  Zap,
  Activity,
  Sliders,
  Cable,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { useSmartFence } from '../../context/SmartFenceContext';
import { HARDWARE_STATION_URL } from '../../data/sampleData';

export const DevicesView: React.FC = () => {
  const {
    devices,
    settings,
    updateSettings,
    currentUltrasonicDistance,
    triggerUltrasonicProximity,
    hardwareSerialConnected,
    connectWebSerial,
    disconnectWebSerial,
  } = useSmartFence();

  const [simulatedSliderDistance, setSimulatedSliderDistance] = useState<number>(currentUltrasonicDistance);
  const [activeTab, setActiveTab] = useState<'nodes' | 'sonar' | 'wiring' | 'firmware'>('nodes');
  const [serialLogs, setSerialLogs] = useState<string[]>([
    '[ESP32-CORE] Booting FreeRTOS kernel on Node-01...',
    '[WIFI] Connected to Farm AP (SSID: AGRI_MESH_2G, IP: 192.168.4.15)',
    '[HC-SR04] Ultrasonic sensor calibrated at 5Hz polling rate',
    '[RELAY] Safe 12V Solenoid driver initialized on GPIO 14 (State: LOW/OFF)',
    '[STATUS] Telemetry beacon dispatched to SmartFence Cloud Hub',
  ]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSimulatedSliderDistance(val);
  };

  const handleApplySimulatedDistance = () => {
    triggerUltrasonicProximity(simulatedSliderDistance, 'zone-a');
    setSerialLogs((prev) => [
      `[HC-SR04] Simulated distance pulse: ${simulatedSliderDistance}cm`,
      simulatedSliderDistance < settings.ultrasonicThresholdCm
        ? `[ALERT] Distance ${simulatedSliderDistance}cm < Threshold ${settings.ultrasonicThresholdCm}cm! Trip registered.`
        : `[INFO] Distance ${simulatedSliderDistance}cm nominal (clear perimeter)`,
      ...prev.slice(0, 10),
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header Station Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={HARDWARE_STATION_URL}
            alt="SmartFence Hardware Station Pole"
            className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                IoT Edge Devices & Ultrasonic Sensor Grid
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {hardwareSerialConnected ? 'REAL SERIAL CONNECTED' : 'SIMULATED HARNESS'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Field monitoring nodes powered by ESP32 microcontrollers, ultrasonic sonar rangefinders, and 12V water deterrent solenoids.
            </p>
          </div>
        </div>

        {/* Web Serial Hardware Adapter Button */}
        <div className="flex items-center gap-2">
          {hardwareSerialConnected ? (
            <button
              onClick={disconnectWebSerial}
              className="px-3.5 py-2 text-xs font-semibold text-rose-300 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <Cable className="w-3.5 h-3.5" />
              <span>Disconnect Serial Port</span>
            </button>
          ) : (
            <button
              onClick={connectWebSerial}
              className="px-3.5 py-2 text-xs font-semibold text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors flex items-center gap-2"
              title="Connect physical ESP32 over Web Serial (USB UART)"
            >
              <Cable className="w-3.5 h-3.5 text-cyan-400" />
              <span>Connect ESP32 (Web Serial)</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('nodes')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'nodes'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Active Node Grid ({devices.length})
        </button>
        <button
          onClick={() => setActiveTab('sonar')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'sonar'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Ultrasonic Sonar Calibration
        </button>
        <button
          onClick={() => setActiveTab('wiring')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'wiring'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Schematic & Pinout Blueprint
        </button>
        <button
          onClick={() => setActiveTab('firmware')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'firmware'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          ESP32 Arduino C++ Firmware
        </button>
      </div>

      {/* Tab 1: Nodes Grid */}
      {activeTab === 'nodes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <div
              key={device.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {device.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {device.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{device.name}</h3>
                <p className="text-xs text-slate-400 mb-3">{device.zoneName}</p>

                <div className="text-[11px] text-slate-300 space-y-1.5 border-t border-slate-800 pt-3 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Battery State:</span>
                    <span className="text-emerald-400 tabular-nums">{device.batteryPct}% Solar Reserve</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signal RSSI:</span>
                    <span className="tabular-nums text-slate-300">{device.signalRssi} dBm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">IP / Port:</span>
                    <span className="text-cyan-400">{device.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Telemetry:</span>
                    <span>{device.lastPing}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="text-slate-500 block mb-0.5 font-mono text-[10px]">HARDWARE SPECS:</span>
                <span className="text-slate-300 text-[11px] leading-tight block">
                  {device.hardwareSpecs}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Ultrasonic Sonar Tuning & Simulator */}
      {activeTab === 'sonar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Ultrasonic Distance Sensor Calibration (HC-SR04)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ultrasonic sensors emit high-frequency acoustic sound waves (40 kHz) to calculate distance via time-of-flight.
              </p>
            </div>

            {/* Scientific Explanation Callout (Crucial Hackathon Requirement) */}
            <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg text-xs text-amber-200/90 leading-relaxed flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Sensor Boundary Principle:</strong> An ultrasonic sensor measures distance only (physical boundary proximity). It does <em>not</em> identify animal species or distinguish between crops, leaves, and animals. SmartFence AI uses camera vision + YOLO for species identification, with ultrasonic distance providing rapid proximity corroboration.
              </div>
            </div>

            {/* Live Distance Gauge */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Current Live Sonar Reading:</span>
                <span className={`text-2xl font-bold font-mono tabular-nums ${
                  currentUltrasonicDistance < settings.ultrasonicThresholdCm
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}>
                  {currentUltrasonicDistance} cm
                </span>
              </div>

              {/* Visual Distance Gauge Bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    currentUltrasonicDistance < settings.ultrasonicThresholdCm
                      ? 'bg-rose-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (currentUltrasonicDistance / 300) * 100)}%` }}
                />
                {/* Threshold Marker Needle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 shadow"
                  style={{ left: `${(settings.ultrasonicThresholdCm / 300) * 100}%` }}
                  title={`Threshold: ${settings.ultrasonicThresholdCm}cm`}
                />
              </div>

              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>0 cm</span>
                <span className="text-amber-400">Threshold: {settings.ultrasonicThresholdCm} cm</span>
                <span>300 cm (Max Range)</span>
              </div>
            </div>

            {/* Interactive Simulation Slider */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Simulate Object Approach Distance:
                </label>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {simulatedSliderDistance} cm
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="280"
                step="5"
                value={simulatedSliderDistance}
                onChange={handleSliderChange}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleApplySimulatedDistance}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                >
                  Send Distance Pulse to System
                </button>
                <button
                  onClick={() => {
                    setSimulatedSliderDistance(45);
                    triggerUltrasonicProximity(45, 'zone-a');
                  }}
                  className="px-3.5 py-2 text-xs font-medium text-rose-300 bg-rose-950/70 hover:bg-rose-900 border border-rose-800 rounded-lg transition-colors"
                >
                  Simulate Perimeter Breach (45cm)
                </button>
              </div>
            </div>
          </div>

          {/* Console / UART Serial Monitor */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ESP32 UART Console</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">115200 BAUD</span>
              </div>
              <div className="bg-slate-950 rounded-lg p-2.5 font-mono text-[10px] text-slate-300 space-y-1 h-64 overflow-y-auto border border-slate-800 select-all">
                {serialLogs.map((log, i) => (
                  <div key={i} className="leading-tight">
                    <span className="text-emerald-400">&gt; </span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <span className="block font-mono text-[10px] text-slate-500">ESP32 ADAPTER PROTOCOL:</span>
              JSON payloads over WebSockets or HTTP POST: <code className="text-cyan-400">/api/telemetry/distance</code>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Hardware Schematic & Pinout */}
      {activeTab === 'wiring' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cable className="w-4 h-4 text-emerald-400" />
            <span>Complete Hardware Wiring & Pinout Guide</span>
          </h3>
          <p className="text-xs text-slate-400">
            Field-tested circuit architecture for autonomous solar-powered SmartFence nodes.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2 px-3">Module Component</th>
                  <th className="py-2 px-3">Component Pin</th>
                  <th className="py-2 px-3">ESP32 Pinout</th>
                  <th className="py-2 px-3">Electrical Voltage</th>
                  <th className="py-2 px-3">Function Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-[11px] text-slate-200">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-sky-400">HC-SR04 Sonar</td>
                  <td className="py-2.5 px-3">VCC</td>
                  <td className="py-2.5 px-3 text-emerald-400">5V (VIN)</td>
                  <td className="py-2.5 px-3">5.0V DC</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">Transducer power supply</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-sky-400">HC-SR04 Sonar</td>
                  <td className="py-2.5 px-3">Trig</td>
                  <td className="py-2.5 px-3 text-emerald-400">GPIO 12</td>
                  <td className="py-2.5 px-3">3.3V Logic</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">10µs ultrasonic trigger pulse</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-sky-400">HC-SR04 Sonar</td>
                  <td className="py-2.5 px-3">Echo</td>
                  <td className="py-2.5 px-3 text-emerald-400">GPIO 13 (via 1k/2k Divider)</td>
                  <td className="py-2.5 px-3">3.3V Stepped</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">Pulse width proportional to distance</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-cyan-400">5V Relay Module</td>
                  <td className="py-2.5 px-3">IN</td>
                  <td className="py-2.5 px-3 text-emerald-400">GPIO 14</td>
                  <td className="py-2.5 px-3">3.3V Logic</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">Controls 12V water solenoid valve</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-cyan-400">Solenoid Valve</td>
                  <td className="py-2.5 px-3">+ / - Leads</td>
                  <td className="py-2.5 px-3 text-amber-400">Relay COM & NO</td>
                  <td className="py-2.5 px-3">12.0V DC</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">Harmless agricultural water mist release</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-amber-400">Solar Power Unit</td>
                  <td className="py-2.5 px-3">Solar Output</td>
                  <td className="py-2.5 px-3 text-slate-300">TP4056 + Boost Converter</td>
                  <td className="py-2.5 px-3">3.7V - 5.0V</td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">Autonomous battery recharging</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: ESP32 Firmware Sample */}
      {activeTab === 'firmware' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              ESP32 Arduino C++ Firmware (Production Template)
            </h3>
            <span className="text-xs font-mono text-emerald-400">v1.2-AgriReady</span>
          </div>
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed select-all">
{`#include <WiFi.h>
#include <HTTPClient.h>

#define TRIG_PIN 12
#define ECHO_PIN 13
#define RELAY_PIN 14

const char* ssid = "AGRI_MESH_2G";
const char* password = "FARM_WIFI_KEY";
const char* serverUrl = "https://your-smartfence-backend.run.app/api/telemetry";

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // Safe default: valve closed
  WiFi.begin(ssid, password);
}

long measureDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  if (duration == 0) return 999;
  return duration * 0.034 / 2;
}

void loop() {
  long distance = measureDistanceCm();
  Serial.printf("Distance: %ld cm\\n", distance);
  // Post telemetry every 1 second
  delay(1000);
}`}
          </div>
        </div>
      )}
    </div>
  );
};
