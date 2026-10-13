import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Sliders,
  ShieldAlert,
  Phone,
  Droplets,
  Cpu,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Code,
  FileText,
} from 'lucide-react';
import { useSmartFence } from '../../context/SmartFenceContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData } = useSmartFence();

  const [formData, setFormData] = useState({
    farmName: settings.farmName,
    ownerName: settings.ownerName,
    phoneRecipientMasked: settings.phoneRecipientMasked,
    yoloConfidenceThreshold: settings.yoloConfidenceThreshold,
    ultrasonicThresholdCm: settings.ultrasonicThresholdCm,
    alertCooldownSeconds: settings.alertCooldownSeconds,
    sprayDurationSeconds: settings.sprayDurationSeconds,
    autoSprayEnabled: settings.autoSprayEnabled,
    simulationMode: settings.simulationMode,
    smsWebhookUrl: settings.smsWebhookUrl || '',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'architecture' | 'api_docs'>('config');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>System Parameters & Technical Architecture</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure boundary sensitivities, hardware safety lockouts, SMS alert routing, and inspect hackathon documentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'config'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            System Parameters
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'architecture'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            Hackathon Blueprint & BOM
          </button>
          <button
            onClick={() => setActiveTab('api_docs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'api_docs'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            API & ESP32 Webhooks
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-lg p-3 text-xs text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>System configuration saved successfully to browser local storage.</span>
        </div>
      )}

      {/* Tab 1: Config Form */}
      {activeTab === 'config' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Farm Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Farm Property & Contacts
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Farm / Facility Name:
                </label>
                <input
                  type="text"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Lead Operator / Researcher:
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cellular SMS Recipient (Masked):
                </label>
                <input
                  type="text"
                  value={formData.phoneRecipientMasked}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneRecipientMasked: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Recipient phone formatted as masked demo number. In production, configure Twilio or AWS SNS credentials via backend environment variables.
                </p>
              </div>

              {/* Simulation Mode Safety Warning */}
              <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Hardware Safety Mode</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/60 text-amber-200">
                    {formData.simulationMode ? 'SIMULATION SAFE' : 'REAL HARNESS'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong>Safety Notice:</strong> Never enable real hardware execution without inspecting water plumbing pressure, electrical grounding on 12V relays, and verifying animal safety standards.
                </p>
              </div>
            </div>

            {/* AI Vision & Sensor Thresholds */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Thresholds & Actuator Timing
              </h3>

              {/* YOLO Confidence */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">YOLO Confidence Minimum:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {Math.round(formData.yoloConfidenceThreshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="0.95"
                  step="0.05"
                  value={formData.yoloConfidenceThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yoloConfidenceThreshold: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Ultrasonic Threshold */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Ultrasonic Trip Distance:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {formData.ultrasonicThresholdCm} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="250"
                  step="10"
                  value={formData.ultrasonicThresholdCm}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ultrasonicThresholdCm: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Alert Cooldown */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Alert Notification Cooldown:</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {formData.alertCooldownSeconds} seconds
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={formData.alertCooldownSeconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      alertCooldownSeconds: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Suppresses repeated alerts if the same animal lingers near the perimeter wire.
                </p>
              </div>

              {/* Spray Duration */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Water Spray Pulse Duration:</span>
                  <span className="text-cyan-400 font-mono font-bold">
                    {formData.sprayDurationSeconds} seconds
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={formData.sprayDurationSeconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sprayDurationSeconds: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Automatic Deterrent Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-300 font-medium">
                  Auto-Spray on Verified Detection:
                </span>
                <input
                  type="checkbox"
                  checked={formData.autoSprayEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, autoSprayEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetToDefaultData}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Hackathon Blueprint & BOM */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Hackathon Project Architecture & Hardware Bill of Materials (BOM)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              End-to-end design for presentation to hackathon judges and agricultural stakeholders.
            </p>
          </div>

          {/* Workflow Diagram */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <div className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              SYSTEM EVENT PIPELINE (END-TO-END)
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-center text-slate-300">
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 w-full md:w-auto">
                <span className="block font-bold text-sky-400">01. Camera Node</span>
                <span className="text-[10px] text-slate-400">ESP32-CAM MJPEG</span>
              </div>
              <span className="text-slate-600 font-sans">&rarr;</span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 w-full md:w-auto">
                <span className="block font-bold text-emerald-400">02. YOLOv8 Classifier</span>
                <span className="text-[10px] text-slate-400">Species & Conf %</span>
              </div>
              <span className="text-slate-600 font-sans">&rarr;</span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 w-full md:w-auto">
                <span className="block font-bold text-amber-400">03. Sonar Validation</span>
                <span className="text-[10px] text-slate-400">HC-SR04 Proximity</span>
              </div>
              <span className="text-slate-600 font-sans">&rarr;</span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 w-full md:w-auto">
                <span className="block font-bold text-cyan-400">04. Safe Water Mist</span>
                <span className="text-[10px] text-slate-400">3-5s Harmless Pulse</span>
              </div>
              <span className="text-slate-600 font-sans">&rarr;</span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 w-full md:w-auto">
                <span className="block font-bold text-purple-400">05. SMS Alert</span>
                <span className="text-[10px] text-slate-400">Farmer Dispatched</span>
              </div>
            </div>
          </div>

          {/* Bill of Materials (BOM) Table */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">
              Hardware Bill of Materials (Approx Cost: ~$45 / station)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse font-sans">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="py-2 px-3">Item / Module</th>
                    <th className="py-2 px-3">Model</th>
                    <th className="py-2 px-3">Est. Cost (USD)</th>
                    <th className="py-2 px-3">Role in System</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 text-xs">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">Microcontroller & Cam</td>
                    <td className="py-2 px-3 font-mono">AI-Thinker ESP32-CAM (OV2640)</td>
                    <td className="py-2 px-3 font-mono">$7.50</td>
                    <td className="py-2 px-3">Perimeter vision capture, edge RTSP/MJPEG stream</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">Ultrasonic Sensor</td>
                    <td className="py-2 px-3 font-mono">HC-SR04 Waterproof Transducer</td>
                    <td className="py-2 px-3 font-mono">$3.20</td>
                    <td className="py-2 px-3">Physical boundary distance measurement (2-400cm)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">Solenoid Valve Relay</td>
                    <td className="py-2 px-3 font-mono">5V Optocoupler 1-Channel Relay</td>
                    <td className="py-2 px-3 font-mono">$1.80</td>
                    <td className="py-2 px-3">Switches 12V DC power to water solenoid safely</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">Water Misting Solenoid</td>
                    <td className="py-2 px-3 font-mono">12V DC 1/2" Normally Closed Valve</td>
                    <td className="py-2 px-3 font-mono">$8.00</td>
                    <td className="py-2 px-3">Releases harmless agricultural water mist</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">Solar Power & Battery</td>
                    <td className="py-2 px-3 font-mono">5W Monocrystalline + 18650 Li-ion</td>
                    <td className="py-2 px-3 font-mono">$14.50</td>
                    <td className="py-2 px-3">Autonomous off-grid operation along remote fences</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">Weatherproof Enclosure</td>
                    <td className="py-2 px-3 font-mono">IP65 Junction Box + Pole Mount</td>
                    <td className="py-2 px-3 font-mono">$9.00</td>
                    <td className="py-2 px-3">Protects electronics against rain, dust, and UV</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: API Docs */}
      {activeTab === 'api_docs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <span>Production Edge API & SMS Webhook Endpoints</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">OpenAPI 3.0 Ready</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {/* Endpoint 1 */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-[10px]">POST</span>
                <span>/api/v1/telemetry/sonar</span>
              </div>
              <p className="text-slate-400 font-sans text-xs mb-2">
                Called by ESP32 nodes to publish ultrasonic distance pulses.
              </p>
              <pre className="text-[11px] text-slate-300 overflow-x-auto">
{`{
  "nodeId": "dev-us-01",
  "zoneId": "zone-a",
  "distanceCm": 68,
  "batteryPct": 94,
  "timestamp": "2026-10-13T07:31:00Z"
}`}
              </pre>
            </div>

            {/* Endpoint 2 */}
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-[10px]">POST</span>
                <span>/api/v1/spray/actuate</span>
              </div>
              <p className="text-slate-400 font-sans text-xs mb-2">
                Triggers harmless water solenoid valve for specified duration.
              </p>
              <pre className="text-[11px] text-slate-300 overflow-x-auto">
{`{
  "zoneId": "zone-a",
  "durationSeconds": 4,
  "triggerReason": "yolo_wild_boar_verified",
  "authKey": "Bearer <SECURE_GATEWAY_TOKEN>"
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
