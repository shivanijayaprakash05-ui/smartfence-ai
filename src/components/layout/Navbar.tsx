import React from 'react';
import {
  ShieldAlert,
  Camera,
  MapPin,
  Cpu,
  Droplets,
  Bell,
  Settings,
  LayoutDashboard,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useSmartFence } from '../../context/SmartFenceContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    waterPumpActive,
    waterPumpRemaining,
    triggerDemoDetection,
    isSimulatingDetection,
    resetToDefaultData,
  } = useSmartFence();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Live Monitoring', icon: Camera },
    { id: 'map', label: 'Farm Satellite Map', icon: MapPin },
    { id: 'devices', label: 'Devices & Sensors', icon: Cpu },
    { id: 'spray', label: 'Water Spray Control', icon: Droplets },
    { id: 'alerts', label: 'Alerts & History', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600/30 transition-colors shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              SmartFence AI
            </span>
            <span className="text-[11px] text-emerald-400 font-medium whitespace-nowrap -mt-0.5">
              Protect Crops · Save Wildlife
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Quick Demo Button */}
        <div className="flex items-center gap-3 shrink-0">
          {waterPumpActive && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 rounded-md animate-pulse">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>MISTING {waterPumpRemaining}s</span>
            </div>
          )}

          <div className="hidden md:flex items-center text-[11px] text-slate-400 font-mono px-2 py-1 bg-slate-800/80 rounded border border-slate-700">
            DEMO SIMULATION
          </div>

          <button
            onClick={() => triggerDemoDetection('wild_boar')}
            disabled={isSimulatingDetection}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-98 rounded-lg shadow-sm transition-all whitespace-nowrap disabled:opacity-50"
            title="Simulate immediate end-to-end detection pipeline"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Demo Detection</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-slate-800/80 bg-slate-900">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
