import React from 'react';
import {
  Camera,
  Activity,
  Droplets,
  Radio,
  ShieldAlert,
  Bell,
  Play,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSmartFence } from '../../context/SmartFenceContext';
import { FarmMapView } from '../map/FarmMapView';

interface OverviewViewProps {
  onNavigate: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const {
    events,
    devices,
    zones,
    waterPumpActive,
    waterPumpRemaining,
    currentUltrasonicDistance,
    settings,
    triggerDemoDetection,
    triggerUltrasonicProximity,
    triggerWaterSpray,
    isSimulatingDetection,
  } = useSmartFence();

  const totalDetectionsToday = events.length;
  const boarCount = events.filter((e) => e.animalClass === 'wild_boar').length;
  const deerCount = events.filter((e) => e.animalClass === 'deer').length;
  const spraysToday = events.filter((e) => e.sprayTriggered).length;

  // Hourly distribution demo buckets
  const hourlyData = [
    { hour: '00:00', count: 0 },
    { hour: '03:00', count: 1 },
    { hour: '06:00', count: 2 },
    { hour: '09:00', count: 0 },
    { hour: '12:00', count: 0 },
    { hour: '15:00', count: 0 },
    { hour: '18:00', count: boarCount > 0 ? boarCount : 1 },
    { hour: '21:00', count: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Hackathon Quick Action Hero Banner for Judges */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/70 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                HACKATHON LIVE DEMO WORKFLOW
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                100% Interactive Prototype
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              SmartFence AI — Protect Crops, Save Wildlife
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time agricultural perimeter protection combining YOLO edge animal vision, ultrasonic distance corroboration, harmless low-pressure water mist deterrence, and instant cellular alerts.
            </p>
          </div>

          {/* Direct Demonstration Buttons for Judges */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => triggerDemoDetection('wild_boar')}
              disabled={isSimulatingDetection}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all whitespace-nowrap disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Boar Detection</span>
            </button>
            <button
              onClick={() => triggerDemoDetection('deer')}
              disabled={isSimulatingDetection}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-amber-200 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 rounded-lg transition-all whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Simulate Deer Detection</span>
            </button>
            <button
              onClick={() => triggerUltrasonicProximity(48, 'zone-a')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Test Sonar (48cm)</span>
            </button>
            <button
              onClick={() => triggerWaterSpray(4)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-cyan-200 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 rounded-lg transition-all whitespace-nowrap"
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Test Mist Spray</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Status Cards (Single-Elevation Flat Surfaces) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Camera + YOLO Vision */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">YOLO Camera Vision</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                DEMO / ACTIVE
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">2 Cam Nodes</div>
            <div className="text-xs text-emerald-400 mt-1 font-mono">
              Confidence &ge; {Math.round(settings.yoloConfidenceThreshold * 100)}%
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>ESP32-CAM OV2640</span>
            <button
              onClick={() => onNavigate('monitoring')}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>View Feed</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Ultrasonic Distance Sensor */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Ultrasonic Sonar</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                SIMULATED
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white flex items-baseline gap-2">
              <span className={`tabular-nums ${
                currentUltrasonicDistance < settings.ultrasonicThresholdCm
                  ? 'text-rose-400'
                  : 'text-emerald-400'
              }`}>
                {currentUltrasonicDistance} cm
              </span>
              <span className="text-xs text-slate-500 font-normal">live distance</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              Trip Threshold: {settings.ultrasonicThresholdCm} cm
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>HC-SR04 Transducer</span>
            <button
              onClick={() => onNavigate('devices')}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>Calibrate</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Water Spray Actuator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Water Deterrent Mist</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                waterPumpActive
                  ? 'bg-cyan-500 text-slate-950 font-bold animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {waterPumpActive ? `MISTING (${waterPumpRemaining}s)` : 'STANDBY'}
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {waterPumpActive ? 'Active Spray' : 'Armed (Auto)'}
            </div>
            <div className="text-xs text-cyan-400 mt-1 font-mono">
              {settings.sprayDurationSeconds}s Safe Pulse · 42 PSI
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>12V Solenoid Valve</span>
            <button
              onClick={() => onNavigate('spray')}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>Controls</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Events Today */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">Alerts & Incursions</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                TODAY
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {totalDetectionsToday} Events Logged
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span>🐗 {boarCount} Boar</span>
              <span>·</span>
              <span>🦌 {deerCount} Deer</span>
              <span>·</span>
              <span className="text-cyan-400">💧 {spraysToday} Mists</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>SMS to {settings.phoneRecipientMasked}</span>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>History</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Central Section: Map Preview & Detection Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm Map Overview Preview */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">
                Farm Perimeter Geolocation Map
              </h2>
            </div>
            <button
              onClick={() => onNavigate('map')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>Open Full Interactive GIS Map</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="h-[340px] rounded-lg overflow-hidden border border-slate-800">
            <FarmMapView />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>Protecting 4,050 meters of crop perimeter across 3 agricultural zones.</span>
            <span className="font-mono text-[11px] text-slate-500">OPENSTREETMAP / ESRI GIS</span>
          </div>
        </div>

        {/* Analytics Charts (Anti-Slop Clean Tabular Numerals) */}
        <div className="space-y-4">
          {/* Hourly Incursion Frequency Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Wildlife Activity by Hour</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">24H CYCLE</span>
            </div>

            {/* Clean SVG Bar Chart */}
            <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
              {hourlyData.map((d, i) => {
                const maxCount = 3;
                const heightPct = Math.max(10, (d.count / maxCount) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                      {d.count > 0 ? d.count : ''}
                    </span>
                    <div
                      className={`w-full rounded-t transition-all ${
                        d.count > 0 ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-slate-800/60'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[9px] font-mono text-slate-500">
                      {d.hour.slice(0, 2)}h
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Peak wildlife activity historically concentrates at dusk (18:00–21:00) and dawn (05:00–07:00).
            </p>
          </div>

          {/* Wildlife Species Distribution Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Detected Species Breakdown
            </h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="font-medium">🐗 Wild Boar (Sus scrofa)</span>
                  <span className="font-mono text-emerald-400 tabular-nums">{boarCount} incidents</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${totalDetectionsToday ? (boarCount / totalDetectionsToday) * 100 : 50}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="font-medium">🦌 White-Tailed Deer</span>
                  <span className="font-mono text-amber-400 tabular-nums">{deerCount} incidents</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${totalDetectionsToday ? (deerCount / totalDetectionsToday) * 100 : 30}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="font-medium">📡 Sonar Proximity Only</span>
                  <span className="font-mono text-sky-400 tabular-nums">
                    {events.filter((e) => e.type === 'ultrasonic_proximity').length} incidents
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full"
                    style={{ width: `${totalDetectionsToday ? (events.filter((e) => e.type === 'ultrasonic_proximity').length / totalDetectionsToday) * 100 : 20}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts Feed Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Recent Perimeter Incursion Alerts</h3>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            <span>View All Records & CSV Export</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Species</th>
                <th className="py-2 px-3">YOLO Confidence</th>
                <th className="py-2 px-3">Zone</th>
                <th className="py-2 px-3">Distance</th>
                <th className="py-2 px-3">Spray Deterrent</th>
                <th className="py-2 px-3">Cellular SMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px] text-slate-300">
              {events.slice(0, 4).map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-400">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">
                    {evt.animalClass === 'wild_boar' ? '🐗 Wild Boar' : evt.animalClass === 'deer' ? '🦌 Deer' : evt.animalClass}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums">
                    {evt.confidence > 0 ? `${Math.round(evt.confidence * 100)}%` : '—'}
                  </td>
                  <td className="py-2.5 px-3 font-sans">{evt.zoneName.split('·')[0]}</td>
                  <td className="py-2.5 px-3 tabular-nums">{evt.distanceCm ? `${evt.distanceCm} cm` : '—'}</td>
                  <td className="py-2.5 px-3 font-sans">
                    {evt.sprayTriggered ? (
                      <span className="text-cyan-400 font-medium">💧 {evt.sprayDurationSec}s mist</span>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {evt.notificationStatus === 'SIMULATED_DISPATCHED' ? 'SIMULATED' : evt.notificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
