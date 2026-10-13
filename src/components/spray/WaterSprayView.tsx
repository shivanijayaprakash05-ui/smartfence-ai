import React from 'react';
import {
  Droplets,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Play,
  Square,
  Clock,
  Gauge,
  Sliders,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react';
import { useSmartFence } from '../../context/SmartFenceContext';

export const WaterSprayView: React.FC = () => {
  const {
    waterPumpActive,
    waterPumpRemaining,
    settings,
    updateSettings,
    triggerWaterSpray,
    stopWaterSpray,
  } = useSmartFence();

  return (
    <div className="space-y-6">
      {/* Header and Safety Principle */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-400" />
            <span>Harmless Water Spray Deterrent Station</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Humane agricultural wildlife perimeter defense using short bursts of low-pressure ambient water mist.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>100% NON-LETHAL / SAFE</span>
          </span>
        </div>
      </div>

      {/* Main Status & Big Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actuator Status Visualizer */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                ACTUATOR RELAY STATUS
              </span>
              <span className={`text-xs font-mono px-2.5 py-0.5 rounded font-bold ${
                waterPumpActive
                  ? 'bg-cyan-500 text-slate-950 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {waterPumpActive ? 'VALVE OPEN (SPRAYING)' : 'VALVE CLOSED (STANDBY)'}
              </span>
            </div>

            {/* Visual Mist Graphic Display */}
            <div className={`p-8 rounded-2xl border text-center transition-all ${
              waterPumpActive
                ? 'bg-gradient-to-b from-cyan-950/60 to-slate-950 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.25)]'
                : 'bg-slate-950 border-slate-800'
            }`}>
              <div className="relative inline-flex items-center justify-center">
                {/* Pulsing water rings when active */}
                {waterPumpActive && (
                  <>
                    <span className="absolute w-28 h-28 rounded-full bg-cyan-500/20 animate-ping" />
                    <span className="absolute w-36 h-36 rounded-full bg-cyan-500/10 animate-pulse" />
                  </>
                )}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all ${
                  waterPumpActive
                    ? 'bg-cyan-500 text-slate-950 border-white scale-110 shadow-lg'
                    : 'bg-slate-900 text-slate-500 border-slate-700'
                }`}>
                  <Droplets className="w-10 h-10" />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-2xl font-bold font-mono text-white">
                  {waterPumpActive ? `${waterPumpRemaining}s REMAINING` : 'SYSTEM ARMED & READY'}
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {waterPumpActive
                    ? 'Low-pressure micro-nozzle misting perimeter zone. Wildlife safely startled away from fence line.'
                    : 'Relay is in safe normally-closed (NC) position. Awaiting verified YOLO animal detection trigger.'}
                </p>
              </div>
            </div>
          </div>

          {/* Direct Manual Controls Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => triggerWaterSpray(settings.sprayDurationSeconds)}
                disabled={waterPumpActive}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 rounded-lg shadow-sm transition-all font-sans"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Test Demo Water Spray ({settings.sprayDurationSeconds}s)</span>
              </button>

              {waterPumpActive && (
                <button
                  onClick={stopWaterSpray}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Manual Stop Override</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Mode: <span className="text-cyan-300">SIMULATED ACTUATOR</span>
            </div>
          </div>
        </div>

        {/* Deterrent Configuration & Telemetry */}
        <div className="space-y-4">
          {/* Settings Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Deterrent Parameters</span>
              </h3>
            </div>

            {/* Auto Spray Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">Automatic Deterrent</div>
                <div className="text-[11px] text-slate-400">Trigger spray automatically upon valid detection</div>
              </div>
              <button
                onClick={() =>
                  updateSettings({ autoSprayEnabled: !settings.autoSprayEnabled })
                }
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.autoSprayEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    settings.autoSprayEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Spray Duration Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Spray Pulse Duration:</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {settings.sprayDurationSeconds} seconds
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={settings.sprayDurationSeconds}
                onChange={(e) =>
                  updateSettings({ sprayDurationSeconds: parseInt(e.target.value, 10) })
                }
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Short pulses (3-5s) startle animals while conserving water and preventing ground saturation.
              </p>
            </div>

            {/* Reservoir Telemetry */}
            <div className="border-t border-slate-800 pt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Line Pressure:</span>
                <span className="text-slate-200 font-bold">42 PSI (Gentle Mist)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Reservoir Level:</span>
                <span className="text-emerald-400 font-bold">88% (440 L / 500 L)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Max Safety Timeout:</span>
                <span className="text-slate-200">12s Auto-Lockout</span>
              </div>
            </div>
          </div>

          {/* Ethical Wildlife Protection Manifesto */}
          <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <HeartHandshake className="w-4 h-4 shrink-0" />
              <span>Harmless Deterrent Philosophy</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              SmartFence AI is committed to harmless co-existence between agriculture and local biodiversity.
            </p>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              <li><strong>Zero Electric Shock:</strong> Eliminates high-voltage fence wire mortality.</li>
              <li><strong>Zero Poisons or Chemicals:</strong> Keeps soil organic and preserves food chain safety.</li>
              <li><strong>Zero Physical Trauma:</strong> Low-pressure mist relies strictly on visual & acoustic startle reflexes.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
